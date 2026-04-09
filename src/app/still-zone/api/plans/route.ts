export const runtime = 'experimental-edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
    try {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('payment_plans')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, plans: data });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Failed to load plans' }, { status: 500 });
    }
}
