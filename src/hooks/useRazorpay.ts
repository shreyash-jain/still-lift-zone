'use client';

import { useCallback, useRef, useState } from 'react';

// Use existing global Window.Razorpay declaration from useRazorpayCheckout

interface RazorpayOptions {
  key: string;
  subscription_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface OpenCheckoutParams {
  subscriptionId: string;
  planName: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: RazorpayResponse) => void;
  onFailure: () => void;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const instanceRef = useRef<RazorpayInstance | null>(null);

  const openCheckout = useCallback(async ({
    subscriptionId, planName, prefill, onSuccess, onFailure,
  }: OpenCheckoutParams) => {
    setIsLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setIsLoading(false);
      onFailure();
      return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    const options: RazorpayOptions = {
      key: keyId,
      subscription_id: subscriptionId,
      name: 'Still Zone',
      description: planName,
      prefill,
      theme: { color: '#006B7A' },
      handler: (response) => {
        setIsLoading(false);
        onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false);
          onFailure();
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay(options);
    instanceRef.current = rzp;
    rzp.open();
    setIsLoading(false);
  }, []);

  return { openCheckout, isLoading };
}
