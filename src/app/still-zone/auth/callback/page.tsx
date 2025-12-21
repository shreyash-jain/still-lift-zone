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
    const hasShownToast = useRef(false);

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error fetching session:', error);
                toast.error('Authentication failed. Please try again.');
                router.replace('/still-zone/login');
                return;
            }

            if (session?.access_token) {
                const userTimestamp = new Date(session.user.created_at).getTime();
                const now = new Date().getTime();
                // If user was created less than 60 seconds ago, they are "new".
                const isNewUser = (now - userTimestamp) < 60 * 1000;

                const intent = searchParams.get('intent'); // 'signup' or 'login'

                // STRICT CHECK: Block existing users from "Signing Up"
                if (intent === 'signup' && !isNewUser) {
                    await supabase.auth.signOut();
                    toast.error('You already have an account on Still Zone. Please login.');
                    router.replace('/still-zone/login');
                    return;
                }

                // Set cookies
                setAuthorizationCookie(TokenKey.access_token, session.access_token);
                if (session.refresh_token) {
                    setAuthorizationCookie(TokenKey.refresh_token, session.refresh_token);
                }

                if (!hasShownToast.current) {
                    if (isNewUser) {
                        toast.success('Account created successfully!');
                    } else {
                        toast.success('Welcome to Still Zone');
                    }
                    hasShownToast.current = true;
                }

                router.replace('/still-zone/dashboard');
            } else {
                if (!hasShownToast.current) {
                    toast.error('No session found. Please try again.');
                    hasShownToast.current = true;
                }
                router.replace('/still-zone/login');
            }
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