/**
 * Razorpay Order Creation API
 * POST /api/razorpay/order
 * 
 * Creates a Razorpay order and stores the intent in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getRazorpayClient,
    getPaymentPlanByKey,
    createUserPlan,
    createInvoice,
    generateReceiptId,
    CreateOrderRequest,
    CreateOrderResponse,
} from '@/lib/razorpay';
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: Get authenticated user from request
// ═══════════════════════════════════════════════════════════════════════════════

async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
    try {
        let token: string | null = null;

        // 1. Try Authorization header
        const authHeader = request.headers.get('authorization');

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.replace('Bearer ', '');
        }

        // 2. Fallback to access_token cookie
        if (!token) {
            const cookieStore = request.cookies;
            const accessToken = cookieStore.get('access_token');
            if (accessToken) {
                token = accessToken.value;
            }
        }

        if (!token) {
            return null;
        }

        // Create a Supabase client to verify the token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email || '',
        };
    } catch (error) {
        console.error('Error getting authenticated user:', error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST Handler
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: CreateOrderRequest = await request.json();
        const { plan_key, currency } = body;

        // Validate required fields
        if (!plan_key) {
            return NextResponse.json(
                { success: false, error: 'plan_key is required' },
                { status: 400 }
            );
        }

        if (!currency || !['INR', 'USD'].includes(currency)) {
            return NextResponse.json(
                { success: false, error: 'Invalid currency. Must be INR or USD' },
                { status: 400 }
            );
        }

        // Get authenticated user (optional - can allow guest checkout)
        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Fetch the payment plan from database
        const plan = await getPaymentPlanByKey(plan_key);

        if (!plan) {
            return NextResponse.json(
                { success: false, error: `Plan '${plan_key}' not found` },
                { status: 404 }
            );
        }

        // Get the amount in smallest unit based on currency
        const amount = currency === 'INR' ? plan.price_inr : plan.price_usd;

        // Generate unique receipt ID
        const receipt = generateReceiptId(plan_key);

        // Create Razorpay order
        const razorpay = getRazorpayClient();

        const orderOptions = {
            amount: amount,
            currency: currency,
            receipt: receipt,
            notes: {
                plan_key: plan_key,
                plan_name: plan.plan_name,
                user_id: user.id,
                user_email: user.email,
            },
        };

        const razorpayOrder = await razorpay.orders.create(orderOptions);

        // Store order intent in database
        const userPlan = await createUserPlan({
            userId: user.id,
            planId: plan.id,
            planKey: plan_key,
            razorpayOrderId: razorpayOrder.id,
            amount: amount,
            currency: currency,
        });

        // Create pending invoice
        await createInvoice({
            userId: user.id,
            userPlanId: userPlan.id,
            planId: plan.id,
            razorpayOrderId: razorpayOrder.id,
            amount: amount,
            currency: currency,
            billingEmail: user.email,
        });

        // Return order details to frontend
        const response: CreateOrderResponse = {
            success: true,
            order_id: userPlan.id,
            razorpay_order_id: razorpayOrder.id,
            amount: amount,
            currency: currency,
            plan_key: plan_key,
            plan_name: plan.plan_name,
            receipt: receipt,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error creating Razorpay order:', error);

        // Return detailed error for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';

        console.error('Error details:', { errorMessage, errorStack });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create order',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            },
            { status: 500 }
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET Handler - Get order status
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('order_id');

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'order_id is required' },
                { status: 400 }
            );
        }

        const razorpay = getRazorpayClient();
        const order = await razorpay.orders.fetch(orderId);

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                status: order.status,
                amount: order.amount,
                amount_paid: order.amount_paid,
                currency: order.currency,
            },
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch order status' },
            { status: 500 }
        );
    }
}
