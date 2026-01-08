'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap, Shield, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

type Currency = 'USD' | 'INR';

interface PricingTier {
    id: string;
    name: string;
    description: string;
    price: { USD: string; INR: string };
    period: string; // e.g., '/ month', '/ year', 'one-time'
    features: string[];
    highlight?: boolean;
    highlightText?: string;
    badge?: React.ReactNode;
    icon: React.ElementType;
    ctaText: string;
    trialText?: string;
}

const PRICING_TIERS: PricingTier[] = [
    {
        id: 'monthly',
        name: 'Mindful',
        description: 'Flexible access for those exploring mindfulness.',
        price: { USD: '$4.99', INR: '₹199' },
        period: '/ month',
        icon: Zap,
        features: [
            'Unlimited Experience sessions',
            'Full Premium Dashboard access',
            'Progress tracking & mood history',
            'Cancel anytime',
        ],
        ctaText: 'Start Monthly',
    },
    {
        id: 'yearly',
        name: 'Serenity',
        description: 'Our most popular plan for long-term peace.',
        price: { USD: '$49.99', INR: '₹1,799' },
        period: '/ year',
        highlight: true,
        highlightText: 'Best Value',
        icon: Star,
        features: [
            'Everything in Mindful',
            'Save significant amount yearly',
            'Priority Email Support',
            '7-Day Free Trial included',
        ],
        ctaText: 'Start Free Trial',
        trialText: '7 days free, then billing begins',
    },
    {
        id: 'founder',
        name: 'Founder',
        description: 'Exclusive 5-year pass for early adopters.',
        price: { USD: '$149.99', INR: '₹5,999' },
        period: 'one-time',
        icon: Crown,
        features: [
            '5-Year Full Access',
            'Early access to new features',
            'Exclusive Founder Badge',
            'No recurring payments',
        ],
        ctaText: 'Get Founder Pass',
        badge: <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20">Limited Time</Badge>
    }
];

export default function PlansPage() {
    const router = useRouter();
    const [currency, setCurrency] = useState<Currency>('INR');

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

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {PRICING_TIERS.map((tier, index) => {
                    const isHighlight = tier.highlight;

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
                            {isHighlight && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                                    <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                                        {tier.highlightText}
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
                                        <tier.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex flex-col items-center gap-2">
                                        {tier.name}
                                        {tier.badge}
                                    </CardTitle>
                                    <CardDescription className="text-sm min-h-[40px]">
                                        {tier.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col gap-6">
                                    <div className="text-center">
                                        <span className={cn("text-4xl font-extrabold tracking-tight", isHighlight ? "text-teal-600 dark:text-teal-400" : "text-slate-900 dark:text-white")}>
                                            {tier.price[currency]}
                                        </span>
                                        <span className="text-slate-500 font-medium ml-1">
                                            {tier.period}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {tier.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
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
                                        {tier.ctaText}
                                    </Button>
                                    {tier.trialText && (
                                        <p className="text-xs text-center text-teal-600 dark:text-teal-400 font-medium">
                                            {tier.trialText}
                                        </p>
                                    )}
                                    {!tier.trialText && (
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
