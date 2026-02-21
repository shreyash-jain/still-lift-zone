'use client';

import { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { MoodDailyEntry, MoodStreakSummary } from './MoodTrackerGrid';

// ─── Mood config ───────────────────────────────────────────────────────────────
const MOOD_CONFIG: Record<string, {
    label: string;
    emoji: string;
    value: number;
    color: string;
    gradient: string;
    sentiment: 'positive' | 'neutral' | 'negative';
}> = {
    curious: {
        label: 'Curious',
        emoji: '🤔',
        value: 6,
        color: '#10b981',
        gradient: '#34d399',
        sentiment: 'positive',
    },
    focus: {
        label: 'Seeking Focus',
        emoji: '🧐',
        value: 5,
        color: '#22c55e',
        gradient: '#4ade80',
        sentiment: 'positive',
    },
    tired: {
        label: 'Tired',
        emoji: '😴',
        value: 4,
        color: '#f59e0b',
        gradient: '#fbbf24',
        sentiment: 'neutral',
    },
    overwhelmed: {
        label: 'Overwhelmed',
        emoji: '😰',
        value: 3,
        color: '#f97316',
        gradient: '#fb923c',
        sentiment: 'negative',
    },
    anxious: {
        label: 'Anxious',
        emoji: '😟',
        value: 2,
        color: '#ef4444',
        gradient: '#f87171',
        sentiment: 'negative',
    },
    sad: {
        label: 'Sad',
        emoji: '😔',
        value: 1,
        color: '#dc2626',
        gradient: '#f87171',
        sentiment: 'negative',
    },
};

const MOOD_VALUE_TO_KEY: Record<number, string> = {};
Object.entries(MOOD_CONFIG).forEach(([key, cfg]) => {
    MOOD_VALUE_TO_KEY[cfg.value] = key;
});

// Types used internally by the graph — shared types imported from MoodTrackerGrid

interface ChartDataPoint {
    date: string;
    dateLabel: string;
    moodValue: number;
    moodType: string | null;
    tracked: boolean;
    color: string;
}

interface MoodTrackingGraphProps {
    className?: string;
    dailyData: MoodDailyEntry[];
    summary: MoodStreakSummary | null;
    loading?: boolean;
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
interface TooltipPayload {
    moodType: string | null;
    tracked: boolean;
    dateLabel: string;
}

function CustomTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: { payload: TooltipPayload }[];
    label?: string;
}) {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload as ChartDataPoint;
    const config = data.moodType ? MOOD_CONFIG[data.moodType] : null;

    return (
        <div className="mood-tooltip">
            <p className="mood-tooltip-date">{data.dateLabel}</p>
            {data.tracked && config ? (
                <div className="mood-tooltip-mood">
                    <span className="mood-tooltip-emoji">{config.emoji}</span>
                    <span
                        className="mood-tooltip-label"
                        style={{ color: config.color }}
                    >
                        {config.label}
                    </span>
                </div>
            ) : (
                <p className="mood-tooltip-missed">No mood tracked</p>
            )}
        </div>
    );
}

// ─── Custom dot renderer ───────────────────────────────────────────────────────
interface DotProps {
    cx?: number;
    cy?: number;
    payload?: ChartDataPoint;
}

function CustomDot({ cx, cy, payload }: DotProps) {
    if (cx === undefined || cy === undefined || !payload) return null;

    if (!payload.tracked || payload.moodValue === 0) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={6} fill="#94a3b8" fillOpacity={0.3} />
                <text
                    x={cx}
                    y={cy + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={8}
                    fill="#94a3b8"
                    fontWeight="bold"
                >
                    ✕
                </text>
            </g>
        );
    }

    const config = payload.moodType ? MOOD_CONFIG[payload.moodType] : null;
    const color = config?.color || '#94a3b8';

    return (
        <g>
            {/* Glow effect */}
            <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.15} />
            {/* Main dot */}
            <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={color}
                stroke="white"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
            />
        </g>
    );
}

// ─── Range selector ────────────────────────────────────────────────────────────
type DayRange = 7 | 14 | 30;

