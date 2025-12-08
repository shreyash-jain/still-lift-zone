'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';

interface MessageData {
  title: string;
  message: string;
}

export default function FortuneCookiePage() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [currentContext, setCurrentContext] = useState<string>('');
  const [isCracked, setIsCracked] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  
  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
  } = useUserPreferences();

  useEffect(() => {
    // Load saved data from localStorage
    const savedMessage = localStorage.getItem('selectedMessage');
    const savedMood = localStorage.getItem('currentMood');
    const savedContext = localStorage.getItem('currentContext');

    if (savedMessage) {
      try {
        setSelectedMessage(JSON.parse(savedMessage));
      } catch (error) {
        console.error('Error parsing saved message:', error);
      }
    }

    if (savedMood) setCurrentMood(savedMood);
    if (savedContext) setCurrentContext(savedContext);
  }, []);

  const handleCookieCrack = () => {
    setIsCracked(true);
    setTimeout(() => {
      setShowMessage(true);
    }, 1200); // Wait for crack animation
  };

  const handleGiveMeAnother = () => {
    router.push('/cards');
  };

  const handleStartOver = () => {
    localStorage.removeItem('selectedMessage');
    localStorage.removeItem('currentMood');
    localStorage.removeItem('currentContext');
    router.push('/');
  };

  const playCurrentMessage = () => {
    if (selectedMessage && audioEnabled) {
      playMessageAudio(selectedMessage.title, selectedMessage.message, {
        rate: 0.9,
        pitch: 1,
        voiceHintNames: ['Samantha','Google UK English Female','Microsoft Zira']
      });
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
            <div className="fortune-cookie-section">
              {!isCracked && (
                <div className="cookie-instructions">
                  <h2>Your Fortune Awaits</h2>
                  <p>Click the cookie to crack it open and reveal your destiny</p>
                </div>
              )}
              
              <div className="cookie-container">
                <div 
                  className={`fortune-cookie ${isCracked ? 'cracked' : ''}`}
                  onClick={!isCracked ? handleCookieCrack : undefined}
                >
                  <div className="cookie-body">
                    <div className="cookie-texture"></div>
                    <div className="cookie-crack-line"></div>
                  </div>
                  <div className="fortune-paper">
                    <div className="paper-content">
                      {selectedMessage?.message || 'Your fortune will appear here...'}
                    </div>
                  </div>
                </div>
              </div>

              {showMessage && (
                <div className="message-actions">
                  <button 
                    onClick={playCurrentMessage}
                    className="action-btn play-btn"
                  >
                    🔊 Play Fortune
                  </button>
                  <button 
                    onClick={handleGiveMeAnother}
                    className="action-btn another-btn"
                  >
                    🍪 Another Cookie
                  </button>
                  <button 
                    onClick={handleStartOver}
                    className="action-btn start-over-btn"
                  >
                    🔄 Start Over
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

