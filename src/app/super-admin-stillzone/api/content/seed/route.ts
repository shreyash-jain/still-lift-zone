export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';
import { STILL_ZONE_CONTENT_LIBRARY } from '@/lib/still-zone-content';

// POST — seed the still_zone_content table from the hardcoded content library
export async function POST() {
    try {
        const supabase = getAdminSupabase();

        // Check if data already exists
        const { count, error: countError } = await supabase
            .from('still_zone_content')
            .select('id', { count: 'exact', head: true });

        if (countError) throw countError;

        if (count && count > 0) {
            return NextResponse.json({
                success: false,
                message: `Table already has ${count} entries. Clear the table first if you want to re-seed.`,
            }, { status: 409 });
        }

        // Build rows from the nested content library
        const rows: Record<string, unknown>[] = [];

        for (const [mood, contexts] of Object.entries(STILL_ZONE_CONTENT_LIBRARY)) {
            for (const [context, supportTypes] of Object.entries(contexts)) {
                for (const [supportType, timeKeys] of Object.entries(supportTypes)) {
                    for (const [timeKey, messages] of Object.entries(timeKeys)) {
                        for (let i = 0; i < messages.length; i++) {
                            const msg = messages[i];
                            rows.push({
                                mood,
                                context,
                                support_type: supportType,
                                time_key: timeKey,
                                action_type: msg.actionType,
                                heading: null,
                                message: msg.message,
                                display_time: msg.displayTime,
                                audio_url: msg.audioSrc || null,
                                is_combo: msg.isCombo || false,
                                combo_second_message: msg.comboSecondMessage || null,
                                combo_first_audio_url: msg.comboFirstAudioSrc || null,
                                combo_second_audio_url: msg.comboSecondAudioSrc || null,
                                is_active: true,
                                sort_order: i,
                            });
                        }
                    }
                }
            }
        }

        if (rows.length === 0) {
            return NextResponse.json({ success: true, message: 'No content found in library to seed.' });
        }

        // Insert in batches of 100
        let inserted = 0;
        for (let i = 0; i < rows.length; i += 100) {
            const batch = rows.slice(i, i + 100);
            const { error } = await supabase
                .from('still_zone_content')
                .insert(batch);
            if (error) throw error;
            inserted += batch.length;
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${inserted} content entries successfully.`,
        });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Seed failed' }, { status: 500 });
    }
}
