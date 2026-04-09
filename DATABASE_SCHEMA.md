# Still Zone Database Architecture

This document provides a simple, comprehensive guide to the Still Zone PostgreSQL database schema designed for Supabase.

---

## 1. Profiles & Authentication
**Purpose**: Stores user profile data that is automatically synced with Supabase Auth (`auth.users`).

### `public.profiles`
This table acts as an extension of the system's auth table. It holds personal info and trial status.

```sql
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  email text,
  provider text,      -- e.g., 'google', 'email'
  avatar_url text,
  bio text,
  mobile_number text, -- New field
  country text,       -- New field
  
  -- Trial Logic
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  is_subscription_active boolean default false,
  
  created_at timestamptz default now(),
  last_sign_in timestamptz,
  
  primary key (id)
);
```

### Security (RLS)
- **Public**: Everyone can view profiles.
- **Private**: Users can only update their own profile.

---

## 2. User Statistics
**Purpose**: Tracks engagement metrics like daily streaks and total time spent for gamification.

### `public.user_stats`

```sql
create table public.user_stats (
  user_id uuid not null references public.profiles(id) on delete cascade,
  daily_streak_count int default 0,
  last_activity_date timestamptz,
  total_time_spent bigint default 0, -- Total time in seconds
  total_sessions_count int default 0,
  
  primary key (user_id)
);
```

---

## 3. Activity Tracking
**Purpose**: Logs every session (e.g., breathing, audio tools) to analyze user behavior.

### `public.activities`

```sql
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  
  -- Mood Data
  mood_type text not null,  -- e.g., 'anxious', 'calm'
  mood_id int,
  mood_before_id int,       -- User rating before session (1-10)
  mood_after_id int,        -- User rating after session (1-10)
  
  -- Tool Data
  tool_used text not null,  -- e.g., 'breathing-box'
  duration_seconds int default 0,
  timestamp timestamptz default now()
);
```

---

## 4. Favorites System
**Purpose**: Allows users to save their favorite tools or moods for quick access.

### `public.user_favorites`

```sql
create table public.user_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('mood', 'tool')),
  item_name text not null,
  added_at timestamptz default now(),
  
  -- Ensures user can't favorite the same thing twice
  unique(user_id, item_type, item_name)
);
```

---

## 5. Payments & Subscriptions
**Purpose**: Stores a history of payments and subscription validity.

### `public.payment_logs`

```sql
create table public.payment_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_name text not null,
  amount numeric(10,2) not null,
  currency text default 'USD',
  payment_status text,           -- e.g., 'paid', 'failed'
  transaction_id text,
  subscription_start timestamptz,
  subscription_expiry timestamptz,
  created_at timestamptz default now()
);
```

---

## 6. Still Zone Content (Admin-Managed)
**Purpose**: Stores all guided session content (messages, audio, headings) managed by the super admin. Users are served random content from this table based on their mood, context, support type, and time selection.

### `public.still_zone_content`

```sql
create table public.still_zone_content (
  id                     uuid primary key default gen_random_uuid(),
  mood                   text not null,        -- 'anxious', 'overwhelmed', 'sad', 'tired', 'focus', 'curious'
  context                text not null,        -- 'still', 'move', 'focused'
  support_type           text not null,        -- 'visual-breathing', 'audio-tool', 'immediate-advice', 'havening', 'nlp-micro', 'resources'
  time_key               text not null,        -- '1min', '2min', '3min', '5min'
  action_type            text not null,        -- 'BREATHE', 'LISTEN', 'ACTION', 'VISUALIZE', 'REPEAT'
  heading                text,                 -- Optional heading shown above the message (admin-editable)
  message                text not null,        -- The guided session message shown to users
  display_time           integer not null,     -- Duration in seconds (60, 120, 180, 300)
  audio_url              text,                 -- Supabase storage URL for audio file
  is_combo               boolean not null default false,  -- True for 5min combo entries (3min + 2min)
  combo_second_message   text,                 -- Message for the 2min second part
  combo_first_audio_url  text,                 -- Audio URL for the 3min part
  combo_second_audio_url text,                 -- Audio URL for the 2min part
  is_active              boolean not null default true,   -- Soft delete / toggle visibility
  sort_order             integer not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
```

### Indexes
```sql
-- Primary lookup for user-facing content fetch
create index idx_szc_lookup on still_zone_content (mood, context, support_type, time_key)
  where is_active = true;

-- Admin listing and filtering
create index idx_szc_admin on still_zone_content (mood, support_type, time_key, sort_order);
```

### Security (RLS)
- **Public SELECT**: Anyone can read active content (`is_active = true`).
- **No INSERT/UPDATE/DELETE** for anon/authenticated roles — admin uses service role key.

### Storage Bucket
- **Bucket**: `still-zone-content-audio` (public)
- **Path convention**: `{mood}/{support_type}/{timestamp}-{filename}`
- **Max file size**: 20MB

---

## 7. Still Zone Mood Entries
**Purpose**: Tracks daily mood entries for each user. One entry per user per day (upsert).

### `public.still_zone_mood_entries`

```sql
create table public.still_zone_mood_entries (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid not null,
  mood_key             text not null,          -- 'overwhelmed', 'sad', 'anxious', 'tired', 'focus', 'curious'
  context_key          text not null,          -- 'still', 'move', 'focused'
  time_key             text not null,          -- '1min', '2min', '3min', '5min'
  support_key          text not null,          -- 'visual-breathing', 'audio-tool', etc.
  audio_key            text,                   -- Legacy audio file key
  session_duration_sec integer default 0,      -- Actual time spent in session
  entry_date           date not null,          -- YYYY-MM-DD, one entry per day

  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),

  unique(user_id, entry_date)
);
```

