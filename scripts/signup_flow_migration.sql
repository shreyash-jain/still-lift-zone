-- Signup Flow Migration
-- Run this in the Supabase SQL editor

-- Add fields to still_zone_users for signup flow
ALTER TABLE still_zone_users ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE still_zone_users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE still_zone_users ADD COLUMN IF NOT EXISTS selected_plan_id UUID;

-- Add Razorpay payment fields to user_plans
ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
