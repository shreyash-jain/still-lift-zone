'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSignupFlowStore } from '@/store/signup-flow-store';
import { setAuthorizationCookie, TokenKey } from '@/lib/auth-utils';
import { supabase } from '@/lib/still-zone-supabase';

export function StepComplete() {
  const router = useRouter();
  const store = useSignupFlowStore();

  useEffect(() => {
    let cancelled = false;

    const finalize = async () => {
      // Set auth cookies — either from sessionStorage (email flow) or from Supabase session (Google flow)
      try {
        const storedTokens = typeof window !== 'undefined' ? sessionStorage.getItem('sz_signup_tokens') : null;

        if (storedTokens) {
          const tokens = JSON.parse(storedTokens);
          if (tokens.accessToken) setAuthorizationCookie(TokenKey.access_token, tokens.accessToken);
          if (tokens.refreshToken) setAuthorizationCookie(TokenKey.refresh_token, tokens.refreshToken);
          sessionStorage.removeItem('sz_signup_tokens');
        } else {
          // Google flow — session already exists
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setAuthorizationCookie(TokenKey.access_token, session.access_token);
            if (session.refresh_token) setAuthorizationCookie(TokenKey.refresh_token, session.refresh_token);
          }
        }
      } catch { /* silent */ }

      if (!cancelled) {
        toast.success('Welcome to Still Zone!');
        setTimeout(() => {
          if (!cancelled) {
            store.reset();
            router.push('/still-zone');
          }
        }, 2500);
      }
    };

    finalize();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-teal-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">You&apos;re All Set!</h2>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        Your account is ready and your subscription is active.
        Redirecting to your dashboard...
      </p>
      <Loader2 className="w-5 h-5 animate-spin text-teal-500 mt-2" />
    </div>
  );
}
