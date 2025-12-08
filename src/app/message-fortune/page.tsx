'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import TextBackButton from '@/components/TextBackButton';

interface MessageData {
  title: string;
  message: string;
}

export default function MessageFortunePage() {
  const router = useRouter();
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
            
            // Play uploaded audio (or TTS fallback) if audio is enabled
            if (audioEnabled && parsedMessage) {
              playMessageAudio(
                parsedMessage.title,
                parsedMessage.message,
                { rate: 0.9, pitch: 1, volume: 0.8 }
              );
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
  }, [router, audioEnabled]);

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
            <div className="fortune-message-container">
              <div className={`fortune-message-slip ${isRevealed ? 'revealed' : ''}`}>
                <div className="fortune-message-content">
                  <h3 className="fortune-message-title">{selectedMessage.title}</h3>
                  <p className="fortune-message-body">{selectedMessage.message}</p>
                  {isRevealed && (
                    <>
                      <div className="micro-tips">
                        <div className="micro-tip">Take a moment to reflect on this fortune</div>
                        <div className="micro-tip">Consider how you can apply this wisdom today</div>
                      </div>
                      <div className="fortune-message-actions">
                        <button 
                          className="action-btn primary glass-btn"
                          onClick={handleGiveMeAnother}
                        >
                          Another Fortune
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

            <Link href="/context" className="back-btn glass-btn">
              ← Back
            </Link>
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