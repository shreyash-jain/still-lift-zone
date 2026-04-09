'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMoodByKey } from '@/lib/still-zone-config';

interface DayData {
    date: string;
    tracked: boolean;
    mood?: string | null;
}

interface AdminMoodCalendarProps {
    dailyData: DayData[];
    joinDate: string;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Format date as YYYY-MM-DD in local timezone (avoids UTC shift bug)
function toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function AdminMoodCalendar({ dailyData, joinDate }: AdminMoodCalendarProps) {
    // Build a lookup map: date string → { tracked, mood }
    const dataMap = useMemo(() => {
        const map = new Map<string, DayData>();
        dailyData.forEach(d => map.set(d.date, d));
        return map;
    }, [dailyData]);

    // Determine join month/year and current month/year
    const joinDateObj = new Date(joinDate);
    const joinMonth = joinDateObj.getMonth();
    const joinYear = joinDateObj.getFullYear();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayStr = toLocalDateStr(today);

    // State: which month to display (default = current month)
    const [viewMonth, setViewMonth] = useState(currentMonth);
    const [viewYear, setViewYear] = useState(currentYear);

    // Navigation bounds
    const canGoPrev = viewYear > joinYear || (viewYear === joinYear && viewMonth > joinMonth);
    const canGoNext = viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth);

    const goToPrev = () => {
        if (!canGoPrev) return;
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(y => y - 1);
        } else {
            setViewMonth(m => m - 1);
        }
    };

    const goToNext = () => {
        if (!canGoNext) return;
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(y => y + 1);
        } else {
            setViewMonth(m => m + 1);
        }
    };

    // Build calendar grid for the selected month
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const startDayOfWeek = firstDay.getDay(); // 0=Sun
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        const joinDayStr = toLocalDateStr(joinDateObj);

        type Cell = {
            dayNum: number | null;
            dateStr: string | null;
            data: DayData | null;
            isBeforeJoin: boolean;
            isFuture: boolean;
            isToday: boolean;
        };

        const cells: Cell[] = [];

        // Leading empty cells for days before the 1st
        for (let i = 0; i < startDayOfWeek; i++) {
            cells.push({ dayNum: null, dateStr: null, data: null, isBeforeJoin: false, isFuture: false, isToday: false });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(viewYear, viewMonth, day);
            const dStr = toLocalDateStr(d);
            cells.push({
                dayNum: day,
                dateStr: dStr,
                data: dataMap.get(dStr) || null,
                isBeforeJoin: dStr < joinDayStr,
                isFuture: dStr > todayStr,
                isToday: dStr === todayStr,
            });
        }

        return cells;
    }, [viewYear, viewMonth, dataMap, todayStr]);

    // Stats for this month
    const monthStats = useMemo(() => {
        const monthDays = calendarDays.filter(c => c.dayNum !== null && !c.isBeforeJoin && !c.isFuture);
        const tracked = monthDays.filter(c => c.data?.tracked);
        return { total: monthDays.length, tracked: tracked.length };
    }, [calendarDays]);

    return (
        <div className="space-y-4">
            {/* Month navigation header */}
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
                    {MONTH_NAMES[viewMonth]} {viewYear}
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

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {DAY_HEADERS.map(day => (
                    <div key={day} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase py-1">
                        {day}
                    </div>
                ))}

                {/* Calendar cells */}
                {calendarDays.map((cell, i) => {
                    if (cell.dayNum === null) {
                        return <div key={`empty-${i}`} className="h-11" />;
                    }

                    if (cell.isBeforeJoin || cell.isFuture) {
                        return (
                            <div key={cell.dateStr} className="h-11 flex flex-col items-center justify-center opacity-25">
                                <span className="text-[10px] text-slate-400">{cell.dayNum}</span>
                            </div>
                        );
                    }

                    const tracked = cell.data?.tracked;
                    const moodKey = cell.data?.mood;
                    const moodConfig = moodKey ? getMoodByKey(moodKey) : null;
                    const emoji = moodConfig?.emoji || null;

                    return (
                        <div
                            key={cell.dateStr}
                            title={
                                tracked
                                    ? `${cell.dateStr}: ${moodConfig?.label || moodKey || 'Active'}`
                                    : `${cell.dateStr}: No activity`
                            }
                            className={`h-11 flex flex-col items-center justify-center rounded-lg transition-colors cursor-default ${cell.isToday
                                    ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-slate-900'
                                    : ''
                                } ${tracked
                                    ? 'bg-green-50 dark:bg-green-900/20'
                                    : 'bg-slate-50 dark:bg-slate-800/40'
                                }`}
                        >
                            <span className={`text-[10px] leading-none mb-0.5 ${cell.isToday
                                    ? 'font-bold text-blue-600 dark:text-blue-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                {cell.dayNum}
                            </span>
                            {tracked ? (
                                <span className="text-base leading-none">{emoji || '✓'}</span>
                            ) : (
                                <span className="text-xs leading-none text-red-400 dark:text-red-500 font-bold">✕</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Month summary */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <span>
                    {monthStats.tracked}/{monthStats.total} days tracked
                </span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <span className="text-sm">😊</span> Tracked
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="text-red-400 font-bold">✕</span> Missed
                    </span>
                </div>
            </div>
        </div>
    );
}
