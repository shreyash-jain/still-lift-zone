-- ═══════════════════════════════════════════════════════════════════════════════
-- Still Zone — LLM Usage Logs Table
--
-- One row per LLM API call: which user made it, which provider/model was used,
-- how many tokens it consumed, and what it cost. Feeds the super-admin
-- AI usage & costing screens.
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Create the usage log table
CREATE TABLE IF NOT EXISTS public.llm_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Who triggered the call. SET NULL keeps the cost history if the user is deleted;
  -- the snapshot columns keep each row identifiable after that.
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,               -- snapshot of profiles.email at insert time (filled by trigger)
  user_name TEXT,                -- snapshot of profiles.full_name at insert time (filled by trigger)

  -- What was called
  provider TEXT NOT NULL,        -- 'openai', 'anthropic', 'google', ...
  model TEXT NOT NULL,           -- exact model id as sent to the provider
  feature TEXT,                  -- app feature that made the call, e.g. 'journal-insight'
  request_id TEXT,               -- provider's request id, for reconciling with their billing

  -- Usage
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  cached_input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (cached_input_tokens >= 0),  -- subset of input_tokens served from prompt cache
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,

  -- Costing in USD. Providers bill in USD and a single call costs fractions of a cent,
  -- so this uses NUMERIC rather than the integer paise/cents used for payments.
  input_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0 CHECK (input_cost_usd >= 0),
  output_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0 CHECK (output_cost_usd >= 0),
  total_cost_usd NUMERIC(12, 6) GENERATED ALWAYS AS (input_cost_usd + output_cost_usd) STORED,

  -- Outcome
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message TEXT,
  latency_ms INTEGER,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Indexes for per-user history, date-range reports, and per-model breakdowns
CREATE INDEX IF NOT EXISTS idx_llm_usage_user_created
  ON public.llm_usage_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_llm_usage_created
  ON public.llm_usage_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_llm_usage_provider_model
  ON public.llm_usage_logs(provider, model, created_at DESC);

-- Step 3: Fill the user snapshot columns from profiles on insert
CREATE OR REPLACE FUNCTION public.llm_usage_fill_user_snapshot()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND (NEW.user_email IS NULL OR NEW.user_name IS NULL) THEN
    SELECT COALESCE(NEW.user_email, p.email), COALESCE(NEW.user_name, p.full_name)
      INTO NEW.user_email, NEW.user_name
      FROM public.profiles p
     WHERE p.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_llm_usage_fill_user_snapshot ON public.llm_usage_logs;
CREATE TRIGGER trg_llm_usage_fill_user_snapshot
  BEFORE INSERT ON public.llm_usage_logs
  FOR EACH ROW EXECUTE FUNCTION public.llm_usage_fill_user_snapshot();

-- Step 4: Enable Row Level Security
ALTER TABLE public.llm_usage_logs ENABLE ROW LEVEL SECURITY;

-- No policies on purpose: anon/authenticated roles can neither read nor write.
-- Rows are written by server routes and read by the super-admin API, both using
-- SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. This stops a client from
-- inserting fake usage or reading other users' costs.

-- Step 5: Per-user summary for the admin dashboard
-- security_invoker makes the view obey the table's RLS. Without it the view runs
-- as its owner, and Supabase's default grants would expose it to anon users.
CREATE OR REPLACE VIEW public.llm_usage_user_summary
WITH (security_invoker = true) AS
SELECT
  l.user_id,
  p.full_name,
  p.email,
  COUNT(*)                                   AS total_requests,
  COUNT(*) FILTER (WHERE l.status = 'error') AS failed_requests,
  SUM(l.input_tokens)                        AS total_input_tokens,
  SUM(l.output_tokens)                       AS total_output_tokens,
  SUM(l.total_tokens)                        AS total_tokens,
  SUM(l.total_cost_usd)                      AS total_cost_usd,
  MIN(l.created_at)                          AS first_used_at,
  MAX(l.created_at)                          AS last_used_at
FROM public.llm_usage_logs l
LEFT JOIN public.profiles p ON p.id = l.user_id
GROUP BY l.user_id, p.full_name, p.email;

-- ═══════════════════════════════════════════════════════════════════════════════
-- EXAMPLE QUERIES:
--
-- Top 10 users by AI cost this month:
--   SELECT * FROM llm_usage_user_summary ORDER BY total_cost_usd DESC LIMIT 10;
--   (for a date range, filter llm_usage_logs directly on created_at)
--
-- Daily cost per model:
--   SELECT date_trunc('day', created_at) AS day, provider, model,
--          COUNT(*) AS requests, SUM(total_tokens) AS tokens, SUM(total_cost_usd) AS cost_usd
--     FROM llm_usage_logs
--    GROUP BY 1, 2, 3
--    ORDER BY 1 DESC, cost_usd DESC;
--
-- NOTE: Rows of deleted users have user_id = NULL and appear as a single NULL
-- row in llm_usage_user_summary; their user_email/user_name snapshots remain
-- on the individual rows in llm_usage_logs.
-- ═══════════════════════════════════════════════════════════════════════════════
