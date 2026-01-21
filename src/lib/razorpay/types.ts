/**
 * Razorpay Integration Types
 * Comprehensive type definitions for the payment system
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Database Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaymentPlan {
    id: string;
    plan_key: string;
    plan_name: string;
    description: string | null;
    price_inr: number;
    price_usd: number;
    duration_type: 'monthly' | 'yearly' | 'one_time' | 'lifetime';
    duration_days: number;
    trial_days: number;
    features: string[];
    is_active: boolean;
    is_highlighted: boolean;
    highlight_text: string | null;
    icon_name: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export type UserPlanStatus =
    | 'pending'
    | 'trial'
    | 'active'
    | 'expired'
    | 'cancelled'
    | 'failed';

export interface UserPlan {
    id: string;
    user_id: string;
    plan_id: string | null;
    plan_key: string;
    status: UserPlanStatus;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    razorpay_subscription_id: string | null;
    trial_start_date: string | null;
    trial_end_date: string | null;
    subscription_start_date: string | null;
    subscription_end_date: string | null;
    amount_paid: number | null;
    currency: string;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export type InvoiceStatus =
    | 'pending'
    | 'captured'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';

export interface UserInvoice {
    id: string;
    user_id: string;
    user_plan_id: string | null;
    plan_id: string | null;
    invoice_number: string;
    amount: number;
    currency: string;
    tax_amount: number;
    total_amount: number;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    razorpay_signature: string | null;
    status: InvoiceStatus;
    payment_method: string | null;
    payment_details: Record<string, unknown>;
    invoice_pdf_url: string | null;
    invoice_pdf_generated_at: string | null;
    billing_name: string | null;
    billing_email: string | null;
    billing_address: Record<string, unknown>;
    webhook_payload: Record<string, unknown>;
    webhook_received_at: string | null;
    created_at: string;
    updated_at: string;
    paid_at: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Request/Response Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateOrderRequest {
    plan_key: string;
    currency: 'INR' | 'USD';
    user_id?: string;  // Optional: passed from authenticated context
}

export interface CreateOrderResponse {
    success: boolean;
    order_id: string;
    razorpay_order_id: string;
    amount: number;
    currency: string;
    plan_key: string;
    plan_name: string;
    receipt: string;
}

export interface VerifyPaymentRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    user_plan_id?: string;
}

export interface PaymentStatusResponse {
    success: boolean;
    status: UserPlanStatus;
    plan?: PaymentPlan;
    subscription_end_date?: string;
    is_active: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Razorpay Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    offer_id: string | null;
    status: 'created' | 'attempted' | 'paid';
    attempts: number;
    notes: Record<string, string>;
    created_at: number;
}

export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
    order_id: string;
    invoice_id: string | null;
    international: boolean;
    method: 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi' | 'bank_transfer';
    amount_refunded: number;
    refund_status: string | null;
    captured: boolean;
    description: string | null;
    card_id: string | null;
    card?: {
        id: string;
        entity: string;
        name: string;
        last4: string;
        network: string;
        type: string;
        issuer: string | null;
        international: boolean;
        emi: boolean;
        sub_type: string;
    };
    bank: string | null;
    wallet: string | null;
    vpa: string | null;
    email: string;
    contact: string;
    customer_id: string | null;
    notes: Record<string, string>;
    fee: number;
    tax: number;
    error_code: string | null;
    error_description: string | null;
    error_source: string | null;
    error_step: string | null;
    error_reason: string | null;
    acquirer_data: Record<string, unknown>;
    created_at: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Webhook Types
// ═══════════════════════════════════════════════════════════════════════════════

export type WebhookEventType =
    | 'payment.authorized'
    | 'payment.captured'
    | 'payment.failed'
    | 'order.paid'
    | 'refund.created'
    | 'refund.processed';

export interface RazorpayWebhookEvent {
    entity: 'event';
    account_id: string;
    event: WebhookEventType;
    contains: string[];
    payload: {
        payment?: {
            entity: RazorpayPayment;
        };
        order?: {
            entity: RazorpayOrder;
        };
    };
    created_at: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Checkout Options
// ═══════════════════════════════════════════════════════════════════════════════

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayPaymentResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    image?: string;
    modal?: {
        ondismiss?: () => void;
        confirm_close?: boolean;
        escape?: boolean;
        animation?: boolean;
        backdropclose?: boolean;
    };
}

export interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Error Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface RazorpayError {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id?: string;
            payment_id?: string;
        };
    };
}

export class PaymentError extends Error {
    code: string;
    source: string;

    constructor(message: string, code: string, source: string = 'internal') {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
        this.source = source;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

export const PAYMENT_STATUS_LABELS: Record<UserPlanStatus, string> = {
    pending: 'Pending',
    trial: 'Trial',
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
    failed: 'Failed',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    pending: 'Pending',
    captured: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded',
};
