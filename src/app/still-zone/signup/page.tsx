'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { supabase } from '@/lib/still-zone-supabase';
import { Button } from '@/components/ui/button';
import { useSignupFlowStore } from '@/store/signup-flow-store';
import { StepIndicator } from '@/components/still-zone/signup/StepIndicator';
import { StepDetails } from '@/components/still-zone/signup/StepDetails';
import { StepPayment } from '@/components/still-zone/signup/StepPayment';
import { StepPlanSelection } from '@/components/still-zone/signup/StepPlanSelection';
import Logo from '@/assets/images/stillzonelogo.svg';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const store = useSignupFlowStore();

  // Handle Google OAuth redirect: prefill data from Supabase session
  useEffect(() => {
    const provider = searchParams.get('provider');
    if (provider === 'google') {
      const prefillFromSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          store.prefillGoogle({
            fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || '',
            avatarUrl: user.user_metadata?.avatar_url || '',
          });
          // If on step 1, stay there so user can enter mobile number
          if (store.currentStep === 1) {
            store.setStep(1);
          }
        }
      };
      prefillFromSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Reset store when leaving the page (cleanup)
  useEffect(() => {
    return () => {
      // Only reset if signup wasn't completed
      if (store.currentStep !== 3) {
        // Don't reset — user might navigate back
      }
    };
  }, [store.currentStep]);

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/still-zone/auth/callback?intent=signup`,
        },
      });
      if (error) {
        toast.error('Failed to connect with Google. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/still-zone">
            <Image src={Logo} alt="Still Zone" width={48} height={48} className="rounded-xl" />
          </Link>
        </div>

        {/* Step Indicator */}
        <StepIndicator current={store.currentStep} />

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8">
          {/* Step 1: Details */}
          {store.currentStep === 1 && (
            <>
              <StepDetails />

              {/* Google signup divider — only show for email mode on step 1 */}
              {store.provider === 'email' && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">or</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleGoogleSignup}
                    className="w-full h-12 rounded-xl gap-3 text-base font-medium border-slate-300 dark:border-slate-600"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </Button>
                </>
              )}
            </>
          )}

          {/* Step 2: Plan Selection */}
          {store.currentStep === 2 && <StepPlanSelection />}

          {/* Step 3: Payment (includes success state) */}
          {(store.currentStep === 3 || store.currentStep === 4) && <StepPayment />}
        </div>

        {/* Login link */}
        {store.currentStep === 1 && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/still-zone/login" className="text-teal-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
