'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ToolCardProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    iconColor?: string;
    iconBgColor?: string;
    onClick?: () => void;
    className?: string;
    children?: ReactNode;
}

/**
 * Reusable tool card component for displaying available tools/features
 * Used in dashboard recent tools section
 */
export function ToolCard({
    icon: Icon,
    title,
    subtitle,
    iconColor = 'text-cyan-600 dark:text-cyan-400',
    iconBgColor = 'bg-cyan-100 dark:bg-cyan-900/30',
    onClick,
    className,
    children,
}: ToolCardProps) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className={cn(
                'h-auto py-4 flex flex-col items-center justify-center gap-3 text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300',
                className
            )}
        >
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', iconBgColor, iconColor)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-center">
                <div className="font-semibold">{title}</div>
                <div className="text-xs text-slate-400 font-normal">{subtitle}</div>
            </div>
            {children}
        </Button>
    );
}
