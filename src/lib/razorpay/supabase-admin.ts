/**
 * Supabase Admin Client
 * Uses service role key for server-side operations
 * NEVER import this in client-side code!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════════
// Environment Variables
// ═══════════════════════════════════════════════════════════════════════════════

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ═══════════════════════════════════════════════════════════════════════════════
// Admin Client Singleton
// ═══════════════════════════════════════════════════════════════════════════════

let adminClient: SupabaseClient | null = null;

/**
 * Get Supabase admin client with service role privileges
 * This bypasses RLS and should only be used in server-side code
 * 
 * @throws Error if service role key is not configured
 */
export function getSupabaseAdmin(): SupabaseClient {
    if (adminClient) {
        return adminClient;
    }

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

    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return adminClient;
}

/**
 * Check if admin client is properly configured
 */
export function isAdminConfigured(): boolean {
    return !!(supabaseUrl && supabaseServiceKey);
}
