'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import TextBackButton from '@/components/TextBackButton';

export default function ContextPage() {
  const router = useRouter();
  const [, setCurrentMood] = useState<string | null>(null);
  const [showExperienceOptions, setShowExperienceOptions] = useState(false);
  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
  } = useUserPreferences();

  useEffect(() => {
    // Load user preferences and current mood
    const savedMood = localStorage.getItem('currentMood');

    if (savedMood) {
      setCurrentMood(savedMood);
    } else {
      // If no mood selected, redirect to home
      router.push('/');
      return;
    }
  }, [router]);

  const handleContextSelection = (context: string) => {
    localStorage.setItem('currentContext', context);
    // Don't navigate yet - show experience options
    setShowExperienceOptions(true);
  };

  const handleExperienceSelection = (experience: string) => {
    localStorage.setItem('selectedExperience', experience);
    
    // Navigate to the appropriate page based on experience
    switch (experience) {
      case 'tarot':
        router.push('/cards');
        break;
      case 'scratch':
        router.push('/option2');
        break;
      case 'fortune':
        router.push('/option3');
        break;
      case 'glassmorphic':
        router.push('/option4');
        break;
      default:
        router.push('/cards');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Background />
      
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
            {!showExperienceOptions ? (
              <>
                <div className="context-question">
                  <h2 className="font-inter font-semibold text-slate-900 dark:text-slate-100">Where are you right now?</h2>
                </div>
                <div className="context-buttons">
                  <button 
                    className="context-btn glass-card still" 
                    onClick={() => handleContextSelection('still')}
                    data-context="still"
                  >
                    <div className="context-content">
                      <span className="context-icon">🪑</span>
                      <div className="context-text-group">
                        <span className="context-text font-inter font-medium text-slate-900 dark:text-slate-100">Safe Place</span>
                        <span className="context-subtitle font-inter text-sm text-slate-600 dark:text-slate-300">(seated, able to interact physically)</span>
                      </div>
                    </div>

                  </button>
                  <button 
                    className="context-btn glass-card move" 
                    onClick={() => handleContextSelection('move')}
                    data-context="move"
                  >
                    <div className="context-content">
                      <span className="context-icon">🚶</span>
                      <div className="context-text-group">
                        <span className="context-text font-inter font-medium text-slate-900 dark:text-slate-100">On the Move</span>
                        <span className="context-subtitle font-inter text-sm text-slate-600 dark:text-slate-300">(walking, commuting, etc.)</span>
                      </div>
                    </div>

                  </button>
                </div>
                <Link href="/" className="back-btn glass-btn">
                  ← Back
                </Link>
              </>
            ) : (
              <>
                <div className="context-question">
                  <h2 className="font-inter font-semibold text-slate-900 dark:text-slate-100">Choose your experience:</h2>
                </div>
                <div className="experience-buttons">
                  <button 
                    className="experience-btn glass-card" 
                    onClick={() => handleExperienceSelection('tarot')}
                  >
                    <div className="experience-content">
                      <span className="experience-icon">🎴</span>
                      <div className="experience-text-group">
                        <span className="experience-text font-inter font-medium text-slate-900 dark:text-slate-100">Tarot Cards</span>
                        <span className="experience-subtitle font-inter text-sm text-slate-600 dark:text-slate-300">Classic card selection</span>
                      </div>
                    </div>
                  </button>
                  <button 
                    className="experience-btn glass-card" 
                    onClick={() => handleExperienceSelection('scratch')}
                  >
                    <div className="experience-content">
                      <span className="experience-icon">🎨</span>
                      <div className="experience-text-group">
                        <span className="experience-text font-inter font-medium text-slate-900 dark:text-slate-100">Scratch Card</span>
                        <span className="experience-subtitle font-inter text-sm text-slate-600 dark:text-slate-300">Interactive scratching</span>
                      </div>
                    </div>
                  </button>
                  <button 
                    className="experience-btn glass-card" 
                    onClick={() => handleExperienceSelection('fortune')}
                  >
                    <div className="experience-content">
                      <span className="experience-icon">🥠</span>
                      <div className="experience-text-group">
                        <span className="experience-text font-inter font-medium text-slate-900 dark:text-slate-100">Fortune Cookie</span>
                        <span className="experience-subtitle font-inter text-sm text-slate-600 dark:text-slate-300">Tap to crack open</span>
                      </div>
                    </div>
                  </button>
                  <button 
                    className="experience-btn glass-card" 
                    onClick={() => handleExperienceSelection('glassmorphic')}
                  >
                    <div className="experience-content">
                      <span className="experience-icon">💎</span>
                      <div className="experience-text-group">
                        <span className="experience-text font-inter font-medium text-slate-900 dark:text-slate-100">Glassmorphic Card</span>
                        <span className="experience-subtitle font-inter text-sm text-slate-600 dark:text-slate-300">Professional flip experience</span>
                      </div>
                    </div>
                  </button>
                </div>
                <button 
                  className="back-btn glass-btn"
                  onClick={() => setShowExperienceOptions(false)}
                >
                  ← Back to Context
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
            <TextBackButton />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 