import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cancelRazorpaySubscription } from '@/lib/razorpay';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * POST /still-zone/api/razorpay/cancel-subscription
 * Cancels the user's Razorpay subscription at end of billing cycle.
 * Body: { userId }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find active plan with Razorpay subscription
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select('id, razorpay_subscription_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (planError) throw planError;

    if (!userPlan) {
      return NextResponse.json({ success: false, message: 'No active subscription found' }, { status: 404 });
    }

    // Cancel on Razorpay (at end of current billing cycle)
    if (userPlan.razorpay_subscription_id) {
      try {
        await cancelRazorpaySubscription(userPlan.razorpay_subscription_id, true);
      } catch (rzpErr) {
        console.error('Razorpay cancellation error:', rzpErr);
        // Continue with DB update even if Razorpay fails — webhook will handle it
      }
    }

    // Update user_plans
    await supabase
      .from('user_plans')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true,
        cancellation_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userPlan.id);

    // Update still_zone_users — keep active until period ends
    // The webhook or a cron job should set subscription_status to 'expired' when period actually ends
    await supabase
      .from('still_zone_users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of your current billing period.',
    });
  } catch (e: unknown) {
    console.error('Cancel subscription error:', e);
    return NextResponse.json({ success: false, message: (e as Error)?.message || 'Cancellation failed' }, { status: 500 });
  }
}
