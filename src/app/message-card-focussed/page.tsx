'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import StillLiftMobileCard from '@/components/StillLiftMobileCard';
import TextBackButton from '@/components/TextBackButton';

interface MessageData {
  title: string;
  message: string;
  actionType?: string;
}

export default function MessageCardfocusedPage() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
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
      "Channel your focus into purposeful action",
      "Let your clarity guide your next steps",
      "Use this momentum to tackle important tasks"
    ],
    okay: [
      "Break your focus into smaller, manageable chunks",
      "Use your current attention to build positive habits",
      "Let focus be your tool for moving forward"
    ],
    bad: [
      "Use focus as an anchor when emotions feel overwhelming",
      "Concentrate on one small thing you can control right now",
      "Let focused breathing be your foundation"
    ],
    awful: [
      "Focus on just this moment, nothing else matters right now",
      "If focusing feels hard, that's okay - be gentle with yourself",
      "Sometimes the most focused thing is just breathing"
    ]
  }), []);

  useEffect(() => {
    // Load user preferences and selected message
    const savedMessage = localStorage.getItem('selectedMessage');
    const savedMood = localStorage.getItem('currentMood');
    const savedContext = localStorage.getItem('currentContext');

    console.log('Loading message card focused page:', { savedMessage, savedMood, savedContext });

    if (savedMessage) {
      try {
        const parsedMessage = JSON.parse(savedMessage);
        console.log('Parsed message:', parsedMessage);
        setSelectedMessage(parsedMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
        router.push('/');
        return;
      }
    } else {
      console.log('No message found, redirecting to home');
      router.push('/');
      return;
    }

    if (savedMood) {
      setCurrentMood(savedMood);
      // Set micro tips based on mood
      const tips = microTipsData[savedMood as keyof typeof microTipsData];
      if (tips) {
        const shuffledTips = [...tips].sort(() => Math.random() - 0.5).slice(0, Math.min(3, tips.length));
        setMicroTips(shuffledTips);
      }
    }
  }, [router, microTipsData]);

  // Show action buttons after card flip completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowActions(true);
    }, 2500); // 1500ms flip delay + 1000ms extra

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

  const playCurrentMessage = () => {
    if (selectedMessage && audioEnabled) {
      playMessageAudio(
        selectedMessage.title,
        selectedMessage.message,
        { rate: 1.0, pitch: 1, volume: 0.8, voiceHintNames: ['Alex','Google UK English Male','Microsoft David'] }
      );
    }
  };

  if (!selectedMessage) {
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
            <StillLiftMobileCard
              message={selectedMessage.message}
              actionType={selectedMessage.actionType as 'ACTION' | 'VISUALIZE' | 'REPEAT' || 'ACTION'}
            />

            {/* Action Buttons and Micro Tips */}
            {showActions && (
              <div className="message-actions-overlay focused-style">
                <div className="micro-tips-section focused">
                  <h4 className="micro-tips-title">Stay focused and centered:</h4>
                  <div className="micro-tips">
                    {microTips.map((tip, index) => (
                      <div key={index} className="micro-tip focused">
                        <span className="tip-indicator">▶</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="audio-section">
                  <button 
                    className="audio-play-btn glass-btn focused" 
                    onClick={playCurrentMessage}
                    aria-label="Play audio"
                  >
                    <span className="speaker-icon">🎯</span>
                    <span>Listen & Focus</span>
                  </button>
                </div>

                <div className="message-actions">
                  <button 
                    className="action-btn primary glass-btn neubrutalism-btn focused"
                    onClick={handleGiveMeAnother}
                  >
                    Next Focus
                  </button>
                  <button 
                    className="action-btn secondary glass-btn neubrutalism-btn focused"
                    onClick={handleStartOver}
                  >
                    Reset
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
          animation: slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .message-actions-overlay.focused-style {
          animation: focusedSlideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .micro-tips-section {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(25px);
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.15);
        }

        .micro-tips-section.focused {
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.2);
        }

        .micro-tips-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem 0;
          text-align: center;
          letter-spacing: 0.3px;
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
          border: 1px solid rgba(139, 92, 246, 0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .micro-tip.focused {
          border-color: rgba(139, 92, 246, 0.2);
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
        }

        .tip-indicator {
          color: #8B5CF6;
          font-size: 0.8rem;
          font-weight: bold;
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
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 15px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(15px);
        }

        .audio-play-btn.focused {
          border-color: rgba(139, 92, 246, 0.4);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 245, 255, 0.95) 100%);
        }

        .audio-play-btn:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(250, 245, 255, 1) 100%);
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
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

        .action-btn.primary.focused {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .action-btn.primary.focused:hover {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
        }

        .action-btn.secondary.focused {
          background: rgba(255, 255, 255, 0.95);
          color: #475569;
          border: 2px solid rgba(139, 92, 246, 0.2);
        }

        .action-btn.secondary.focused:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
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

        @keyframes focusedSlideUp {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .micro-tips-section {
            background: rgba(30, 41, 59, 0.96);
            border-color: rgba(139, 92, 246, 0.3);
          }

          .micro-tips-title {
            color: #f1f5f9;
          }

          .micro-tip.focused {
            background: linear-gradient(135deg, #2d1b69 0%, #3730a3 100%);
            color: #e0e7ff;
            border-color: rgba(139, 92, 246, 0.3);
          }

          .audio-play-btn.focused {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(45, 27, 105, 0.95) 100%);
            color: #f1f5f9;
            border-color: rgba(139, 92, 246, 0.4);
          }

          .audio-play-btn:hover {
            background: linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(45, 27, 105, 1) 100%);
          }

          .action-btn.secondary.focused {
            background: rgba(30, 41, 59, 0.95);
            color: #f1f5f9;
            border-color: rgba(139, 92, 246, 0.3);
          }

          .action-btn.secondary.focused:hover {
            background: rgba(30, 41, 59, 1);
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
