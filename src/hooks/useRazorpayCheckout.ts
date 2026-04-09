import { useState, useCallback } from 'react';
import { CreateOrderResponse, VerifyPaymentResponse, RazorpayPaymentResponse, RazorpayError, RazorpayCheckoutOptions } from '@/lib/razorpay/types';
import { toast } from 'sonner';

interface CheckoutOptions {
    planKey: string;
    currency: 'INR' | 'USD';
    userInfo?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    onSuccess?: (response: VerifyPaymentResponse) => void;
    onFailure?: (error: unknown) => void;
}

interface UseRazorpayCheckoutReturn {
    isLoading: boolean;
    initiateCheckout: (options: CheckoutOptions) => Promise<void>;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
    }
}

interface RazorpayInstance {
    on: (event: string, handler: (response: unknown) => void) => void;
    open: () => void;
}

export const useRazorpayCheckout = (): UseRazorpayCheckoutReturn => {
    const [isLoading, setIsLoading] = useState(false);

    const initiateCheckout = useCallback(async ({
        planKey,
        currency,
        userInfo,
        onSuccess,
        onFailure
    }: CheckoutOptions) => {
        setIsLoading(true);

        try {
            // Check if Razorpay script is loaded
            if (!window.Razorpay) {
                throw new Error('Razorpay SDK not loaded. Please try again.');
            }

            // 1. Create Order
            const orderResponse = await fetch('/still-zone/api/razorpay/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_key: planKey,
                    currency,
                }),
            });

            const orderData: CreateOrderResponse = await orderResponse.json();

            if (!orderData.success) {
                throw new Error('Failed to create order');
            }

            // 2. Initialize Razorpay Checkout
            // Ensure options match RazorpayCheckoutOptions
            // Note: handler expects RazorpayPaymentResponse, but our types might need adjustment if using strict checking
            // We'll use type assertion if necessary, or ensure conformance.
            const options: RazorpayCheckoutOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Enter the Key ID generated from the Dashboard
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Still Zone', // Your business name
                description: orderData.plan_name,
                image: '/logo.png', // Optional: Your logo URL
                order_id: orderData.razorpay_order_id,
                handler: async function (response: RazorpayPaymentResponse) {
                    try {
                        // 3. Verify Payment
                        const verifyResponse = await fetch('/still-zone/api/razorpay/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData: VerifyPaymentResponse = await verifyResponse.json();

                        if (verifyData.success) {
                            toast.success('Payment successful!');
                            if (onSuccess) onSuccess(verifyData);
                        } else {
                            throw new Error(verifyData.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('Payment verification failed. Please contact support.');
                        if (onFailure) onFailure(error);
                    } finally {
                        // Keep loading state until verification is done? 
                        // Or maybe toggle it off here. 
                        // Usually we want to stop loading after verification logic completes
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: userInfo?.name || '',
                    email: userInfo?.email || '',
                    contact: userInfo?.phone || '',
                },
                notes: {
                    plan_key: planKey,
                },
                theme: {
                    color: '#0d9488', // Teal-600
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response: unknown) {
                const errorResponse = response as RazorpayError;
                console.error('Payment failed:', errorResponse.error);
                toast.error(`Payment failed: ${errorResponse.error.description}`);
                if (onFailure) onFailure(errorResponse.error);
                setIsLoading(false);
            });

            rzp.open();

        } catch (error: unknown) {
            console.error('Checkout error:', error);
            const message = error instanceof Error ? error.message : 'Something went wrong during checkout';
            toast.error(message);
            if (onFailure) onFailure(error);
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        initiateCheckout,
    };
};
