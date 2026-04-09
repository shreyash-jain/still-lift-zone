
import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

// GET — list all payment plans
export async function GET() {
    try {
        const supabase = getAdminSupabase();
        const { data, error } = await supabase
            .from('payment_plans')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ success: true, data: data || [] });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}

// POST — create a new plan
export async function POST(request: Request) {
    try {
        const supabase = getAdminSupabase();
        const body = await request.json();

        const {
            plan_name, plan_key, description,
            price_inr, price_usd,
            duration_type, duration_days, trial_days,
            features, is_active, is_highlighted,
            highlight_text, icon_name, sort_order,
            razorpay_plan_id_inr, razorpay_plan_id_usd,
        } = body;

        if (!plan_name || !plan_key) {
            return NextResponse.json({ success: false, message: 'plan_name and plan_key are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('payment_plans')
            .insert({
                plan_name,
                plan_key,
                description: description || '',
                price_inr: Number(price_inr) || 0,
                price_usd: Number(price_usd) || 0,
                duration_type: duration_type || 'monthly',
                duration_days: Number(duration_days) || 30,
                trial_days: Number(trial_days) || 0,
                features: features || [],
                is_active: is_active ?? true,
                is_highlighted: is_highlighted ?? false,
                highlight_text: highlight_text || '',
                icon_name: icon_name || '',
                sort_order: Number(sort_order) || 0,
                razorpay_plan_id_inr: razorpay_plan_id_inr || '',
                razorpay_plan_id_usd: razorpay_plan_id_usd || '',
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: (e as Error)?.message || 'Unknown error' }, { status: 500 });
    }
}
