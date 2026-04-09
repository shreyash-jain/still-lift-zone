/**
 * Razorpay Payment Verification API
 * POST /api/razorpay/verify
 * 
 * Verifies payment signature from frontend callback
 * This provides an additional layer of security before confirming payment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    verifyPaymentSignature,
    getUserPlanByOrderId,
    updateUserPlanStatus,
    getPaymentPlanByKey,
    calculateEndDate,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
} from '@/lib/razorpay';

// ═══════════════════════════════════════════════════════════════════════════════
// POST Handler - Verify Payment
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
    try {
        const body: VerifyPaymentRequest = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature'
                },
                { status: 400 }
            );
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // Verify the payment signature
        // ═══════════════════════════════════════════════════════════════════════════

        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.error('Payment signature verification failed:', {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
            });

            return NextResponse.json<VerifyPaymentResponse>(
                {
                    success: false,
                    message: 'Payment signature verification failed. This payment may be fraudulent.'
                },
                { status: 400 }
            );
        }

        console.log('Payment signature verified successfully:', {
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
        });

        // ═══════════════════════════════════════════════════════════════════════════
        // Update database (if webhook hasn't already processed it)
        // ═══════════════════════════════════════════════════════════════════════════

        // Get the existing user plan
        const existingPlan = await getUserPlanByOrderId(razorpay_order_id);

        if (!existingPlan) {
            console.warn('No user plan found for order:', razorpay_order_id);
            return NextResponse.json<VerifyPaymentResponse>(
                {
                    success: false,
                    message: 'Order not found in our records'
                },
                { status: 404 }
            );
        }

        // If already active (processed by webhook), just confirm
        if (existingPlan.status === 'active') {
            console.log('Payment already processed by webhook');
            return NextResponse.json<VerifyPaymentResponse>({
                success: true,
                message: 'Payment already verified and active',
                user_plan_id: existingPlan.id,
            });
        }

        // Update the plan status to active
        // Note: The webhook is the primary source of truth, but this serves as a backup
        const plan = await getPaymentPlanByKey(existingPlan.plan_key);
        const startDate = new Date();
        const endDate = plan
            ? calculateEndDate(plan.duration_days, startDate)
            : calculateEndDate(30, startDate);

        const updatedPlan = await updateUserPlanStatus({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            status: 'active',
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
        });

        // Also update the invoice
        const { updateInvoiceOnCapture } = await import('@/lib/razorpay');
        await updateInvoiceOnCapture({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paymentMethod: 'verified_via_frontend',
        });

        return NextResponse.json<VerifyPaymentResponse>({
            success: true,
            message: 'Payment verified successfully',
            user_plan_id: updatedPlan?.id,
        });

    } catch (error) {
        console.error('Payment verification error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json<VerifyPaymentResponse>(
            {
                success: false,
                message: 'An error occurred during verification',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            } as VerifyPaymentResponse,
            { status: 500 }
        );
    }
}
