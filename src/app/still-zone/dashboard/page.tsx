'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu, X,
  CloudRain, Cloud, Wind, BatteryLow, Target, Sparkles,
  ShieldCheck, Bike, BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/still-zone-supabase';
import { toast } from 'sonner';
import { TokenKey, removeAuthorizationCookie } from '@/lib/auth-utils';

// First screen after successful login for Still Zone
// Mobile-first, calm, minimal UI built with TailwindCSS

type MoodKey =
  | 'overwhelmed'
  | 'sad'
  | 'anxious'
  | 'tired'
  | 'focus'
  | 'curious';

const MOODS: { key: MoodKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'overwhelmed', label: 'Overwhelmed / Stressed', icon: CloudRain, color: 'text-blue-500' },
  { key: 'sad', label: 'Sad / Low Mood', icon: Cloud, color: 'text-indigo-400' },
  { key: 'anxious', label: 'Anxious / Restless', icon: Wind, color: 'text-teal-500' },
  { key: 'tired', label: 'Tired / Burned Out', icon: BatteryLow, color: 'text-orange-400' },
  { key: 'focus', label: 'Seeking Focus', icon: Target, color: 'text-rose-500' },
  { key: 'curious', label: 'Just Curious', icon: Sparkles, color: 'text-amber-400' },
];

type ContextKey = 'still-safe' | 'move-safe' | 'move-focused';

const CONTEXTS: { key: ContextKey; label: string; description: string; icon: React.ElementType }[] = [
  { key: 'still-safe', label: 'Still and Safe', description: 'At home or a quiet safe space', icon: ShieldCheck },
  { key: 'move-safe', label: 'On the Move, but Safe', description: 'Walking, commuting (passenger)', icon: Bike },
  { key: 'move-focused', label: 'On the Move and Focused', description: 'Driving, active commuting', icon: BrainCircuit },
];

const TIME_OPTIONS = [1, 2, 3, 5];

export default function StillZoneDashboardPage() {
  // Navbar state
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  // Selections
  const [mood, setMood] = useState<MoodKey>('overwhelmed');
  const [context, setContext] = useState<ContextKey>('still-safe');
  const [time, setTime] = useState<number>(3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-sm flex items-center justify-center text-white font-bold text-sm">
              SZ
            </div>
            <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Still Zone</span>
          </div>

          {/* Right: Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <nav className="max-w-4xl mx-auto px-4 py-4">
              <ul className="space-y-2">
                {['Dashboard', 'Profile', 'Settings', 'Logout'].map((item) => (
                  <li key={item}>
                    {item === 'Logout' ? (
                      <button
                        onClick={async () => {
                          try {
                            // 1. Clear local cookies manually
                            removeAuthorizationCookie(TokenKey.access_token);
                            removeAuthorizationCookie(TokenKey.refresh_token);

                            // 2. Sign out from Supabase
                            const { error } = await supabase.auth.signOut();
                            if (error) console.error('Error signing out:', error);

                            // 3. Redirect
                            router.replace('/still-zone/login');
                            toast.success('Logged out successfully');
                          } catch (e) {
                            console.error('Logout failed:', e);
                            router.replace('/still-zone/login'); // Force redirect anyway
                          }
                        }}
                        className="w-full text-left block px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors font-medium"
                      >
                        {item}
                      </button>
                    ) : (
                      <a
                        href="#"
                        className="block px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                      >
                        {item}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT WRAPPER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-12">

        {/* HERO SECTION */}
        <section className="text-center space-y-3 max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            How are you feeling today?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 text-lg"
          >
            Select your current state to begin a personalized session.
          </motion.p>
        </section>

        {/* MOOD GRID - Updated with Cards */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {MOODS.map((m, idx) => {
              const selected = mood === m.key;
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-300 border-2 overflow-hidden relative group h-full",
                      selected
                        ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-md ring-1 ring-teal-500/20"
                        : "border-transparent border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                    )}
                    onClick={() => setMood(m.key)}
                  >
                    <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3 h-full">
                      <div className={cn(
                        "p-3 rounded-full transition-colors",
                        selected ? "bg-white dark:bg-slate-900 shadow-sm" : "bg-slate-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600"
                      )}>
                        <Icon className={cn("w-7 h-7", m.color)} />
                      </div>
                      <span className={cn(
                        "font-semibold text-sm sm:text-base",
                        selected ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"
                      )}>
                        {m.label}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* CONTEXT SELECTION */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-teal-500 rounded-full" />
              Choose your context
            </h2>
            <div className="space-y-3">
              {CONTEXTS.map((c) => {
                const selected = context === c.key;
                const Icon = c.icon;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setContext(c.key)}
                    className={cn(
                      "w-full text-left rounded-xl p-4 transition-all duration-200 flex items-start gap-4 border-2 group",
                      selected
                        ? "border-teal-500 bg-white dark:bg-slate-800 shadow-md"
                        : "border-transparent bg-white dark:bg-slate-800 shadow-sm hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                  >
                    <div className={cn(
                      "mt-1 p-2 rounded-lg transition-colors",
                      selected ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={cn(
                        "font-semibold text-base transition-colors",
                        selected ? "text-teal-900 dark:text-teal-100" : "text-slate-900 dark:text-slate-100"
                      )}>
                        {c.label}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {c.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* TIME SELECTION */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-rose-500 rounded-full" />
              Current Availability
            </h2>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
              <p className="text-slate-600 dark:text-slate-300">
                How much time do you have for this session?
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIME_OPTIONS.map((t) => {
                  const selected = time === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={cn(
                        "relative py-3 px-2 rounded-xl text-center transition-all duration-200 font-medium text-sm sm:text-base border-2",
                        selected
                          ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      )}
                    >
                      {t} min
                      {selected && (
                        <motion.div
                          layoutId="activeTime"
                          className="absolute inset-0 rounded-xl border-2 border-rose-500 pointer-events-none"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <Button className="w-full h-12 text-base rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg hover:shadow-xl transition-all">
                  Start Session
                </Button>
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
