/**
 * Razorpay Database Operations
 * All database operations for the payment system
 */

import { getSupabaseAdmin } from './supabase-admin';
import {
    PaymentPlan,
    UserPlan,
    UserInvoice,
    UserPlanStatus
} from './types';
import { calculateEndDate } from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// Payment Plans Operations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all active payment plans
 */
export async function getActivePaymentPlans(): Promise<PaymentPlan[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching payment plans:', error);
        throw new Error('Failed to fetch payment plans');
    }

    return data || [];
}

/**
 * Get a specific payment plan by key
 */
export async function getPaymentPlanByKey(planKey: string): Promise<PaymentPlan | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('plan_key', planKey)
        .eq('is_active', true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching payment plan:', error);
        throw new Error('Failed to fetch payment plan');
    }

    return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// User Plans Operations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a new user plan record when order is created
 */
export async function createUserPlan(params: {
    userId: string;
    planId: string;
    planKey: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
}): Promise<UserPlan> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('user_plans')
        .insert({
            user_id: params.userId,
            plan_id: params.planId,
            plan_key: params.planKey,
            razorpay_order_id: params.razorpayOrderId,
            amount_paid: params.amount,
            currency: params.currency,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user plan:', error);
        throw new Error('Failed to create user plan');
    }

    return data;
}

/**
 * Update user plan status after payment
 */
export async function updateUserPlanStatus(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    status: UserPlanStatus;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    metadata?: Record<string, unknown>;
}): Promise<UserPlan | null> {
    const supabase = getSupabaseAdmin();

    const updateData: Record<string, unknown> = {
        razorpay_payment_id: params.razorpayPaymentId,
        status: params.status,
        updated_at: new Date().toISOString(),
    };

    if (params.subscriptionStartDate) {
        updateData.subscription_start_date = params.subscriptionStartDate.toISOString();
    }
    if (params.subscriptionEndDate) {
        updateData.subscription_end_date = params.subscriptionEndDate.toISOString();
    }
    if (params.metadata) {
        updateData.metadata = params.metadata;
    }

    const { data, error } = await supabase
        .from('user_plans')
        .update(updateData)
        .eq('razorpay_order_id', params.razorpayOrderId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user plan:', error);
        throw new Error('Failed to update user plan');
    }

    return data;
}

/**
 * Get user's current active plan
 */
export async function getUserActivePlan(userId: string): Promise<UserPlan | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('user_plans')
        .select('*, payment_plans(*)')
        .eq('user_id', userId)
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching user plan:', error);
        throw new Error('Failed to fetch user plan');
    }

    return data;
}

/**
 * Get user plan by Razorpay order ID
 */
export async function getUserPlanByOrderId(orderId: string): Promise<UserPlan | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('user_plans')
        .select('*, payment_plans(*)')
        .eq('razorpay_order_id', orderId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching user plan by order:', error);
        throw new Error('Failed to fetch user plan');
    }

    return data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// User Invoices Operations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create invoice record when order is created
 */
export async function createInvoice(params: {
    userId: string;
    userPlanId: string;
    planId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    billingEmail?: string;
    billingName?: string;
}): Promise<UserInvoice> {
    const supabase = getSupabaseAdmin();

    // Generate invoice number inline (simpler approach)
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString(36).toUpperCase();
    const invoiceNumber = `INV-${year}-${timestamp}`;

    const insertData = {
        user_id: params.userId,
        user_plan_id: params.userPlanId,
        plan_id: params.planId,
        invoice_number: invoiceNumber,
        razorpay_order_id: params.razorpayOrderId,
        amount: params.amount,
        currency: params.currency,
        tax_amount: 0,
        total_amount: params.amount,
        status: 'pending',
        billing_email: params.billingEmail,
        billing_name: params.billingName,
    };

    const { data, error } = await supabase
        .from('user_invoices')
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error('Error creating invoice:', error.message);
        throw new Error(`Failed to create invoice: ${error.message}`);
    }

    return data;
}

/**
 * Update invoice after payment capture
 */
