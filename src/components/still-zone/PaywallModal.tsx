'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, Lock, Star, Crown, Zap, Sparkles, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useRazorpay, type RazorpayResponse } from '@/hooks/useRazorpay';
import { supabase } from '@/lib/still-zone-supabase';

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
  is_active: boolean;
  highlight_text: string;
  icon_name: string;
}

const ICONS: Record<string, React.ElementType> = { zap: Zap, star: Star, crown: Crown, sparkles: Sparkles };
const toHuman = (paise: number) => { const n = paise / 100; return n % 1 === 0 ? n.toString() : n.toFixed(2); };
const getPeriodLabel = (d: string) => ({ monthly: '/ month', yearly: '/ year', lifetime: 'one-time', weekly: '/ week', free: 'forever' }[d] || '');

export function PaywallModal({ onSubscribed }: { onSubscribed: () => void }) {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currency, setCurrency] = useState<Currency>('INR');
  const { openCheckout } = useRazorpay();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/still-zone/api/plans');
        const json = await res.json();
        if (json.success) setPlans(json.plans || json.data || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSubscribe = async (plan: PaymentPlan) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please sign in.'); setProcessing(false); return; }

      // 1. Create Razorpay subscription
      const res = await fetch('/still-zone/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, currency, userId: user.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      // 2. Open Razorpay checkout
      await openCheckout({
        subscriptionId: json.subscriptionId,
        planName: plan.plan_name,
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          contact: user.user_metadata?.mobile_number || '',
        },
        onSuccess: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/still-zone/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, userId: user.id, planId: plan.id, planKey: plan.plan_key }),
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson.success) {
              toast.success('Subscription activated!');
              onSubscribed();
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch { toast.error('Verification failed.'); }
          finally { setProcessing(false); }
        },
        onFailure: () => { toast.error('Payment cancelled.'); setProcessing(false); },
      });
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Something went wrong');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 overflow-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Your Free Trial Has Ended</h1>
            <p className="text-slate-500">Subscribe to continue your wellness journey.</p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={cn("text-sm font-medium", currency === 'USD' ? "text-slate-900 dark:text-white" : "text-slate-500")}>USD</span>
              <Switch checked={currency === 'INR'} onCheckedChange={(c: boolean) => setCurrency(c ? 'INR' : 'USD')} className="data-[state=checked]:bg-teal-600" />
              <span className={cn("text-sm font-medium", currency === 'INR' ? "text-slate-900 dark:text-white" : "text-slate-500")}>INR</span>
            </div>
          </div>

          {/* Plans — same card design as plans page */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.filter(p => p.is_active).map((tier, i) => {
                const isHighlight = tier.is_highlighted;
                const Icon = ICONS[tier.icon_name] || (tier.duration_type === 'yearly' ? Star : Zap);
                const price = currency === 'USD'
                  ? (tier.price_usd === 0 ? 'Free' : `$${toHuman(tier.price_usd)}`)
                  : (tier.price_inr === 0 ? 'Free' : `\u20B9${toHuman(tier.price_inr)}`);

                return (
                  <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    {isHighlight && tier.highlight_text && (
                      <div className="flex justify-center mb-[-12px] relative z-10">
                        <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">{tier.highlight_text}</span>
                      </div>
                    )}
                    <Card className={cn(
                      "h-full transition-all hover:shadow-xl",
                      isHighlight ? "border-2 border-teal-500 ring-4 ring-teal-500/10" : "border-slate-200 dark:border-slate-800"
                    )}>
                      <CardHeader className="text-center pb-4">
                        <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg font-bold flex flex-col items-center gap-1">
                          {tier.plan_name}
                          {tier.duration_type === 'lifetime' && (
                            <Badge variant="outline" className="border-amber-500 text-amber-600 text-[10px]">Limited</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center pb-3">
                        <span className={cn("text-3xl font-extrabold", isHighlight ? "text-teal-600" : "")}>{price}</span>
                        <span className="text-sm text-slate-500 ml-1">{getPeriodLabel(tier.duration_type)}</span>
                        <div className="mt-4 space-y-2 text-left">
                          {(tier.features || []).slice(0, 4).map((f, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <Check className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" /> {f}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-3">
                        <Button
                          onClick={() => handleSubscribe(tier)}
                          disabled={processing}
                          className={cn(
                            "w-full rounded-xl h-11 font-semibold",
                            isHighlight ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 dark:bg-slate-800 dark:text-white"
                          )}
                        >
                          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe Now'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4" /> Secure payment &bull; Cancel anytime from your account
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
