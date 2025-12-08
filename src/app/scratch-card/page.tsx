'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ScratchCardPage() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [currentContext, setCurrentContext] = useState<string>('');
  const [isScratched, setIsScratched] = useState(false);
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

  const handleScratch = () => {
    setIsScratched(true);
    setTimeout(() => {
      setShowMessage(true);
    }, 1000); // Wait for scratch animation
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
            <div className="scratch-card-section">
              {!isScratched && (
                <div className="scratch-instructions">
                  <h2>Scratch to Reveal</h2>
                  <p>Click the card to scratch away and see your message</p>
                </div>
              )}
              
              <div className="scratch-card-container">
                <div 
                  className={`scratch-card ${isScratched ? 'scratched' : ''}`}
                  onClick={!isScratched ? handleScratch : undefined}
                >
                  <div className="scratch-layer">
                    <div className="scratch-pattern">
                      <div className="scratch-line"></div>
                      <div className="scratch-line"></div>
                      <div className="scratch-line"></div>
                    </div>
                  </div>
                  <div className="message-layer">
                    <div className="message-content">
                      {selectedMessage?.message || 'Your message will appear here...'}
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
                    🔊 Play Message
                  </button>
                  <button 
                    onClick={handleGiveMeAnother}
                    className="action-btn another-btn"
                  >
                    🎫 Another Card
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
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
            <TextBackButton />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

