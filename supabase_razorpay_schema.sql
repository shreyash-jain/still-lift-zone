-- ═══════════════════════════════════════════════════════════════════════════════
-- STILL ZONE - RAZORPAY PAYMENT SYSTEM DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 1: payment_plans
-- Purpose: Stores all available pricing tiers and their features
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payment_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Plan Identification
    plan_key text UNIQUE NOT NULL,           -- e.g., 'monthly', 'yearly', 'founder'
    plan_name text NOT NULL,                 -- Display name: 'Mindful', 'Serenity', 'Founder'
    description text,
    
    -- Pricing (store in smallest unit for precision)
    price_inr integer NOT NULL,              -- Price in paise (e.g., 19900 = ₹199)
    price_usd integer NOT NULL,              -- Price in cents (e.g., 499 = $4.99)
    
    -- Plan Duration
    duration_type text NOT NULL CHECK (duration_type IN ('monthly', 'yearly', 'one_time', 'lifetime')),
    duration_days integer NOT NULL,          -- 30 for monthly, 365 for yearly, 1825 for 5-year
    
    -- Trial Configuration
    trial_days integer DEFAULT 0,            -- 7 for yearly plan trial
    
    -- Features (stored as JSONB for flexibility)
    features jsonb DEFAULT '[]'::jsonb,
    
    -- Metadata
    is_active boolean DEFAULT true,
    is_highlighted boolean DEFAULT false,    -- For UI: marks "Best Value" plan
    highlight_text text,                     -- e.g., 'Best Value', 'Limited Time'
    icon_name text,                          -- e.g., 'zap', 'star', 'crown'
    sort_order integer DEFAULT 0,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON public.payment_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_plans_key ON public.payment_plans(plan_key);

-- Enable RLS
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active plans
DROP POLICY IF EXISTS "Payment plans are viewable by everyone" ON public.payment_plans;
CREATE POLICY "Payment plans are viewable by everyone" 
    ON public.payment_plans FOR SELECT 
    USING (is_active = true);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 2: user_plans (Subscriptions)
