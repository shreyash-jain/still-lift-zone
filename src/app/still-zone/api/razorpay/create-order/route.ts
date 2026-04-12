import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRazorpaySubscription } from '@/lib/razorpay-subscriptions';



/**
 * POST /still-zone/api/razorpay/create-order
 * Creates a Razorpay subscription for a selected plan.
 * - Plans with trial_days > 0: subscription with trial (card collected, charge deferred)
 * - Plans with trial_days = 0: immediate charge via Razorpay subscription
 * Body: { planId, currency: 'INR' | 'USD', userId }
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    const body = await request.json();
    const { planId, currency = 'INR', userId } = body;

    if (!planId || !userId) {
      return NextResponse.json({ success: false, message: 'planId and userId are required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ success: false, message: 'Plan not found' }, { status: 404 });
    }

    // Get Razorpay plan ID based on currency
    const razorpayPlanId = currency === 'INR' ? plan.razorpay_plan_id_inr : plan.razorpay_plan_id_usd;

    if (!razorpayPlanId) {
      return NextResponse.json({
        success: false,
        message: `No Razorpay plan configured for ${currency}. Please contact support.`,
      }, { status: 400 });
    }

    const totalCount = plan.duration_type === 'yearly' ? 5 : plan.duration_type === 'monthly' ? 60 : 1;
    const hasTrial = plan.trial_days && plan.trial_days > 0;

    // Create Razorpay subscription
    // For trial plans: Razorpay won't charge until trial ends (configured in Razorpay plan)
    // For non-trial plans: Razorpay charges immediately on subscription activation
    const subscription = await createRazorpaySubscription(razorpayPlanId, totalCount, {
      plan_id: planId,
      plan_key: plan.plan_key,
      user_id: userId,
      has_trial: hasTrial ? 'true' : 'false',
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      razorpayKeyId: RAZORPAY_KEY_ID,
      planName: plan.plan_name,
      hasTrial,
      trialDays: plan.trial_days || 0,
    });
  } catch (e: unknown) {
    console.error('Create subscription error:', e);
    return NextResponse.json({
      success: false,
      message: (e as Error)?.message || 'Failed to create subscription',
    }, { status: 500 });
  }
}
