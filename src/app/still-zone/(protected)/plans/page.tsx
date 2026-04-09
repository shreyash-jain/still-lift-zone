'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap, Shield, Loader2 } from 'lucide-react';
import { Check, Star, Crown, Zap, Shield, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { supabase } from '@/lib/still-zone-supabase';

type Currency = 'USD' | 'INR';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
    zap: Zap,
    star: Star,
    crown: Crown,
};

interface PaymentPlan {
    id: string;
    plan_key: string;
    plan_name: string;
    description: string | null;
    price_inr: number;
    price_usd: number;
    duration_type: string;
    duration_days: number;
    trial_days: number;
    features: string[];
    is_highlighted: boolean;
    highlight_text: string | null;
    icon_name: string | null;
}

    description: string;
    price_inr: number;
    price_usd: number;
    duration_type: string;
    trial_days: number;
    features: string[];
    is_highlighted: boolean;
    highlight_text: string;
    icon_name: string;
}

const ICONS: Record<string, React.ElementType> = {
    zap: Zap,
    star: Star,
    crown: Crown,
    sparkles: Sparkles,
};

const toHuman = (paise: number) => {
    const num = paise / 100;
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
};

const getPeriodLabel = (dur: string) => {
    if (dur === 'monthly') return '/ month';
    if (dur === 'yearly') return '/ year';
    if (dur === 'lifetime') return 'one-time';
    if (dur === 'weekly') return '/ week';
    if (dur === 'free') return 'forever';
    return '';
};

