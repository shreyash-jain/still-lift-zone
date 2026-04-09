'use client';

import { useState, useEffect } from 'react';
import { Loader2, CreditCard, ArrowLeft, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSignupFlowStore } from '@/store/signup-flow-store';
import { useRazorpay, type RazorpayResponse } from '@/hooks/useRazorpay';
import { setAuthorizationCookie, TokenKey } from '@/lib/auth-utils';
import { supabase } from '@/lib/still-zone-supabase';

interface PlanDetails {
  planName: string;
  price: string;
  period: string;
  trialDays: number;
  hasTrial: boolean;
}

export function StepPayment() {
  const store = useSignupFlowStore();
  const { openCheckout } = useRazorpay();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'creating' | 'checkout' | 'verifying' | 'done'>('idle');
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);

  // Fetch plan details on mount
  useEffect(() => {
    if (!store.selectedPlanId) return;
    (async () => {
      try {
        const res = await fetch('/still-zone/api/plans');
        const json = await res.json();
        const plans = json.plans || json.data || [];
        const plan = plans.find((p: { id: string }) => p.id === store.selectedPlanId);
        if (plan) {
          const price = plan.price_inr ? `\u20B9${(plan.price_inr / 100).toFixed(0)}` : 'Free';
          const period = plan.duration_type === 'monthly' ? '/month' : plan.duration_type === 'yearly' ? '/year' : '';
          setPlanDetails({
            planName: plan.plan_name,
            price,
            period,
            trialDays: plan.trial_days || 0,
            hasTrial: plan.trial_days > 0,
          });
        }
      } catch { /* silent */ }
    })();
  }, [store.selectedPlanId]);

  const setAuthCookies = async (tokens?: { accessToken?: string; refreshToken?: string }) => {
    if (tokens?.accessToken) {
      setAuthorizationCookie(TokenKey.access_token, tokens.accessToken);
      if (tokens.refreshToken) setAuthorizationCookie(TokenKey.refresh_token, tokens.refreshToken);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setAuthorizationCookie(TokenKey.access_token, session.access_token);
      if (session.refresh_token) setAuthorizationCookie(TokenKey.refresh_token, session.refresh_token);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setStatus('creating');

    let savedTokens: { accessToken?: string; refreshToken?: string } = {};

    try {
      // 1. Create user account
      const signupRes = await fetch('/still-zone/api/signup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: store.provider,
          fullName: store.fullName,
          email: store.email,
          mobileNumber: store.mobileNumber || null,
          password: store.provider === 'email' ? store.password : undefined,
          selectedPlanId: store.selectedPlanId,
          selectedPlanKey: store.selectedPlanKey,
        }),
      });
      const signupJson = await signupRes.json();
      if (!signupJson.success) throw new Error(signupJson.message || 'Account creation failed');

      const userId = signupJson.userId;
      savedTokens = { accessToken: signupJson.accessToken, refreshToken: signupJson.refreshToken };

      // 2. Create Razorpay subscription
      const orderRes = await fetch('/still-zone/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: store.selectedPlanId, currency: 'INR', userId }),
      });
      const orderJson = await orderRes.json();
      if (!orderJson.success) throw new Error(orderJson.message || 'Failed to create subscription');

      setStatus('checkout');

      // 3. Open Razorpay checkout
      await openCheckout({
        subscriptionId: orderJson.subscriptionId,
        planName: orderJson.planName || planDetails?.planName || 'Still Zone Plan',
        prefill: {
          name: store.fullName,
          email: store.email,
          contact: store.mobileNumber || undefined,
        },
        onSuccess: async (response: RazorpayResponse) => {
          setStatus('verifying');
          try {
            const verifyRes = await fetch('/still-zone/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                userId,
                planId: store.selectedPlanId,
                planKey: store.selectedPlanKey,
              }),
            });
            const verifyJson = await verifyRes.json();

            if (verifyJson.success) {
              await setAuthCookies(savedTokens);
              setStatus('done');
              toast.success(planDetails?.hasTrial
                ? `Trial started! You won't be charged for ${planDetails.trialDays} days.`
                : 'Payment successful! Welcome to Still Zone!');

              setTimeout(() => {
                store.reset();
                window.location.href = '/still-zone';
              }, 2500);
            } else {
              toast.error('Payment verification failed. Please contact support.');
              setProcessing(false);
              setStatus('idle');
            }
          } catch {
            toast.error('Payment verification failed.');
            setProcessing(false);
            setStatus('idle');
          }
        },
        onFailure: () => {
          toast.error('Payment was cancelled. You can try again.');
          setProcessing(false);
          setStatus('idle');
        },
      });
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Something went wrong');
      setProcessing(false);
      setStatus('idle');
    }
  };

  // ── Success state ──
  if (status === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-5">
        <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You&apos;re All Set!</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          {planDetails?.hasTrial
            ? `Your ${planDetails.trialDays}-day free trial of ${planDetails.planName} has started. You won't be charged until it ends.`
            : `Your ${planDetails?.planName || 'subscription'} is now active.`}
        </p>
        <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
      </div>
    );
  }

  // ── Payment form ──
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {planDetails?.hasTrial ? 'Set Up Payment' : 'Complete Payment'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">Secure payment powered by Razorpay</p>
      </div>

      {/* Plan summary card */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">{planDetails?.planName || store.selectedPlanKey}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {planDetails?.hasTrial
                ? `${planDetails.trialDays}-day free trial, then ${planDetails.price}${planDetails.period}`
                : `${planDetails?.price || ''}${planDetails?.period || ''}`}
            </p>
          </div>
          <div className="text-right">
            {planDetails?.hasTrial ? (
              <div>
                <p className="text-lg font-bold text-teal-600">Free</p>
                <p className="text-[10px] text-slate-400">for {planDetails.trialDays} days</p>
              </div>
            ) : (
              <p className="text-xl font-bold text-slate-900 dark:text-white">{planDetails?.price || ''}</p>
            )}
          </div>
        </div>

        {/* Trial notice */}
        {planDetails?.hasTrial && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                {planDetails.trialDays}-day free trial
              </p>
              <p className="text-[11px] text-blue-500 mt-0.5">
                Your payment method will be saved. You won&apos;t be charged until the trial ends. Cancel anytime.
              </p>
            </div>
          </div>
        )}

        {/* Immediate charge notice */}
        {planDetails && !planDetails.hasTrial && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
            <CreditCard className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                {planDetails.price} will be charged now
              </p>
              <p className="text-[11px] text-teal-500 mt-0.5">
                Your subscription starts immediately after payment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status messages */}
      {status === 'creating' && (
        <div className="flex items-center justify-center gap-3 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span className="text-sm text-slate-600">Setting up your account...</span>
        </div>
      )}
      {status === 'checkout' && (
        <div className="flex items-center justify-center gap-3 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span className="text-sm text-slate-600">Complete payment in Razorpay window...</span>
        </div>
      )}
      {status === 'verifying' && (
        <div className="flex items-center justify-center gap-3 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span className="text-sm text-slate-600">Verifying payment...</span>
        </div>
      )}

      {/* Pay button */}
      {status === 'idle' && (
        <Button
          onClick={handlePay}
          disabled={processing}
          className="w-full h-12 text-base rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50 gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {planDetails?.hasTrial
            ? 'Start Free Trial'
            : `Pay ${planDetails?.price || ''} & Subscribe`}
        </Button>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        256-bit SSL encrypted &bull; Cancel anytime from your account
      </div>

      {status === 'idle' && (
        <button
          onClick={() => store.setStep(2)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Change plan
        </button>
      )}
    </div>
  );
}
