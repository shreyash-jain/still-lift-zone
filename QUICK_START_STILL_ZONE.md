# Still Zone - Quick Start Guide

## ⚠️ Supabase Setup Required

Still Zone requires Supabase for authentication and database. Follow these steps:

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Still Zone (or your choice)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Create Environment File

Create a file named `.env.local` in the root of your project:

```bash
# Windows (PowerShell)
New-Item -Path .env.local -ItemType File

# Mac/Linux
touch .env.local
```

## Step 4: Add Your Credentials

Open `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace:**
- `your-project-id` with your actual Supabase project ID
- `your-anon-key-here` with your actual anon key

Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTIwMDAwMCwiZXhwIjoxOTYwNzg2MDAwfQ.example
```

## Step 5: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL from `STILL_ZONE_SETUP.md` (Database Setup section)
4. Click **Run** (or press Ctrl+Enter)

## Step 6: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add:
   - `http://localhost:3000` (for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/still-zone/questionnaire`
4. Enable **Email** provider (should be enabled by default)

## Step 7: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 8: Test It!

1. Visit `http://localhost:3000/still-zone`
2. Click "Start My 7-Day Free Trial"
3. Sign up with your email
4. Complete the questionnaire
5. You should see the category page!

## 🎉 You're Done!

Still Zone should now work with full authentication and database functionality.

## Troubleshooting

### Error: "supabaseUrl is required"
- Make sure `.env.local` exists in the project root
- Check that the file has the correct variable names (no typos)
- Restart the dev server after creating/editing `.env.local`

### Error: "Invalid API key"
- Double-check you copied the **anon/public** key (not the service_role key)
- Make sure there are no extra spaces in `.env.local`

### Can't connect to Supabase
- Check your internet connection
- Verify the Supabase project is active (not paused)
- Check Supabase status page: https://status.supabase.com

### Database errors
- Make sure you ran the SQL migrations
- Check the SQL Editor for any error messages
- Verify RLS (Row Level Security) policies are set correctly

## Need Help?

See `STILL_ZONE_SETUP.md` for detailed setup instructions and database schema.

