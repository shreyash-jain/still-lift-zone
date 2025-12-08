'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { playMessageAudio } from '@/lib/audio';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Background from '@/components/Background';

interface MessageData {
  title: string;
  message: string;
}

export default function Option2Page() {
  const router = useRouter();
  const [, setCurrentMood] = useState<string | null>(null);
  const [, setCurrentContext] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [, setScratchPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const {
    isDarkMode,
    audioEnabled,
    screenlessMode,
    toggleTheme,
    toggleReadAloud,
    toggleScreenless,
  } = useUserPreferences();

  const messages = useMemo(() => ({
    good: {
      safe: [
        {
          title: "Gratitude Practice",
          message: "Take a moment to appreciate this feeling. You're doing well, and that's worth celebrating. Consider writing down one thing that made today special."
        },
        {
          title: "Share Your Light",
          message: "Your positive energy is contagious! Share a smile with someone today - it might be exactly what they need."
        },
        {
          title: "Set Intentions",
          message: "This is a great time to set a small, achievable goal for tomorrow. What would make you feel even better?"
        },
        {
          title: "Spread Kindness",
          message: "Your good mood is a gift. Consider doing something kind for someone else - it will amplify your own joy."
        }
      ],
      moving: [
        {
          title: "Flow with Movement",
          message: "Keep that positive energy flowing! As you move, notice the rhythm of your steps and let it ground you."
        },
        {
          title: "Connect with Others",
          message: "Your good mood is perfect for connecting with others. Consider reaching out to a friend or family member."
        },
        {
          title: "Explore Something New",
          message: "Use this energy to explore something new on your route today - maybe a different path or a new coffee shop."
        },
        {
          title: "Creative Thinking",
          message: "Your positive state is ideal for creative thinking. What ideas or solutions come to mind as you move?"
        }
      ]
    },
    okay: {
      safe: [
        {
          title: "Embrace the Moment",
          message: "It's perfectly normal to feel okay. Sometimes 'okay' is exactly where we need to be. Take a few deep breaths and acknowledge this moment."
        },
        {
          title: "Small Improvements",
          message: "Being okay is a stable foundation. What small thing could you do right now to feel a bit better?"
        },
        {
          title: "Your Power",
          message: "This neutral state is actually quite powerful. You have the energy to make choices that could improve your day."
        },
        {
          title: "Find Gratitude",
          message: "Okay is a good place to be. Consider what you're grateful for right now, even if it's something simple."
        }
      ],
      moving: [
        {
          title: "Mindful Movement",
          message: "Okay is a perfectly valid feeling. As you move, let the rhythm of your steps help you find your center."
        },
        {
          title: "Notice Beauty",
          message: "This neutral energy is great for observation. Notice something beautiful or interesting on your journey."
        },
        {
          title: "Meditative Walking",
          message: "Being okay while moving can be meditative. Focus on your breathing and the sensation of movement."
        },
        {
          title: "Plan for Joy",
          message: "Use this stable state to plan something small that might bring you joy later today."
        }
      ]
    },
    bad: {
      safe: [
        {
          title: "Be Gentle",
          message: "I see you're having a tough time. That's okay - difficult feelings are part of being human. You don't have to figure everything out right now."
        },
        {
          title: "Self-Compassion",
          message: "It's okay to not be okay. Take a moment to be gentle with yourself. What would feel comforting right now?"
        },
        {
          title: "You're Not Alone",
          message: "You're not alone in feeling this way. Consider reaching out to someone you trust, even if it's just to say you're having a rough day."
        },
        {
          title: "This Too Shall Pass",
          message: "This feeling won't last forever. For now, try to be as kind to yourself as you would be to a friend who's struggling."
        }
      ],
      moving: [
        {
          title: "One Step at a Time",
          message: "I understand this is hard. Sometimes movement can help shift our energy. Focus on putting one foot in front of the other."
        },
        {
          title: "Notice the Good",
          message: "You're doing the best you can right now. As you move, try to notice one thing that's not terrible - maybe the air on your skin or the sound of your footsteps."
        },
        {
          title: "Be Patient",
          message: "It's okay to feel this way while moving. Don't push yourself too hard. What would feel most supportive right now?"
        },
        {
          title: "Temporary Feelings",
          message: "This difficult moment is temporary. Keep moving if it helps, or find a quiet place to pause if you need to."
        }
      ]
    },
    awful: {
      safe: [
        {
          title: "Reach Out",
          message: "I'm so sorry you're feeling this way. You don't have to go through this alone. Is there someone you can call right now?"
        },
        {
          title: "Your Feelings Matter",
          message: "This is really hard, and your feelings are valid. Try to be extra gentle with yourself today. You're doing the best you can."
        },
        {
          title: "Just Breathe",
          message: "When things feel this overwhelming, sometimes the best thing is to just breathe. Take slow, deep breaths and know that this moment will pass."
        },
        {
          title: "You Deserve Support",
          message: "You're not alone, even if it feels that way. Consider reaching out to a crisis helpline or someone you trust. You deserve support."
        }
      ],
      moving: [
        {
          title: "Find Safety",
          message: "I know this is incredibly difficult. If you're safe to do so, try to find a quiet place to sit and breathe for a moment."
        },
        {
          title: "Be Kind to Yourself",
          message: "You're going through something really hard. Don't feel pressured to keep moving if you need to stop and rest."
        },
        {
          title: "One Moment at a Time",
          message: "This feeling is overwhelming, but it won't last forever. Focus on getting through the next few minutes, one step at a time."
        },
        {
          title: "You're Not Alone",
          message: "You're not alone in this pain. Consider calling a friend, family member, or crisis helpline. You deserve to be heard and supported."
        }
      ]
    }
  }), []);

  useEffect(() => {
    // Load user preferences and current mood/context
    const savedMood = localStorage.getItem('currentMood');
    const savedContext = localStorage.getItem('currentContext');

    if (savedMood && savedContext) {
      setCurrentMood(savedMood);
      setCurrentContext(savedContext);
      
      // Get random message
      const availableMessages = messages[savedMood as keyof typeof messages]?.[savedContext as keyof typeof messages.good];
      if (availableMessages) {
        const randomMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
        setSelectedMessage(randomMessage);
      }
    } else {
      // If no mood or context selected, redirect to home
      router.push('/');
      return;
    }
  }, [router, messages]);

  useEffect(() => {
    if (selectedMessage) {
      setupCanvas();
    }
  }, [selectedMessage]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;
    
    // Set canvas size
    const container = canvas.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Fill canvas with scratchable layer
    ctx.fillStyle = 'rgba(139, 157, 195, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set up compositing for erasing
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startScratching = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctxRef.current || !canvasRef.current) return;
    
    setIsScratching(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctxRef.current.beginPath();
    ctxRef.current.arc(x, y, 12, 0, 2 * Math.PI);
    ctxRef.current.fill();
    
    updateScratchPercentage();
  };

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || !ctxRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.arc(x, y, 12, 0, 2 * Math.PI);
    ctxRef.current.fill();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    
    updateScratchPercentage();
  };

  const stopScratching = () => {
    setIsScratching(false);
    if (ctxRef.current) {
      ctxRef.current.beginPath();
    }
  };

  const updateScratchPercentage = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    
    // Simple approximation - count transparent pixels
    const imageData = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }
    
    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);
    
    if (percentage > 30) {
      revealCard();
    }
  };

  const autoScratch = () => {
    if (isRevealed) return;
    
    // Create animated scratch effect
    let progress = 0;
    const animate = () => {
      if (!ctxRef.current || !canvasRef.current) return;
      
      progress += 0.15;
      
      // Draw random scratch lines
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * canvasRef.current!.width;
        const y = Math.random() * canvasRef.current!.height;
        const radius = 20 + Math.random() * 30;
        
        ctxRef.current!.beginPath();
        ctxRef.current!.arc(x, y, radius, 0, Math.PI * 2);
        ctxRef.current!.fill();
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        revealCard();
      }
    };
    
    animate();
  };

  const revealCard = () => {
    setIsRevealed(true);
    
    // Hide canvas
    if (canvasRef.current) {
      canvasRef.current.style.display = 'none';
    }
    
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



  const handleRevealMessage = () => {
    // Validate that we have a valid message before proceeding
    if (!selectedMessage || !selectedMessage.title || !selectedMessage.message) {
      console.error('Invalid message selected:', selectedMessage);
      return;
    }
    
    localStorage.setItem('selectedMessage', JSON.stringify(selectedMessage));
    router.push('/message-scratch');
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
            <div className="scratch-intro">
              <h2 className="font-inter font-semibold">Reveal your guidance</h2>
              <p>Scratch to uncover your personalized message</p>
            </div>
            <div className="scratch-card-container">
              <canvas 
                ref={canvasRef}
                className="scratch-canvas"
                onMouseDown={startScratching}
                onMouseMove={scratch}
                onMouseUp={stopScratching}
                onMouseLeave={stopScratching}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startScratching(e);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  scratch(e);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopScratching();
                }}
                onClick={autoScratch}
              />
              <div className="scratch-content" id="scratch-content">
                <h3 className="scratch-title">{selectedMessage.title}</h3>
                <p className="scratch-message">{selectedMessage.message}</p>
              </div>
              <div className={`scratch-overlay ${isRevealed ? 'revealed' : ''}`}>
                <div className="scratch-pattern"></div>
                <div className="scratch-sparkles">✨</div>
                <div className="scratch-hint">Scratch here to reveal</div>
              </div>
            </div>
            <div className="message-action-buttons">
              <button 
                className="action-btn primary glass-btn neubrutalism-btn"
                onClick={handleRevealMessage}
              >
                Reveal Message
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
        </section>
      </main>

      <Footer />
    </div>
  );
} 