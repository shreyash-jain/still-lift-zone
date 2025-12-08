'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import { getRandomMessage, CONTENT_LIBRARY, Mood } from '@/lib/still-lift-content';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import TextBackButton from '@/components/TextBackButton';

interface MessageData {
  title: string;
  message: string;
  actionType?: string;
}

// Augment window to avoid using 'any' for a global callback
declare global {
  interface Window {
    playCurrentActionAudio?: () => void;
  }
}

interface ActionItem {
  message: string;
  actionType?: string;
  audioIndex: number;
}

export default function MessageCardMovingPage() {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [showCard, setShowCard] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [microTips, setMicroTips] = useState<string[]>([]);
  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
  } = useUserPreferences();

  const microTipsData = useMemo(() => ({
    good: [
      "Keep moving and let your body flow with the rhythm",
      "Notice how your movement creates positive energy",
      "Share a smile with someone you pass along the way"
    ],
    okay: [
      "Use your movement to boost your energy naturally",
      "Focus on one step at a time, one breath at a time",
      "Let the rhythm of movement help center your thoughts"
    ],
    bad: [
      "Use gentle movement to help process difficult feelings",
      "Remember that movement can be medicine for your mind",
      "Ground yourself by feeling your feet connect with the earth"
    ],
    awful: [
      "Move slowly and be gentle with yourself",
      "If you need to stop and rest, that's completely okay",
      "Focus on just the next step, nothing more"
    ]
  }), []);

  // Function to select a random action
  const selectRandomAction = (mood: string) => {
    const actions = CONTENT_LIBRARY[mood as Mood]?.move;
    if (!actions || actions.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * actions.length);
    const action = actions[randomIndex];

    setSelectedAction(action);
    setActionIndex(randomIndex);

    // Auto-play audio if enabled
    if (audioEnabled) {
      setTimeout(() => {
        playMessageAudio(
          action.actionType || 'ACTION',
          action.message,
          {
            rate: 0.9,
            pitch: 1,
            volume: 0.8,
            voiceHintNames: ['Samantha','Google UK English Female','Microsoft Zira'],
            mood: mood,
            context: 'move',
            audioIndex: action.audioIndex, // Use explicit audioIndex from message
            preferExactIndex: true
          }
        ).catch(() => {
          // Handle autoplay restrictions (user must click audio icon)
          console.log("Autoplay blocked. Wait for user interaction.");
        });
      }, 500); // Small delay to ensure UI is ready
    }

    return action;
  };

  useEffect(() => {
    // Load user preferences and mood
    const savedMood = localStorage.getItem('currentMood');
    const savedContext = localStorage.getItem('currentContext');

    console.log('Loading message card moving page:', { savedMood, savedContext });

    if (savedContext !== 'move') {
      console.log('Wrong context, redirecting to home');
      router.push('/');
      return;
    }

    if (savedMood && ['good', 'okay', 'bad', 'awful'].includes(savedMood)) {
      setCurrentMood(savedMood);
      // Set micro tips based on mood
      const tips = microTipsData[savedMood as keyof typeof microTipsData];
      if (tips) {
        const shuffledTips = [...tips].sort(() => Math.random() - 0.5).slice(0, Math.min(3, tips.length));
        setMicroTips(shuffledTips);
      }

      // Select random action
      const action = selectRandomAction(savedMood);
      if (!action) {
        console.error('No actions available for mood:', savedMood);
        router.push('/');
        return;
      }
    } else {
      console.log('Invalid mood, redirecting to home');
      router.push('/');
      return;
    }
  }, [router, microTipsData]);

  // Show action buttons after card flip completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowActions(true);
    }, 3000); // 2000ms flip delay + 1000ms extra

    return () => clearTimeout(timer);
  }, []);

  const handleGiveMeAnother = () => {
    router.push('/cards');
  };

  const handleStartOver = () => {
    // Clear all stored data
    localStorage.removeItem('currentMood');
    localStorage.removeItem('currentContext');
    localStorage.removeItem('selectedMessage');
    router.push('/');
  };

  const handleShuffle = () => {
    if (currentMood) {
      selectRandomAction(currentMood);
      // Audio will auto-play in selectRandomAction if enabled
    }
  };

  const playCurrentMessage = () => {
    if (selectedAction && audioEnabled && currentMood) {
      playMessageAudio(
        selectedAction.actionType || 'ACTION',
        selectedAction.message,
        {
          rate: 0.9,
          pitch: 1,
          volume: 0.8,
          voiceHintNames: ['Samantha','Google UK English Female','Microsoft Zira'],
          mood: currentMood,
          context: 'move',
          audioIndex: selectedAction.audioIndex, // Use explicit audioIndex from message
          preferExactIndex: true
        }
      );
    }
  };

  // Expose playCurrentMessage so Navbar can call it
  useEffect(() => {
    window.playCurrentActionAudio = playCurrentMessage;
    return () => {
      delete window.playCurrentActionAudio;
    };
  }, [selectedAction, audioEnabled, currentMood]);

  if (!selectedAction) {
    return <div>Loading...</div>;
  }

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
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
              <div className="flashcard bg-white dark:bg-neutral-800 shadow-lg rounded-2xl p-8 w-[320px] text-center text-lg font-medium leading-relaxed transition-all duration-300 hover:scale-105">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  {selectedAction.actionType || 'ACTION'}
                </h3>
                <p className="text-gray-800 dark:text-gray-100">
                  {selectedAction.message}
                </p>
              </div>
            </div>

            {/* Action Buttons and Micro Tips */}
            {showActions && (
              <div className="message-actions-overlay">
                <div className="micro-tips-section">
                  <h4 className="micro-tips-title">While you&apos;re on the move:</h4>
                  <div className="micro-tips">
                    {microTips.map((tip, index) => (
                      <div key={index} className="micro-tip">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="audio-section">
                  <button 
                    className="audio-play-btn glass-btn" 
                    onClick={playCurrentMessage}
                    aria-label="Play audio"
                  >
                    <span className="speaker-icon">🔊</span>
                    <span>Play Message</span>
                  </button>
                </div>

                <div className="message-actions">
                  <button
                    className="action-btn tertiary glass-btn neubrutalism-btn"
                    onClick={handleShuffle}
                  >
                    🔀 Shuffle
                  </button>
                  <button
                    className="action-btn primary glass-btn neubrutalism-btn"
                    onClick={handleGiveMeAnother}
                  >
                    Give Me Another
                  </button>
                  <button
                    className="action-btn secondary glass-btn neubrutalism-btn"
                    onClick={handleStartOver}
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
              <TextBackButton />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .message-actions-overlay {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 500px;
          padding: 0 1rem;
          z-index: 100;
          animation: slideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .micro-tips-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(0, 72, 81, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .micro-tips-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .micro-tips {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .micro-tip {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.4;
          border: 1px solid rgba(0, 72, 81, 0.1);
        }

        .audio-section {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .audio-play-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid rgba(0, 72, 81, 0.2);
          border-radius: 15px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .audio-play-btn:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(0, 72, 81, 0.3);
          transform: translateY(-2px);
        }

        .speaker-icon {
          font-size: 1.2rem;
        }

        .message-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .action-btn {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          letter-spacing: 0.3px;
          backdrop-filter: blur(20px);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #004851 0%, #006B7A 100%);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .action-btn.primary:hover {
          background: linear-gradient(135deg, #003A40 0%, #004851 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 72, 81, 0.3);
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.9);
          color: #475569;
          border: 2px solid rgba(0, 72, 81, 0.1);
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .micro-tips-section {
            background: rgba(30, 41, 59, 0.95);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .micro-tips-title {
            color: #f1f5f9;
          }

          .micro-tip {
            background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
            color: #cbd5e1;
            border-color: rgba(255, 255, 255, 0.1);
          }

          .audio-play-btn {
            background: rgba(30, 41, 59, 0.9);
            color: #f1f5f9;
            border-color: rgba(255, 255, 255, 0.2);
          }

          .audio-play-btn:hover {
            background: rgba(30, 41, 59, 1);
          }

          .action-btn.secondary {
            background: rgba(30, 41, 59, 0.9);
            color: #f1f5f9;
            border-color: rgba(255, 255, 255, 0.1);
          }

        .action-btn.secondary:hover {
          background: rgba(30, 41, 59, 1);
        }

        .action-btn.tertiary {
          background: rgba(148, 163, 184, 0.9);
          color: #334155;
          border: 2px solid rgba(148, 163, 184, 0.3);
        }

        .action-btn.tertiary:hover {
          background: rgba(148, 163, 184, 1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(148, 163, 184, 0.3);
        }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .message-actions-overlay {
            bottom: 1rem;
            padding: 0 1rem;
          }

          .micro-tips-section {
            padding: 1.25rem;
          }

          .message-actions {
            flex-direction: column;
            gap: 0.75rem;
          }

          .action-btn {
            padding: 0.875rem 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
