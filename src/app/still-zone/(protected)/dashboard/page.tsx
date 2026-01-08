'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3, User, Settings, LogOut,
    Wind, Music, Brain, Sparkles, Trophy, Calendar, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/still-zone-supabase';

export default function DashboardPage() {
    const [userName, setUserName] = useState('');

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

    return (
        /* DASHBOARD CONTENT */
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
                        <div className="flex flex-col gap-6">
                            {/* Flex Grid for 7 Days */}
                            <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
                                {/* Days Header */}
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="text-xs sm:text-sm font-medium text-slate-500">{day}</div>
                                ))}

                                {/* Dot Matrix Rows */}
                                {/* Row 1 */}
                                {[1, 2, 0, 3, 3, 3, 2].map((level, i) => (
                                    <div key={`r1-${i}`} className="flex items-center justify-center h-8">
                                        {level > 0 ? (
                                            <span className="text-xl sm:text-2xl leading-none filter drop-shadow-sm transition-transform hover:scale-110 cursor-default">
                                                {level === 1 ? '🙂' : level === 2 ? '😐' : '😔'}
                                            </span>
                                        ) : (
                                            <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                                        )}
                                    </div>
                                ))}

                                {/* Row 2 */}
                                {[0, 2, 2, 0, 2, 2, 3].map((level, i) => (
                                    <div key={`r2-${i}`} className="flex items-center justify-center h-8">
                                        {level > 0 ? (
                                            <span className="text-xl sm:text-2xl leading-none filter drop-shadow-sm transition-transform hover:scale-110 cursor-default">
                                                {level === 1 ? '🙂' : level === 2 ? '😐' : '😔'}
                                            </span>
                                        ) : (
                                            <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                                        )}
                                    </div>
                                ))}

                                {/* Row 3 */}
                                {[3, 3, 2, 1, 1, 3, 0].map((level, i) => (
                                    <div key={`r3-${i}`} className="flex items-center justify-center h-8">
                                        {level > 0 ? (
                                            <span className="text-xl sm:text-2xl leading-none filter drop-shadow-sm transition-transform hover:scale-110 cursor-default">
                                                {level === 1 ? '🙂' : level === 2 ? '😐' : '😔'}
                                            </span>
                                        ) : (
                                            <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm">View Trends</Button>
                            </div>
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
                            {/* Statistic 1 */}
                            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="p-2 mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">6</span>
                                <span className="text-xs text-slate-500 font-medium">Sessions This Week</span>
                            </div>

                            {/* Statistic 2 */}
                            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="p-2 mb-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-600 dark:text-rose-400">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">28 <span className="text-sm font-normal text-slate-400">min</span></span>
                                <span className="text-xs text-slate-500 font-medium">Minutes Calm</span>
                            </div>

                            {/* Statistic 3 */}
                            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="p-2 mb-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-bold text-green-600">+3</span>
                                <span className="text-xs text-slate-500 font-medium">Mood Improvement</span>
                            </div>
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
                            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-3 text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                    <Wind className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">Breathing</div>
                                    <div className="text-xs text-slate-400 font-normal">Relaxation</div>
                                </div>
                            </Button>

                            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-3 text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Music className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">Audio</div>
                                    <div className="text-xs text-slate-400 font-normal">Soothing</div>
                                </div>
                            </Button>

                            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-3 text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">Micro Tool</div>
                                    <div className="text-xs text-slate-400 font-normal">NLP Focus</div>
                                </div>
                            </Button>
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
                                <Button className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm px-8">Start Now</Button>
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
                            {/* Badge 1 */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center relative shadow-sm">
                                    <span className="text-2xl">👍</span>
                                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-slate-700 rounded-full border-2 border-white dark:border-slate-900" />
                                </div>
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Calm Streak</span>
                            </div>
                            {/* Badge 2 */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center relative shadow-sm">
                                    <span className="text-2xl">⭐</span>
                                </div>
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Mindful Explorer</span>
                            </div>
                            {/* Badge 3 */}
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center relative shadow-sm">
                                    <span className="text-2xl">🌟</span>
                                </div>
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Focus Master</span>
                            </div>
                            {/* Weekly Reflection */}
                            <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 text-center">Weekly Reflection</h4>
                                <Button size="sm" className="w-full text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white">
                                    Add Journal Note
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </main>

    );
}
