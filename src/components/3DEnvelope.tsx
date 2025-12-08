'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ActionRevealCard from './ActionRevealCard';

interface EnvelopeProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
  onPlayNarration?: (
    message: string,
    actionType?: string,
    overrideMood?: string | null,
    overrideContext?: string | null,
    audioIndexOverride?: number | null,
    preferExact?: boolean
  ) => void;
  // Content coming from the centralized library
  message?: string; // full text to display
  action?: string;  // same as message in our mapping
  actionType?: string; // 'ACTION' | 'REPEAT' | 'VISUALIZE' | 'BREATHE' | 'LISTEN'
  onStartOver?: () => void;
  onTryAnother?: () => void;
  mood?: string;
  context?: string;
}

// Map actionType to a friendly tag label
const actionTypeToTitle = (actionType?: string): string => {
  if (!actionType) return '💌 A Note for You';
  const upper = actionType.toUpperCase();
  if (upper.includes('VISUAL')) return '🌈 Visualize This';
  if (upper.includes('RECITE') || upper.includes('REPEAT')) return '🗣️ Repeat Gently';
  if (upper.includes('ACTION')) return '🧭 Gentle Action';
  if (upper.includes('BREATHE')) return '🌬️ Breathe Deeply';
  if (upper.includes('LISTEN')) return '👂 Listen Mindfully';
  return '💌 A Note for You';
};

