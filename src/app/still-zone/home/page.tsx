'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Palette, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';

// First screen after successful login for Still Zone
// Mobile-first, calm UI matching Still Lift design patterns

type MoodKey = 'overwhelmed' | 'sad' | 'anxious' | 'tired' | 'focus' | 'curious';

const MOODS: { key: MoodKey; label: string; emoji: string }[] = [
  { key: 'overwhelmed', label: 'Overwhelmed / Stressed', emoji: '😰' },
  { key: 'sad', label: 'Sad / Low Mood', emoji: '😔' },
  { key: 'anxious', label: 'Anxious / Restless', emoji: '😟' },
  { key: 'tired', label: 'Tired / Burned Out', emoji: '😴' },
  { key: 'focus', label: 'Seeking Focus', emoji: '🧐' },
  { key: 'curious', label: 'Just Curious', emoji: '🤔' },
];

type ContextKey = 'still' | 'move' | 'focused';

const CONTEXTS: { key: ContextKey; label: string; icon: string }[] = [
  { key: 'still', label: 'Still and Safe', icon: '🪑' },
  { key: 'move', label: 'On the Move, but Safe', icon: '🚶' },
  { key: 'focused', label: 'On the Move and Focused', icon: '🎯' },
];



export default function StillZoneHomePage() {
  const router = useRouter();
  
  // Navbar state
  const [menuOpen, setMenuOpen] = useState(false);
  // Selections
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [context, setContext] = useState<ContextKey | null>(null);
  const [time, setTime] = useState<number | null>(null);
  
  // User preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [screenlessMode, setScreenlessMode] = useState(false);

  // Refs for scroll behavior
  const moodSectionRef = useRef<HTMLDivElement>(null);
  const contextSectionRef = useRef<HTMLDivElement>(null);
  const moodButtonsRef = useRef<HTMLDivElement>(null);
  const contextButtonsRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile or tablet
  const isMobileOrTablet = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  };

  const handleMoodSelection = (selectedMood: MoodKey) => {
    // Toggle behavior
    if (mood === selectedMood) {
      setMood(null);
    } else {
      setMood(selectedMood);
      // Scroll to context on mobile
      if (isMobileOrTablet() && contextSectionRef.current) {
        setTimeout(() => {
          contextSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
    }
  };

  const handleContextSelection = (selectedContext: ContextKey) => {
    // Toggle behavior
    if (context === selectedContext) {
      setContext(null);
    } else {
      setContext(selectedContext);
      // Scroll back to mood on mobile
      if (isMobileOrTablet() && moodSectionRef.current) {
        setTimeout(() => {
          moodSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
    }
  };

  // Navigate to support selection when all choices are made
  useEffect(() => {
    if (mood && context && time) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        router.push(`/still-zone/support-selection?mood=${mood}&context=${context}&time=${time}`);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mood, context, time, router]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Still Zone teal gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none" 
        style={{
          background: 'linear-gradient(to bottom, #f0fdfa 0%, rgba(207, 250, 254, 0.3) 50%, rgba(240, 253, 250, 0.5) 100%)',
          zIndex: 0
        }}
      />
      
      {/* Subtle background glows - Still Zone teal theme */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 1 }}>
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(0, 72, 81, 0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6, scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -right-16 w-[28rem] h-[28rem] rounded-full blur-3xl"
          style={{ background: 'rgba(0, 107, 122, 0.15)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* NAVBAR - Shared Header Component */}
      <Header
        isDarkMode={isDarkMode}
        audioEnabled={audioEnabled}
        screenlessMode={screenlessMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onToggleReadAloud={() => setAudioEnabled(!audioEnabled)}
        onToggleScreenless={() => setScreenlessMode(!screenlessMode)}
        appName="Still Zone"
        brandColor="#004851"
        showThemeToggle={false}
        customControls={
          <>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`control-btn glass-control ${audioEnabled ? 'active' : ''}`}
              aria-label="Toggle audio"
            >
              <span className="control-icon">🔊</span>
            </button>
            <button
              onClick={() => setScreenlessMode(!screenlessMode)}
              className={`control-btn glass-control ${screenlessMode ? 'active' : ''}`}
              aria-label={screenlessMode ? 'Exit screenless mode' : 'Enter screenless mode'}
            >
              <span className="control-icon" aria-hidden="true">
                {screenlessMode ? '🙈' : '👁️'}
              </span>
            </button>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
              className={`control-btn glass-control ${menuOpen ? 'active' : ''}`}
            >
              <span className="control-icon" aria-hidden="true">
                {menuOpen ? '✕' : '☰'}
              </span>
            </button>
          </>
        }
      />

      {/* Black Overlay */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Drawer Menu */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-screen w-[80%] md:w-[60%] lg:w-[50%] max-w-md z-[101] bg-white shadow-2xl flex flex-col"
          >
            {/* Header with close button */}
            <div className="flex-shrink-0 p-6 pb-4">
              <button 
                className="self-end" 
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-3">
                {/* Theme Settings */}
                <div className="w-full flex items-start gap-4 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-600/10 text-teal-600">
                    <Palette className="w-4 h-4" />
                  </span>
                  <span className="flex-1 space-y-0.5">
                    <span className="block text-sm font-medium text-slate-900">Theme</span>
                    <span className="block text-xs text-slate-600">Customize appearance</span>
                  </span>
                  <div className="flex items-center">
                    <AnimatedThemeToggler isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} ariaLabel="Toggle theme" />
                  </div>
                </div>

                {/* Dashboard */}
                <a 
                  href="#" 
                  className="flex items-start gap-4 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-600/10 text-teal-600">
                    <LayoutDashboard className="w-4 h-4" />
                  </span>
                  <span className="flex-1 space-y-0.5">
                    <span className="block text-sm font-medium text-slate-900">Dashboard</span>
                    <span className="block text-xs text-slate-600">View your activity</span>
                  </span>
                </a>

                {/* Profile */}
                <a 
                  href="#" 
                  className="flex items-start gap-4 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-600/10 text-teal-600">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="flex-1 space-y-0.5">
                    <span className="block text-sm font-medium text-slate-900">Profile</span>
                    <span className="block text-xs text-slate-600">Manage your account</span>
                  </span>
                </a>

                {/* Logout */}
                <a 
                  href="#" 
                  className="flex items-start gap-4 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-teal-600/10 text-teal-600">
                    <LogOut className="w-4 h-4" />
                  </span>
                  <span className="flex-1 space-y-0.5">
                    <span className="block text-sm font-medium text-slate-900">Logout</span>
                    <span className="block text-xs text-slate-600">Sign out of your account</span>
                  </span>
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col" style={{ position: 'relative', zIndex: 10 }}>
        <section className="screen active">
          <div className="container">
            {/* Instructions Section - matching Still Lift */}
            <div className="instructions-section">
              <h1 
                className="instruction-text"
                style={{
                  backgroundImage: 'linear-gradient(to right, rgb(13, 148, 136), rgb(16, 185, 129))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                  width: '100%'
                }}
              >
                How&apos;s your inner world today?
              </h1>
              <p className="instruction-subtext">
                Select your mood and context, and we&apos;ll help you find clarity and calm.
              </p>
            </div>

            {/* Main Questions Container */}
            <div className="main-questions-container">
              {/* Mood Question */}
              <div className="question-section mood-section" ref={moodSectionRef}>
                <div className="question-header">
                  <h2 className="font-inter font-semibold">How are you feeling today?</h2>
                </div>
                <div className="mood-buttons" ref={moodButtonsRef}>
                  {MOODS.map((m) => {
                    const selected = mood === m.key;
                    return (
                      <button
                        key={m.key}
                        className={`mood-btn glass-card ${selected ? 'selected' : m.key}`}
                        onClick={() => handleMoodSelection(m.key)}
                        data-mood={m.key}
                        aria-pressed={selected}
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

              {/* Right Column - Context and Time */}
              <div className="right-column">
                {/* Context Question */}
                <div className="question-section context-section" ref={contextSectionRef}>
                  <div className="question-header">
                    <h2 className="font-inter font-semibold">Where are you right now?</h2>
                  </div>
                  <div className="context-buttons" ref={contextButtonsRef}>
                    {CONTEXTS.map((c) => {
                      const selected = context === c.key;
                      return (
                        <button
                          key={c.key}
                          className={`context-btn glass-card ${selected ? 'selected' : c.key}`}
                          onClick={() => handleContextSelection(c.key)}
                          data-context={c.key}
                          aria-pressed={selected}
                        >
                          <div className="context-content">
                            <span className="context-icon">{c.icon}</span>
                            <span className="context-text font-inter font-medium">{c.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="time-selection-section">
                  <div className="question-header">
                    <h2 className="font-inter font-semibold">How much time do you have?</h2>
                  </div>
                  <select
                    id="time-select"
                    className="time-select glass-card"
                    value={time ?? ''}
                    onChange={(e) => setTime(e.target.value ? parseInt(e.target.value, 10) : null)}
                    aria-label="Select session duration"
                  >
                    <option value="">Select duration</option>
                    <option value={1}>1 minute</option>
                    <option value={2}>2 minutes</option>
                    <option value={3}>3 minutes</option>
                    <option value={5}>5 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}