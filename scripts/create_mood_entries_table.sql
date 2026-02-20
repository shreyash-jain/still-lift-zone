-- ═══════════════════════════════════════════════════════════════════════════════
-- Still Zone — Mood Entries Table
-- 
-- VERIFIED TABLES & COLUMNS (from live Supabase check):
--   user_plans → subscription_start_date (enrollment date)
--   profiles   → id, full_name, email, provider, created_at, last_sign_in, mobile_number
--   still_zone_mood_entries → DOES NOT EXIST YET ← creating below
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Create the mood entries table
CREATE TABLE IF NOT EXISTS public.still_zone_mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- The 4 selections that together form one mood tracking entry
  mood_key TEXT NOT NULL,        -- 'overwhelmed', 'sad', 'anxious', 'tired', 'focus', 'curious'
  context_key TEXT NOT NULL,     -- 'still', 'move', 'focused'
  time_key TEXT NOT NULL,        -- '1min', '2min', '5min', '10min'
  support_key TEXT NOT NULL,     -- 'visual-breathing', 'audio-tool', 'immediate-advice', 'havening', 'nlp-micro', 'resources'
  
  -- Audio file key (maps to local file at runtime, NOT the full path)
  audio_key TEXT,                -- e.g., 'breathing_calm' → app maps to /public/audio/breathing_calm.mp3
  
  -- Date tracking — one entry per day per user (like attendance)
  entry_date DATE NOT NULL,      -- YYYY-MM-DD only, for day-wise tracking
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One mood entry per user per day
  CONSTRAINT unique_user_daily_mood UNIQUE(user_id, entry_date)
);

-- Step 2: Index for fast lookups (user + date range queries)
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date 
  ON public.still_zone_mood_entries(user_id, entry_date DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE public.still_zone_mood_entries ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies — users can only access their own data
CREATE POLICY "Users can view own mood entries"
  ON public.still_zone_mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON public.still_zone_mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON public.still_zone_mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- HOW THE CALENDAR/STREAK WORKS:
--
-- 1. Calendar START date = user_plans.subscription_start_date
--    (query: SELECT subscription_start_date FROM user_plans 
--            WHERE user_id = '<user_id>' AND status = 'active')
--
-- 2. For each day from subscription_start_date to TODAY:
--    - If entry exists in still_zone_mood_entries for that date → ✅ emoji shown
--    - If no entry for that date → ❌ X shown
--
-- 3. Streak = consecutive days with entries (does NOT reset on miss, just shows X)
--
-- NOTE: The API route uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS automatically.
-- ═══════════════════════════════════════════════════════════════════════════════
