'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SelectionCard, PageHeader, SectionHeader } from '@/components/still-zone';

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
  const router = useRouter();
  // Selections
  const [mood, setMood] = useState<MoodKey>('overwhelmed');
  const [context, setContext] = useState<ContextKey>('still-safe');
  const [time, setTime] = useState<number>(3);

  return (
    /* MAIN CONTENT WRAPPER */
    <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12 space-y-12">

      {/* HERO SECTION */}
      <PageHeader
        title="How are you feeling today?"
        subtitle="Select your current state to begin a personalized session."
      />

      {/* MOOD GRID */}
      <section>
        <div className="mood-section">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {MOODS.map((m) => (
              <SelectionCard
                key={m.key}
                selected={mood === m.key}
                onClick={() => setMood(m.key)}
                emoji={m.emoji}
                label={m.label}
                variant="mood"
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* CONTEXT SELECTION */}
        <section className="space-y-5">
          <SectionHeader title="Choose your context" />
          <div className="context-section space-y-3">
            {CONTEXTS.map((c) => (
              <SelectionCard
                key={c.key}
                selected={context === c.key}
                onClick={() => setContext(c.key)}
                emoji={c.emoji}
                label={c.label}
                description={c.description}
                variant="context"
              />
            ))}
          </div>
        </section>

        {/* TIME SELECTION */}
        <section className="space-y-5">
          <SectionHeader title="Current Availability" />

          <div className="p-6 glass-card space-y-6">
            <p className="text-slate-600 dark:text-slate-300">
              How much time do you have for this session?
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_OPTIONS.map((t) => (
                <SelectionCard
                  key={t}
                  selected={time === t}
                  onClick={() => setTime(t)}
                  label={`${t} min`}
                  variant="time"
                />
              ))}
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
