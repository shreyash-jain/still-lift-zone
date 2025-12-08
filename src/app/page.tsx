'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { useUserPreferences } from '@/hooks/useUserPreferences';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import RevealElement from '@/components/3DRevealElement';
import TextBackButton from '@/components/TextBackButton';
import { initAnalytics, trackMoodSelected, trackContextSelected, trackMoodContextCombination, trackMicroHabitRevealed, trackUserAction } from '@/lib/analytics';
import { getRandomMessage, type Mood, type Context, type ContentMessage } from '@/lib/still-lift-content';
import { useAudioController } from '@/context/AudioControllerContext';
import '@/components/3DComponents.css';

interface MicroHabitData {
  action: string;
  actionType: 'ACTION' | 'REPEAT' | 'VISUALIZE' | 'BREATHE' | 'LISTEN';
  message: string;
  revealToken: string;
  revealType: string;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
  audioIndex: number; // Required: Index of the pre-recorded audio file
}

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
    setScreenlessMode,
  } = useUserPreferences();

  const { playHomepageAudio, stopHomepageAudio, playTaskAudio, stopTaskAudio } = useAudioController();

  const prevAudioEnabled = useRef(audioEnabled);
  const lastAutoAudioKeyRef = useRef<string | null>(null);
  const prevShowRevealRef = useRef(showReveal);
  const prevScreenlessModeRef = useRef(screenlessMode);
  const hasInstantRevealRef = useRef(false);
  const hasTrackedRevealRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const wasEnabled = prevAudioEnabled.current;
    prevAudioEnabled.current = audioEnabled;

    if (!showReveal && audioEnabled && !wasEnabled) {
      playHomepageAudio().catch((error) => {
        console.warn('[audio] Unable to start homepage audio:', error);
      });
    }

    if (!audioEnabled && wasEnabled) {
      stopTaskAudio();
      stopHomepageAudio();
    }
  }, [audioEnabled, showReveal, playHomepageAudio, stopHomepageAudio, stopTaskAudio]);

  useEffect(() => {
    if (showReveal) {
      stopHomepageAudio();
    }
  }, [showReveal, stopHomepageAudio]);

  useEffect(() => {
    const wasShowingReveal = prevShowRevealRef.current;
    prevShowRevealRef.current = showReveal;

    if (wasShowingReveal && !showReveal && audioEnabled) {
      playHomepageAudio().catch((error) => {
        console.warn('[audio] Unable to resume homepage audio:', error);
      });
    }
  }, [showReveal, audioEnabled, playHomepageAudio]);

  const moodSectionRef = useRef<HTMLDivElement>(null);
  const contextSectionRef = useRef<HTMLDivElement>(null);
  const moodButtonsRef = useRef<HTMLDivElement>(null);
  const contextButtonsRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile or tablet
  const isMobileOrTablet = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  };

  const handleMoodSelection = (mood: string) => {
    // Toggle behavior: if clicking the same mood, deselect it
    if (selectedMood === mood) {
      setSelectedMood(null);
      localStorage.removeItem('currentMood');
    } else {
      // Otherwise, select the new mood
      setSelectedMood(mood);
      localStorage.setItem('currentMood', mood);
      // Track mood selection
      trackMoodSelected(mood);
      
      // Scroll to context section on mobile/tablet
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

  const handleContextSelection = (context: string) => {
    // Toggle behavior: if clicking the same context, deselect it
    if (selectedContext === context) {
      setSelectedContext(null);
      localStorage.removeItem('currentContext');
    } else {
      // Otherwise, select the new context
      setSelectedContext(context);
      localStorage.setItem('currentContext', context);
      // Track context selection
      trackContextSelected(context);
      
      // Scroll back to mood section on mobile/tablet (vice versa)
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

  // Load saved mood and context on component mount
  useEffect(() => {
    // Prevent double initialization
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    // Initialize analytics
    initAnalytics();
    
    // Clear any existing selections to start fresh
    localStorage.removeItem('currentMood');
    localStorage.removeItem('currentContext');
    setSelectedMood(null);
    setSelectedContext(null);
    setShowReveal(false);
    setIsRevealed(false);
  }, []);

  // Auto-navigate to reveal when both mood and context are selected
  useEffect(() => {
    if (selectedMood && selectedContext) {
      // Track mood-context combination
      trackMoodContextCombination(selectedMood, selectedContext);
      
      // Small delay to show the selection state before revealing
      const timer = setTimeout(() => {
        setShowReveal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedMood, selectedContext]);

  // Handle clicks outside cards to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't deselect if reveal is showing
      if (showReveal) return;

      const target = event.target as HTMLElement;
      
      // Check if click is outside mood buttons
      if (
        moodButtonsRef.current &&
        !moodButtonsRef.current.contains(target) &&
        selectedMood
      ) {
        // Check if click is also outside context buttons
        if (
          contextButtonsRef.current &&
          !contextButtonsRef.current.contains(target)
        ) {
          setSelectedMood(null);
          localStorage.removeItem('currentMood');
        }
      }
      
      // Check if click is outside context buttons
      if (
        contextButtonsRef.current &&
        !contextButtonsRef.current.contains(target) &&
        selectedContext
      ) {
        // Check if click is also outside mood buttons
        if (
          moodButtonsRef.current &&
          !moodButtonsRef.current.contains(target)
        ) {
          setSelectedContext(null);
          localStorage.removeItem('currentContext');
        }
      }
    };

    // Only add listener if not showing reveal
    if (!showReveal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedMood, selectedContext, showReveal]);

  // Backend logic: Auto-select micro-habit based on Mood + Context
  const getMicroHabit = (excludeMessage?: ContentMessage | null): MicroHabitData | null => {
    if (!selectedMood || !selectedContext) return null;

    // Always use local content library for all mood-context combinations
    // Pass excludeMessage to prevent showing the same message twice
    const contentMessage = getRandomMessage(selectedMood as Mood, selectedContext as Context, excludeMessage);
    if (!contentMessage) return null;

    // Map content to micro-habit format with appropriate styling
    const getActionType = (mood: string, context: string): 'ACTION' | 'REPEAT' | 'VISUALIZE' | 'BREATHE' | 'LISTEN' => {
      if (mood === 'good' && context === 'still') return 'VISUALIZE';
      if (mood === 'good' && (context === 'move' || context === 'focused')) return 'ACTION';
      if (mood === 'okay' && context === 'still') return 'ACTION';
      if (mood === 'okay' && context === 'move') return 'REPEAT';
      if (mood === 'okay' && context === 'focused') return 'VISUALIZE';
      if (mood === 'bad') return 'REPEAT';
      if (mood === 'awful') return 'ACTION';
      return 'ACTION';
    };

    const getRevealType = (mood: string, context: string): string => {
      // Card experience only for moving contexts; still context uses mood-specific tokens
      if (context === 'move' || context === 'focused') {
        return 'playing-card';
      }
      // Still & Safe Place
      if (mood === 'good') return 'treasure-chest';
      if (mood === 'okay') return 'balloon-pop';
      if (mood === 'bad') return 'envelope';
      if (mood === 'awful') return 'bandage';
      return 'treasure-chest';
    };

  const getRevealToken = (mood: string, context: string): string => {
    // Card glyph for move/focused; emoji tokens for still context per mood
    if (context === 'move' || context === 'focused') {
      return '🎴';
    }
    if (mood === 'good') return '💎'; // treasure chest theme
    if (mood === 'okay') return '🎈'; // balloon/confetti theme
    if (mood === 'bad') return '📩'; // envelope/message theme
    if (mood === 'awful') return '🩹'; // bandage/prescription theme
    return '🎴';
  };

    const getAccentColor = (actionType: string): string => {
      if (actionType === 'VISUALIZE') return '#8B5CF6'; // Purple
      if (actionType === 'REPEAT') return '#10B981'; // Green
      if (actionType === 'BREATHE') return '#F59E0B'; // Amber/Orange
      if (actionType === 'LISTEN') return '#EC4899'; // Pink
      return '#3B82F6'; // Blue for ACTION
    };

    const getAnimationSpeed = (mood: string, context: string): 'rich' | 'quick' | 'gentle' | 'instant' => {
      if (mood === 'good' && context === 'still') return 'rich';
      if (mood === 'good' && context === 'move') return 'quick';
      if (mood === 'good' && context === 'focused') return 'instant';
      if (mood === 'okay' && context === 'still') return 'rich';
      if (mood === 'okay' && context === 'move') return 'quick';
      if (mood === 'okay' && context === 'focused') return 'gentle';
      if (mood === 'bad' && context === 'still') return 'rich';
      if (mood === 'bad' && context === 'move') return 'quick';
      if (mood === 'bad' && context === 'focused') return 'instant';
      if (mood === 'awful' && context === 'still') return 'gentle';
      if (mood === 'awful' && (context === 'move' || context === 'focused')) return 'instant';
      return 'rich';
    };

    const actionType = getActionType(selectedMood, selectedContext);
    const revealType = getRevealType(selectedMood, selectedContext);
    const revealToken = getRevealToken(selectedMood, selectedContext);
    const accentColor = getAccentColor(actionType);
    const animationSpeed = getAnimationSpeed(selectedMood, selectedContext);

    // Use the explicit audioIndex from the message object (required field)
    const audioIndex = contentMessage.audioIndex;

    return {
      action: contentMessage.message,
      actionType: contentMessage.actionType as 'ACTION' | 'REPEAT' | 'VISUALIZE' | 'BREATHE' | 'LISTEN',
      message: contentMessage.message,
      revealToken,
      revealType,
      accentColor,
    animationSpeed: animationSpeed as 'rich' | 'quick' | 'gentle' | 'instant',
    audioIndex
    };
  };

  // Track when to force a new random selection (for "Try Another" button)
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Track the previous message to avoid showing the same message twice
  // Key includes mood+context to reset when switching combinations
  const previousMessageRef = useRef<ContentMessage | null>(null);
  const previousMoodContextRef = useRef<string>('');
  
  // Reset previous message when mood/context changes
  useEffect(() => {
    const currentKey = `${selectedMood || ''}-${selectedContext || ''}`;
    if (currentKey !== previousMoodContextRef.current) {
      previousMessageRef.current = null;
      previousMoodContextRef.current = currentKey;
    }
  }, [selectedMood, selectedContext]);
  
  // Memoize selectedMicroHabit to prevent random message selection on every render
  // This ensures display text and audio always match
  // forceRefresh is included to allow forcing a new selection when "Try Another" is clicked
  const selectedMicroHabit = useMemo(() => {
    // Get the previous message before calling getMicroHabit
    const previousMessage = previousMessageRef.current;
    
    // Log for debugging
    if (previousMessage) {
      console.log('[page] Getting new message, excluding previous:', {
        previousMessage: previousMessage.message,
        previousAudioIndex: previousMessage.audioIndex
      });
    }
    
    const microHabit = getMicroHabit(previousMessage);
    
    // Update the previous message ref after getting a new one
    if (microHabit) {
      // Reconstruct the ContentMessage from the microHabit data
      const currentMessage: ContentMessage = {
        actionType: microHabit.actionType,
        message: microHabit.message,
        displayTime: 0, // Not used for comparison
        audioIndex: microHabit.audioIndex
      };
      
      // Verify it's different from the previous message
      if (previousMessage && 
          currentMessage.message === previousMessage.message && 
          currentMessage.audioIndex === previousMessage.audioIndex) {
        console.warn('[page] WARNING: Same message was selected again!', {
          message: currentMessage.message,
          audioIndex: currentMessage.audioIndex
        });
      } else {
        console.log('[page] New message selected:', {
          message: currentMessage.message,
          audioIndex: currentMessage.audioIndex
        });
      }
      
      previousMessageRef.current = currentMessage;
    }
    
    return microHabit;
  }, [selectedMood, selectedContext, forceRefresh]);

  const taskAudioPayload = useMemo(() => {
    if (!selectedMicroHabit) return null;
    const fullMessage = `${selectedMicroHabit.actionType}: ${selectedMicroHabit.action}`;
    return {
      message: fullMessage,
      options: {
        rate: 0.9,
        pitch: 1,
        volume: 0.8,
        voiceHintNames: ['Samantha', 'Google UK English Female', 'Microsoft Zira'],
        mood: selectedMood ?? undefined,
        context: selectedContext ?? undefined,
        isHomepage: false,
        audioIndex: selectedMicroHabit.audioIndex,
        preferExactIndex: true,
      },
    };
  }, [selectedMicroHabit, selectedMood, selectedContext]);

  useEffect(() => {
    hasInstantRevealRef.current = false;
    hasTrackedRevealRef.current = false;
  }, [selectedMicroHabit]);

  const recordRevealAnalytics = useCallback(() => {
    if (hasTrackedRevealRef.current) return;
    if (selectedMicroHabit && selectedMood && selectedContext) {
      trackMicroHabitRevealed(
        selectedMood,
        selectedContext,
        selectedMicroHabit.revealType,
        selectedMicroHabit.actionType
      );
      hasTrackedRevealRef.current = true;
    }
  }, [selectedMicroHabit, selectedMood, selectedContext]);

  const revealImmediately = useCallback(() => {
    if (!selectedMicroHabit || hasInstantRevealRef.current) return;

    hasInstantRevealRef.current = true;
    setShowReveal(true);
    setIsRevealed(true);
    recordRevealAnalytics();

    const tokenElement = document.querySelector('.reveal-token');
    if (tokenElement) {
      tokenElement.classList.remove('opening', 'popping', 'pressing', 'unwrapping', 'sliding', 'glowing');
    }
  }, [recordRevealAnalytics, selectedMicroHabit]);

  useEffect(() => {
    const wasScreenless = prevScreenlessModeRef.current;
    prevScreenlessModeRef.current = screenlessMode;

    if (wasScreenless && !screenlessMode && selectedContext === 'still') {
      revealImmediately();
    }
  }, [screenlessMode, selectedContext, revealImmediately]);

  const handleReveal = useCallback(() => {
    if (!selectedMicroHabit) return;

    const tokenElement = document.querySelector('.reveal-token');

    if (selectedMicroHabit.revealType === 'treasure-chest') {
      tokenElement?.classList.add('opening');
    } else if (selectedMicroHabit.revealType === 'balloon-pop') {
      tokenElement?.classList.add('popping');
    } else if (selectedMicroHabit.revealType === 'envelope') {
      tokenElement?.classList.add('opening');
    } else if (selectedMicroHabit.revealType === 'bandage') {
      tokenElement?.classList.add('unwrapping');
    } else if (selectedMicroHabit.revealType === 'ribbon-slide') {
      tokenElement?.classList.add('sliding');
    } else if (selectedMicroHabit.revealType === 'glow-patch') {
      tokenElement?.classList.add('glowing');
    } else if (selectedMicroHabit.revealType === 'auto-flip') {
      setIsRevealed(true);
      recordRevealAnalytics();

      if (audioEnabled && !screenlessMode && taskAudioPayload) {
        // Ensure no previous audio (homepage or task) leaks through
        stopHomepageAudio();
        stopTaskAudio();
        playTaskAudio({
          message: taskAudioPayload.message,
          options: taskAudioPayload.options,
        }).catch((error) => {
          console.warn('[audio] Unable to play task audio:', error);
        });
      }
      return;
    } else if (selectedMicroHabit.revealType === 'stamp') {
      tokenElement?.classList.add('pressing');
    }

    const animationDuration = selectedMicroHabit.animationSpeed === 'instant' ? 100 :
      selectedMicroHabit.animationSpeed === 'quick' ? 300 :
      selectedMicroHabit.animationSpeed === 'gentle' ? 800 : 600;

    setTimeout(() => {
      setIsRevealed(true);
      recordRevealAnalytics();

      // Skip audio playback for 'playing-card' and 'treasure-chest' - they handle their own audio
      if (audioEnabled && !screenlessMode && taskAudioPayload && 
          selectedMicroHabit.revealType !== 'treasure-chest' && 
          selectedMicroHabit.revealType !== 'playing-card') {
        // Ensure no previous audio (homepage or task) leaks through
        stopHomepageAudio();
        stopTaskAudio();
        playTaskAudio({
          message: taskAudioPayload.message,
          options: taskAudioPayload.options,
        }).catch((error) => {
          console.warn('[audio] Unable to play task audio:', error);
        });
      }
    }, animationDuration);
  }, [
    selectedMicroHabit,
    audioEnabled,
    screenlessMode,
    taskAudioPayload,
    recordRevealAnalytics,
    playTaskAudio,
  ]);

  const handleStartOver = useCallback(() => {
    trackUserAction('start_over', selectedMood || undefined, selectedContext || undefined);

    stopTaskAudio();
    stopHomepageAudio();
    lastAutoAudioKeyRef.current = null;
    hasInstantRevealRef.current = false;
    hasTrackedRevealRef.current = false;

    localStorage.removeItem('currentMood');
    localStorage.removeItem('currentContext');
    setSelectedMood(null);
    setSelectedContext(null);
    setShowReveal(false);
    setIsRevealed(false);

    const tokenElement = document.querySelector('.reveal-token');
    tokenElement?.classList.remove('opening', 'popping', 'pressing', 'unwrapping', 'sliding', 'glowing');
  }, [selectedMood, selectedContext, stopTaskAudio, stopHomepageAudio]);

  const handleTryAnother = useCallback(() => {
    trackUserAction('try_another', selectedMood || undefined, selectedContext || undefined);

    // Stay on the same screen; keep the reveal container mounted
    // Stop any playing task audio
    stopTaskAudio();

    // IMPORTANT: Ensure previousMessageRef is set to the current message BEFORE triggering refresh
    // This ensures the current message will be excluded from the next selection
    if (selectedMicroHabit) {
      const currentMessage: ContentMessage = {
        actionType: selectedMicroHabit.actionType,
        message: selectedMicroHabit.message,
        displayTime: 0,
        audioIndex: selectedMicroHabit.audioIndex
      };
      previousMessageRef.current = currentMessage;
      console.log('[page] Try Another clicked - setting previous message to exclude:', {
        message: currentMessage.message,
        audioIndex: currentMessage.audioIndex
      });
    }

    // Force a new random message selection by incrementing forceRefresh
    // This will cause selectedMicroHabit to recalculate with a new random message
    setForceRefresh(prev => prev + 1);

    // Reset the flip and immediately re-reveal to trigger a new random selection
    setIsRevealed(false);
    hasInstantRevealRef.current = false;
    hasTrackedRevealRef.current = false;

    const tokenElement = document.querySelector('.reveal-token');
    tokenElement?.classList.remove('opening', 'popping', 'pressing', 'unwrapping', 'sliding', 'glowing');

    setTimeout(() => {
      setIsRevealed(true);
    }, 40);
  }, [selectedMood, selectedContext, stopTaskAudio, selectedMicroHabit]);

  useEffect(() => {
    if (!showReveal || !taskAudioPayload || !selectedMicroHabit) {
      return;
    }

    stopHomepageAudio();

    if (!screenlessMode) {
      lastAutoAudioKeyRef.current = null;
      return;
    }

    if (selectedMicroHabit.revealType === 'treasure-chest') {
      // Let the TreasureChest component trigger its own audio based on the randomly selected index
      return;
    }

    const autoKey = `${taskAudioPayload.message}|${selectedMicroHabit.audioIndex}|${selectedMood ?? ''}|${selectedContext ?? ''}`;
    if (lastAutoAudioKeyRef.current === autoKey) {
      return;
    }

    playTaskAudio({
      message: taskAudioPayload.message,
      options: taskAudioPayload.options,
    }).catch((error) => {
      console.warn('[audio] Screenless autoplay blocked:', error);
    });

    lastAutoAudioKeyRef.current = autoKey;
  }, [
    screenlessMode,
    showReveal,
    taskAudioPayload,
    selectedMicroHabit,
    selectedMood,
    selectedContext,
    playTaskAudio,
    stopHomepageAudio,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Background />
      {screenlessMode && showReveal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '20px',
            gap: '12px',
            cursor: 'pointer',
            zIndex: 9999,
          }}
          onClick={() => setScreenlessMode(false)}
          aria-label="Exit screenless mode"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setScreenlessMode(false);
            }
          }}
        >
          <span style={{ fontSize: '48px', opacity: 0.8 }} aria-hidden="true">
            👁️
          </span>
          <p style={{ opacity: 0.9, fontSize: '20px', fontWeight: 500, letterSpacing: '0.01em' }}>
            Tap to return to normal mode
          </p>
        </div>
      )}
      {showReveal && (
        <div style={{ position: 'relative' }}>
          {/* No navbar button on home; contextual back below activities */}
        </div>
      )}
      
      <Header
        isDarkMode={isDarkMode}
        audioEnabled={audioEnabled}
        screenlessMode={screenlessMode}
        onToggleTheme={toggleTheme}
        onToggleReadAloud={toggleReadAloud}
        onToggleScreenless={toggleScreenless}
      />

      <main className="flex-1 flex flex-col">
        <section className="screen active">
          <div className="container">
            {!showReveal ? (
              <>
                {/* Instructions */}
                <div className="instructions-section">
                  <p className="instruction-text">
                    Let&apos;s tune in to how you&apos;re feeling.
                  </p>
                  <p className="instruction-subtext">
                    Select your mood and current situation — we&apos;ll craft a short, personalized moment to help you feel centered and ready.
                  </p>
                </div>

                {/* Main Questions Section */}
                <div className="main-questions-container">
                  {/* Mood Question */}
                  <div className="question-section mood-section" ref={moodSectionRef}>
                    <div className="question-header">
                      <h2 className="font-inter font-semibold">How are you feeling today?</h2>
                    </div>
                    <div className="mood-buttons" ref={moodButtonsRef}>
                      <button 
                        className={`mood-btn glass-card ${selectedMood === 'good' ? 'selected' : 'good'}`}
                        onClick={() => handleMoodSelection('good')}
                        data-mood="good"
                      >
                        <div className="mood-content">
                          <span className="mood-emoji">😊</span>
                          <span className="mood-text font-inter">Good</span>
                        </div>

                      </button>
                      <button 
                        className={`mood-btn glass-card ${selectedMood === 'okay' ? 'selected' : 'okay'}`}
                        onClick={() => handleMoodSelection('okay')}
                        data-mood="okay"
                      >
                        <div className="mood-content">
                          <span className="mood-emoji">😐</span>
                          <span className="mood-text font-inter">Okay</span>
                        </div>

                      </button>
                      <button 
                        className={`mood-btn glass-card ${selectedMood === 'bad' ? 'selected' : 'bad'}`}
                        onClick={() => handleMoodSelection('bad')}
                        data-mood="bad"
                      >
                        <div className="mood-content">
                          <span className="mood-emoji">😔</span>
                          <span className="mood-text font-inter">Bad</span>
                        </div>

                      </button>
                      <button 
                        className={`mood-btn glass-card ${selectedMood === 'awful' ? 'selected' : 'awful'}`}
                        onClick={() => handleMoodSelection('awful')}
                        data-mood="awful"
                      >
                        <div className="mood-content">
                          <span className="mood-emoji">😢</span>
                          <span className="mood-text font-inter">Awful</span>
                        </div>

                      </button>
                    </div>
                  </div>

                  {/* Context Question */}
                  <div className="question-section context-section" ref={contextSectionRef}>
                    <div className="question-header">
                      <h2 className="font-inter font-semibold">Where are you right now?</h2>
                    </div>
                    <div className="context-buttons" ref={contextButtonsRef}>
                      <button 
                        className={`context-btn glass-card ${selectedContext === 'still' ? 'selected' : 'still'}`}
                        onClick={() => handleContextSelection('still')}
                        data-context="still"
                      >
                        <div className="context-content">
                          <span className="context-icon">🪑</span>
                          <span className="context-text font-inter font-medium">Still & Safe Place</span>
                        </div>

                      </button>
                      <button 
                        className={`context-btn glass-card ${selectedContext === 'move' ? 'selected' : 'move'}`}
                        onClick={() => handleContextSelection('move')}
                        data-context="move"
                      >
                        <div className="context-content">
                          <span className="context-icon">🚶</span>
                          <span className="context-text font-inter font-medium">On the Move, but Safe</span>
                        </div>

                      </button>
                      <button 
                        className={`context-btn glass-card ${selectedContext === 'focused' ? 'selected' : 'focused'}`}
                        onClick={() => handleContextSelection('focused')}
                        data-context="focused"
                      >
                        <div className="context-content">
                          <span className="context-icon">🎯</span>
                          <span className="context-text font-inter font-medium">On the Move and focused</span>
                        </div>

                      </button>
                    </div>
                  </div>
                </div>


              </>
            ) : (
              <>
                {/* Reveal Experience */}
                <div className="reveal-container">
                  {selectedMicroHabit?.revealType !== 'balloon-pop' && 
                   !(selectedMicroHabit?.revealType === 'playing-card' && (selectedContext === 'move' || selectedContext === 'focused')) && (
                    <div className="reveal-header">
                      <h2 className="font-inter font-semibold text-slate-900 dark:text-slate-100">
                        Your Personalized Experience
                      </h2>
                      <p className="reveal-subtitle font-inter text-slate-600 dark:text-slate-300">
                        Based on your mood: <span className="font-medium capitalize">{selectedMood}</span> • 
                        Location: <span className="font-medium">
                          {selectedContext === 'still' ? 'Still & Safe Place' : 
                           selectedContext === 'move' ? 'On the Move, but Safe' : 
                           'On the Move and focused'}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {/* Render the computed reveal type based on mood/context mapping */}
                  <RevealElement
                    revealType={selectedMicroHabit?.revealType || 'playing-card'}
                    isRevealed={isRevealed}
                    onReveal={handleReveal}
                    accentColor={selectedMicroHabit?.accentColor || '#3B82F6'}
                    animationSpeed={selectedMicroHabit?.animationSpeed || 'rich'}
                    message={selectedMicroHabit?.message}
                    action={selectedMicroHabit?.action}
                    actionType={selectedMicroHabit?.actionType}
                    mood={selectedMood}
                    context={selectedContext}
                    onStartOver={handleStartOver}
                    onTryAnother={handleTryAnother}
                    audioIndex={selectedMicroHabit?.audioIndex}
                    onPlayNarration={(msg, tag, overrideMood, overrideContext, audioIndexOverride, preferExact) => {
                      // Route narration to task audio with exact index if provided
                      playTaskAudio({
                        message: `${tag ? tag + ': ' : ''}${msg}`,
                        options: {
                          rate: 0.9,
                          pitch: 1,
                          volume: 0.8,
                          voiceHintNames: ['Samantha', 'Google UK English Female', 'Microsoft Zira'],
                          mood: (overrideMood ?? selectedMood) ?? undefined,
                          context: (overrideContext ?? selectedContext) ?? undefined,
                          isHomepage: false,
                          audioIndex: audioIndexOverride ?? undefined,
                          preferExactIndex: preferExact ?? false,
                        }
                      }).catch((error) => {
                        console.warn('[audio] Narration play failed:', error);
                      });
                    }}
                  />
                  {showReveal && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                      <TextBackButton />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
