'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// First screen after successful login for Still Zone
// Mobile-first, calm, minimal UI built with TailwindCSS

type MoodKey =
  | 'overwhelmed'
  | 'sad'
  | 'anxious'
  | 'tired'
  | 'focus'
  | 'curious';

const MOODS: { key: MoodKey; label: string }[] = [
  { key: 'overwhelmed', label: 'Overwhelmed / Stressed' },
  { key: 'sad', label: 'Sad / Low Mood' },
  { key: 'anxious', label: 'Anxious / Restless' },
  { key: 'tired', label: 'Tired / Burned Out' },
  { key: 'focus', label: 'Seeking Focus' },
  { key: 'curious', label: 'Just Curious' },
];

type ContextKey = 'still-safe' | 'move-safe' | 'move-focused';

const CONTEXTS: { key: ContextKey; label: string }[] = [
  { key: 'still-safe', label: 'Still and Safe' },
  { key: 'move-safe', label: 'On the Move, but Safe' },
  { key: 'move-focused', label: 'On the Move and Focused' },
];

export default function StillZoneDashboardPage() {
  // Navbar state
  const [menuOpen, setMenuOpen] = useState(false);
  // Selections
  const [mood, setMood] = useState<MoodKey>('overwhelmed');
  const [context, setContext] = useState<ContextKey>('still-safe');
  const [time, setTime] = useState<number>(1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVBAR */}
      <header className="bg-white shadow-sm py-3 px-4 flex justify-between items-center sticky top-0 z-50">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-2">
          {/* Placeholder circle for logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-200 to-teal-400" aria-hidden="true" />
          <span className="text-slate-900 font-semibold">Still Zone</span>
        </div>

        {/* Right: Hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-slate-100 active:bg-slate-200 transition"
        >
          {menuOpen ? <X className="h-5 w-5 text-slate-800" /> : <Menu className="h-5 w-5 text-slate-800" />}
        </button>
      </header>

      {/* Slide-down menu */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="bg-white shadow-sm border-b overflow-hidden"
          >
            <div className="max-w-md mx-auto px-4 py-3">
              <ul className="grid gap-2">
                <li>
                  <a href="#" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700">Dashboard</a>
                </li>
                <li>
                  <a href="#" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700">Profile</a>
                </li>
                <li>
                  <a href="#" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700">Logout</a>
                </li>
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT WRAPPER */}
      <main className="max-w-md mx-auto px-4 py-8 space-y-10">
        {/* HEADLINE SECTION */}
        <section className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 text-center">How are you feeling today?</h1>
          <p className="text-slate-600 text-center">Choose a mood to begin your guided session.</p>
        </section>

        {/* MOOD GRID */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {MOODS.map((m) => {
              const selected = mood === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMood(m.key)}
                  className={[
                    'rounded-2xl p-4 bg-white shadow-sm text-center font-semibold transition hover:shadow-md cursor-pointer border border-gray-100',
                    selected ? 'ring-2 ring-indigo-400 ring-offset-1' : '',
                  ].join(' ')}
                >
                  <span className="block text-slate-800">{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTEXT SELECTION */}
        <section className="space-y-4">
          <h2 className="text-slate-900 font-semibold">Choose your context</h2>
          <div className="space-y-3">
            {CONTEXTS.map((c) => {
              const selected = context === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setContext(c.key)}
                  className={[
                    'w-full text-left rounded-2xl p-4 bg-white border transition hover:shadow-md',
                    selected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 shadow-sm',
                  ].join(' ')}
                >
                  <div className="font-medium text-slate-900">{c.label}</div>
                  <div className="text-sm text-slate-600">Tap to select</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* TIME SELECTION */}
        <section className="space-y-4">
          <label htmlFor="time-select" className="text-slate-900 font-semibold">
            How much time do you have?
          </label>
          <select
            id="time-select"
            className="w-full mt-2 p-3.5 rounded-xl border bg-white text-slate-900"
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value, 10))}
          >
            <option value={1}>1 minute</option>
            <option value={2}>2 minutes</option>
            <option value={3}>3 minutes</option>
            <option value={5}>5 minutes</option>
          </select>
        </section>
      </main>
    </div>
  );
}
