'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import { useRandomMessage } from '@/hooks/useStillLiftContent';
import { type Mood, type Context } from '@/lib/still-lift-content';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';

interface MessageData {
  title: string;
  message: string;
}

export default function Option4Page() {
  const router = useRouter();
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const microTipsData = useMemo(() => ({
    good: [
      "Practice gratitude by naming three things you appreciate right now",
      "Share your positive energy with someone who might need it",
      "Take a moment to savor this feeling and remember it for harder times"
    ],
    okay: [
      "Try a simple stretching routine to boost your energy",
      "Listen to a favorite song or podcast",
      "Do one small thing that usually brings you joy"
    ],
    bad: [
      "Take five deep breaths, counting to four on inhale and six on exhale",
      "Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
      "Reach out to someone you trust - you don't have to go through this alone"
    ],
    awful: [
      "If you're in crisis, call 988 immediately - you're not alone",
      "Try to find a quiet, safe space to sit and breathe",
      "Remember that this feeling is temporary, even if it doesn't feel that way"
    ]
  }), []);
  
  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
  } = useUserPreferences();

  // Use the centralized content system
  const randomMessage = useRandomMessage(currentMood as Mood | null, currentContext as Context | null);

  useEffect(() => {
    // Load user preferences and current mood/context
    const savedMood = localStorage.getItem('currentMood');
    const savedContext = localStorage.getItem('currentContext');

    if (savedMood && savedContext) {
      setCurrentMood(savedMood);
      setCurrentContext(savedContext);
    } else {
      // If no mood or context selected, redirect to home
      router.push('/');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (randomMessage) {
      setSelectedMessage({
        title: randomMessage.actionType,
        message: randomMessage.message
      });
    }
  }, [randomMessage]);

  const flipCard = () => {
    if (isFlipped) return;
    
    setIsFlipped(true);
    
    // After flip animation, reveal the message
    setTimeout(() => {
      setIsRevealed(true);
      
      // Play pre-generated audio (fallback to TTS) if audio is enabled
      if (audioEnabled && selectedMessage) {
        playMessageAudio(selectedMessage.title, selectedMessage.message, {
          rate: 0.9,
          pitch: 1,
          volume: 0.8,
          voiceHintNames: ['Samantha','Google UK English Female','Microsoft Zira']
        });
      }
    }, 800);
  };

  const handleGiveMeAnother = () => {
    // Reset card state
    setIsFlipped(false);
    setIsRevealed(false);
    
    // Get new random message
    const availableMessages = microTipsData[currentMood as keyof typeof microTipsData];
    if (availableMessages) {
      const randomMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
      setSelectedMessage({
        title: 'TIP',
        message: randomMessage
      });
    }
  };



  const handleStartOver = () => {
    localStorage.removeItem('currentMood');
    localStorage.removeItem('currentContext');
    localStorage.removeItem('selectedMessage');
    router.push('/');
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
            <div className="glassmorphic-intro">
              <h2 className="font-inter font-semibold">Reveal your guidance</h2>
              <p>Tap the card to unveil your personalized message</p>
            </div>
            <div className="glassmorphic-card-container">
              <div 
                className={`glassmorphic-card ${isFlipped ? 'flipped' : ''} ${isRevealed ? 'revealed' : ''}`}
                onClick={flipCard}
              >
                <div className="card-inner">
                  <div className="card-back">
                    <div className="card-pattern"></div>
                    <div className="card-mystique">
                      <div className="mystique-symbol">✨</div>
                      <div className="mystique-text">Tap to reveal</div>
                    </div>
                  </div>
                  <div className="card-front">
                    <div className="card-content">
                      <h3 className="card-title">{selectedMessage.title}</h3>
                      <p className="card-message">{selectedMessage.message}</p>
                      {isRevealed && (
                        <>
                          <div className="micro-tips">
                            <div className="micro-tip">Take a moment to reflect on this message</div>
                            <div className="micro-tip">Consider how you can apply this wisdom today</div>
                          </div>
                          <div className="card-actions">
                            <button 
                              className="action-btn primary glass-btn"
                              onClick={handleGiveMeAnother}
                            >
                              Another Message
                            </button>
                            <button 
                              className="action-btn secondary glass-btn"
                              onClick={handleStartOver}
                            >
                              Start Over
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/context" className="back-btn glass-btn">
              ← Back
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 