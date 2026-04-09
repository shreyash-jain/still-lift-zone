/**
 * usePaymentStatus Hook
 * 
 * Real-time subscription to user's payment status changes
 * Uses Supabase Realtime to get instant updates when payment status changes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/still-zone-supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type PaymentStatus =
    | 'pending'
    | 'trial'
    | 'active'
    | 'expired'
    | 'cancelled'
    | 'failed'
    | 'loading'
    | 'error';

export interface PaymentPlan {
    id: string;
    plan_key: string;
    plan_name: string;
    description: string | null;
    price_inr: number;
    price_usd: number;
    duration_type: string;
    duration_days: number;
    features: string[];
}

export interface UserPlanData {
    id: string;
    user_id: string;
    plan_key: string;
    status: PaymentStatus;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    subscription_start_date: string | null;
    subscription_end_date: string | null;
    amount_paid: number | null;
    currency: string;
    created_at: string;
    updated_at: string;
    payment_plans?: PaymentPlan;
}

export interface UsePaymentStatusReturn {
    status: PaymentStatus;
    userPlan: UserPlanData | null;
    isActive: boolean;
    isLoading: boolean;
    error: Error | null;
    daysRemaining: number | null;
    refetch: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Hook Implementation
// ═══════════════════════════════════════════════════════════════════════════════

export function usePaymentStatus(userId?: string): UsePaymentStatusReturn {
    const [status, setStatus] = useState<PaymentStatus>('loading');
    const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Calculate days remaining
    const daysRemaining = userPlan?.subscription_end_date
        ? Math.max(
            0,
            Math.ceil(
                (new Date(userPlan.subscription_end_date).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
        )
        : null;

    // Check if subscription is active
    const isActive = status === 'active' || status === 'trial';

    // ═══════════════════════════════════════════════════════════════════════════
    // Fetch user's active plan
    // ═══════════════════════════════════════════════════════════════════════════

    const fetchUserPlan = useCallback(async () => {
        if (!userId || !isSupabaseConfigured) {
            setStatus('error');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('user_plans')
                .select('*, payment_plans(*)')
                .eq('user_id', userId)
                .in('status', ['active', 'trial', 'pending'])
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            if (!data) {
                // Check if user has any plan at all (might be expired)
                const { data: anyPlan } = await supabase
                    .from('user_plans')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (anyPlan) {
                    // Check if expired
                    if (anyPlan.subscription_end_date) {
                        const endDate = new Date(anyPlan.subscription_end_date);
                        if (endDate < new Date()) {
                            setStatus('expired');
                            setUserPlan(anyPlan);
                        } else {
                            setStatus(anyPlan.status);
                            setUserPlan(anyPlan);
                        }
                    } else {
                        setStatus(anyPlan.status);
                        setUserPlan(anyPlan);
                    }
                } else {
                    setStatus('expired');
                    setUserPlan(null);
                }
            } else {
                // Check expiry for active plan
                if (data.subscription_end_date) {
                    const endDate = new Date(data.subscription_end_date);
                    if (endDate < new Date()) {
                        setStatus('expired');
                    } else {
                        setStatus(data.status);
                    }
                } else {
                    setStatus(data.status);
                }
                setUserPlan(data);
            }
        } catch (err) {
            console.error('Error fetching user plan:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Real-time subscription
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (!userId || !isSupabaseConfigured) {
            return;
        }

        // Initial fetch
        fetchUserPlan();

        // Set up real-time subscription
        const channel: RealtimeChannel = supabase
            .channel(`user_plans:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'user_plans',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('Real-time update received:', payload);

                    // Refetch to get the latest data with joined tables
                    fetchUserPlan();
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
            });

        // Cleanup on unmount
        return () => {
            console.log('Unsubscribing from real-time updates');
            supabase.removeChannel(channel);
        };
    }, [userId, fetchUserPlan]);

    return {
        status,
        userPlan,
        isActive,
        isLoading,
        error,
        daysRemaining,
        refetch: fetchUserPlan,
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// usePaymentStatusPolling - Alternative polling approach
// ═══════════════════════════════════════════════════════════════════════════════

export interface UsePaymentStatusPollingOptions {
    userId?: string;
    orderId?: string;
    pollInterval?: number; // in milliseconds
    enabled?: boolean;
}

/**
 * Alternative hook that polls for payment status
 * Useful when Supabase Realtime is not available or as a fallback
 */
export function usePaymentStatusPolling(
    options: UsePaymentStatusPollingOptions
): UsePaymentStatusReturn & { stopPolling: () => void } {
    const { userId, orderId, pollInterval = 3000, enabled = true } = options;

    const [status, setStatus] = useState<PaymentStatus>('loading');
    const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isPolling, setIsPolling] = useState(true);

    const daysRemaining = userPlan?.subscription_end_date
        ? Math.max(
            0,
            Math.ceil(
                (new Date(userPlan.subscription_end_date).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            )
        )
        : null;

    const isActive = status === 'active' || status === 'trial';

    const fetchStatus = useCallback(async () => {
        if (!enabled || (!userId && !orderId)) return;

        try {
            let query = supabase
                .from('user_plans')
                .select('*, payment_plans(*)');

            if (orderId) {
                query = query.eq('razorpay_order_id', orderId);
            } else if (userId) {
                query = query
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
            }

            const { data, error: fetchError } = await query.limit(1).maybeSingle();

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            if (data) {
                setUserPlan(data);
                setStatus(data.status);

                // Stop polling if we reach a terminal state
                if (['active', 'failed', 'cancelled', 'expired'].includes(data.status)) {
                    setIsPolling(false);
                }
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [userId, orderId, enabled]);

    useEffect(() => {
        if (!enabled || !isPolling) return;

        // Initial fetch
        fetchStatus();

        // Set up polling
        const intervalId = setInterval(fetchStatus, pollInterval);

        return () => {
            clearInterval(intervalId);
        };
    }, [fetchStatus, pollInterval, enabled, isPolling]);

    const stopPolling = useCallback(() => {
        setIsPolling(false);
    }, []);

    return {
        status,
        userPlan,
        isActive,
        isLoading,
        error,
        daysRemaining,
        refetch: fetchStatus,
        stopPolling,
    };
}