export async function updateInvoiceOnCapture(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    paymentMethod?: string;
    paymentDetails?: Record<string, unknown>;
    webhookPayload?: Record<string, unknown>;
}): Promise<UserInvoice | null> {
    const supabase = getSupabaseAdmin();

    const now = new Date().toISOString();

    // Generate invoice PDF URL (points to an API endpoint that generates PDF on-demand)
    const invoicePdfUrl = `/still-zone/api/razorpay/invoice/${params.razorpayOrderId}/pdf`;

    const { data, error } = await supabase
        .from('user_invoices')
        .update({
            razorpay_payment_id: params.razorpayPaymentId,
            razorpay_signature: params.razorpaySignature,
            status: 'captured',
            payment_method: params.paymentMethod,
            payment_details: params.paymentDetails || {},
            webhook_payload: params.webhookPayload || {},
            webhook_received_at: now,
            paid_at: now,
            updated_at: now,
            // Set invoice PDF fields
            invoice_pdf_url: invoicePdfUrl,
            invoice_pdf_generated_at: now,
        })
        .eq('razorpay_order_id', params.razorpayOrderId)
        .select()
        .single();

    if (error) {
        console.error('Error updating invoice:', error);
        throw new Error('Failed to update invoice');
    }

    return data;
}

/**
 * Update invoice on payment failure
 */
export async function updateInvoiceOnFailure(params: {
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    webhookPayload?: Record<string, unknown>;
    errorDetails?: Record<string, unknown>;
}): Promise<UserInvoice | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('user_invoices')
        .update({
            razorpay_payment_id: params.razorpayPaymentId,
            status: 'failed',
            webhook_payload: params.webhookPayload || {},
            payment_details: params.errorDetails || {},
            webhook_received_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', params.razorpayOrderId)
        .select()
        .single();

    if (error) {
        console.error('Error updating invoice on failure:', error);
        throw new Error('Failed to update invoice');
    }

    return data;
}

/**
 * Get user's invoice history
 */
export async function getUserInvoices(
    userId: string,
    limit = 20
): Promise<UserInvoice[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('user_invoices')
        .select('*, payment_plans(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching user invoices:', error);
        throw new Error('Failed to fetch invoices');
    }

    return data || [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Composite Operations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle successful payment capture
 * Updates both user_plans and user_invoices, and calculates subscription dates
 */
export async function handlePaymentCaptured(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    paymentMethod?: string;
    paymentDetails?: Record<string, unknown>;
    webhookPayload?: Record<string, unknown>;
}): Promise<{ userPlan: UserPlan | null; invoice: UserInvoice | null }> {
    // First, get the user plan to find the associated payment plan
    const userPlan = await getUserPlanByOrderId(params.razorpayOrderId);

    if (!userPlan) {
        console.warn('No user plan found for order:', params.razorpayOrderId);
        return { userPlan: null, invoice: null };
    }

    // Get the payment plan details for duration calculation
    const plan = await getPaymentPlanByKey(userPlan.plan_key);

    const startDate = new Date();
    let endDate: Date;

    if (plan) {
        // Check if plan has trial period
        if (plan.trial_days > 0) {
            const trialEndDate = calculateEndDate(plan.trial_days, startDate);
            endDate = calculateEndDate(plan.duration_days, trialEndDate);
        } else {
            endDate = calculateEndDate(plan.duration_days, startDate);
        }
    } else {
        // Default to 30 days if plan not found
        endDate = calculateEndDate(30, startDate);
    }

    // Update user plan
    const updatedUserPlan = await updateUserPlanStatus({
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        status: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        metadata: params.webhookPayload,
    });

    // Update invoice
    const invoice = await updateInvoiceOnCapture({
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
        paymentMethod: params.paymentMethod,
        paymentDetails: params.paymentDetails,
        webhookPayload: params.webhookPayload,
    });

    return { userPlan: updatedUserPlan, invoice };
}

/**
 * Handle failed payment
 * Updates both user_plans and user_invoices with failure status
 */
export async function handlePaymentFailed(params: {
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    errorCode?: string;
    errorDescription?: string;
    webhookPayload?: Record<string, unknown>;
}): Promise<{ userPlan: UserPlan | null; invoice: UserInvoice | null }> {
    const errorDetails = {
        error_code: params.errorCode,
        error_description: params.errorDescription,
    };

    // Update user plan
    const userPlan = await updateUserPlanStatus({
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId || '',
        status: 'failed',
        metadata: params.webhookPayload,
    });

    // Update invoice
    const invoice = await updateInvoiceOnFailure({
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        webhookPayload: params.webhookPayload,
        errorDetails,
    });

    return { userPlan, invoice };
}
