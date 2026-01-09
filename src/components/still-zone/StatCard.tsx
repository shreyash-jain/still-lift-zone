'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
    icon: LucideIcon;
    value: ReactNode;
    label: string;
    iconColor?: string;
    iconBgColor?: string;
    valueColor?: string;
    className?: string;
    children?: ReactNode;
}

/**
 * Reusable statistic card component for displaying metrics
 * Used in dashboard progress section
 */
export function StatCard({
    icon: Icon,
    value,
    label,
    iconColor = 'text-blue-600 dark:text-blue-400',
    iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
    valueColor = 'text-slate-900 dark:text-white',
    className,
    children,
}: StatCardProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800',
                className
            )}
        >
            <div className={cn('p-2 mb-2 rounded-full', iconBgColor, iconColor)}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={cn('text-2xl font-bold', valueColor)}>{value}</span>
            <span className="text-xs text-slate-500 font-medium">{label}</span>
            {children}
        </div>
    );
}
