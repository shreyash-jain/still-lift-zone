'use client';

import { useState, useEffect, useMemo } from 'react';
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

export default function MessagePage() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [, setCurrentMood] = useState<string | null>(null);
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

  useEffect(() => {
    // Load user preferences and selected message
    const savedMessage = localStorage.getItem('selectedMessage');
    const savedMood = localStorage.getItem('currentMood');

    if (savedMessage) {
      setSelectedMessage(JSON.parse(savedMessage));
    } else {
      // If no message selected, redirect to home
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
        { rate: 0.9, pitch: 1, volume: 0.8, voiceHintNames: ['Samantha','Google UK English Female','Microsoft Zira'] }
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
            <div className="message-content glass-card revealed-card">
              <div className="message-header">
                <h3 className="message-title">{selectedMessage.title}</h3>
                <button 
                  className="audio-play-btn glass-btn" 
                  onClick={playCurrentMessage}
                  aria-label="Play audio"
                >
                  <span className="speaker-icon">🔊</span>
                </button>
              </div>
              <div className="message-text">
                {selectedMessage.message}
              </div>
              <div className="micro-tips">
                {microTips.map((tip, index) => (
                  <div key={index} className="micro-tip">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
            <div className="message-actions">
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