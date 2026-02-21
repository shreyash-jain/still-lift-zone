'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMoodByKey, getMoodByAverageScore } from '@/lib/still-zone-config';

// ─── Shared types (consumed by Dashboard, Grid, and Graph) ─────────────────
export interface MoodDailyEntry {
    date: string;
    mood_type: string | null;
    time_key: string | null;
    tracked: boolean;
    sessions: number;
}

export interface MoodStreakSummary {
    totalDaysTracked: number;
    totalDays: number;
    mostFrequentMood: string;
    mostFrequentMoodCount: number;
    moodDistribution: Record<string, number>;
    bestStreak: number;
    bestStreakStart: string;
    bestStreakEnd: string;
    currentStreak: number;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface MoodTrackerGridProps {
    className?: string;
    dailyData: MoodDailyEntry[];
    summary: MoodStreakSummary | null;
    loading?: boolean;
}

interface DayEntry {
    date: string;
    dayLabel: string;
    dateLabel: string;
    tracked: boolean;
    mood_key: string | null;
    emoji: string | null;
    isToday: boolean;
    isFuture: boolean;
}

/**
 * Mood Tracker Grid — pure display component.
 * All data comes from props (single source of truth from Dashboard).
 * No independent API calls.
 */
export function MoodTrackerGrid({ className, dailyData, summary, loading }: MoodTrackerGridProps) {
    if (loading) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                <div className="flex items-center justify-center h-32">
                    <div className="mood-graph-loading-spinner" />
                </div>
            </div>
        );
    }

    const today = new Date().toISOString().split('T')[0];

    // Transform daily data into display entries
    const allDays: DayEntry[] = (dailyData || []).map((d) => {
        const dateObj = new Date(d.date + 'T00:00:00');
        // Support single or multiple mood keys (comma-separated for future multi-select)
        const moodKeys = d.mood_type ? d.mood_type.split(',').map(k => k.trim()).filter(Boolean) : [];
        const moodConfig = moodKeys.length > 1
            ? getMoodByAverageScore(moodKeys)
            : moodKeys.length === 1
                ? getMoodByKey(moodKeys[0])
                : null;
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return {
            date: d.date,
            dayLabel: dayNames[dateObj.getDay()],
            dateLabel: `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`,
            tracked: d.tracked,
            mood_key: moodConfig?.key || d.mood_type,
            emoji: moodConfig?.emoji || null,
            isToday: d.date === today,
            isFuture: d.date > today,
        };
    });

    // Show only last 21 days (3 weeks)
    const days = allDays.slice(-21);

    if (days.length === 0) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                <p className="text-center text-slate-400 text-sm py-8">
                    Start tracking your mood to see your journey here 🌱
                </p>
            </div>
        );
    }

    // Split days into weeks of 7 for grid display
    const weeks: DayEntry[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {/* Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
                {/* Day headers */}
                {dayHeaders.map((day) => (
                    <div key={day} className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
                        {day}
                    </div>
                ))}

                {/* Mood day cells */}
                {weeks.map((week, weekIdx) =>
                    week.map((day, dayIdx) => (
                        <MoodDayCell key={`${weekIdx}-${dayIdx}`} day={day} />
                    ))
                )}
            </div>

            {/* Streak stats — uses same summary as the graph */}
            {summary && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">🔥</span>
                            <div>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    {summary.currentStreak}
                                </span>
                                <span className="text-xs text-slate-400 ml-1">current</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">🏆</span>
                            <div>
                                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                    {summary.bestStreak}
                                </span>
                                <span className="text-xs text-slate-400 ml-1">longest</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">
                        {summary.totalDaysTracked}/{summary.totalDays} days tracked
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Individual mood day cell — emoji if tracked, X if missed. Nothing else.
 */
function MoodDayCell({ day }: { day: DayEntry }) {
    if (day.isFuture) {
        return <div className="flex items-center justify-center h-10 sm:h-12" />;
    }

    if (!day.tracked || !day.emoji) {
        return (
            <div className="flex items-center justify-center h-10 sm:h-12" title={`${day.dateLabel} — Not tracked`}>
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 dark:text-red-500" />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-10 sm:h-12" title={`${day.dateLabel} — ${day.mood_key}`}>
            <span className="text-lg sm:text-xl leading-none cursor-default">
                {day.emoji}
            </span>
        </div>
    );
}
