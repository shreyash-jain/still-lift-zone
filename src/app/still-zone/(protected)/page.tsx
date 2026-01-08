'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShieldCheck, Bike, BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/still-zone-supabase';

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

const TIME_OPTIONS = [1, 2, 5, 10];

export default function StillZoneDashboardPage() {
  const router = useRouter(); // Kept if needed for future logic, though mostly handled by header now
  // Selections
  const [mood, setMood] = useState<MoodKey>('overwhelmed');
  const [context, setContext] = useState<ContextKey>('still-safe');
  const [time, setTime] = useState<number>(3);

  return (
    /* MAIN CONTENT WRAPPER */
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
                  <div className="flex items-center gap-5 p-2">
                    <span className="text-5xl filter drop-shadow-sm">{c.emoji}</span>
                    <div className="text-left w-full">
                      <span className="context-text font-inter block text-2xl font-semibold !text-left leading-tight mb-1">{c.label}</span>
                      {c.description && (
                        <span className="context-subtitle text-base opacity-80 block font-normal !text-left">{c.description}</span>
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
              <Button
                onClick={() => router.push('/still-zone/support-selection')}
                className="w-full h-12 text-base rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 active:bg-teal-800 transition-all shadow-md border-transparent"
              >
                Start Session
              </Button>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}
