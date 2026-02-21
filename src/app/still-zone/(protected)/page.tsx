'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SelectionCard, PageHeader, SectionHeader } from '@/components/still-zone';
import { MOOD_OPTIONS, CONTEXT_OPTIONS, TIME_OPTIONS } from '@/lib/still-zone-config';

// First screen after successful login for Still Zone
// Mobile-first, calm, minimal UI built with TailwindCSS

export default function StillZoneDashboardPage() {
  const router = useRouter();
  // Selections — use config keys, not hardcoded
  const [mood, setMood] = useState<string | null>(null);
  const [context, setContext] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const canStart = mood && context && time;

  const handleStartSession = () => {
    if (!canStart) return;
    router.push(`/still-zone/support-selection?mood=${mood}&context=${context}&time=${time}`);
  };

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
            {MOOD_OPTIONS.map((m) => (
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
            {CONTEXT_OPTIONS.map((c) => (
              <SelectionCard
                key={c.key}
                selected={context === c.key}
                onClick={() => setContext(c.key)}
                emoji={c.icon}
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
                  key={t.key}
                  selected={time === t.key}
                  onClick={() => setTime(t.key)}
                  label={t.label}
                  variant="time"
                />
              ))}
            </div>

            <div className="pt-2">
              <Button
                onClick={handleStartSession}
                disabled={!canStart}
                className="w-full h-12 text-base rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 active:bg-teal-800 transition-all shadow-md border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canStart ? 'Start Session' : 'Start Session'}
              </Button>
            </div>
          </div>
        </section>
      </div>

    </main>
  );
}
