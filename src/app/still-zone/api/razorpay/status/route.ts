/**
 * Payment Status API
 * GET /api/razorpay/status
 * 
 * Returns the current subscription status for a user with full details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/razorpay/supabase-admin';

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: Get authenticated user
// ═══════════════════════════════════════════════════════════════════════════════

async function getAuthenticatedUser(request: NextRequest): Promise<string | null> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.replace('Bearer ', '');

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return null;
        }

        return user.id;
    } catch {
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET Handler - Get Payment/Subscription Status with Full Details
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const userId = await getAuthenticatedUser(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get user's active plan with payment plan details
        const { data: userPlan, error: planError } = await supabase
            .from('user_plans')
            .select('*, payment_plans(*)')
            .eq('user_id', userId)
            .in('status', ['active', 'trial', 'pending'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (planError) {
            console.error('Error fetching user plan:', planError);
            throw new Error('Failed to fetch plan');
        }

        // Get user's recent invoices
        const { data: invoices, error: invoiceError } = await supabase
            .from('user_invoices')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (invoiceError) {
            console.error('Error fetching invoices:', invoiceError);
        }

        // If no active plan
        if (!userPlan) {
            // Check if user ever had a plan
            const { data: anyPlan } = await supabase
                .from('user_plans')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            return NextResponse.json({
                success: true,
                has_subscription: false,
                status: anyPlan?.status || 'none',
                is_active: false,
                message: 'No active subscription',
                last_plan: anyPlan ? {
                    plan_key: anyPlan.plan_key,
                    status: anyPlan.status,
                    ended_at: anyPlan.subscription_end_date,
                } : null,
                invoices: invoices || [],
            });
        }

        // Calculate days remaining
        let daysRemaining: number | null = null;
        let isExpired = false;

        if (userPlan.subscription_end_date) {
            const endDate = new Date(userPlan.subscription_end_date);
            const now = new Date();
            daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            isExpired = daysRemaining < 0;
        }

        // Format amount for display
        const formatAmount = (amount: number, currency: string) => {
            const value = amount / 100;
            return currency === 'INR'
                ? `₹${value.toLocaleString('en-IN')}`
                : `$${value.toLocaleString('en-US')}`;
        };

        // Build response
        const response = {
            success: true,
            has_subscription: true,
            is_active: !isExpired && (userPlan.status === 'active' || userPlan.status === 'trial'),
            status: isExpired ? 'expired' : userPlan.status,

            // Current Plan Details
            current_plan: {
                id: userPlan.id,
                plan_key: userPlan.plan_key,
                plan_name: userPlan.payment_plans?.plan_name || userPlan.plan_key,
                description: userPlan.payment_plans?.description || null,
                features: userPlan.payment_plans?.features || [],
                icon_name: userPlan.payment_plans?.icon_name || 'zap',
            },

            // Subscription Dates
            subscription: {
                start_date: userPlan.subscription_start_date,
                end_date: userPlan.subscription_end_date,
                days_remaining: isExpired ? 0 : daysRemaining,
                is_expired: isExpired,
            },

            // Payment Details
            payment: {
                amount: userPlan.amount_paid,
                amount_formatted: userPlan.amount_paid
                    ? formatAmount(userPlan.amount_paid, userPlan.currency || 'INR')
                    : null,
                currency: userPlan.currency,
                razorpay_order_id: userPlan.razorpay_order_id,
                razorpay_payment_id: userPlan.razorpay_payment_id,
                paid_at: userPlan.created_at,
            },

            // Recent Invoices
            invoices: (invoices || []).map(inv => ({
                id: inv.id,
                invoice_number: inv.invoice_number,
                amount: inv.total_amount,
                amount_formatted: inv.total_amount
                    ? formatAmount(inv.total_amount, inv.currency || 'INR')
                    : null,
                currency: inv.currency,
                status: inv.status,
                payment_method: inv.payment_method,
                paid_at: inv.paid_at,
                created_at: inv.created_at,
                invoice_pdf_url: inv.invoice_pdf_url,
            })),
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching payment status:', error);

        return NextResponse.json(
            { success: false, error: 'Failed to fetch status' },
            { status: 500 }
        );
    }
}
