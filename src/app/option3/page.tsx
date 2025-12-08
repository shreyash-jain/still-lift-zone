'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import { useRandomMessage } from '@/hooks/useStillLiftContent';
import { type Mood, type Context } from '@/lib/still-lift-content';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';
import fortuneCookieAnimation from '../../../public/fortune-cookie.json';

interface MessageData {
  title: string;
  message: string;
}

interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext: typeof AudioContext;
}

export default function Option3Page() {
  const router = useRouter();
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [isCracking, setIsCracking] = useState(false);

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  
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

  const openCookie = () => {
    if (isOpened || isCracking) return;
    setIsCracking(true);
    
    // Play the Lottie animation
    if (lottieRef.current) {
      lottieRef.current.play();
    }
    
    // Play crack sound
    if (audioEnabled) {
      const audioContext = new (window.AudioContext || (window as unknown as WindowWithWebkitAudioContext).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const onAnimationComplete = () => {
    setAnimationComplete(true);
    setIsOpened(true);
    setIsCracking(false);
    
    // Wait a moment then reveal the fortune
    setTimeout(() => {
      revealFortune();
    }, 500);
  };

  const revealFortune = () => {
    // Expand the fortune slip
    setTimeout(() => {
      setIsExpanded(true);
    }, 300);
    
    // Play pre-generated audio (fallback to TTS) if audio is enabled
    if (audioEnabled && selectedMessage) {
      playMessageAudio(selectedMessage.title, selectedMessage.message, {
        rate: 0.9,
        pitch: 1,
        volume: 0.8,
        voiceHintNames: ['Samantha','Google UK English Female','Microsoft Zira']
      });
    }
  };



  const handleGiveMeAnother = () => {
    // Reset cookie state
    setIsOpened(false);
    setIsCracking(false);
    setIsExpanded(false);
    setAnimationComplete(false);
    
    // Reset Lottie animation
    if (lottieRef.current) {
      lottieRef.current.stop();
    }
    
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

  const shareFortune = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My StillLift Fortune',
        text: `${selectedMessage?.title}: ${selectedMessage?.message}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const text = `${selectedMessage?.title}: ${selectedMessage?.message} - StillLift`;
      navigator.clipboard.writeText(text).then(() => {
        // Show a brief feedback
        const shareButton = document.querySelector('.share-btn');
        if (shareButton) {
          const originalText = shareButton.textContent;
          shareButton.textContent = 'Copied!';
          setTimeout(() => {
            shareButton.textContent = originalText;
          }, 1500);
        }
      });
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
            <div className="fortune-intro">
              <h2 className="font-inter font-semibold">Open your fortune</h2>
              <p>Tap to crack open your wellness fortune</p>
            </div>
            <div className="fortune-cookie-container">
              <div 
                className={`cookie-wrapper ${isCracking ? 'cracking' : ''} ${isOpened ? 'opened' : ''}`}
                onClick={openCookie}
                style={{ cursor: isCracking ? 'default' : 'pointer' }}
              >
                <Lottie
                  lottieRef={lottieRef}
                  animationData={fortuneCookieAnimation}
                  autoplay={false}
                  loop={false}
                  onComplete={onAnimationComplete}
                  style={{
                    width: '240px',
                    height: '180px',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              
              <div className={`fortune-slip ${isOpened ? 'revealed' : ''} ${isExpanded ? 'expanded' : ''}`}>
                <div className="slip-content">
                  <h3 className="fortune-title">{selectedMessage?.title}</h3>
                  <p className="fortune-message">{selectedMessage?.message}</p>
                  {isOpened && (
                    <>
                      <div className="micro-tips">
                        <div className="micro-tip">Take a moment to reflect on this message</div>
                        <div className="micro-tip">Consider how you can apply this wisdom today</div>
                      </div>
                      <div className="fortune-actions">
                        <button 
                          className="action-btn primary glass-btn"
                          onClick={handleGiveMeAnother}
                        >
                          Another Fortune
                        </button>
                        <button 
                          className="action-btn secondary glass-btn share-btn"
                          onClick={shareFortune}
                        >
                          Share
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {!isOpened && (
                <div className="tap-hint">
                  <span className="hint-text">Tap to open your fortune!</span>
                  <div className="hint-sparkles">✨ 🌟 ✨</div>
                </div>
              )}
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