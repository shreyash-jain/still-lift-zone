'use client';

import { useState, useEffect, useCallback } from 'react';

interface AutoFlipProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
  message?: string;
  action?: string;
  actionType?: 'ACTION' | 'REPEAT' | 'VISUALIZE' | 'BREATHE' | 'LISTEN';
  onStartOver?: () => void;
  onTryAnother?: () => void;
  onPlayNarration?: (
    message: string,
    actionType?: string,
    overrideMood?: string | null,
    overrideContext?: string | null,
    audioIndexOverride?: number | null,
    preferExact?: boolean
  ) => void;
  mood?: string;
  context?: string;
}

export default function AutoFlip({ 
  isRevealed, 
  onReveal, 
  accentColor, 
  animationSpeed, 
  message, 
  action, 
  actionType,
  onStartOver,
  onTryAnother,
  onPlayNarration,
  mood,
  context
}: AutoFlipProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canClick, setCanClick] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(0);

  // Messages for rotating content
  const messages = [
    {
      action: action || "Stay present while you move",
      message: message || "As you move through your day, remember that each step is an opportunity to stay grounded and present.",
      tag: "VISUALIZE"
    },
    {
      action: "Focus on your breath as you walk",
      message: "With each step, take a breath. Let your movement become a form of moving meditation.",
      tag: "ACTION"
    },
    {
      action: "'I am exactly where I need to be'",
      message: "Sometimes the journey is more important than the destination. Trust your path.",
      tag: "REPEAT"
    }
  ];

  const getAnimationDuration = useCallback(() => {
    switch (animationSpeed) {
      case 'instant': return 300;
      case 'quick': return 800;
      case 'gentle': return 1200;
      case 'rich': return 1600;
      default: return 1000;
    }
  }, [animationSpeed]);

  // Auto-flip after delay
  useEffect(() => {
    if (!isRevealed && canClick) {
      const flipDelay = animationSpeed === 'instant' ? 500 : 1200;
      
      const flipTimer = setTimeout(() => {
        console.log('🎴 Starting auto-flip animation...');
        setIsFlipping(true);
        setCanClick(false);
        
        // Flip animation duration
        const duration = getAnimationDuration();
        
        setTimeout(() => {
          setIsFlipped(true);
          console.log('🎴 Card flipped - showing message...');
          
          // Show message immediately after flip
          setTimeout(() => {
            setShowMessage(true);
            
            // Expand card after message appears
            setTimeout(() => {
              setIsExpanded(true);
              console.log('🎴 Card expanded for better readability');
              
              // Call onReveal after expansion
              setTimeout(() => {
                onReveal();
              }, 300);
            }, 400);
          }, 200);
        }, duration * 0.6);
      }, flipDelay);
      
      return () => clearTimeout(flipTimer);
    }
  }, [isRevealed, canClick, animationSpeed, getAnimationDuration, onReveal]);

  const handleStartOver = () => {
    console.log('🏠 Going back to home screen...');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleGiveAnother = () => {
    console.log('📝 Getting another message...');
    const nextMessage = (currentMessage + 1) % messages.length;
    setCurrentMessage(nextMessage);
    
    // Reset and re-flip with new message
    setIsFlipping(false);
    setIsFlipped(false);
    setShowMessage(false);
    setIsExpanded(false);
    setCanClick(true);
  };

  useEffect(() => {
    if (!showMessage) return;
    if (!onPlayNarration) return;

    const current = messages[currentMessage];
    if (!current) return;

    if (currentMessage === 0) {
      onPlayNarration(
        current.message,
        current.tag,
        mood ?? null,
        context ?? null
      );
    } else {
      onPlayNarration(
        current.message,
        current.tag,
        mood ?? null,
        context ?? null,
        null,
        false
      );
    }
  }, [showMessage, currentMessage, onPlayNarration, messages, mood, context]);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VISUALIZE': return '#8B5CF6'; // Purple
      case 'ACTION': return '#3B82F6'; // Blue
      case 'REPEAT': return '#10B981'; // Green
      case 'BREATHE': return '#F59E0B'; // Amber/Orange
      case 'LISTEN': return '#EC4899'; // Pink
      default: return accentColor;
    }
  };

  const currentMessageData = messages[currentMessage];

  return (
    <div className="auto-flip-container">
      <div 
        className={`flip-card ${isFlipping ? 'flipping' : ''} ${isFlipped ? 'flipped' : ''} ${isExpanded ? 'expanded' : ''}`}
        style={{ '--flip-duration': `${getAnimationDuration()}ms` } as React.CSSProperties}
        data-speed={animationSpeed}
      >
        {/* Card Back (shows first) */}
        <div className="card-face card-back">
          <div className="card-back-content">
            <div className="back-pattern">
              <div className="pattern-layer-1"></div>
              <div className="pattern-layer-2"></div>
              <div className="pattern-layer-3"></div>
            </div>
            <div className="back-branding">
              <div className="back-logo">✨</div>
              <div className="back-text">Still Lift</div>
              <div className="back-subtitle">Your Moment of Clarity</div>
            </div>
            <div className="loading-indicator">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Preparing your message...</p>
            </div>
          </div>
        </div>

        {/* Card Front (shows after flip) */}
        <div className="card-face card-front">
          {showMessage && (
            <div className="message-content">
              {/* Message Tag */}
              <div 
                className="message-tag"
                style={{ backgroundColor: getTagColor(currentMessageData.tag) }}
              >
                {currentMessageData.tag}
              </div>

              {/* Message Action */}
              <h3 className="message-action">
                {currentMessageData.action}
              </h3>

              {/* Message Text */}
              <p className="message-text">
                {currentMessageData.message}
              </p>

              {/* Action Buttons */}
              <div className="message-actions">
                <button 
                  className="action-button start-over"
                  onClick={handleStartOver}
                >
                  🏠 Start Over
                </button>
                <button 
                  className="action-button give-another primary"
                  onClick={handleGiveAnother}
                >
                  📝 Give Me Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
                 .auto-flip-container {
           position: fixed !important;
           top: 50% !important;
           left: 50% !important;
           transform: translate(-50%, -50%) !important;
           width: 100vw !important;
           height: 100vh !important;
           display: flex !important;
           justify-content: center !important;
           align-items: center !important;
           perspective: 1000px;
           padding: 0 !important;
           margin: 0 !important;
           z-index: 10000 !important;
           background: transparent;
         }

                 .flip-card {
           position: relative !important;
           width: 380px !important;
           height: 240px !important;
           transform-style: preserve-3d !important;
           transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
           cursor: pointer;
           will-change: transform;
           flex-shrink: 0 !important;
           margin: 0 !important;
           padding: 0 !important;
         }

         .flip-card.flipping {
           animation: cardFlipAnimation var(--flip-duration, 0.8s) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
         }

         .flip-card.flipped {
           transform: rotateY(180deg);
         }

         .flip-card.expanded {
           width: 480px !important;
           height: 600px !important;
           transform: rotateY(180deg) scale(1.1) !important;
           transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
           flex-shrink: 0 !important;
           margin: 0 !important;
           padding: 0 !important;
         }

                 .card-face {
           position: absolute;
           width: 100%;
           height: 100%;
           backface-visibility: hidden;
           border-radius: 20px;
           box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
           overflow: hidden;
           border: 1px solid rgba(255, 255, 255, 0.1);
           will-change: transform;
           transform-style: preserve-3d;
         }

                 .card-back {
           background: linear-gradient(135deg, #004851 0%, #006B7A 50%, #004851 100%);
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           color: white;
           position: relative;
           border: 2px solid rgba(255, 255, 255, 0.2);
           padding: 2rem;
         }

                 .card-front {
           background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
           transform: rotateY(180deg);
           padding: 2rem;
           display: flex;
           flex-direction: column;
           justify-content: flex-start;
           border: 2px solid rgba(0, 72, 81, 0.1);
           overflow-y: auto;
         }

        .dark-mode .card-front {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #f1f5f9;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .dark-mode .card-back {
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .back-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.3;
        }

        .pattern-layer-1 {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%);
        }

        .pattern-layer-2 {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 60%);
        }

        .pattern-layer-3 {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
        }

                 .back-branding {
           text-align: center;
           z-index: 2;
           margin-bottom: 1.5rem;
           flex-shrink: 0;
         }

         .back-logo {
           font-size: 3.5rem;
           margin-bottom: 0.5rem;
           animation: pulse 2s infinite;
           filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
         }

         .back-text {
           font-size: 1.8rem;
           font-weight: 700;
           letter-spacing: 2px;
           margin-bottom: 0.25rem;
           text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
         }

         .back-subtitle {
           font-size: 1rem;
           opacity: 0.9;
           font-weight: 300;
           letter-spacing: 0.5px;
         }

                 .loading-indicator {
           text-align: center;
           z-index: 2;
           flex-shrink: 0;
         }

         .loading-dots {
           display: flex;
           justify-content: center;
           gap: 0.5rem;
           margin-bottom: 0.75rem;
         }

         .loading-dots span {
           width: 10px;
           height: 10px;
           background: white;
           border-radius: 50%;
           animation: loadingDots 1.5s infinite;
           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
           will-change: transform, opacity;
         }

         .loading-dots span:nth-child(2) {
           animation-delay: 0.3s;
         }

         .loading-dots span:nth-child(3) {
           animation-delay: 0.6s;
         }

         .loading-indicator p {
           font-size: 0.9rem;
           opacity: 0.8;
           font-weight: 300;
           letter-spacing: 0.5px;
           margin: 0;
         }

                 .message-content {
           display: flex;
           flex-direction: column;
           height: 100%;
           animation: messageSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
           gap: 1.5rem;
           will-change: transform, opacity;
         }

                 .message-tag {
           color: white;
           padding: 0.6rem 1.2rem;
           border-radius: 20px;
           font-size: 0.8rem;
           font-weight: 700;
           text-align: center;
           letter-spacing: 0.5px;
           align-self: flex-start;
           box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
           border: 1px solid rgba(255, 255, 255, 0.2);
           flex-shrink: 0;
         }

                 .message-action {
           font-size: 1.3rem;
           font-weight: 700;
           color: #1e293b;
           line-height: 1.4;
           letter-spacing: -0.01em;
           flex-shrink: 0;
         }

        .dark-mode .message-action {
          color: #f1f5f9;
        }

                 .message-text {
           font-size: 1rem;
           line-height: 1.6;
           color: #475569;
           flex-grow: 1;
           font-weight: 400;
           overflow-y: auto;
         }

        .dark-mode .message-text {
          color: #cbd5e1;
        }

                 .message-actions {
           display: flex;
           gap: 1rem;
           margin-top: auto;
           flex-shrink: 0;
         }

                 .action-button {
           flex: 1;
           padding: 0.875rem 1rem;
           border: none;
           border-radius: 12px;
           font-weight: 600;
           cursor: pointer;
           transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                       box-shadow 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                       background 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
           font-size: 0.9rem;
           letter-spacing: 0.3px;
           will-change: transform, box-shadow;
         }

        .start-over {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #475569;
        }

        .dark-mode .start-over {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          color: #f1f5f9;
        }

                 .start-over:hover {
           background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
           transform: translateY(-2px);
           box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
         }

        .dark-mode .start-over:hover {
          background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

         .give-another {
           background: linear-gradient(135deg, #004851 0%, #006B7A 100%);
           color: white;
           box-shadow: 0 3px 8px rgba(0, 72, 81, 0.25);
         }

         .give-another:hover {
           background: linear-gradient(135deg, #003A40 0%, #004851 100%);
           transform: translateY(-2px);
           box-shadow: 0 6px 16px rgba(0, 72, 81, 0.4);
         }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Enhanced card flip animation inspired by Lottie reference */
        @keyframes cardFlipAnimation {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          15% {
            transform: rotateY(-8deg) scale(1.015);
          }
          35% {
            transform: rotateY(45deg) scale(0.98);
          }
          50% {
            transform: rotateY(90deg) scale(0.92);
          }
          65% {
            transform: rotateY(135deg) scale(0.96);
          }
          85% {
            transform: rotateY(165deg) scale(0.99);
          }
          100% {
            transform: rotateY(180deg) scale(1);
          }
        }

        /* Speed-specific variations */
        .flip-card[data-speed="instant"].flipping {
          animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .flip-card[data-speed="quick"].flipping {
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .flip-card[data-speed="gentle"].flipping {
          animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .flip-card[data-speed="rich"].flipping {
          animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }

                 @keyframes loadingDots {
           0%, 80%, 100% {
             transform: scale(0.8);
             opacity: 0.6;
           }
           40% {
             transform: scale(1.1);
             opacity: 1;
           }
         }

                 @keyframes messageSlideIn {
           0% {
             opacity: 0;
             transform: translateY(20px);
           }
           100% {
             opacity: 1;
             transform: translateY(0);
           }
         }



                 /* Mobile Responsiveness */
         @media (max-width: 768px) {
           .auto-flip-container {
             padding: 1rem;
             min-height: 50vh;
           }

           .flip-card {
             width: 320px;
             height: 200px;
           }

           .flip-card.expanded {
             width: 400px;
             height: 500px;
             transform: rotateY(180deg) scale(1.05);
           }

           .card-front {
             padding: 1.5rem;
           }

           .card-back {
             padding: 1.5rem;
           }

           .message-action {
             font-size: 1.1rem;
           }

           .message-text {
             font-size: 0.9rem;
           }

           .action-button {
             font-size: 0.8rem;
             padding: 0.75rem 0.875rem;
           }

           .message-actions {
             flex-direction: column;
             gap: 0.75rem;
           }

           .back-text {
             font-size: 1.5rem;
           }

           .back-logo {
             font-size: 2.8rem;
           }

           .message-tag {
             font-size: 0.7rem;
             padding: 0.5rem 0.8rem;
           }

           .loading-indicator p {
             font-size: 0.8rem;
           }
         }

         @media (max-width: 480px) {
           .flip-card {
             width: 280px;
             height: 180px;
           }

           .flip-card.expanded {
             width: 340px;
             height: 425px;
             transform: rotateY(180deg) scale(1.02);
           }

           .card-front {
             padding: 1.25rem;
           }

           .card-back {
             padding: 1.25rem;
           }

           .message-action {
             font-size: 1rem;
           }

           .message-text {
             font-size: 0.85rem;
           }

           .back-text {
             font-size: 1.3rem;
           }

           .back-logo {
             font-size: 2.5rem;
           }

           .message-tag {
             font-size: 0.65rem;
             padding: 0.4rem 0.7rem;
           }

           .loading-indicator p {
             font-size: 0.75rem;
           }
         }
      `}</style>
    </div>
  );
}