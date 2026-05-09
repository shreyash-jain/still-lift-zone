'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Clock,
    Wrench,
    CreditCard,
    Activity,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    ShieldOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import dynamic from 'next/dynamic';

const MoodTrackingGraph = dynamic(
    () => import('@/components/still-zone/MoodTrackingGraph').then((m) => m.MoodTrackingGraph),
    { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading mood graph...</div> }
);

interface DashboardData {
    dau: number;
    avgTimeSpentMinutes: number;
    toolsUsed: { name: string; count: number }[];
    subscriptions: { active: number; total: number };
    currentlyActive: number;
    recentLogins: {
        full_name: string;
        email: string;
        last_sign_in: string;
        provider: string;
        is_subscription_active: boolean;
    }[];
    moodDailyData: { date: string; mood_type: string | null; time_key: string | null; tracked: boolean; sessions: number }[];
    moodSummary: {
        totalDaysTracked: number;
        totalDays: number;
        mostFrequentMood: string;
        mostFrequentMoodCount: number;
        moodDistribution: Record<string, number>;
        bestStreak: number;
        bestStreakStart: string;
        bestStreakEnd: string;
        currentStreak: number;
    } | null;
}

export default function SuperAdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loginPage, setLoginPage] = useState(0);
    const LOGINS_PER_PAGE = 5;
    const router = useRouter();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('/super-admin-stillzone/api/dashboard');
            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/super-admin-stillzone/login');
                    return;
                }
                throw new Error('Failed to fetch dashboard data');
            }
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                throw new Error(((result as Error).message));
            }
        } catch (err: unknown) {
            setError(((err as Error).message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 lg:pt-10 pb-12 space-y-8 w-full">
            <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    SuperAdmin Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Overview of StillZone activity and metrics.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center">
                    <span className="font-semibold mr-2">Error:</span> {error}
                    <button onClick={() => fetchDashboardData()} className="ml-auto underline">Retry</button>
                </div>
            )}

            {loading && !data ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 dark:border-slate-500"></div>
                </div>
            ) : data ? (
                <div className="flex flex-col gap-6">

                    {/* Top Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Currently Active Users"
                            value={data.currentlyActive}
                            icon={<Activity className="text-green-600 dark:text-green-400" />}
                            description="Activity in last 15 min"
                            iconBgColor="bg-green-100 dark:bg-green-900/30"
                        />
                        <MetricCard
                            title="Daily Active Users"
                            value={data.dau}
                            icon={<Users className="text-blue-600 dark:text-blue-400" />}
                            description="Unique logins in 24h"
                            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                        />
                        <MetricCard
                            title="Average Time Spent"
                            value={`${data.avgTimeSpentMinutes}m`}
                            icon={<Clock className="text-purple-600 dark:text-purple-400" />}
                            description="Per recorded session"
                            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                        />
                        <MetricCard
                            title="Active Subscriptions"
                            value={data.subscriptions.active}
                            icon={<CreditCard className="text-amber-600 dark:text-amber-400" />}
                            description="Paid members"
                            iconBgColor="bg-amber-100 dark:bg-amber-900/30"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: Tools Usage */}
                        <Card className="lg:col-span-1 border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="pb-4 flex flex-row items-center space-y-0 space-x-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <Wrench className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Most Used Tools</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {data.toolsUsed.length === 0 ? (
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">No tool usage recorded yet.</p>
                                ) : (
                                    (() => {
                                        const TOOL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
                                        const total = data.toolsUsed.reduce((s: number, t: { count: number }) => s + t.count, 0);
                                        let accumulated = 0;
                                        const stops = data.toolsUsed.map((tool: { count: number }, i: number) => {
                                            const pct = (tool.count / total) * 100;
                                            const start = accumulated;
                                            accumulated += pct;
                                            return `${TOOL_COLORS[i % TOOL_COLORS.length]} ${start}% ${accumulated}%`;
                                        });
                                        return (
                                            <div className="flex flex-col items-center gap-5">
                                                {/* Donut */}
                                                <div className="relative w-36 h-36">
                                                    <div
                                                        className="w-full h-full rounded-full"
                                                        style={{ background: `conic-gradient(${stops.join(', ')})` }}
                                                    />
                                                    <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{total}</div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">total uses</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Legend */}
                                                <div className="w-full space-y-2.5">
                                                    {data.toolsUsed.map((tool: { name: string; count: number }, i: number) => {
                                                        const pct = Math.round((tool.count / total) * 100);
                                                        return (
                                                            <div key={i} className="flex items-center gap-2.5">
                                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: TOOL_COLORS[i % TOOL_COLORS.length] }} />
                                                                <span className="text-sm text-slate-700 dark:text-slate-300 capitalize flex-1">{tool.name.replace(/-/g, ' ')}</span>
                                                                <span className="text-xs text-slate-400">{tool.count}</span>
                                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 w-10 text-right">{pct}%</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                            </CardContent>
                        </Card>

                        {/* Right: Recent Logins List */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                        <CalendarDays className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                    </div>
                                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Logins</CardTitle>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => fetchDashboardData()} className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition">
                                    Refresh List
                                </Button>
                            </CardHeader>

                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                                <th className="pb-3 font-medium">User</th>
                                                <th className="pb-3 font-medium">Email</th>
                                                <th className="pb-3 font-medium">Plan</th>
                                                <th className="pb-3 font-medium text-right">Last Login</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {data.recentLogins.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-6 text-center text-slate-500">No recent logins.</td>
                                                </tr>
                                            ) : (
                                                data.recentLogins.slice(loginPage * LOGINS_PER_PAGE, (loginPage + 1) * LOGINS_PER_PAGE).map((user, idx) => (
                                                    <tr key={idx} className="group">
                                                        <td className="py-4 font-medium text-slate-800 dark:text-slate-200">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                {user.full_name || 'Anonymous User'}
                                                                {user.provider?.toLowerCase() === 'google' ? (
                                                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">{user.provider}</span>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-slate-600 dark:text-slate-400">{user.email || '-'}</td>
                                                        <td className="py-4">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.is_subscription_active ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 border border-amber-200 dark:border-amber-900/50' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                                {user.is_subscription_active ? 'Pro' : 'Free'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">
                                                            {user.last_sign_in ? new Date(user.last_sign_in).toLocaleString() : 'Never'}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {data.recentLogins.length > LOGINS_PER_PAGE && (
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                                        <span className="text-xs text-slate-400">
                                            {loginPage * LOGINS_PER_PAGE + 1}–{Math.min((loginPage + 1) * LOGINS_PER_PAGE, data.recentLogins.length)} of {data.recentLogins.length}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setLoginPage(p => Math.max(0, p - 1))}
                                                disabled={loginPage === 0}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                aria-label="Previous page"
                                            >
                                                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                            </button>
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 min-w-[3rem] text-center">
                                                Page {loginPage + 1}/{Math.ceil(data.recentLogins.length / LOGINS_PER_PAGE)}
                                            </span>
                                            <button
                                                onClick={() => setLoginPage(p => Math.min(Math.ceil(data.recentLogins.length / LOGINS_PER_PAGE) - 1, p + 1))}
                                                disabled={(loginPage + 1) * LOGINS_PER_PAGE >= data.recentLogins.length}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                aria-label="Next page"
                                            >
                                                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>


                    </div>

                    {/* All-Members Mood Journey */}
                    <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2 flex flex-row items-center space-y-0 space-x-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">All Members Mood Journey</CardTitle>
                                <p className="text-xs text-slate-500 mt-0.5">Aggregated mood across all members — last 30 days</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {data.moodDailyData && data.moodDailyData.length > 0 ? (
                                <MoodTrackingGraph
                                    dailyData={data.moodDailyData}
                                    summary={data.moodSummary}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No mood data recorded yet.</div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            ) : null}
        </main>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description: string;
    iconBgColor: string;
    highlight?: boolean;
}

// Reusable Metric Card matching StillZone UI
function MetricCard({ title, value, icon, description, iconBgColor, highlight = false }: MetricCardProps) {
    return (
        <Card className={`border-slate-200 shadow-sm overflow-hidden ${highlight ? 'bg-white dark:bg-slate-900 ring-2 ring-indigo-500/20 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)]' : 'bg-white dark:bg-slate-900'}`}>
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                        <h3 className={`text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100`}>{value}</h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${iconBgColor} shadow-sm`}>
                        {icon}
                    </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 font-medium">{description}</p>
            </div>
        </Card>
    );
}

// Mood Analytics Component
function MoodAnalytics() {
    const [analytics, setAnalytics] = useState<Record<string, any> | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<Record<string, any> | null /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await fetch('/super-admin-stillzone/api/mood-analytics');
                const result = await res.json();
                if (result.success) {
                    setAnalytics(result.data);
                }
            } catch (err) {
                console.error("Failed to fetch mood analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!analytics) return null;

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#fbd38d', '#34d399', '#38bdf8'];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mood Analytics</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graph 1: Mood Trends */}
                <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">7-Day Tracking Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
                                    axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="totalCount" name="Total Logs" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Graph 2: Most Used Moods */}
                <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Overall Mood Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {analytics.mostUsedData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-500">No moods tracked yet.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.mostUsedData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tickFormatter={(val) => val.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {analytics.mostUsedData.map((entry: { name: string; value: number }, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Graph 3: Per User Mood Table */}
            <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Latest User Moods</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                    <th className="pb-3 font-medium px-4">User</th>
                                    <th className="pb-3 font-medium px-4">Latest Mood</th>
                                    <th className="pb-3 font-medium px-4">Logged At</th>
                                    <th className="pb-3 font-medium px-4 min-w-[200px]">7-Day Pulse Map</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {analytics.userMoodsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-slate-500">No recent mood logs found.</td>
                                    </tr>
                                ) : (
                                    analytics.userMoodsList.map((u: Record<string, any> /* eslint-disable-line @typescript-eslint/no-explicit-any */, idx: number) => (
                                        <tr
                                            key={idx}
                                            onClick={() => { setSelectedUser(u); setSheetOpen(true); }}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                                        >
                                            <td className="py-4 px-4 font-medium text-slate-800 dark:text-slate-200">
                                                {u.fullName}
                                                <div className="text-xs text-slate-500 font-normal">{u.email}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                                                    {u.latestMood.replace(/-/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                                                {new Date(u.latestMoodDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex gap-1">
                                                    {analytics.dates.map((dStr: string) => {
                                                        const mood = u.sevenDaySummary[dStr];
                                                        return (
                                                            <div
                                                                key={dStr}
                                                                title={`${dStr}: ${mood || 'No Log'}`}
                                                                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-sm ${mood ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Side Sheet for Individual User Graph */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                {selectedUser && (
                    <SheetContent side="right" className="w-[100vw] sm:w-[500px] overflow-y-auto outline-none border-l border-slate-200 dark:border-slate-800">
                        <div className="pt-6 pb-4">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedUser.fullName}&apos;s Mood Map</h2>
                            <p className="text-slate-500">Breakdown of mood logs over the past week.</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="uppercase text-xs font-semibold text-slate-400 mb-4 tracking-wider">7-Day Breakdown</h3>
                            <div className="space-y-3">
                                {analytics.dates.map((dStr: string) => {
                                    const mood = selectedUser.sevenDaySummary[dStr];
                                    const dayDate = new Date(dStr);
                                    const isToday = new Date().toISOString().split('T')[0] === dStr;

                                    return (
                                        <div key={dStr} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {isToday ? 'Today' : dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <div>
                                                {mood ? (
                                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-semibold rounded-full capitalize border border-indigo-200 dark:border-indigo-800/50">
                                                        {mood.replace(/-/g, ' ')}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-sm">No entry</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SheetContent>
                )}
            </Sheet>
        </div>
    );
}
