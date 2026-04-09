import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { createInvoice, updateInvoiceOnCapture } from '@/lib/razorpay/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, userId, planId, planKey } = body;

    console.log('[verify-payment] Start:', { userId, planId, planKey });

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required payment fields' }, { status: 400 });
    }

    const isValid = await verifyRazorpaySignature(razorpay_payment_id, razorpay_subscription_id, razorpay_signature);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid payment signature.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const now = new Date().toISOString();

    // ── 1. Get plan details ──
    let durationDays = 30;
    let hasTrial = false;
    let planPriceInr = 0;
    let planName = planKey || 'Unknown';
    if (planId) {
      const { data: plan } = await supabase.from('payment_plans').select('*').eq('id', planId).single();
      if (plan) {
        durationDays = plan.duration_days || 30;
        hasTrial = (plan.trial_days || 0) > 0;
        planPriceInr = plan.price_inr || 0;
        planName = plan.plan_name || planKey;
      }
    }
    const periodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // ── 2. Ensure profiles exists (FK for user_plans.user_id) ──
    const { data: profileCheck } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!profileCheck) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
      await supabase.from('profiles').insert({
        id: userId, full_name: authUser?.user_metadata?.full_name || null,
        email: authUser?.email || '', provider: authUser?.app_metadata?.provider || 'unknown',
      });
    }

    // ── 3. Ensure still_zone_users exists ──
    const { data: szCheck } = await supabase.from('still_zone_users').select('id').eq('id', userId).maybeSingle();
    if (!szCheck) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
      await supabase.from('still_zone_users').insert({
        id: userId, email: authUser?.email || '',
        full_name: authUser?.user_metadata?.full_name || null,
        subscription_status: 'none', trial_active: false,
      });
    }

    // ── 4. Find or create user_plans record ──
    const { data: existingPlan } = await supabase
      .from('user_plans').select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle();

    const planRecord = {
      status: 'active',
      plan_id: planId || null,
      plan_key: planKey || null,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      subscription_start_date: now,
      current_period_end: periodEnd,
      amount_paid: planPriceInr,
      currency: 'INR',
      is_recurring: true,
      updated_at: now,
    };

    let userPlanId: string | null = null;

    if (existingPlan) {
      await supabase.from('user_plans').update(planRecord).eq('id', existingPlan.id);
      userPlanId = existingPlan.id;
      console.log('[verify-payment] Updated plan:', existingPlan.id, 'amount_paid:', planPriceInr);
    } else {
      const { data: inserted } = await supabase.from('user_plans')
        .insert({ user_id: userId, ...planRecord }).select('id').single();
      userPlanId = inserted?.id || null;
      console.log('[verify-payment] Inserted plan:', userPlanId, 'amount_paid:', planPriceInr);
    }

    // ── 5. Update still_zone_users ──
    const szUpdate = hasTrial
      ? { subscription_status: 'active', trial_active: true, updated_at: now }
      : { subscription_status: 'active', trial_active: false, trial_start_date: null, trial_end_date: null, updated_at: now };
    await supabase.from('still_zone_users').update(szUpdate).eq('id', userId);

    // ── 6. Create invoice in user_invoices ──
    try {
      // Get user email for invoice
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);

      await createInvoice({
        userId,
        userPlanId: userPlanId || '',
        planId: planId || '',
        razorpayOrderId: razorpay_subscription_id, // Use subscription ID as order reference
        amount: planPriceInr,
        currency: 'INR',
        billingEmail: authUser?.email || '',
        billingName: authUser?.user_metadata?.full_name || '',
      });

      // Mark invoice as captured
      await updateInvoiceOnCapture({
        razorpayOrderId: razorpay_subscription_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      console.log('[verify-payment] Invoice created and captured');
    } catch (invErr) {
      // Invoice creation is non-fatal — don't fail the whole payment
      console.error('[verify-payment] Invoice error (non-fatal):', (invErr as Error).message);
    }

    // ── 7. Verify ──
    const { data: finalPlan } = await supabase.from('user_plans')
      .select('id, status, amount_paid').eq('user_id', userId).eq('status', 'active').maybeSingle();
    console.log('[verify-payment] Final:', { plan: finalPlan });

    return NextResponse.json({ success: true, message: 'Subscription activated!' });
  } catch (e: unknown) {
    console.error('[verify-payment] Fatal:', e);
    return NextResponse.json({ success: false, message: (e as Error)?.message || 'Failed' }, { status: 500 });
  }
}
