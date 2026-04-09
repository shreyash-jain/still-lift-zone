'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    Wind, Music, Brain, Sparkles, Trophy, User, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/still-zone-supabase';
import { StatCard, ToolCard, BadgeCard, MoodTrackerGrid } from '@/components/still-zone';
import type { MoodDailyEntry, MoodStreakSummary } from '@/components/still-zone/MoodTrackerGrid';
import JournalDialog from '@/components/JournalDialog';
import { useJournalNotes } from '@/hooks/useJournalNotes';
import { CreateJournalNoteData } from '@/types/journal';

// Dynamic import: Recharts uses browser-only APIs (ResizeObserver, etc.)
// Must be loaded client-side only to avoid SSR chunk loading failures
const MoodTrackingGraph = dynamic(
    () => import('@/components/still-zone/MoodTrackingGraph').then((m) => m.MoodTrackingGraph),
    {
        ssr: false,
        loading: () => (
            <div className="mood-graph-container">
                <div className="mood-graph-loading">
                    <div className="mood-graph-loading-spinner" />
                    <p>Loading your mood journey...</p>
                </div>
            </div>
        ),
    }
);

export default function DashboardPage() {
    const [userName, setUserName] = useState('');
    const [userJoinDate, setUserJoinDate] = useState<string>('');
    const [isJournalDialogOpen, setIsJournalDialogOpen] = useState(false);
    const { createNote } = useJournalNotes();

    // ─── Single source of truth for mood data ──────────────────────────────
    const [moodDailyData, setMoodDailyData] = useState<MoodDailyEntry[]>([]);
    const [moodSummary, setMoodSummary] = useState<MoodStreakSummary | null>(null);
    const [moodLoading, setMoodLoading] = useState(true);

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend';
                setUserName(name);
                setUserJoinDate(user.created_at || '');
            }
        };
        fetchUser();
    }, []);

    // Fetch mood data ONCE — shared by both MoodTrackerGrid and MoodTrackingGraph
    const fetchMoodData = useCallback(async () => {
        setMoodLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMoodLoading(false);
                return;
            }

            // Single API call — both components consume this same data
            const res = await fetch(`/still-zone/api/mood-history?userId=${user.id}`);
            if (!res.ok) {
                setMoodLoading(false);
                return;
            }

            const data = await res.json();
            setMoodDailyData(data.dailyData || []);
            setMoodSummary(data.summary || null);
        } catch (err) {
            console.error('Error fetching mood data:', err);
        } finally {
            setMoodLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMoodData();
    }, [fetchMoodData]);

    const handleCreateJournalNote = async (data: CreateJournalNoteData) => {
        await createNote(data);
    };

    // ─── Compute Today's Progress from real mood data ───────────────────────
    const todayProgress = useMemo(() => {
        // Mood score map — same as MoodTrackingGraph MOOD_CONFIG values
        const MOOD_SCORES: Record<string, number> = {
            curious: 6, focus: 5, tired: 4, overwhelmed: 3, anxious: 2, sad: 1,
        };
        // time_key → minutes map (matches still-zone-config TIME options)
        const TIME_MINUTES: Record<string, number> = {
            '1min': 1, '2min': 2, '5min': 5, '10min': 10,
        };

        if (!moodDailyData || moodDailyData.length === 0) {
            return { sessionsThisWeek: 0, minutesCalm: 0, moodDelta: null, todayTracked: false };
        }

        const todayStr = new Date().toISOString().split('T')[0];

        // Sessions this week (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const weekStartStr = sevenDaysAgo.toISOString().split('T')[0];
        const sessionsThisWeek = moodDailyData.filter(
            d => d.tracked && d.date >= weekStartStr && d.date <= todayStr
        ).length;

        // Today's entry
        const todayEntry = moodDailyData.find(d => d.date === todayStr && d.tracked);
        const todayTracked = !!todayEntry;

        // Minutes Calm — sum of all session durations this week
        const minutesCalm = moodDailyData
            .filter(d => d.tracked && d.date >= weekStartStr && d.date <= todayStr)
            .reduce((sum, d) => sum + (TIME_MINUTES[d.time_key || ''] || 0), 0);

        // Mood Improvement — today vs most recent previous entry
        let moodDelta: number | null = null;
        if (todayEntry?.mood_type) {
            const todayScore = MOOD_SCORES[todayEntry.mood_type] ?? null;
            // Find the most recent tracked day BEFORE today
            const previousEntries = moodDailyData
                .filter(d => d.tracked && d.date < todayStr && d.mood_type)
                .reverse();
            const prevEntry = previousEntries[0];
            if (prevEntry?.mood_type && todayScore !== null) {
                const prevScore = MOOD_SCORES[prevEntry.mood_type] ?? null;
                if (prevScore !== null) moodDelta = todayScore - prevScore;
            }
        }

        return { sessionsThisWeek, minutesCalm, moodDelta, todayTracked };
    }, [moodDailyData]);

    return (
        <>
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-8">


                {/* Welcome Section */}
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Hello, {userName || 'Friend'} <span className="animate-wave inline-block origin-[70%_70%]">👋</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        How are you feeling today?
                    </p>
                </div>

                <div className="flex flex-col gap-6">

                    {/* 1. Mood Tracker — same data as graph */}
                    <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-6 space-y-0">
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Mood Tracker</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <span className="sr-only">Menu</span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MoodTrackerGrid
                                dailyData={moodDailyData}
                                summary={moodSummary}
                                loading={moodLoading}
                                monthView
                                joinDate={userJoinDate}
                            />
                        </CardContent>
                    </Card>

                    {/* Daily Mood Tracking Graph — same data as tracker */}
                    <MoodTrackingGraph
                        dailyData={moodDailyData}
                        summary={moodSummary}
                        loading={moodLoading}
                    />

                    {/* 2. Today's Progress */}
                    <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Today&apos;s Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatCard
                                    icon={User}
                                    value={moodLoading ? '—' : String(todayProgress.sessionsThisWeek)}
                                    label="Sessions This Week"
                                    iconColor="text-blue-600 dark:text-blue-400"
                                    iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                                />
                                <StatCard
                                    icon={Sparkles}
                                    value={
                                        moodLoading ? '—' : (
                                            <>{todayProgress.minutesCalm} <span className="text-sm font-normal text-slate-400">min</span></>
                                        )
                                    }
                                    label="Minutes Calm This Week"
                                    iconColor="text-rose-600 dark:text-rose-400"
                                    iconBgColor="bg-rose-100 dark:bg-rose-900/30"
                                />
                                <StatCard
                                    icon={Trophy}
                                    value={
                                        moodLoading ? '—' :
                                            !todayProgress.todayTracked ? '—' :
                                                todayProgress.moodDelta === null ? '—' :
                                                    todayProgress.moodDelta > 0 ? `+${todayProgress.moodDelta}` :
                                                        todayProgress.moodDelta < 0 ? `${todayProgress.moodDelta}` : '0'
                                    }
                                    label="Mood vs Last Session"
                                    iconColor={
                                        !moodLoading && todayProgress.moodDelta !== null && todayProgress.moodDelta > 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : !moodLoading && todayProgress.moodDelta !== null && todayProgress.moodDelta < 0
                                                ? 'text-red-500 dark:text-red-400'
                                                : 'text-slate-500 dark:text-slate-400'
                                    }
                                    iconBgColor={
                                        !moodLoading && todayProgress.moodDelta !== null && todayProgress.moodDelta > 0
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : !moodLoading && todayProgress.moodDelta !== null && todayProgress.moodDelta < 0
                                                ? 'bg-red-100 dark:bg-red-900/30'
                                                : 'bg-slate-100 dark:bg-slate-800'
                                    }
                                    valueColor={
                                        !moodLoading && todayProgress.moodDelta !== null && todayProgress.moodDelta > 0
                                            ? 'text-green-600'
                                            : !moodLoading && todayProgress.moodDelta !== null && todayProgress.moodDelta < 0
                                                ? 'text-red-500'
                                                : undefined
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Your Recent Tools */}
                    <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Your Recent Tools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ToolCard
                                    icon={Wind}
                                    title="Breathing"
                                    subtitle="Relaxation"
                                    iconColor="text-cyan-600 dark:text-cyan-400"
                                    iconBgColor="bg-cyan-100 dark:bg-cyan-900/30"
                                />
                                <ToolCard
                                    icon={Music}
                                    title="Audio"
                                    subtitle="Soothing"
                                    iconColor="text-indigo-600 dark:text-indigo-400"
                                    iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
                                />
                                <ToolCard
                                    icon={Brain}
                                    title="Micro Tool"
                                    subtitle="NLP Focus"
                                    iconColor="text-violet-600 dark:text-violet-400"
                                    iconBgColor="bg-violet-100 dark:bg-violet-900/30"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Recommended Banner */}
                    <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recommended For You</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-hidden rounded-lg border border-sky-100 bg-gradient-to-r from-sky-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex-1 space-y-2 text-center md:text-left z-10">
                                    <h3 className="text-2xl font-serif text-slate-800 dark:text-white italic">
                                        Try a Havening Technique
                                    </h3>
                                </div>
                                <div className="z-10">
                                    <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm px-8">Start Now</Button>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute left-0 top-0 w-32 h-32 bg-sky-100/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl dark:opacity-10" />
                                <div className="absolute right-0 bottom-0 w-48 h-48 bg-indigo-100/50 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl dark:opacity-10" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. Achievement Badges */}
                    <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Achievement Badges</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <span className="sr-only">Menu</span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <BadgeCard
                                    emoji="👍"
                                    title="Calm Streak"
                                    locked={true}
                                    bgColor="bg-amber-100 dark:bg-amber-900/30"
                                />
                                <BadgeCard
                                    emoji="⭐"
                                    title="Mindful Explorer"
                                    bgColor="bg-cyan-100 dark:bg-cyan-900/30"
                                />
                                <BadgeCard
                                    emoji="🌟"
                                    title="Focus Master"
                                    bgColor="bg-indigo-100 dark:bg-indigo-900/30"
                                />
                                {/* Weekly Reflection */}
                                <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 text-center">Weekly Reflection</h4>
                                    <Button
                                        size="sm"
                                        className="w-full text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white"
                                        onClick={() => setIsJournalDialogOpen(true)}
                                    >
                                        Add Journal Note
                                    </Button>
                                    <Link href="/still-zone/journal">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs font-medium border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 gap-1"
                                        >
                                            <BookOpen className="w-3 h-3" />
                                            View All Notes
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>

            {/* Journal Dialog */}
            <JournalDialog
                isOpen={isJournalDialogOpen}
                onOpenChange={setIsJournalDialogOpen}
                onSave={handleCreateJournalNote}
                mode="create"
            />
        </>
    );
}
