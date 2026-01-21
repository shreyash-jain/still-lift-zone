/**
 * Payment Plans API
 * GET /api/razorpay/plans
 * 
 * Returns all active payment plans
 * This endpoint uses the anon key since plans are publicly viewable
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use public client for plans (they're publicly viewable via RLS)
function getPublicSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET Handler - Get All Active Plans
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET() {
    try {
        const supabase = getPublicSupabase();

        // Fetch ALL plans (temporarily removing is_active filter for debugging)
        const { data, error } = await supabase
            .from('payment_plans')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { success: false, error: error.message, code: error.code },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            plans: data || [],
        });

    } catch (error) {
        console.error('Error fetching payment plans:', error);

        return NextResponse.json(
            { success: false, error: 'Failed to fetch plans' },
            { status: 500 }
        );
    }
}
