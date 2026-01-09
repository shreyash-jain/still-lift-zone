'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionHeaderProps {
    title: string;
    className?: string;
    children?: ReactNode;
}

/**
 * Reusable section header component with accent bar
 * Provides consistent section styling across pages
 */
export function SectionHeader({ title, className, children }: SectionHeaderProps) {
    return (
        <h2 className={cn('text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2', className)}>
            <span className="w-1 h-6 bg-teal-500 rounded-full" />
            {title}
            {children}
        </h2>
    );
}
