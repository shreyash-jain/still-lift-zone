'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface AnimatedThemeTogglerProps {
  isDark?: boolean;
  onToggle?: () => void;
  ariaLabel?: string;
}

export function AnimatedThemeToggler({ isDark, onToggle, ariaLabel }: AnimatedThemeTogglerProps) {
  const [mounted, setMounted] = useState(false);
  const [internalDark, setInternalDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof isDark === 'boolean') return;
    const hasDark = document.body.classList.contains('dark-mode');
    setInternalDark(hasDark);
  }, [isDark]);

  const effectiveDark = typeof isDark === 'boolean' ? isDark : internalDark;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
      if (typeof isDark !== 'boolean') setInternalDark(v => !v);
      return;
    }
    // Fallback: directly toggle body classes + localStorage if no handler provided
    const next = !effectiveDark;
    if (next) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
    setInternalDark(next);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={ariaLabel || 'Toggle theme'}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/60 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition-colors dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-200"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={ariaLabel || (effectiveDark ? 'Switch to light theme' : 'Switch to dark theme')}
      className="relative inline-flex h-9 w-16 items-center rounded-full border border-slate-200/70 bg-white/70 px-1 shadow-sm ring-0 backdrop-blur transition-colors hover:bg-white dark:border-slate-700/60 dark:bg-slate-900/60 hover:dark:bg-slate-900"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {effectiveDark ? (
          <motion.span
            key="knob-dark"
            initial={{ x: 0, opacity: 0.6 }}
            animate={{ x: 28, opacity: 1 }}
            exit={{ x: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-amber-300 shadow-md"
          >
            <Moon className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="knob-light"
            initial={{ x: 28, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 28, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-amber-500 shadow"
          >
            <Sun className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}


