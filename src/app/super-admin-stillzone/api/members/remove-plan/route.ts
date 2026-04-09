import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.SUPER_ADMIN_JWT_SECRET || 'fallback-secret-if-missing';

async function getAdminFromCookie(request: Request): Promise<string | null> {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/super_admin_session=([^;]+)/);
    if (!match) return null;
    try {
        const { payload } = await jwtVerify(match[1], new TextEncoder().encode(JWT_SECRET));
        return (payload.email as string) || null;
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const adminEmail = await getAdminFromCookie(request);
        if (!adminEmail) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
        }

        const supabase = getAdminSupabase();

        // Fetch the user's active plan(s)
        const { data: activePlans, error: planFetchError } = await supabase
            .from('user_plans')
            .select('id, user_id, plan_id, plan_key, status, razorpay_subscription_id, razorpay_order_id')
            .eq('user_id', userId)
            .in('status', ['active', 'trialing']);

        if (planFetchError) throw planFetchError;

        if (!activePlans || activePlans.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'This user has no active subscription plan to remove.'
            }, { status: 400 });
        }

        // Fetch user profile for logging/email
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        const cancelledPlans: string[] = [];
        const razorpayErrors: string[] = [];

        // For each active plan, attempt Razorpay subscription cancellation if applicable
        for (const plan of activePlans) {
            if (plan.razorpay_subscription_id) {
                try {
                    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
                    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
                    if (razorpayKeyId && razorpayKeySecret) {
                        const credentials = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
                        const rzpRes = await fetch(
                            `https://api.razorpay.com/v1/subscriptions/${plan.razorpay_subscription_id}/cancel`,
                            {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Basic ${credentials}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ cancel_at_cycle_end: 0 }),
                            }
                        );
                        if (!rzpRes.ok) {
                            const err = await rzpRes.json();
                            razorpayErrors.push(`Razorpay cancel failed: ${err.error?.description || rzpRes.statusText}`);
                        }
                    }
                } catch (rzpErr: unknown) {
                    razorpayErrors.push(`Razorpay error: ${((rzpErr as Error).message)}`);
                }
            }

            // Update plan status to 'cancelled' in DB
            const { error: updateError } = await supabase
                .from('user_plans')
                .update({
                    status: 'cancelled',
                    cancel_at_period_end: true,
                    cancellation_requested_at: new Date().toISOString(),
                    cancellation_reason: `Cancelled by SuperAdmin (${adminEmail})`,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', plan.id);

            if (updateError) throw updateError;
            cancelledPlans.push(plan.plan_key || plan.id);
        }

        // Set account_status to Inactive in profiles
        await supabase
            .from('profiles')
            .update({ account_status: 'Inactive' })
            .eq('id', userId);

        // Try sending cancellation email (non-fatal)
        if (profile?.email) {
            try {
                const resendApiKey = process.env.RESEND_API_KEY;
                const emailFrom = process.env.EMAIL_FROM || 'StillZone <onboarding@resend.dev>';
                if (resendApiKey) {
                    await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${resendApiKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            from: emailFrom,
                            to: [profile.email],
                            subject: 'Your StillZone Subscription Has Been Cancelled',
                            html: `
                                <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                    <h2 style="color: #1e293b;">Subscription Cancelled</h2>
                                    <p>Hi <strong>${profile.full_name || 'there'}</strong>,</p>
                                    <p>Your <strong>${cancelledPlans.join(', ')}</strong> subscription on StillZone has been cancelled by the administrator.</p>
                                    <p>You have been moved to the free plan. All premium features and benefits have been revoked immediately.</p>
                                    <p>If you believe this was done in error, please contact our support team.</p>
                                    <br/>
                                    <p style="color: #64748b; font-size: 14px;">— The StillZone Team</p>
                                </div>
                            `,
                        }),
                    });
                }
            } catch (emailErr) {
                console.warn('Email notification failed:', emailErr);
            }
        }

        // Log to activity log table (silent if table not found)
        try {
            await supabase.from('super_admin_activity_log').insert({
                admin_email: adminEmail,
                action: 'remove_plan',
                target_user_id: userId,
                target_user_email: profile?.email,
                target_user_name: profile?.full_name,
                details: `Cancelled plans: ${cancelledPlans.join(', ')}. Account set to Inactive.`,
                created_at: new Date().toISOString(),
            });
        } catch { /* silent */ }

        return NextResponse.json({
            success: true,
            message: `Successfully removed subscription for ${profile?.full_name || userId}.`,
            cancelledPlans,
            razorpayWarnings: razorpayErrors.length > 0 ? razorpayErrors : undefined,
        });

    } catch (error: unknown) {
        console.error('Remove plan error:', error);
        return NextResponse.json({
            success: false,
            message: ((error as Error)?.message) || 'An unexpected error occurred.'
        }, { status: 500 });
    }
}
