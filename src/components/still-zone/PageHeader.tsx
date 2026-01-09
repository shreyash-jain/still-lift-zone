'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
    children?: ReactNode;
}

/**
 * Reusable animated page header component
 * Provides consistent header styling across pages
 */
export function PageHeader({ title, subtitle, className, children }: PageHeaderProps) {
    return (
        <section className={cn('text-center space-y-3 max-w-2xl mx-auto', className)}>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
                {title}
            </motion.h1>
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 dark:text-slate-400 text-lg"
                >
                    {subtitle}
                </motion.p>
            )}
            {children}
        </section>
    );
}