export default function Envelope({ 
  isRevealed, 
  onReveal, 
  accentColor, 
  animationSpeed,
  onPlayNarration,
  message,
  action,
  actionType,
  onStartOver,
  onTryAnother,
  mood,
  context
}: EnvelopeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [canClick, setCanClick] = useState(true);
  const [showTreasureCard, setShowTreasureCard] = useState(false);
  const [treasureCardEmerging, setTreasureCardEmerging] = useState(false);
  const [treasureCardFullyRevealed, setTreasureCardFullyRevealed] = useState(false);
  const [treasureCardStatic, setTreasureCardStatic] = useState(false);
  const hasAutoRevealed = useRef(false);
  const hasAnnouncedReveal = useRef(false);
  
  const resolvedMessage = action || message || '';
  const resolvedTitle = actionTypeToTitle(actionType);

  // Animation duration based on speed
  const getAnimationDuration = useCallback(() => {
    switch (animationSpeed) {
      case 'instant': return 400;
      case 'quick': return 800;
      case 'gentle': return 1200;
      case 'rich': return 1600;
      default: return 1200;
    }
  }, [animationSpeed]);

  const handleClick = useCallback(() => {
    if (!canClick || isAnimating || isRevealed) return;
    
    setCanClick(false);
    setIsAnimating(true);
    
    const duration = getAnimationDuration();
    
    // Gentle flap opening
    setTimeout(() => {
      setFlapOpen(true);
    }, duration * 0.1);
    
    // Treasure card appears after envelope opens
    setTimeout(() => {
      setMessageVisible(true);
      setShowTreasureCard(true);
      setTreasureCardEmerging(true);
    }, duration * 0.6);
    
    // Treasure card fully revealed
    setTimeout(() => {
      setTreasureCardFullyRevealed(true);
      setTreasureCardEmerging(false);
    }, duration * 0.8);
    
    // Treasure card becomes static
    setTimeout(() => {
      setTreasureCardStatic(true);
    }, duration * 1.1);
  }, [canClick, isAnimating, isRevealed, onReveal, getAnimationDuration]);

  const handleReplay = () => {
    setIsAnimating(false);
    setFlapOpen(false);
    setMessageVisible(false);
    setCanClick(true);
  };

  const handleStartOver = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleGiveAnother = () => {
    if (onTryAnother) onTryAnother();
  };

  useEffect(() => {
    if (!messageVisible || !onPlayNarration) return;
    const narrationText = resolvedMessage || '';
    onPlayNarration(
      narrationText,
      actionType?.toUpperCase(),
      mood ?? null,
      context ?? null
    );
  }, [messageVisible, onPlayNarration, mood, context, resolvedMessage, actionType]);

  useEffect(() => {
    if (messageVisible && !hasAnnouncedReveal.current) {
      hasAnnouncedReveal.current = true;
      onReveal();
    }
  }, [messageVisible, onReveal]);

  useEffect(() => {
    if (!isRevealed || messageVisible || hasAutoRevealed.current) return;

    hasAutoRevealed.current = true;
    setCanClick(false);
    setIsAnimating(false);
    setFlapOpen(true);
    setMessageVisible(true);
    // Show treasure card
    setShowTreasureCard(true);
    setTreasureCardEmerging(true);
    setTimeout(() => {
      setTreasureCardFullyRevealed(true);
      setTreasureCardEmerging(false);
    }, 300);
    setTimeout(() => {
      setTreasureCardStatic(true);
    }, 600);
  }, [isRevealed, messageVisible]);

  useEffect(() => {
    if (!isRevealed) {
      hasAutoRevealed.current = false;
      hasAnnouncedReveal.current = false;
    }
  }, [isRevealed]);

  return (
    <div className="envelope-lottie-container">
      {/* Envelope - Lottie Style */}
      <div 
        className={`envelope-lottie ${flapOpen ? 'opened' : ''} ${isAnimating ? 'opening' : ''} ${messageVisible ? 'revealed' : ''}`}
        onClick={handleClick}
        style={{ cursor: canClick ? 'pointer' : 'default' }}
      >
                 {/* Envelope Base Body - Clean Rectangle */}
         <div className="envelope-base-lottie">
           {/* Main envelope body */}
           <div className="envelope-body-rectangle"></div>
         </div>
        
        {/* Envelope Flap - Triangular */}
        <div className={`envelope-flap-lottie ${flapOpen ? 'open' : ''}`}>
          <div className="flap-triangle"></div>
        </div>
        
        {/* Heart Seal - As Requested */}
        <div className={`heart-seal-lottie ${flapOpen ? 'hidden' : ''}`}>
          ❤️
        </div>
        
        
      </div>

      

      {/* Treasure Card */}
      <ActionRevealCard
        message={message}
        action={action}
        actionType={actionType}
        onStartOver={onStartOver}
        onTryAnother={onTryAnother}
        showCard={showTreasureCard}
        isEmerging={treasureCardEmerging}
        isFullyRevealed={treasureCardFullyRevealed}
        isStatic={treasureCardStatic}
      />

      {/* Interaction Hint */}
      {canClick && !isAnimating && !messageVisible && (
        <div className="interaction-hint-envelope">
          <div className="hint-text-envelope">💌 Gentle tap to open 💌</div>
          <div className="hint-pulse-envelope"></div>
        </div>
      )}

      <style jsx>{`
        .envelope-lottie-container {
          position: relative;
          width: 400px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border-radius: 20px;
          overflow: visible;
          perspective: 1000px;
        }

        .dark-mode .hint-text-envelope {
          color: #9ca3af;
        }

        /* Mobile Responsive Design */
        @media (max-width: 768px) {
          .envelope-lottie-container {
            width: 90vw;
            max-width: 350px;
            height: 250px;
          }

          .envelope-lottie {
            width: 160px;
            height: 120px;
          }

          .envelope-body-rectangle {
            width: 160px;
            height: 120px;
          }

          .envelope-flap-lottie {
            width: 0;
            height: 0;
            border-left: 80px solid transparent;
            border-right: 80px solid transparent;
            border-bottom: 60px solid #F3F4F6;
          }
          
          .dark-mode .envelope-flap-lottie {
            border-bottom-color: #9CA3AF;
          }

          .large-message-card {
            width: 90vw;
            max-width: 320px;
            min-height: 360px;
            padding: 24px;
            margin: 20px;
          }

          .large-card-content {
            padding: 28px 24px;
          }

          .large-card-tag {
            font-size: 20px;
            padding: 12px 18px;
            margin-bottom: 20px;
          }

          .clean-text-area {
            font-size: 20px;
            padding: 20px;
            min-height: 160px;
          }

          .large-card-actions {
            flex-direction: column;
            gap: 14px;
          }

          .large-action-button {
            width: 100%;
            padding: 14px 24px;
            font-size: 15px;
          }

          .envelope-hint {
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 300px;
          }

          .hint-text {
            font-size: 14px;
            padding: 8px 12px;
          }
        }

        /* Small Mobile Devices */
        @media (max-width: 480px) {
          .envelope-lottie-container {
            width: 95vw;
            max-width: 320px;
            height: 220px;
          }

          .envelope-lottie {
            width: 140px;
            height: 100px;
          }

          .envelope-body-rectangle {
            width: 140px;
            height: 100px;
          }

          .envelope-flap-lottie {
            width: 0;
            height: 0;
            border-left: 70px solid transparent;
            border-right: 70px solid transparent;
            border-bottom: 50px solid #F3F4F6;
          }
          
          .dark-mode .envelope-flap-lottie {
            border-bottom-color: #9CA3AF;
          }

          .large-message-card {
            width: 95vw;
            max-width: 95vw;
            min-height: 320px;
            padding: 20px;
            margin: 12px;
          }

          .large-card-content {
            padding: 26px 20px;
          }

          .large-card-tag {
            font-size: 18px;
            padding: 10px 16px;
            margin-bottom: 16px;
          }

          .clean-text-area {
            font-size: 18px;
            padding: 18px;
            min-height: 140px;
          }

          .large-card-actions {
            gap: 12px;
          }

          .large-action-button {
            padding: 12px 18px;
            font-size: 14px;
            min-height: 46px;
          }

          .envelope-hint {
            bottom: -50px;
            width: 95%;
            max-width: 280px;
          }

          .hint-text {
            font-size: 13px;
            padding: 6px 10px;
          }
        }

        /* Lottie Style Envelope */
        .envelope-lottie {
          position: relative;
          width: 280px;
          height: 200px;
          transition: transform 0.3s ease;
        }

        .envelope-lottie:hover {
          transform: scale(1.05);
        }

        .envelope-lottie.opening {
          animation: envelope-shake 0.6s ease;
        }

        .envelope-lottie.disappearing {
          opacity: 0;
          transform: scale(0.8) translateY(-20px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        /* Envelope Base - Clean Rectangle Like Lottie */
        .envelope-base-lottie {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .envelope-body-rectangle {
          width: 100%;
          height: 100%;
          background: #F5F5F0;
          border: 2px solid #E5E7EB;
          border-radius: 6px;
          position: relative;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .dark-mode .envelope-body-rectangle {
          background: #A8A29E;
          border: 2px solid #78716C;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        /* Flat design like Lottie - no 3D sides */

        /* Envelope Flap - Clean Triangle Like Lottie */
        .envelope-flap-lottie {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 140px solid transparent;
          border-right: 140px solid transparent;
          border-top: 140px solid #F3F4F6;
          transform-origin: top center;
          transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 5;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
        }

        .dark-mode .envelope-flap-lottie {
          border-top-color: #9CA3AF;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
        }

        .envelope-flap-lottie.open {
          transform: translateX(-50%) rotateX(135deg);
        }

        /* Heart Seal - Simple and Clean */
        .heart-seal-lottie {
          position: absolute;
          top: 25%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          z-index: 10;
          transition: all 0.6s ease;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
          animation: heart-pulse 2s ease-in-out infinite;
        }

        .heart-seal-lottie.hidden {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.3);
        }

        /* Large Impact Message Card */
        .large-message-card {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 520px;
          min-height: 420px;
          background: rgba(30, 41, 59, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 24px;
          transform: translate(-50%, -50%) scale(0.9);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.45);
          z-index: 1000;
          pointer-events: none;
          overflow: hidden;
          backdrop-filter: blur(18px);
        }

        .dark-mode .large-message-card {
          background: rgba(15, 23, 42, 0.94);
          border-color: rgba(148, 163, 184, 0.4);
        }

        .large-message-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 55%);
          pointer-events: none;
          z-index: 0;
        }

        .large-message-card.visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          pointer-events: all;
        }

        .large-card-content {
          position: relative;
          padding: 42px 48px 44px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 1;
        }
        
        /* Large Card Tag */
        .large-card-tag {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          color: #E5E7EB;
          font-size: 30px;
          text-align: center;
          margin-bottom: 36px;
          background: rgba(148, 163, 184, 0.18);
          padding: 18px 28px;
          border-radius: 18px;
          border-left: 8px solid rgba(96, 165, 250, 0.6);
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
        }

        .dark-mode .large-card-tag {
          color: #F8FAFC;
          background: rgba(15, 23, 42, 0.65);
          border-left-color: rgba(59, 130, 246, 0.7);
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
        }
        
        /* Large Card Message with Full Lined Background */
        .large-card-message {
          flex-grow: 1;
          margin-bottom: 30px;
        }
        
        .clean-text-area {
          width: 100%;
          min-height: 220px;
          background: rgba(15, 23, 42, 0.7);
          padding: 30px;
          border-radius: 18px;
          font-family: var(--font-cursive), cursive;
          color: #E2E8F0;
          font-size: 26px;
          font-weight: 500;
          line-height: 1.7;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          text-shadow: 0 10px 25px rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(148, 163, 184, 0.25);
        }

        .dark-mode .clean-text-area {
          background: rgba(15, 23, 42, 0.78);
          color: #F8FAFC;
          border-color: rgba(148, 163, 184, 0.35);
        }
        
        /* Large Card Actions */
        .large-card-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 32px;
        }

        .large-action-button {
          padding: 16px 36px;
          border: none;
          border-radius: 18px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
          color: #F8FAFC;
        }

        .replay-large-button {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.24));
          border: 1px solid rgba(96, 165, 250, 0.4);
        }

        .replay-large-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px rgba(59, 130, 246, 0.3);
        }

        .support-large-button {
          background: linear-gradient(135deg, rgba(45, 212, 191, 0.18), rgba(59, 130, 246, 0.3));
          border: 1px solid rgba(45, 212, 191, 0.4);
        }

        .support-large-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px rgba(45, 212, 191, 0.3);
        }



        /* Interaction Hint */
        .interaction-hint-envelope {
          position: absolute;
          bottom: -80px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          pointer-events: none;
        }

        .hint-text-envelope {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #a16207;
          margin-bottom: 8px;
          animation: hint-pulse-warm 2s ease-in-out infinite;
        }

        .hint-pulse-envelope {
          width: 24px;
          height: 24px;
          background: rgba(251, 191, 36, 0.3);
          border-radius: 50%;
          margin: 0 auto;
          animation: ripple-pulse-warm 2s ease-in-out infinite;
        }

        /* Simple Animations */
        @keyframes envelope-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1px); }
          75% { transform: translateX(1px); }
        }

        @keyframes heart-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }

        @keyframes gentle-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
          60% { transform: translateY(-2px); }
        }

        @keyframes hint-pulse-warm {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes ripple-pulse-warm {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

