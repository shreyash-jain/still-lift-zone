import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// User-facing content API — returns active content for a given mood+context+supportType+timeKey
export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role so RLS SELECT policy works reliably

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ success: false, message: 'Server config error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { searchParams } = new URL(request.url);

        const mood = searchParams.get('mood');
        const context = searchParams.get('context');
        const supportType = searchParams.get('supportType');
        const timeKey = searchParams.get('timeKey');

        if (!mood || !context || !supportType || !timeKey) {
            return NextResponse.json(
                { success: false, message: 'mood, context, supportType, and timeKey are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('still_zone_content')
            .select('*')
            .eq('mood', mood)
            .eq('context', context)
            .eq('support_type', supportType)
            .eq('time_key', timeKey)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}
