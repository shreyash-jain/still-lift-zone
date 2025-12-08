# Still Zone - Setup Guide

## Overview

Still Zone is a calm, guided mindfulness platform with a 7-day free trial and subscription model. This guide will help you set up the application.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Environment variables configured

## Installation

1. Install dependencies (already done):
```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Database Setup

### 1. Create Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table for Still Zone
CREATE TABLE IF NOT EXISTS still_zone_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  trial_active BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questionnaire responses
CREATE TABLE IF NOT EXISTS still_zone_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES still_zone_users(id) ON DELETE CASCADE,
  mood_category TEXT,
  session_duration TEXT,
  support_type TEXT,
  affiliate_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE still_zone_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE still_zone_questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies for still_zone_users
CREATE POLICY "Users can view their own data"
  ON still_zone_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON still_zone_users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for still_zone_questionnaires
CREATE POLICY "Users can view their own questionnaires"
  ON still_zone_questionnaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires"
  ON still_zone_questionnaires FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2. Set up Authentication

In Supabase Dashboard:
1. Go to Authentication > Settings
2. Enable Email provider
3. Configure email templates (optional)
4. Set up redirect URLs:
   - `http://localhost:3000/still-zone/questionnaire` (development)
   - `https://yourdomain.com/still-zone/questionnaire` (production)

## Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000/still-zone` to see the landing page.

## Routes

- `/still-zone` - Landing page
- `/still-zone/signup` - Email sign-up
- `/still-zone/login` - Email login
- `/still-zone/questionnaire` - 4-question onboarding
- `/still-zone/category/[category]` - Personalized tools page
- `/still-zone/dashboard` - Premium dashboard (subscribers)
- `/still-zone/paywall` - Trial expired screen

## Features

### Trial System
- 7-day free trial starts on sign-up
- Trial status tracked in database
- Automatic redirect to paywall when expired

### Authentication
- Email/password authentication via Supabase
- Session persistence
- Protected routes

### Questionnaire
- 4 questions: mood, duration, support type, opt-in
- Saves responses to database
- Redirects to appropriate category page

### Category Pages
- Personalized tools based on questionnaire
- Session controls
- Trial countdown banner

### Paywall
- Shown when trial expires
- Subscription pricing display
- Payment integration placeholder (Razorpay/Stripe)

### Dashboard
- Stats and progress tracking
- Charts (Recharts)
- Quick actions
- Subscribers only

## Payment Integration (TODO)

The paywall page includes a placeholder for payment integration. To implement:

1. Choose payment provider (Razorpay or Stripe)
2. Set up payment gateway account
3. Add payment processing logic in `/still-zone/paywall/page.tsx`
4. Update user subscription status on successful payment
5. Handle webhooks for subscription events

## Styling

Still Zone uses:
- Tailwind CSS for styling
- Framer Motion for animations
- Custom color palette (lavender, dusk-blue, beige)
- Mobile-first responsive design

## State Management

- Zustand store for auth and trial state
- Persisted to localStorage
- Auto-syncs with Supabase

## Development Notes

- All Still Zone files are prefixed with `still-zone-` or in `/still-zone/` directories
- Separate from Still Lift product
- Uses Supabase for backend
- Client-side routing with Next.js App Router

## Troubleshooting

### Auth not working
- Check Supabase credentials in `.env.local`
- Verify RLS policies are set correctly
- Check browser console for errors

### Trial not starting
- Check database triggers (if using)
- Verify user creation logic in auth store
- Check Supabase logs

### Routes not protecting
- Verify middleware is working
- Check auth state initialization
- Ensure user is logged in

## Next Steps

1. Set up Supabase project
2. Configure environment variables
3. Run database migrations
4. Test authentication flow
5. Implement payment integration
6. Add more tools/content
7. Deploy to production

