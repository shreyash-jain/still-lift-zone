/**
 * Razorpay Signature Verification
 * Implements HMAC SHA256 signature verification for payment security
 */

import crypto from 'crypto';
import { razorpayConfig } from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// Payment Signature Verification
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify Razorpay payment signature
 * Used after successful payment on frontend to verify authenticity
 * 
 * @param orderId - The Razorpay order ID
 * @param paymentId - The Razorpay payment ID
 * @param signature - The signature from Razorpay
 * @returns boolean indicating if signature is valid
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        console.error('RAZORPAY_KEY_SECRET not configured');
        return false;
    }

    try {
        // Razorpay signature verification:
        // signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        // Constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Webhook Signature Verification
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify Razorpay webhook signature
 * CRITICAL: Must be verified before processing any webhook event
 * 
 * @param payload - The raw webhook payload string
 * @param signature - The X-Razorpay-Signature header value
 * @returns boolean indicating if webhook is authentic
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string
): boolean {
    const webhookSecret = razorpayConfig.webhookSecret;

    if (!webhookSecret) {
        console.error('RAZORPAY_WEBHOOK_SECRET not configured');
        return false;
    }

    try {
        // Webhook signature verification:
        // signature = HMAC-SHA256(payload, webhook_secret)
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex');

        // Constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Subscription Signature Verification (for recurring payments)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify Razorpay subscription signature
 * Used for subscription-based payments
 * 
 * @param paymentId - The Razorpay payment ID
 * @param subscriptionId - The Razorpay subscription ID
 * @param signature - The signature from Razorpay
 * @returns boolean indicating if signature is valid
 */
export function verifySubscriptionSignature(
    paymentId: string,
    subscriptionId: string,
    signature: string
): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        console.error('RAZORPAY_KEY_SECRET not configured');
        return false;
    }

    try {
        // Subscription signature verification:
        // signature = HMAC-SHA256(payment_id + "|" + subscription_id, secret)
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${paymentId}|${subscriptionId}`)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (error) {
        console.error('Subscription signature verification error:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Error Types
// ═══════════════════════════════════════════════════════════════════════════════

export class SignatureVerificationError extends Error {
    type: 'payment' | 'webhook' | 'subscription';

    constructor(type: 'payment' | 'webhook' | 'subscription', details?: string) {
        super(`${type} signature verification failed${details ? `: ${details}` : ''}`);
        this.name = 'SignatureVerificationError';
        this.type = type;
    }
}
