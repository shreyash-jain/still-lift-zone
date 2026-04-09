'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap, Shield, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';

type Currency = 'USD' | 'INR';

interface PaymentPlan {
    id: string;
    plan_key: string;
    plan_name: string;
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

        </main>
    );
}
