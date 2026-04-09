'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/still-zone-supabase';
import { TokenKey, setAuthorizationCookie } from '@/lib/auth-utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasHandled = useRef(false);

    useEffect(() => {
        if (hasHandled.current) return;
        hasHandled.current = true;

        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session?.access_token) {
                toast.error('Authentication failed. Please try again.');
                router.replace('/still-zone/login');
                return;
            }

            const intent = searchParams.get('intent'); // 'signup' or 'login'

            // Check if user has completed signup — check both tables (old users may only have profiles)
            const [{ data: szUser }, { data: profile }] = await Promise.all([
                supabase.from('still_zone_users').select('id').eq('id', session.user.id).maybeSingle(),
                supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle(),
            ]);

            const hasCompletedSignup = !!(szUser || profile);

            // ── SIGNUP INTENT ──
            if (intent === 'signup') {
                if (hasCompletedSignup) {
                    // Already has an account — don't let them "sign up" again
                    await supabase.auth.signOut();
                    toast.error('You already have an account. Please login.');
                    router.replace('/still-zone/login');
                    return;
                }

                // New or incomplete signup — redirect to signup to collect details + plan + payment
                toast.success('Google account connected! Just a few more details.');
                router.replace('/still-zone/signup?provider=google');
                return;
            }

            // ── LOGIN INTENT ──
            if (!hasCompletedSignup) {
                // Has Google auth but never finished signup — send to signup
                toast.info('Please complete your signup first.');
                router.replace('/still-zone/signup?provider=google');
                return;
            }

            // Fully signed up user logging in — set cookies and go to dashboard
            setAuthorizationCookie(TokenKey.access_token, session.access_token);
            if (session.refresh_token) {
                setAuthorizationCookie(TokenKey.refresh_token, session.refresh_token);
            }

            toast.success('Welcome back to Still Zone!');
            router.replace('/still-zone');
        };

        handleAuthCallback();
    }, [router, searchParams]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
                <p className="text-sm text-gray-500">Verifying...</p>
            </div>
        </div>
    );
}
