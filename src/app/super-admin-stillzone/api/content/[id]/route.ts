export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

// PUT — update a content entry
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = getAdminSupabase();
        const { id } = await params;
        const body = await request.json();

        const {
            mood, context, support_type, time_key, action_type,
            heading, message, display_time, audio_url,
            is_combo, combo_second_message,
            combo_first_audio_url, combo_second_audio_url,
            is_active, sort_order,
        } = body;

        const { data, error } = await supabase
            .from('still_zone_content')
            .update({
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
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}

// DELETE — remove a content entry
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = getAdminSupabase();
        const { id } = await params;

        const { error } = await supabase
            .from('still_zone_content')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}