-- Purpose: Maps users to their active subscription status
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User Reference
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Plan Reference
    plan_id uuid REFERENCES public.payment_plans(id) ON DELETE SET NULL,
    plan_key text NOT NULL,                  -- Denormalized for quick access
    
    -- Subscription Status
    status text NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Order created, payment not yet completed
        'trial',        -- In trial period
        'active',       -- Paid and active
        'expired',      -- Subscription ended
        'cancelled',    -- User cancelled
        'failed'        -- Payment failed
    )),
    
    -- Razorpay References
    razorpay_order_id text,
    razorpay_payment_id text,
    razorpay_subscription_id text,           -- For recurring subscriptions
    
    -- Dates
    trial_start_date timestamptz,
    trial_end_date timestamptz,
    subscription_start_date timestamptz,
    subscription_end_date timestamptz,
    
    -- Payment Info
    amount_paid integer,                     -- Amount in smallest unit
    currency text DEFAULT 'INR',
    
    -- Metadata
    cancelled_at timestamptz,
    cancellation_reason text,
    metadata jsonb DEFAULT '{}'::jsonb,      -- Additional data from webhook
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_status ON public.user_plans(status);
CREATE INDEX IF NOT EXISTS idx_user_plans_razorpay_order ON public.user_plans(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_razorpay_payment ON public.user_plans(razorpay_payment_id);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own plans
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
CREATE POLICY "Users can view their own plans" 
    ON public.user_plans FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all plans (for API operations)
DROP POLICY IF EXISTS "Service role can manage user_plans" ON public.user_plans;
CREATE POLICY "Service role can manage user_plans" 
    ON public.user_plans FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 3: user_invoices
-- Purpose: Logs every transaction with PDF invoice links
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- References
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_plan_id uuid REFERENCES public.user_plans(id) ON DELETE SET NULL,
    plan_id uuid REFERENCES public.payment_plans(id) ON DELETE SET NULL,
    
    -- Invoice Details
    invoice_number text UNIQUE NOT NULL,     -- e.g., 'INV-2026-001234'
    
    -- Payment Details
    amount integer NOT NULL,                 -- Amount in smallest unit
    currency text NOT NULL DEFAULT 'INR',
    tax_amount integer DEFAULT 0,            -- GST/Tax amount
    total_amount integer NOT NULL,           -- amount + tax_amount
    
    -- Razorpay References
    razorpay_order_id text,
    razorpay_payment_id text UNIQUE,
    razorpay_signature text,
    
    -- Payment Status
    status text NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'captured',
        'failed',
        'refunded',
        'partially_refunded'
    )),
    
    -- Payment Method Details
    payment_method text,                     -- 'card', 'upi', 'netbanking', 'wallet'
    payment_details jsonb DEFAULT '{}'::jsonb, -- Card last 4 digits, bank name, etc.
    
    -- Invoice PDF
    invoice_pdf_url text,                    -- Supabase Storage URL
    invoice_pdf_generated_at timestamptz,
    
    -- Billing Address (for tax compliance)
    billing_name text,
    billing_email text,
    billing_address jsonb DEFAULT '{}'::jsonb,
    
    -- Webhook Data
    webhook_payload jsonb DEFAULT '{}'::jsonb, -- Full webhook data for debugging
    webhook_received_at timestamptz,
    
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    paid_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_invoices_user_id ON public.user_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invoices_status ON public.user_invoices(status);
CREATE INDEX IF NOT EXISTS idx_user_invoices_razorpay_order ON public.user_invoices(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_user_invoices_razorpay_payment ON public.user_invoices(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_user_invoices_created ON public.user_invoices(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.user_invoices;
CREATE POLICY "Users can view their own invoices" 
    ON public.user_invoices FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all invoices
DROP POLICY IF EXISTS "Service role can manage user_invoices" ON public.user_invoices;
CREATE POLICY "Service role can manage user_invoices" 
    ON public.user_invoices FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: Generate Invoice Number
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    year_val text;
    sequence_num integer;
    invoice_num text;
BEGIN
    year_val := to_char(now(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM public.user_invoices
    WHERE invoice_number LIKE 'INV-' || year_val || '-%';
    
    invoice_num := 'INV-' || year_val || '-' || LPAD(sequence_num::text, 6, '0');
    
    RETURN invoice_num;
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION: Sync Profile Subscription Status
-- Automatically updates the profile when subscription status changes
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.sync_profile_subscription_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update profile when subscription becomes active
    IF NEW.status = 'active' THEN
        UPDATE public.profiles
        SET 
            is_subscription_active = true
        WHERE id = NEW.user_id;
    
    -- Update profile when subscription expires/cancelled
    ELSIF NEW.status IN ('expired', 'cancelled', 'failed') THEN
        -- Check if user has any other active plans
        IF NOT EXISTS (
            SELECT 1 FROM public.user_plans 
            WHERE user_id = NEW.user_id 
            AND id != NEW.id 
            AND status = 'active'
        ) THEN
            UPDATE public.profiles
            SET 
                is_subscription_active = false
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create Trigger
DROP TRIGGER IF EXISTS on_user_plan_status_change ON public.user_plans;
CREATE TRIGGER on_user_plan_status_change
    AFTER INSERT OR UPDATE OF status ON public.user_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_subscription_status();


-- ═══════════════════════════════════════════════════════════════════════════════
-- ENABLE REALTIME for user_plans
-- This allows frontend to subscribe to changes via Supabase Realtime
-- ═══════════════════════════════════════════════════════════════════════════════

-- First, check if the table is already in the publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'user_plans'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_plans;
    END IF;
END
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Insert Default Payment Plans
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.payment_plans (
    plan_key, plan_name, description, 
    price_inr, price_usd, 
    duration_type, duration_days, trial_days,
    features, is_highlighted, highlight_text, icon_name, sort_order
) VALUES 
(
    'monthly',
    'Mindful',
    'Flexible access for those exploring mindfulness.',
    19900,      -- ₹199
    499,        -- $4.99
    'monthly',
    30,
    0,
    '["Unlimited Experience sessions", "Full Premium Dashboard access", "Progress tracking & mood history", "Cancel anytime"]'::jsonb,
    false,
    NULL,
    'zap',
    1
),
(
    'yearly',
    'Serenity',
    'Our most popular plan for long-term peace.',
    179900,     -- ₹1,799
    4999,       -- $49.99
    'yearly',
    365,
    7,          -- 7-day trial
    '["Everything in Mindful", "Save significant amount yearly", "Priority Email Support", "7-Day Free Trial included"]'::jsonb,
    true,
    'Best Value',
    'star',
    2
),
(
    'founder',
    'Founder',
    'Exclusive 5-year pass for early adopters.',
    599900,     -- ₹5,999
    14999,      -- $149.99
    'one_time',
    1825,       -- 5 years
    0,
    '["5-Year Full Access", "Early access to new features", "Exclusive Founder Badge", "No recurring payments"]'::jsonb,
    false,
    'Limited Time',
    'crown',
    3
)
ON CONFLICT (plan_key) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    description = EXCLUDED.description,
    price_inr = EXCLUDED.price_inr,
    price_usd = EXCLUDED.price_usd,
    duration_days = EXCLUDED.duration_days,
    trial_days = EXCLUDED.trial_days,
    features = EXCLUDED.features,
    is_highlighted = EXCLUDED.is_highlighted,
    highlight_text = EXCLUDED.highlight_text,
    icon_name = EXCLUDED.icon_name,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();


-- ═══════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Allow authenticated users to call generate_invoice_number
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO service_role;


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run these to check if everything is set up correctly)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payment_plans', 'user_plans', 'user_invoices');

-- Check payment plans were inserted
SELECT plan_key, plan_name, price_inr, price_usd, duration_type 
FROM public.payment_plans 
ORDER BY sort_order;

-- Check realtime is enabled
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
