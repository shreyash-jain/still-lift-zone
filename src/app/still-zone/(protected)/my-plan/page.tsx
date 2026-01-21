'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Calendar, Clock, Check, Star, Crown, Zap,
    Receipt, Download, Loader2, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { supabase } from '@/lib/still-zone-supabase';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface PlanDetails {
    id: string;
    plan_key: string;
    plan_name: string;
    description: string | null;
    features: string[];
    icon_name: string;
}

interface SubscriptionDetails {
    start_date: string | null;
    end_date: string | null;
    days_remaining: number | null;
    is_expired: boolean;
}

interface PaymentDetails {
    amount: number | null;
    amount_formatted: string | null;
    currency: string | null;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    paid_at: string | null;
}

interface Invoice {
    id: string;
    invoice_number: string;
    amount: number;
    amount_formatted: string;
    currency: string;
    status: string;
    payment_method: string | null;
    paid_at: string | null;
    created_at: string;
    invoice_pdf_url: string | null;
}

interface StatusResponse {
    success: boolean;
    has_subscription: boolean;
    is_active: boolean;
    status: string;
    current_plan?: PlanDetails;
    subscription?: SubscriptionDetails;
    payment?: PaymentDetails;
    invoices: Invoice[];
    message?: string;
}

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
    zap: Zap,
    star: Star,
    crown: Crown,
};

// Status badge styling helper
const getStatusBadgeStyles = (status: string, isActive: boolean) => {
    if (isActive && status === 'active') {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0';
    }
    if (status === 'pending') {
        return 'bg-slate-600 text-white dark:bg-slate-500 dark:text-white border-0';
    }
    if (status === 'expired') {
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0';
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function MyPlanPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<StatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                setError('Please log in to view your plan');
                return;
            }

            const response = await fetch('/still-zone/api/razorpay/status', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                setData(result);
            } else {
                setError(result.error || 'Failed to fetch status');
            }
        } catch (err) {
            console.error('Error fetching status:', err);
            setError('Failed to load subscription details');
        } finally {
            setIsLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Loading State
    if (isLoading) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12 min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    <p className="text-slate-500">Loading your plan details...</p>
                </div>
            </main>
        );
    }

    // Error State
    if (error) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12 min-h-[80vh] flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                        <AlertTriangle className="w-12 h-12 text-amber-500" />
                        <p className="text-slate-600 dark:text-slate-400">{error}</p>
                        <Button onClick={fetchStatus} variant="outline">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

    // No Subscription State
    if (!data?.has_subscription) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12 min-h-[80vh] flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Active Plan
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Manage your subscription and billing details
                        </p>
                    </div>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center text-center p-8 sm:p-12 space-y-6">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                                <span className="text-4xl">🤷‍♂️</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    No Active Plan
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-[260px] mx-auto">
                                    You currently don&apos;t have an active subscription plan linked to your account.
                                </p>
                            </div>

                            <div className="pt-2 w-full">
                                <Button
                                    asChild
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 shadow-md shadow-teal-600/10"
                                >
                                    <Link href="/still-zone/plans">
                                        Browse Plans
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        );
    }

    // Active Subscription View
    const plan = data.current_plan;
    const subscription = data.subscription;
    const payment = data.payment;
    const invoices = data.invoices || [];
    const IconComponent = plan ? ICON_MAP[plan.icon_name] || Zap : Zap;

    // Calculate progress percentage
    const progressPercentage = subscription?.days_remaining && subscription.days_remaining > 0
        ? Math.max(0, Math.min(100, (subscription.days_remaining / 30) * 100))
        : 0;

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-8">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-2"
            >
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Your Active Plan
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage your subscription and billing
                </p>
            </motion.div>

            {/* Status Badge */}
            {subscription?.is_expired && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3"
                >
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                        <p className="font-semibold text-red-700 dark:text-red-400">Your subscription has expired</p>
                        <p className="text-sm text-red-600 dark:text-red-400/80">Renew now to continue enjoying Still Zone</p>
                    </div>
                    <Button asChild size="sm" className="ml-auto bg-red-600 hover:bg-red-700">
                        <Link href="/still-zone/plans">Renew</Link>
                    </Button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Current Plan Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="h-full relative overflow-hidden border-teal-200 dark:border-teal-800 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900 shadow-sm ring-1 ring-teal-100/50 dark:ring-teal-900/30">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    {plan?.plan_name || 'Plan'}
                                </CardTitle>
                                <Badge className={getStatusBadgeStyles(data.status, data.is_active)}>
                                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                {plan?.description}
                            </p>

                            {/* Features */}
                            <div className="space-y-2">
                                {plan?.features.slice(0, 4).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Check className="w-4 h-4 text-teal-500" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {data.is_active && (
                                <Button asChild variant="outline" className="w-full mt-4">
                                    <Link href="/still-zone/plans">
                                        Upgrade Plan <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Subscription Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="h-full border-teal-200 dark:border-teal-800 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900 shadow-sm ring-1 ring-teal-100/50 dark:ring-teal-900/30">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                Subscription Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {/* Days Remaining */}
                            {subscription && !subscription.is_expired && subscription.days_remaining !== null && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Days Remaining</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {subscription.days_remaining} days
                                        </span>
                                    </div>
                                    <Progress value={progressPercentage} className="h-2" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                        {formatDate(subscription?.start_date || null)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">End Date</p>
                                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                        {formatDate(subscription?.end_date || null)}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                            {/* Payment Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <CreditCard className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-400">Amount Paid:</span>
                                    <span className="font-bold text-slate-900 dark:text-white ml-auto">
                                        {payment?.amount_formatted || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-400">Paid On:</span>
                                    <span className="font-medium text-slate-900 dark:text-white ml-auto">
                                        {formatDate(payment?.paid_at || null)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Invoice History */}
            {invoices.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900 shadow-sm ring-1 ring-teal-100/50 dark:ring-teal-900/30">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {invoices.map((invoice, index) => (
                                    <div
                                        key={invoice.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-teal-100 dark:border-teal-900/30 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                                                invoice.status === 'captured'
                                                    ? "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20"
                                                    : "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/20"
                                            )}>
                                                <Receipt className={cn(
                                                    "w-5 h-5",
                                                    invoice.status === 'captured'
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-amber-600 dark:text-amber-400"
                                                )} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">
                                                    {invoice.invoice_number}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {formatDate(invoice.paid_at || invoice.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-slate-900 dark:text-white">
                                                    {invoice.amount_formatted}
                                                </p>
                                                <Badge className={cn(
                                                    "text-xs font-medium",
                                                    invoice.status === 'captured'
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0"
                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0"
                                                )}>
                                                    {invoice.status === 'captured' ? 'Paid' : invoice.status}
                                                </Badge>
                                            </div>
                                            {invoice.invoice_pdf_url && (
                                                <Button variant="outline" size="icon" asChild className="rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <a href={invoice.invoice_pdf_url} download>
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Help Link */}
            <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                Need help? <Link href="#" className="underline hover:text-slate-600 dark:hover:text-slate-300">Contact Support</Link>
            </p>
        </main>
    );
}
