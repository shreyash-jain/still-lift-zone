'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Wind, Music, Brain, Sparkles, Trophy, User, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/still-zone-supabase';
import { StatCard, ToolCard, BadgeCard, MoodTrackerGrid } from '@/components/still-zone';
import JournalDialog from '@/components/JournalDialog';
import { useJournalNotes } from '@/hooks/useJournalNotes';
import { CreateJournalNoteData } from '@/types/journal';

export default function DashboardPage() {
    const [userName, setUserName] = useState('');
    const [isJournalDialogOpen, setIsJournalDialogOpen] = useState(false);
    const { createNote } = useJournalNotes();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Friend';
                setUserName(name);
            }
        };
        fetchUser();
    }, []);

    const handleCreateJournalNote = async (data: CreateJournalNoteData) => {
        await createNote(data);
    };

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

                {/* 1. Mood Tracker */}
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
                        <MoodTrackerGrid />
                        <div className="flex justify-end pt-2">
                            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">View Trends</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Today's Progress */}
                <Card className="border-slate-200 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Today&apos;s Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                icon={User}
                                value="6"
                                label="Sessions This Week"
                                iconColor="text-blue-600 dark:text-blue-400"
                                iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                            />
                            <StatCard
                                icon={Sparkles}
                                value={<>28 <span className="text-sm font-normal text-slate-400">min</span></>}
                                label="Minutes Calm"
                                iconColor="text-rose-600 dark:text-rose-400"
                                iconBgColor="bg-rose-100 dark:bg-rose-900/30"
                            />
                            <StatCard
                                icon={Trophy}
                                value="+3"
                                label="Mood Improvement"
                                iconColor="text-green-600 dark:text-green-400"
                                iconBgColor="bg-green-100 dark:bg-green-900/30"
                                valueColor="text-green-600"
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
