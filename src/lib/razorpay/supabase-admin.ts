/**
 * Supabase Admin Client
 * Uses service role key for server-side operations
 * NEVER import this in client-side code!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════════
// Admin Client
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get Supabase admin client with service role privileges
 * This bypasses RLS and should only be used in server-side code
 * 
 * @throws Error if service role key is not configured
 */
export function getSupabaseAdmin(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
    }

    if (!supabaseServiceKey) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
            'This is required for webhook operations. ' +
            'Get it from Supabase Dashboard > Settings > API'
        );
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Check if admin client is properly configured
 */
export function isAdminConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
