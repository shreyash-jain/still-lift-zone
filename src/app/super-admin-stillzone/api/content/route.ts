
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

// GET — list content with optional filters
export async function GET(request: NextRequest) {
    try {
        const supabase = getAdminSupabase();
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, Number(searchParams.get('page')) || 1);
        const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 10));
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Count query (same filters, no range)
        let countQuery = supabase
            .from('still_zone_content')
            .select('id', { count: 'exact', head: true });

        let query = supabase
            .from('still_zone_content')
            .select('*')
            .order('mood')
            .order('context')
            .order('support_type')
            .order('time_key')
            .order('sort_order', { ascending: true })
            .range(from, to);

        const mood = searchParams.get('mood');
        const context = searchParams.get('context');
        const support_type = searchParams.get('support_type');
        const time_key = searchParams.get('time_key');

        if (mood) { query = query.eq('mood', mood); countQuery = countQuery.eq('mood', mood); }
        if (context) { query = query.eq('context', context); countQuery = countQuery.eq('context', context); }
        if (support_type) { query = query.eq('support_type', support_type); countQuery = countQuery.eq('support_type', support_type); }
        if (time_key) { query = query.eq('time_key', time_key); countQuery = countQuery.eq('time_key', time_key); }

        const [{ data, error }, { count, error: countError }] = await Promise.all([query, countQuery]);

        if (error) throw error;
        if (countError) throw countError;

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: data || [],
            pagination: { page, limit, total, totalPages },
        });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}

// POST — create a new content entry
export async function POST(request: Request) {
    try {
        const supabase = getAdminSupabase();
        const body = await request.json();

        const {
            mood, context, support_type, time_key, action_type,
            heading, message, display_time, audio_url,
            is_combo, combo_second_message,
            combo_first_audio_url, combo_second_audio_url,
            is_active, sort_order,
        } = body;

        if (!mood || !context || !support_type || !time_key || !action_type || !message) {
            return NextResponse.json(
                { success: false, message: 'mood, context, support_type, time_key, action_type, and message are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('still_zone_content')
            .insert({
                mood,
                context,
                support_type,
                time_key,
                action_type,
                heading: heading || null,
                message,
                display_time: Number(display_time) || 60,
                audio_url: audio_url || null,
                is_combo: is_combo ?? false,
                combo_second_message: combo_second_message || null,
                combo_first_audio_url: combo_first_audio_url || null,
                combo_second_audio_url: combo_second_audio_url || null,
                is_active: is_active ?? true,
                sort_order: Number(sort_order) || 0,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}
