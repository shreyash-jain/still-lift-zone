'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeCardProps {
    emoji: string;
    title: string;
    locked?: boolean;
    bgColor?: string;
    className?: string;
    children?: ReactNode;
}

/**
 * Reusable badge card component for displaying achievements
 * Used in dashboard achievement badges section
 */
export function BadgeCard({
    emoji,
    title,
    locked = false,
    bgColor = 'bg-amber-100 dark:bg-amber-900/30',
    className,
    children,
}: BadgeCardProps) {
    return (
        <div className={cn('flex flex-col items-center text-center gap-2', className)}>
            <div className={cn('w-16 h-16 rounded-full flex items-center justify-center relative shadow-sm', bgColor)}>
                <span className="text-2xl">{emoji}</span>
                {locked && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-slate-700 rounded-full border-2 border-white dark:border-slate-900" />
                )}
            </div>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{title}</span>
            {children}
        </div>
    );
}
