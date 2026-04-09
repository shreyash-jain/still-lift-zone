'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/still-zone-supabase';
import { Loader2 } from 'lucide-react';
import { PaywallModal } from '@/components/still-zone/PaywallModal';

type AccessState = 'loading' | 'unauthenticated' | 'incomplete-signup' | 'paywall' | 'granted';

// Cache auth result for 60 seconds to avoid re-checking on every navigation
let cachedAccess: { state: AccessState; userId: string; expiry: number } | null = null;

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [accessState, setAccessState] = useState<AccessState>(() => {
        // Use cache if valid
        if (cachedAccess && Date.now() < cachedAccess.expiry && cachedAccess.state === 'granted') {
            return 'granted';
        }
        return 'loading';
    });
    const hasChecked = useRef(false);

    useEffect(() => {
        // Skip if already granted from cache
        if (accessState === 'granted' && !hasChecked.current) {
            hasChecked.current = true;
            // Still validate in background (non-blocking)
            validateAccess(false);
            return;
        }

        if (!hasChecked.current) {
            hasChecked.current = true;
            validateAccess(true);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                cachedAccess = null;
                setAccessState('unauthenticated');
                router.replace('/still-zone/login');
            }
            // Don't re-check on TOKEN_REFRESHED — it causes unnecessary API calls
        });

        return () => { subscription.unsubscribe(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function validateAccess(blocking: boolean) {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                cachedAccess = null;
                if (blocking) setAccessState('unauthenticated');
                router.replace('/still-zone/login');
                return;
            }

            // Query both tables in parallel
            const [{ data: szUser }, { data: profile }] = await Promise.all([
                supabase.from('still_zone_users')
                    .select('trial_active, trial_end_date, subscription_status')
                    .eq('id', session.user.id)
                    .maybeSingle(),
                supabase.from('profiles')
                    .select('id')
                    .eq('id', session.user.id)
                    .maybeSingle(),
            ]);

            let result: AccessState;

            if (szUser) {
                const now = new Date();
                const trialEnd = szUser.trial_end_date ? new Date(szUser.trial_end_date) : null;
                const isTrialActive = szUser.trial_active && trialEnd && trialEnd > now;
                const isSubscribed = szUser.subscription_status === 'active';
                result = (!isTrialActive && !isSubscribed) ? 'paywall' : 'granted';
            } else if (profile) {
                result = 'granted'; // Old user
            } else {
                result = 'incomplete-signup';
            }

            // Cache the result for 60 seconds
            cachedAccess = { state: result, userId: session.user.id, expiry: Date.now() + 60000 };

            if (blocking || result !== 'granted') {
                setAccessState(result);
            }

            if (result === 'incomplete-signup') {
                router.replace('/still-zone/signup?provider=google');
            }
        } catch {
            cachedAccess = null;
            if (blocking) {
                setAccessState('unauthenticated');
                router.replace('/still-zone/login');
            }
        }
    }

    if (accessState === 'loading') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                    <p className="text-sm font-medium text-slate-500 animate-pulse">
                        Entering Still Zone...
                    </p>
                </div>
            </div>
        );
    }

    if (accessState === 'paywall') {
        return <PaywallModal onSubscribed={() => {
            cachedAccess = null;
            setAccessState('granted');
        }} />;
    }

    if (accessState === 'unauthenticated' || accessState === 'incomplete-signup') {
        return null;
    }

    return <>{children}</>;
}
