'use client';

import { motion } from 'framer-motion';
import { CreditCard, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyPlanPage() {
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

                <p className="text-center mt-8 text-sm text-slate-400 dark:text-slate-500">
                    Need help? <Link href="#" className="underline hover:text-slate-600 dark:hover:text-slate-300">Contact Support</Link>
                </p>

            </motion.div>
        </main>
    );
}
