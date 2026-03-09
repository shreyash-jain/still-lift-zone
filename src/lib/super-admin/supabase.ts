import { createClient } from '@supabase/supabase-js';

// Setup Supabase admin client with Service Role to bypass RLS securely
export function getAdminSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase Environment Variables for Admin portal');
    }

    return createClient(supabaseUrl, serviceRoleKey);
}
