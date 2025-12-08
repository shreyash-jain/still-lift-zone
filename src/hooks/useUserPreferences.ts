'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useUserPreferences() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [screenlessMode, setScreenlessMode] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    // Load user preferences from localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedAudio = localStorage.getItem('audio');
    const savedScreenless = localStorage.getItem('screenless');

    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    }

    if (savedAudio === 'enabled') {
      setAudioEnabled(true);
    }

    if (savedScreenless === 'enabled') {
      setScreenlessMode(true);
      document.body.classList.add('screenless-mode');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleReadAloud = () => {
    const newAudioEnabled = !audioEnabled;
    setAudioEnabled(newAudioEnabled);
    localStorage.setItem('audio', newAudioEnabled ? 'enabled' : 'disabled');
  };

  const setScreenlessModeState = useCallback((enabled: boolean) => {
    setScreenlessMode(enabled);

    if (enabled) {
      document.body.classList.add('screenless-mode');
      document.body.classList.remove('normal-mode');
      localStorage.setItem('screenless', 'enabled');
    } else {
      document.body.classList.add('normal-mode');
      document.body.classList.remove('screenless-mode');
      localStorage.setItem('screenless', 'disabled');
    }
  }, [setScreenlessMode]);

  const toggleScreenless = () => {
    setScreenlessModeState(!screenlessMode);
  };

  return {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
    setScreenlessMode: setScreenlessModeState,
  };
} 