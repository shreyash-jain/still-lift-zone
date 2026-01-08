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

## 6. Analytics Views
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

## 7. Automation (Triggers)
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