function RangeSelector({
    selected,
    onChange,
}: {
    selected: DayRange;
    onChange: (range: DayRange) => void;
}) {
    const ranges: { value: DayRange; label: string }[] = [
        { value: 7, label: '7 Days' },
        { value: 14, label: '14 Days' },
        { value: 30, label: '30 Days' },
    ];

    return (
        <div className="mood-graph-range-selector">
            {ranges.map((r) => (
                <button
                    key={r.value}
                    onClick={() => onChange(r.value)}
                    className={`mood-graph-range-btn ${selected === r.value ? 'mood-graph-range-btn-active' : ''
                        }`}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}

// ─── Mood legend ───────────────────────────────────────────────────────────────
function MoodLegend() {
    return (
        <div className="mood-graph-legend">
            {Object.entries(MOOD_CONFIG).map(([key, cfg]) => (
                <div key={key} className="mood-graph-legend-item">
                    <span className="mood-graph-legend-emoji">{cfg.emoji}</span>
                    <span className="mood-graph-legend-label">{cfg.label}</span>
                </div>
            ))}
            <div className="mood-graph-legend-item">
                <span className="mood-graph-legend-dot mood-graph-legend-dot-missed" />
                <span className="mood-graph-legend-label">Missed</span>
            </div>
        </div>
    );
}

// ─── Summary cards ─────────────────────────────────────────────────────────────
function SummaryCards({ summary }: { summary: MoodStreakSummary }) {
    const frequentConfig = MOOD_CONFIG[summary.mostFrequentMood];

    const formatStreakDates = () => {
        if (!summary.bestStreakStart || !summary.bestStreakEnd) return '';
        try {
            const start = format(parseISO(summary.bestStreakStart), 'MMM d');
            const end = format(parseISO(summary.bestStreakEnd), 'MMM d');
            return `${start} – ${end}`;
        } catch {
            return '';
        }
    };

    return (
        <div className="mood-graph-summary">
            {/* Most Frequent Mood */}
            <div className="mood-graph-summary-card">
                <div className="mood-graph-summary-icon" style={{ background: frequentConfig ? `${frequentConfig.color}18` : '#f1f5f9' }}>
                    <span className="mood-graph-summary-emoji">
                        {frequentConfig?.emoji || '—'}
                    </span>
                </div>
                <div className="mood-graph-summary-info">
                    <span className="mood-graph-summary-value" style={{ color: frequentConfig?.color }}>
                        {frequentConfig?.label || 'None'}
                    </span>
                    <span className="mood-graph-summary-label">Most Frequent Mood</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function MoodTrackingGraph({ className, dailyData, summary, loading: externalLoading }: MoodTrackingGraphProps) {
    const [dayRange, setDayRange] = useState<DayRange>(14);

    // Transform incoming data for chart display, sliced to the selected range
    const chartData = useMemo(() => {
        if (!dailyData || dailyData.length === 0) return [];

        // Slice to the selected day range (take last N days)
        const sliced = dailyData.slice(-dayRange);

        return sliced.map((entry) => {
            const config = entry.mood_type ? MOOD_CONFIG[entry.mood_type] : null;
            return {
                date: entry.date,
                dateLabel: format(parseISO(entry.date), 'MMM d'),
                moodValue: entry.tracked && config ? config.value : 0,
                moodType: entry.mood_type,
                tracked: entry.tracked,
                color: config?.color || '#94a3b8',
            };
        });
    }, [dailyData, dayRange]);

    const loading = externalLoading ?? false;

    // Y-axis tick formatter
    const formatYTick = (value: number) => {
        const key = MOOD_VALUE_TO_KEY[value];
        return key ? MOOD_CONFIG[key].emoji : '';
    };

    // ─── Render states ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className={`mood-graph-container ${className || ''}`}>
                <div className="mood-graph-loading">
                    <div className="mood-graph-loading-spinner" />
                    <p>Loading your mood journey...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`mood-graph-container ${className || ''}`}>
            {/* Header */}
            <div className="mood-graph-header">
                <div className="mood-graph-header-text">
                    <h3 className="mood-graph-title">Your Mood Journey</h3>
                    <p className="mood-graph-subtitle">
                        Track how you&apos;ve been feeling day by day
                    </p>
                </div>
                <RangeSelector selected={dayRange} onChange={setDayRange} />
            </div>

            {/* Chart */}
            <div className="mood-graph-chart-wrapper">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: -10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e2e8f0"
                                strokeOpacity={0.5}
                            />

                            <XAxis
                                dataKey="dateLabel"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                                interval={dayRange <= 7 ? 0 : dayRange <= 14 ? 1 : 4}
                                angle={dayRange >= 30 ? -35 : 0}
                                textAnchor={dayRange >= 30 ? 'end' : 'middle'}
                                height={dayRange >= 30 ? 45 : 30}
                            />

                            <YAxis
                                domain={[0, 7]}
                                ticks={[1, 2, 3, 4, 5, 6]}
                                tickFormatter={formatYTick}
                                tick={{ fontSize: 16 }}
                                tickLine={false}
                                axisLine={false}
                                width={35}
                            />

                            <Tooltip content={<CustomTooltip />} cursor={false} />

                            {/* Neutral line — divides positive / negative half */}
                            <ReferenceLine
                                y={3.5}
                                stroke="#cbd5e1"
                                strokeDasharray="6 4"
                                strokeOpacity={0.6}
                            />

                            <Area
                                type="monotoneX"
                                dataKey="moodValue"
                                stroke="#0d9488"
                                strokeWidth={2.5}
                                fill="url(#moodGradient)"
                                dot={<CustomDot />}
                                activeDot={{ r: 7, strokeWidth: 2, stroke: '#0d9488' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="mood-graph-empty">
                        <span className="mood-graph-empty-icon">🌱</span>
                        <p className="mood-graph-empty-text">
                            Start tracking your mood to see your journey here
                        </p>
                    </div>
                )}
            </div>

            {/* Legend */}
            <MoodLegend />

            {/* Summary */}
            {summary && summary.totalDaysTracked > 0 && (
                <SummaryCards summary={summary} />
            )}
        </div>
    );
}