### Indexes
```sql
create index idx_mood_entries_user_date on still_zone_mood_entries (user_id, entry_date desc);
```

### Security (RLS)
- Users can view, insert, and update their own mood entries (`auth.uid() = user_id`).

---

## 8. Still Zone Users
**Purpose**: Still Zone-specific user record for trial and subscription tracking.

### `public.still_zone_users`

```sql
create table public.still_zone_users (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null,
  trial_start_date    timestamptz,
  trial_end_date      timestamptz,
  trial_active        boolean default false,
  subscription_status text default 'none' check (subscription_status in ('none', 'active', 'expired')),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
```

### Security (RLS)
- Users can view and update their own row (`auth.uid() = id`).

---

## 9. Still Zone Questionnaires
**Purpose**: Stores onboarding questionnaire responses.

### `public.still_zone_questionnaires`

```sql
create table public.still_zone_questionnaires (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references still_zone_users(id) on delete cascade,
  mood_category    text,
  session_duration text,
  support_type     text,
  affiliate_opt_in boolean default false,
  created_at       timestamptz default now()
);
```

### Security (RLS)
- Users can view and insert their own questionnaires (`auth.uid() = user_id`).

---

## 10. Journal Notes
**Purpose**: User journal entries with optional audio recordings.

### `public.journal_notes`

```sql
create table public.journal_notes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  title           text not null default '',
  content         text not null default '',
  audio_url       text,                    -- Supabase storage signed URL
  audio_duration  integer,                 -- Duration in seconds
  audio_mime_type text,                    -- e.g. 'audio/webm'
  audio_size      integer,                 -- File size in bytes
  mood            text check (mood in ('great', 'good', 'okay', 'bad', 'awful')),
  tags            text[] default array[]::text[],
  is_private      boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
```

### Indexes
```sql
create index idx_journal_notes_user_id on journal_notes (user_id);
create index idx_journal_notes_created_at on journal_notes (created_at desc);
create index idx_journal_notes_mood on journal_notes (mood);
create index idx_journal_notes_tags on journal_notes using gin(tags);
```

### Security (RLS)
- Full CRUD for own notes only (`auth.uid() = user_id`).

### Storage Bucket
- **Bucket**: `journal-audio` (private)
- **Path**: `{user_id}/{filename}`
- RLS enforces user isolation via folder name.

---

## 11. User Plans & Payment Plans
**Purpose**: Subscription management — available plans and user enrollments.

### `public.payment_plans`

```sql
create table public.payment_plans (
  id                    uuid primary key default gen_random_uuid(),
  plan_name             text not null,
  plan_key              text not null,        -- Unique slug: 'monthly', 'yearly', 'founder'
  description           text,
  price_inr             numeric(10,2),
  price_usd             numeric(10,2),
  duration_type         text default 'monthly',
  duration_days         integer default 30,
  trial_days            integer default 0,
  features              text[],               -- Array of feature strings
  is_active             boolean default true,
  is_highlighted        boolean default false,
  highlight_text        text,
  icon_name             text,
  sort_order            integer default 0,
  razorpay_plan_id_inr  text,
  razorpay_plan_id_usd  text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
```

### `public.user_plans`

```sql
create table public.user_plans (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references profiles(id),
  plan_id                  uuid references payment_plans(id),
  plan_key                 text,
  status                   text,              -- 'active', 'trialing', 'cancelled'
  subscription_start_date  timestamptz,       -- Enrollment date (used for calendar start)
  current_period_end       timestamptz,
  cancel_at_period_end     boolean,
  cancellation_requested_at timestamptz,
  cancellation_reason      text,
  razorpay_subscription_id text,
  razorpay_order_id        text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);
```

---

## 12. Super Admin Activity Log
**Purpose**: Audit trail for admin actions (activate user, remove plan, etc.).

### `public.super_admin_activity_log`

```sql
create table public.super_admin_activity_log (
  id                uuid primary key default gen_random_uuid(),
  admin_email       text,
  action            text,                    -- 'activate_user', 'remove_plan', etc.
  target_user_id    uuid,
  target_user_email text,
  target_user_name  text,
  details           text,
  created_at        timestamptz default now()
);
```

---

## 13. Analytics Views (Legacy)
**Purpose**: Pre-calculated views to simplify querying complex analytics.

### `public.weekly_summary`
Calculates total sessions and duration for the current week per user.

```sql
create or replace view public.weekly_summary as
select 
  user_id,
  date_trunc('week', timestamp) as week_start,
  count(*) as session_count,
  sum(duration_seconds) as total_duration_seconds
from 
  public.activities
where 
  timestamp >= date_trunc('week', now())
group by 
  user_id, date_trunc('week', timestamp);
```

---

## 14. Automation (Triggers)
**Purpose**: Automates backend logic so the frontend doesn't have to handle it.

### `handle_new_user()`
Automatically runs when a user creates an account (via Google or Email).
1. Creates a **Profile** entry.
2. Sets up a **7-Day Free Trial**.
3. Initializes an empty **User Stats** entry.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
declare
  trial_length interval := interval '7 days';
begin
  -- 1. Create Profile
  insert into public.profiles (
    id, full_name, email, provider, mobile_number, country,
    trial_start_date, trial_end_date, is_subscription_active, last_sign_in
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_app_meta_data->>'provider',
    new.raw_user_meta_data->>'mobile_number',
    new.raw_user_meta_data->>'country',
    now(),
    now() + trial_length, -- 7 Days from now
    true,
    now()
  );

  -- 2. Create Stats
  insert into public.user_stats (user_id, daily_streak_count, total_time_spent)
  values (new.id, 0, 0);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger Definition
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
