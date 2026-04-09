'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap, Sparkles, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSignupFlowStore } from '@/store/signup-flow-store';

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

export function StepPlanSelection() {
  const store = useSignupFlowStore();
  const [currency, setCurrency] = useState<Currency>('INR');
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/still-zone/api/plans');
        const json = await res.json();
        if (json.success) setPlans(json.plans || json.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: PaymentPlan) => {
    store.setSelectedPlan(plan.id, plan.plan_key);
    store.setStep(3);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Choose Your <span className="text-teal-600">Plan</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your 7-day free trial starts now. Pick a plan for when it ends.
        </p>

        {/* Currency Switcher */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className={cn("text-sm font-medium transition-colors", currency === 'USD' ? "text-slate-900 dark:text-white" : "text-slate-500")}>USD</span>
          <Switch
            checked={currency === 'INR'}
            onCheckedChange={(checked: boolean) => setCurrency(checked ? 'INR' : 'USD')}
            className="data-[state=checked]:bg-teal-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
          />
          <span className={cn("text-sm font-medium transition-colors", currency === 'INR' ? "text-slate-900 dark:text-white" : "text-slate-500")}>INR</span>
        </div>
      </div>

      {/* Plans */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {plans.map((tier, index) => {
            const isHighlight = tier.is_highlighted;
            const IconComponent = ICONS[tier.icon_name] || (
              tier.duration_type === 'yearly' ? Star :
                tier.duration_type === 'lifetime' ? Crown : Zap
            );

            const priceDisplay = currency === 'USD'
              ? (tier.price_usd === 0 ? 'Free' : `$${toHuman(tier.price_usd)}`)
              : (tier.price_inr === 0 ? 'Free' : `\u20B9${toHuman(tier.price_inr)}`);

            const ctaText = tier.trial_days > 0 ? 'Start Free Trial' : `Select ${tier.plan_name}`;
            const trialText = tier.trial_days > 0 ? `${tier.trial_days} days free, then billing begins` : undefined;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                {isHighlight && tier.highlight_text && (
                  <div className="flex justify-center mb-[-12px] relative z-10">
                    <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                      {tier.highlight_text}
                    </span>
                  </div>
                )}

                <Card className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer",
                  isHighlight
                    ? "border-2 border-teal-500 dark:border-teal-400 bg-white dark:bg-slate-900 shadow-lg ring-4 ring-teal-500/10"
                    : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900"
                )} onClick={() => handleSelectPlan(tier)}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {tier.plan_name}
                          {tier.duration_type === 'lifetime' && (
                            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20 text-[10px]">
                              Limited
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">{tier.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-2xl font-extrabold", isHighlight ? "text-teal-600" : "text-slate-900 dark:text-white")}>
                          {priceDisplay}
                        </span>
                        <span className="text-xs text-slate-500 block">{getPeriodLabel(tier.duration_type)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-2">
                    <div className="grid grid-cols-2 gap-2">
                      {(tier.features || []).slice(0, 4).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 pt-3 bg-slate-50/50 dark:bg-slate-800/30">
                    <Button
                      className={cn(
                        "w-full rounded-xl h-11 font-semibold text-sm shadow-sm transition-all active:scale-95",
                        isHighlight
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700"
                      )}
                      onClick={(e) => { e.stopPropagation(); handleSelectPlan(tier); }}
                    >
                      {ctaText}
                    </Button>
                    {trialText && (
                      <p className="text-[10px] text-center text-teal-600 dark:text-teal-400 font-medium">{trialText}</p>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Guarantee + Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => store.setStep(1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <Shield className="w-3.5 h-3.5" /> Secure payment &bull; Cancel anytime
        </div>
      </div>
    </div>
  );
}
