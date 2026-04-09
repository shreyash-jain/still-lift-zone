/**
 * Razorpay Configuration
 * Centralized configuration for the payment system
 */

import Razorpay from 'razorpay';

// ═══════════════════════════════════════════════════════════════════════════════
// Environment Validation
// ═══════════════════════════════════════════════════════════════════════════════

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Validate required environment variables
export function validateRazorpayConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!RAZORPAY_KEY_ID) {
        errors.push('NEXT_PUBLIC_RAZORPAY_KEY_ID is not set');
    }
    if (!RAZORPAY_KEY_SECRET) {
        errors.push('RAZORPAY_KEY_SECRET is not set');
    }
    if (!RAZORPAY_WEBHOOK_SECRET) {
        errors.push('RAZORPAY_WEBHOOK_SECRET is not set (required for webhook verification)');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Razorpay Client Singleton
// ═══════════════════════════════════════════════════════════════════════════════

let razorpayInstance: Razorpay | null = null;

/**
 * Get or create the Razorpay client instance
 * Uses singleton pattern to reuse the client across API routes
 */
export function getRazorpayClient(): Razorpay {
    if (razorpayInstance) {
        return razorpayInstance;
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error(
            'Razorpay credentials not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.'
        );
    }

    razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    return razorpayInstance;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration Constants
// ═══════════════════════════════════════════════════════════════════════════════

export const razorpayConfig = {
    // Public key for frontend
    publicKey: RAZORPAY_KEY_ID || '',

    // Webhook secret for signature verification
    webhookSecret: RAZORPAY_WEBHOOK_SECRET || '',

    // Checkout appearance
    theme: {
        color: '#0d9488', // Teal-600 to match Still Zone branding
    },

    // Company details
    businessName: 'Still Zone',
    businessLogo: '/Logo%20stilllift%20new.svg',

    // Supported currencies
    supportedCurrencies: ['INR', 'USD'] as const,

    // Default currency
    defaultCurrency: 'INR' as const,

    // API endpoints
    endpoints: {
        createOrder: '/still-zone/api/razorpay/order',
        verifyPayment: '/still-zone/api/razorpay/verify',
        getPaymentStatus: '/still-zone/api/razorpay/status',
        webhook: '/still-zone/api/razorpay/webhook',
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format amount for display (convert from smallest unit)
 */
export function formatAmount(amount: number, currency: string): string {
    const value = amount / 100;
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

/**
 * Convert amount to smallest unit (paise/cents)
 */
export function toSmallestUnit(amount: number): number {
    return Math.round(amount * 100);
}

/**
 * Convert from smallest unit to regular amount
 */
export function fromSmallestUnit(amount: number): number {
    return amount / 100;
}

/**
 * Generate a unique receipt ID
 */
export function generateReceiptId(planKey: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${planKey}_${timestamp}_${random}`;
}

/**
 * Calculate subscription end date based on plan duration
 */
export function calculateEndDate(durationDays: number, startDate?: Date): Date {
    const start = startDate || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    return end;
}
