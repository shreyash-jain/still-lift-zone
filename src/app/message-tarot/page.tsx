'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TextBackButton from '@/components/TextBackButton';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';

interface MessageData {
  title: string;
  message: string;
}

function MessageTarotPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
  } = useUserPreferences();

  useEffect(() => {
    // Load selected message
    const savedMessage = localStorage.getItem('selectedMessage');
    if (savedMessage && savedMessage !== 'undefined' && savedMessage !== '"undefined"') {
      try {
        const parsedMessage = JSON.parse(savedMessage);
        if (parsedMessage && parsedMessage.title && parsedMessage.message) {
          setSelectedMessage(parsedMessage);
          
          // Auto-reveal after a short delay
          setTimeout(() => {
            setIsRevealed(true);
            
            // Play pre-generated audio (fallback to TTS) if audio is enabled
            if (audioEnabled && parsedMessage) {
              playMessageAudio(parsedMessage.title, parsedMessage.message, {
                rate: 0.9,
                pitch: 1,
                volume: 0.8,
                voiceHintNames: ['Samantha','Google UK English Female','Microsoft Zira'],
                mood: searchParams.get('mood') || undefined,
                context: searchParams.get('context') || undefined
              });
            }
          }, 500);
        } else {
          console.error('Invalid message structure:', parsedMessage);
          router.push('/');
        }
      } catch (error) {
        console.error('Error parsing saved message:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router, audioEnabled, searchParams]);

  const handleGiveMeAnother = () => {
    router.push('/context');
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
            <div className="tarot-message-container">
              <div className={`tarot-message-card ${isRevealed ? 'revealed' : ''}`}>
                <div className="message-card-inner">
                  <div className="message-card-back">
                    <div className="card-pattern"></div>
                    <div className="card-mystique">
                      <div className="mystique-symbol">🎴</div>
                      <div className="mystique-text">Your guidance awaits</div>
                    </div>
                  </div>
                  <div className="message-card-front">
                    <div className="message-card-content">
                      <h3 className="message-card-title">{selectedMessage.title}</h3>
                      <p className="message-card-text">{selectedMessage.message}</p>
                      {isRevealed && (
                        <>
                          <div className="micro-tips">
                            <div className="micro-tip">Take a moment to reflect on this guidance</div>
                            <div className="micro-tip">Consider how you can apply this wisdom today</div>
                          </div>
                          <div className="message-card-actions">
                            <button 
                              className="action-btn primary text-black glass-btn"
                              onClick={handleGiveMeAnother}
                            >
                              Another Card
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

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
              <TextBackButton />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function MessageTarotPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessageTarotPageInner />
    </Suspense>
  );
} 