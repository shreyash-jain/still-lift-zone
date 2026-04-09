export const runtime = 'experimental-edge';

import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

// PUT — update an existing plan
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = getAdminSupabase();
        const { id } = await params;
        const body = await request.json();

        const {
            plan_name, plan_key, description,
            price_inr, price_usd,
            duration_type, duration_days, trial_days,
            features, is_active, is_highlighted,
            highlight_text, icon_name, sort_order,
            razorpay_plan_id_inr, razorpay_plan_id_usd,
        } = body;

        const { data, error } = await supabase
            .from('payment_plans')
            .update({
                plan_name,
                plan_key,
                description,
                price_inr: Number(price_inr) || 0,
                price_usd: Number(price_usd) || 0,
                duration_type,
                duration_days: Number(duration_days) || 30,
                trial_days: Number(trial_days) || 0,
                features,
                is_active,
                is_highlighted,
                highlight_text,
                icon_name,
                sort_order: Number(sort_order) || 0,
                razorpay_plan_id_inr,
                razorpay_plan_id_usd,
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

// DELETE — delete a plan
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = getAdminSupabase();
        const { id } = await params;

        const { error } = await supabase
            .from('payment_plans')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}
