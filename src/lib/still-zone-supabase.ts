// Still Zone - Supabase Client Configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These should be set as environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Still Zone: Supabase credentials not configured.\n' +
    'Please create a .env.local file with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n\n' +
    'For now, Still Zone will run in demo mode without authentication.'
  );
}

// Create Supabase client with fallback dummy values for development
// This allows the app to run without crashing when Supabase isn't configured
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

// Database types for Still Zone
export interface StillZoneUser {
  id: string;
  email: string;
  trial_start_date: string | null;
  trial_end_date: string | null;
  trial_active: boolean;
  subscription_status: 'none' | 'active' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface StillZoneQuestionnaire {
  user_id: string;
  mood_category: string | null;
  session_duration: string | null;
  support_type: string | null;
  affiliate_opt_in: boolean;
  created_at: string;
}