export default function PlansPage() {
    const router = useRouter();
    const [currency, setCurrency] = useState<Currency>('INR');
    const [plans, setPlans] = useState<PaymentPlan[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; phone?: string }>({});

    const { initiateCheckout, isLoading: isCheckoutLoading } = useRazorpayCheckout();
    const { status, isActive, daysRemaining } = usePaymentStatus(userId);

    // Get user ID and profile info
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Extract profile info for Razorpay prefill
                setUserInfo({
                    name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                    email: user.email || '',
                    phone: user.phone || user.user_metadata?.phone || '',
                });
            }
        };
        getUser();
    }, []);

    // Fetch plans from API
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('/still-zone/api/razorpay/plans');
                const data = await response.json();
                if (data.success) {
                    setPlans(data.plans);
                }
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            } finally {
                setIsLoadingPlans(false);
            }
        };
        fetchPlans();
    }, []);

    // Format amount from smallest unit
    const formatPrice = (amount: number, curr: Currency): string => {
        const value = amount / 100;
        const symbol = curr === 'INR' ? '₹' : '$';
        return `${symbol}${value.toLocaleString('en-IN')}`;
    };

    // Get period text
    const getPeriodText = (durationType: string): string => {
        switch (durationType) {
            case 'monthly':
                return '/ month';
            case 'yearly':
                return '/ year';
            case 'one_time':
            case 'lifetime':
                return 'one-time';
            default:
                return '';
        }
    };

    // Handle payment
    const handlePayment = async (plan: PaymentPlan) => {
        setSelectedPlanKey(plan.plan_key);

        await initiateCheckout({
            planKey: plan.plan_key,
            currency: currency,
            userInfo: userInfo,
            onSuccess: (response) => {
                console.log('Payment successful:', response);
                setSelectedPlanKey(null);
                // Redirect to still-zone after successful payment
                router.push('/still-zone');
            },
            onFailure: (error) => {
                console.error('Payment failed:', error);
                setSelectedPlanKey(null);
            },
        });
    };

    // Show current subscription status banner
    const renderSubscriptionBanner = () => {
        if (!userId || status === 'loading') return null;

        if (isActive) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl p-4 mb-8 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold">You have an active subscription!</p>
                            <p className="text-sm text-white/80">
                                {daysRemaining !== null && `${daysRemaining} days remaining`}
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </motion.div>
            );
        }

        return null;
    };

    if (isLoadingPlans) {
        return (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    <p className="text-slate-500">Loading plans...</p>
                </div>
            </main>
        );
    }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlans() {
            try {
                const res = await fetch('/still-zone/api/plans');
                const json = await res.json();
                if (json.success) {
                    setPlans(json.plans);
                }
            } catch (error) {
                console.error('Failed to load plans:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPlans();
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-12">

            {/* Header Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
                >
                    Invest in your <span className="text-teal-600">Peace of Mind</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-500 dark:text-slate-400"
                >
                    Choose the plan that fits your journey. Upgrade to unlock the full Still Zone experience.
                </motion.p>

                {/* Currency Switcher */}
                <div className="flex items-center justify-center gap-3 pt-4">
                    <span className={cn("text-sm font-medium transition-colors", currency === 'USD' ? "text-slate-900 dark:text-white" : "text-slate-500")}>USD</span>
                    <Switch
                        checked={currency === 'INR'}
                        onCheckedChange={(checked: boolean) => setCurrency(checked ? 'INR' : 'USD')}
                        className="data-[state=checked]:bg-teal-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                    />
                    <span className={cn("text-sm font-medium transition-colors", currency === 'INR' ? "text-slate-900 dark:text-white" : "text-slate-500")}>INR</span>
                </div>
            </div>

            {/* Subscription Status Banner */}
            {renderSubscriptionBanner()}

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {plans.map((plan, index) => {
                    const isHighlight = plan.is_highlighted;
                    const IconComponent = ICON_MAP[plan.icon_name || 'zap'] || Zap;
                    const price = currency === 'INR' ? plan.price_inr : plan.price_usd;
                    const isSelected = selectedPlanKey === plan.plan_key;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className={cn(
                                "relative flex flex-col h-full",
                                isHighlight ? "md:-mt-4 md:mb-4" : ""
                            )}
                        >
                            {isHighlight && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                                    <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                                        {plan.highlight_text || 'Best Value'}
                                    </span>
                                </div>
                            )}

                            <Card className={cn(
                                "flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                                isHighlight
                                    ? "border-2 border-teal-500 dark:border-teal-400 bg-white dark:bg-slate-900 shadow-lg ring-4 ring-teal-500/10"
                                    : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900"
                            )}>
                                <CardHeader className="text-center pb-8">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-900 dark:text-white">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex flex-col items-center gap-2">
                                        {plan.plan_name}
                                        {plan.highlight_text && plan.plan_key === 'founder' && (
                                            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20">
                                                {plan.highlight_text}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-sm min-h-[40px]">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col gap-6">
                                    <div className="text-center">
                                        <span className={cn("text-4xl font-extrabold tracking-tight", isHighlight ? "text-teal-600 dark:text-teal-400" : "text-slate-900 dark:text-white")}>
                                            {formatPrice(price, currency)}
                                        </span>
                                        <span className="text-slate-500 font-medium ml-1">
                                            {getPeriodText(plan.duration_type)}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <Check className="w-5 h-5 text-teal-500 shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col gap-3 pt-6 bg-slate-50/50 dark:bg-slate-800/30">
                                    <Button
                                        onClick={() => handlePayment(plan)}
                                        disabled={isCheckoutLoading || isActive}
                                        className={cn(
                                            "w-full rounded-xl h-12 font-semibold text-base shadow-sm transition-all active:scale-95",
                                            isHighlight
                                                ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25 hover:shadow-teal-600/40"
                                                : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700"
                                        )}
                                    >
                                        {isSelected && isCheckoutLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : isActive ? (
                                            'Already Subscribed'
                                        ) : plan.trial_days > 0 ? (
                                            'Start Free Trial'
                                        ) : (
                                            `Get ${plan.plan_name}`
                                        )}
                                    </Button>
                                    {plan.trial_days > 0 && (
                                        <p className="text-xs text-center text-teal-600 dark:text-teal-400 font-medium">
                                            {plan.trial_days} days free, then billing begins
                                        </p>
                                    )}
                                    {!plan.trial_days && (
                                        <p className="text-xs text-center text-slate-400 h-4">
                                            {/* Spacer/Empty for alignment */}
                                        </p>
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
            ) : (
                /* Pricing Grid */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {plans.map((tier, index) => {
                        const isHighlight = tier.is_highlighted;
                        const IconComponent = ICONS[tier.icon_name] || (
                            tier.duration_type === 'yearly' ? Star :
                                tier.duration_type === 'lifetime' ? Crown : Zap
                        );

                        const priceDisplay = currency === 'USD'
                            ? (tier.price_usd === 0 ? 'Free' : `$${toHuman(tier.price_usd)}`)
                            : (tier.price_inr === 0 ? 'Free' : `₹${toHuman(tier.price_inr)}`);

                        const ctaText = tier.trial_days > 0 ? 'Start Free Trial' : `Get ${tier.plan_name}`;
                        const trialText = tier.trial_days > 0 ? `${tier.trial_days} days free, then billing begins` : undefined;

                        return (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className={cn(
                                    "relative flex flex-col h-full",
                                    isHighlight ? "md:-mt-4 md:mb-4" : ""
                                )}
                            >
                                {isHighlight && tier.highlight_text && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                                        <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                                            {tier.highlight_text}
                                        </span>
                                    </div>
                                )}

                                <Card className={cn(
                                    "flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                                    isHighlight
                                        ? "border-2 border-teal-500 dark:border-teal-400 bg-white dark:bg-slate-900 shadow-lg ring-4 ring-teal-500/10"
                                        : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900"
                                )}>
                                    <CardHeader className="text-center pb-8">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-900 dark:text-white">
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex flex-col items-center gap-2">
                                            {tier.plan_name}
                                            {tier.duration_type === 'lifetime' && (
                                                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20 mt-1">
                                                    Limited Time
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="text-sm min-h-[40px]">
                                            {tier.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col gap-6">
                                        <div className="text-center">
                                            <span className={cn("text-4xl font-extrabold tracking-tight", isHighlight ? "text-teal-600 dark:text-teal-400" : "text-slate-900 dark:text-white")}>
                                                {priceDisplay}
                                            </span>
                                            <span className="text-slate-500 font-medium ml-1">
                                                {getPeriodLabel(tier.duration_type)}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {(tier.features || []).map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                    <Check className="w-5 h-5 text-teal-500 shrink-0" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex flex-col gap-3 pt-6 bg-slate-50/50 dark:bg-slate-800/30">
                                        <Button
                                            className={cn(
                                                "w-full rounded-xl h-12 font-semibold text-base shadow-sm transition-all active:scale-95",
                                                isHighlight
                                                    ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25 hover:shadow-teal-600/40"
                                                    : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700"
                                            )}
                                        >
                                            {ctaText}
                                        </Button>
                                        {trialText ? (
                                            <p className="text-xs text-center text-teal-600 dark:text-teal-400 font-medium">
                                                {trialText}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-center text-slate-400 h-4">
                                                {/* Spacer/Empty for alignment */}
                                            </p>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Guarantee Badge */}
            <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Shield className="w-4 h-4" />
                    Secure payment • Cancel anytime
                </div>
            </div>

            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </main>
    );
}
