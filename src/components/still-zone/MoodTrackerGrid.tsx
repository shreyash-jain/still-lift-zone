'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MoodTrackerGridProps {
    className?: string;
}

type MoodLevel = 0 | 1 | 2 | 3;

interface MoodDayProps {
    level: MoodLevel;
}

/**
 * Individual mood day cell component
 */
function MoodDay({ level }: MoodDayProps) {
    if (level === 0) {
        return (
            <div className="flex items-center justify-center h-8">
                <X className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
        );
    }

    const emoji = level === 1 ? '🙂' : level === 2 ? '😐' : '😔';

    return (
        <div className="flex items-center justify-center h-8">
            <span className="text-xl sm:text-2xl leading-none filter drop-shadow-sm transition-transform hover:scale-110 cursor-default">
                {emoji}
            </span>
        </div>
    );
}

/**
 * Reusable mood tracker grid component
 * Displays a 7-day mood tracking grid with emoji indicators
 */
export function MoodTrackerGrid({ className }: MoodTrackerGridProps) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Sample data - in real app, this would come from props or API
    const weekData: MoodLevel[][] = [
        [1, 2, 0, 3, 3, 3, 2],
        [0, 2, 2, 0, 2, 2, 3],
        [3, 3, 2, 1, 1, 3, 0],
    ];

    return (
        <div className={cn('flex flex-col gap-6', className)}>
            <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
                {/* Days Header */}
                {days.map((day) => (
                    <div key={day} className="text-xs sm:text-sm font-medium text-slate-500">
                        {day}
                    </div>
                ))}

                {/* Mood Data Rows */}
                {weekData.map((week, weekIndex) =>
                    week.map((level, dayIndex) => (
                        <MoodDay key={`week-${weekIndex}-day-${dayIndex}`} level={level} />
                    ))
                )}
            </div>
        </div>
    );
}
