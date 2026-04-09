/**
 * Razorpay Integration Module
 * Re-exports all payment-related utilities
 */

// Types
export * from './types';

// Configuration
export {
    getRazorpayClient,
    razorpayConfig,
    validateRazorpayConfig,
    formatAmount,
    toSmallestUnit,
    fromSmallestUnit,
    generateReceiptId,
    calculateEndDate,
} from './config';

// Security
export {
    verifyPaymentSignature,
    verifyWebhookSignature,
    verifySubscriptionSignature,
    SignatureVerificationError,
} from './signature';

// Database Operations
export {
    getActivePaymentPlans,
    getPaymentPlanByKey,
    createUserPlan,
    updateUserPlanStatus,
    getUserActivePlan,
    getUserPlanByOrderId,
    createInvoice,
    updateInvoiceOnCapture,
    updateInvoiceOnFailure,
    getUserInvoices,
    handlePaymentCaptured,
    handlePaymentFailed,
} from './database';

// Admin Client (only for server-side use)
export {
    getSupabaseAdmin,
    isAdminConfigured,
} from './supabase-admin';
