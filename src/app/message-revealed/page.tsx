'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import TextBackButton from '@/components/TextBackButton';

interface MessageData {
  title: string;
  message: string;
}

export default function MessageRevealedPage() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  
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
  }, [router]);

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
            <div className="reveal-guidance-intro">
              <h2 className="font-inter font-semibold">Reveal your guidance</h2>
              <p>Scratch to uncover your personalized message</p>
            </div>
            
            <div className="revealed-message-container">
              <div className="revealed-message-card">
                <div className="revealed-message-content">
                  <h3 className="revealed-message-title">{selectedMessage.title}</h3>
                  <p className="revealed-message-body">{selectedMessage.message}</p>
                </div>
              </div>
            </div>

            <div className="message-action-buttons">
              {/* Empty button - removed as it serves no purpose */}
              <button 
                className="action-btn primary glass-btn neubrutalism-btn"
                onClick={() => router.push('/context')}
              >
                Get Another
              </button>
              <button 
                className="action-btn secondary glass-btn neubrutalism-btn"
                onClick={handleStartOver}
              >
                Start Over
              </button>
              <Link href="/context" className="action-btn secondary glass-btn neubrutalism-btn">
                ← Back
              </Link>
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


