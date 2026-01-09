'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  label: string;
  description?: string;
  className?: string;
  variant?: 'mood' | 'context' | 'time';
  children?: ReactNode;
}

/**
 * Reusable selection card component for mood, context, and time selections
 * Maintains the Still Lift aesthetic with glass-card styling
 */
export function SelectionCard({
  selected,
  onClick,
  emoji,
  label,
  description,
  className,
  variant = 'mood',
  children,
}: SelectionCardProps) {
  const baseClasses = cn(
    'glass-card w-full transition-all duration-300 focus:outline-none focus:ring-0',
    selected
      ? '!border-2 !border-teal-500 dark:!border-teal-400 !bg-[var(--glass-card-bg)] !shadow-sm !outline-none !ring-0'
      : 'hover:!border-teal-200 dark:hover:!border-teal-800',
    className
  );

  if (variant === 'mood') {
    return (
      <button type="button" onClick={onClick} className={cn(baseClasses, 'mood-btn')}>
        <div className="mood-content">
          {emoji && <span className="mood-emoji">{emoji}</span>}
          <span className="mood-text font-inter">{label}</span>
        </div>
        {children}
      </button>
    );
  }

  if (variant === 'context') {
    return (
      <button type="button" onClick={onClick} className={cn(baseClasses, 'context-btn')}>
        <div className="flex items-center gap-5 p-2">
          {emoji && <span className="text-5xl filter drop-shadow-sm">{emoji}</span>}
          <div className="text-left w-full">
            <span className="context-text font-inter block text-2xl font-semibold !text-left leading-tight mb-1">
              {label}
            </span>
            {description && (
              <span className="context-subtitle text-base opacity-80 block font-normal !text-left">
                {description}
              </span>
            )}
          </div>
        </div>
        {children}
      </button>
    );
  }

  if (variant === 'time') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'relative py-3 px-2 rounded-xl text-center transition-all duration-300 font-medium text-sm sm:text-base border-2 glass-card focus:outline-none focus:ring-0',
          selected
            ? '!border-teal-500 dark:!border-teal-400 !bg-[var(--glass-card-bg)] !shadow-sm !outline-none !ring-0'
            : 'border-transparent hover:!border-teal-200 dark:hover:!border-teal-800',
          className
        )}
      >
        {label}
        {children}
      </button>
    );
  }

  return null;
}
