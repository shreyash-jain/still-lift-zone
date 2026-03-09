'use client';

import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
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
    /** When true, renders a full month calendar with prev/next navigation */
    monthView?: boolean;
    /** Required when monthView is true — the date the user joined (ISO string) */
    joinDate?: string;
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/** Resolve a raw mood_type string into { key, emoji } */
function resolveMood(moodType: string | null) {
    if (!moodType) return null;
    const moodKeys = moodType.split(',').map(k => k.trim()).filter(Boolean);
    return moodKeys.length > 1
        ? getMoodByAverageScore(moodKeys)
        : moodKeys.length === 1
            ? getMoodByKey(moodKeys[0])
            : null;
}

/**
 * Mood Tracker Grid — pure display component.
 * All data comes from props (single source of truth from Dashboard).
 * No independent API calls.
 *
 * Supports two modes:
 * - Default (3-week grid) — used on the StillZone user dashboard
 * - Month view (full calendar with navigation) — used on the admin side sheet
 */
export function MoodTrackerGrid({
    className, dailyData, summary, loading,
    monthView = false, joinDate,
}: MoodTrackerGridProps) {
    if (loading) {
        return (
            <div className={cn('flex flex-col gap-4', className)}>
                <div className="flex items-center justify-center h-32">
                    <div className="mood-graph-loading-spinner" />
                </div>
            </div>
        );
    }

    // Route to the appropriate view
    if (monthView) {
        return <MonthViewGrid className={className} dailyData={dailyData} summary={summary} joinDate={joinDate} />;
    }

    return <WeekViewGrid className={className} dailyData={dailyData} summary={summary} />;
}

// ─── Default 3-week view (unchanged behaviour) ─────────────────────────────────
function WeekViewGrid({
    className, dailyData, summary,
}: { className?: string; dailyData: MoodDailyEntry[]; summary: MoodStreakSummary | null }) {
    const today = new Date().toISOString().split('T')[0];

    const allDays: DayEntry[] = (dailyData || []).map((d) => {
        const dateObj = new Date(d.date + 'T00:00:00');
        const moodConfig = resolveMood(d.mood_type);
        return {
            date: d.date,
            dayLabel: DAY_NAMES[dateObj.getDay()],
            dateLabel: `${MONTH_NAMES_SHORT[dateObj.getMonth()]} ${dateObj.getDate()}`,
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

    const weeks: DayEntry[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
                {DAY_NAMES.map((day) => (
                    <div key={day} className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
                        {day}
                    </div>
                ))}
                {weeks.map((week, weekIdx) =>
                    week.map((day, dayIdx) => (
                        <MoodDayCell key={`${weekIdx}-${dayIdx}`} day={day} />
                    ))
                )}
            </div>

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

// ─── Month-wise calendar view with navigation ──────────────────────────────────
function MonthViewGrid({
    className, dailyData, summary, joinDate,
}: { className?: string; dailyData: MoodDailyEntry[]; summary: MoodStreakSummary | null; joinDate?: string }) {
    // Build lookup map
    const dataMap = useMemo(() => {
        const map = new Map<string, MoodDailyEntry>();
        (dailyData || []).forEach(d => map.set(d.date, d));
        return map;
    }, [dailyData]);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const joinDateObj = joinDate ? new Date(joinDate) : new Date();
    const joinMonth = joinDateObj.getMonth();
    const joinYear = joinDateObj.getFullYear();
    const joinDayStr = joinDateObj.toISOString().split('T')[0];

    const [viewMonth, setViewMonth] = useState(currentMonth);
    const [viewYear, setViewYear] = useState(currentYear);

    const canGoPrev = viewYear > joinYear || (viewYear === joinYear && viewMonth > joinMonth);
    const canGoNext = viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth);

    const goToPrev = () => {
        if (!canGoPrev) return;
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const goToNext = () => {
        if (!canGoNext) return;
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Calendar cells for the viewed month
    type CalendarCell = {
        dayNum: number | null;
        dateStr: string | null;
        entry: MoodDailyEntry | null;
        isBeforeJoin: boolean;
        isFuture: boolean;
        isToday: boolean;
    };

    const cells = useMemo<CalendarCell[]>(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const startDow = firstDay.getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        const result: CalendarCell[] = [];
        // Leading blanks
        for (let i = 0; i < startDow; i++) {
            result.push({ dayNum: null, dateStr: null, entry: null, isBeforeJoin: false, isFuture: false, isToday: false });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(viewYear, viewMonth, day);
            const dStr = d.toISOString().split('T')[0];
            result.push({
                dayNum: day,
                dateStr: dStr,
                entry: dataMap.get(dStr) || null,
                isBeforeJoin: dStr < joinDayStr,
                isFuture: dStr > todayStr,
                isToday: dStr === todayStr,
            });
        }
        return result;
    }, [viewYear, viewMonth, dataMap, todayStr, joinDayStr]);

    // Month stats
    const monthStats = useMemo(() => {
        const activeCells = cells.filter(c => c.dayNum !== null && !c.isBeforeJoin && !c.isFuture);
        const tracked = activeCells.filter(c => c.entry?.tracked);
        return { total: activeCells.length, tracked: tracked.length };
    }, [cells]);

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {/* Month navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={goToPrev}
                    disabled={!canGoPrev}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                    {MONTH_NAMES_FULL[viewMonth]} {viewYear}
                </h4>
                <button
                    onClick={goToNext}
                    disabled={!canGoNext}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next month"
                >
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {/* Day headers */}
                {DAY_NAMES.map(day => (
                    <div key={day} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase py-1">
                        {day}
                    </div>
                ))}

                {/* Day cells */}
                {cells.map((cell, i) => {
                    if (cell.dayNum === null) {
                        return <div key={`empty-${i}`} className="h-11" />;
                    }

                    // Before join or future — greyed out
                    if (cell.isBeforeJoin || cell.isFuture) {
                        return (
                            <div key={cell.dateStr} className="h-11 flex flex-col items-center justify-center opacity-25">
                                <span className="text-[10px] text-slate-400">{cell.dayNum}</span>
                            </div>
                        );
                    }

                    const tracked = cell.entry?.tracked;
                    const moodConfig = resolveMood(cell.entry?.mood_type || null);
                    const emoji = moodConfig?.emoji || null;

                    return (
                        <div
                            key={cell.dateStr}
                            title={
                                tracked
                                    ? `${cell.dateStr}: ${moodConfig?.label || cell.entry?.mood_type || 'Active'}`
                                    : `${cell.dateStr}: No activity`
                            }
                            className={`h-11 flex flex-col items-center justify-center rounded-lg transition-colors cursor-default ${cell.isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                                } ${tracked ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-50 dark:bg-slate-800/40'
                                }`}
                        >
                            <span className={`text-[10px] leading-none mb-0.5 ${cell.isToday ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                {cell.dayNum}
                            </span>
                            {tracked ? (
                                <span className="text-base leading-none">{emoji || '✓'}</span>
                            ) : (
                                <X className="w-3.5 h-3.5 text-red-400 dark:text-red-500" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Month summary footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <span>{monthStats.tracked}/{monthStats.total} days tracked</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="text-sm">😊</span> Tracked</span>
                    <span className="flex items-center gap-1"><X className="w-3 h-3 text-red-400" /> Missed</span>
                </div>
            </div>

            {/* Streak stats (if summary provided) */}
            {summary && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">🔥</span>
                            <div>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{summary.currentStreak}</span>
                                <span className="text-xs text-slate-400 ml-1">current</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">🏆</span>
                            <div>
                                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{summary.bestStreak}</span>
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
