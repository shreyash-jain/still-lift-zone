'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logoStillliftNew from '@/../public/Logo stilllift new.svg';
import logoStillliftDark from '@/../public/Logo stilllift - dark theme.png';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu, X,
  ShieldCheck, Bike, BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/still-zone-supabase';
import { toast } from 'sonner';
import { TokenKey, removeAuthorizationCookie } from '@/lib/auth-utils';
import Background from '@/components/Background';

// First screen after successful login for Still Zone
// Mobile-first, calm, minimal UI built with TailwindCSS

type MoodKey =
  | 'overwhelmed'
  | 'sad'
  | 'anxious'
  | 'tired'
  | 'focus'
  | 'curious';

const MOODS: { key: MoodKey; label: string; emoji: string }[] = [
  { key: 'overwhelmed', label: 'Overwhelmed / Stressed', emoji: '🤯' },
  { key: 'sad', label: 'Sad / Low Mood', emoji: '😔' },
  { key: 'anxious', label: 'Anxious / Restless', emoji: '😰' },
  { key: 'tired', label: 'Tired / Burned Out', emoji: '😫' },
  { key: 'focus', label: 'Seeking Focus', emoji: '🎯' },
  { key: 'curious', label: 'Just Curious', emoji: '✨' },
];

type ContextKey = 'still-safe' | 'move-safe' | 'move-focused';

const CONTEXTS: { key: ContextKey; label: string; description?: string; emoji: string }[] = [
  { key: 'still-safe', label: 'Still & Safe Place', description: 'At home or a quiet safe space', emoji: '🪑' },
  { key: 'move-safe', label: 'On the Move, but Safe', description: 'Walking, commuting (passenger)', emoji: '🚶' },
  { key: 'move-focused', label: 'On the Move and Actively Focused', description: 'Driving, active commuting', emoji: '🎯' },
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
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Background />
      {/* NAVBAR */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800" : "bg-transparent"
      )}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image
                src={logoStillliftNew}
                alt="Still Lift Logo"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src={logoStillliftDark}
                alt="Still Lift Logo"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
            <span className={cn(
              "font-bold text-lg tracking-tight transition-colors",
              // scrolled ? "text-slate-900 dark:text-white" : "text-slate-900 dark:text-white"
              "text-slate-900 dark:text-white"
            )}>Still Zone</span>
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

        {/* MOOD GRID - Updated with Still Lift CSS Styles */}
        <section>
          <div className="mood-section">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {MOODS.map((m) => {
                const selected = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMood(m.key)}
                    className={cn(
                      "mood-btn glass-card w-full transition-all duration-300 focus:outline-none focus:ring-0",
                      selected
                        ? "!border-2 !border-teal-500 dark:!border-teal-400 !bg-[var(--glass-card-bg)] !shadow-sm !outline-none !ring-0"
                        : "hover:!border-teal-200 dark:hover:!border-teal-800"
                    )}
                  >
                    <div className="mood-content">
                      <span className="mood-emoji">{m.emoji}</span>
                      <span className="mood-text font-inter">{m.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* CONTEXT SELECTION */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-teal-500 rounded-full" />
              Choose your context
            </h2>
            <div className="context-section space-y-3">
              {CONTEXTS.map((c) => {
                const selected = context === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setContext(c.key)}
                    className={cn(
                      "context-btn glass-card w-full transition-all duration-300 focus:outline-none focus:ring-0",
                      selected
                        ? "!border-2 !border-teal-500 dark:!border-teal-400 !bg-[var(--glass-card-bg)] !shadow-sm !outline-none !ring-0"
                        : "hover:!border-teal-200 dark:hover:!border-teal-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl filter drop-shadow-sm">{c.emoji}</span>
                      <div className="text-left w-full">
                        <span className="context-text font-inter block text-lg font-medium !text-left">{c.label}</span>
                        {c.description && (
                          <span className="context-subtitle text-sm opacity-80 block font-normal !text-left">{c.description}</span>
                        )}
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
              <span className="w-1 h-6 bg-teal-500 rounded-full" />
              Current Availability
            </h2>

            <div className="p-6 glass-card space-y-6">
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
                        "relative py-3 px-2 rounded-xl text-center transition-all duration-300 font-medium text-sm sm:text-base border-2 glass-card focus:outline-none focus:ring-0",
                        selected
                          ? "!border-teal-500 dark:!border-teal-400 !bg-[var(--glass-card-bg)] !shadow-sm !outline-none !ring-0"
                          : "border-transparent hover:!border-teal-200 dark:hover:!border-teal-800"
                      )}
                    >
                      {t} min
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <Button className="w-full h-12 text-base rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 active:bg-teal-800 transition-all shadow-md border-transparent">
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
