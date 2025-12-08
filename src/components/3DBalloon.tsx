'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ActionRevealCard from './ActionRevealCard';
const BALLOON_ACTION_TAG = 'SUPPORT';
const BALLOON_MESSAGE_BODY = "It's perfectly normal to feel okay. Sometimes 'okay' is exactly where we need to be. Take a few deep breaths and acknowledge this moment.";

interface BalloonProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
  audioIndex?: number;
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
  message?: string;
  action?: string;
  actionType?: string;
  onStartOver?: () => void;
  onTryAnother?: () => void;
}

export default function Balloon({ isRevealed, onReveal, accentColor, animationSpeed, audioIndex, onPlayNarration, mood, context, message, action, actionType, onStartOver, onTryAnother }: BalloonProps) {
  const [isPopping, setIsPopping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [canClick, setCanClick] = useState(true);
  const [messageLocked, setMessageLocked] = useState(false);
  const [showTreasureCard, setShowTreasureCard] = useState(false);
  const [treasureCardEmerging, setTreasureCardEmerging] = useState(false);
  const [treasureCardFullyRevealed, setTreasureCardFullyRevealed] = useState(false);
  const [treasureCardStatic, setTreasureCardStatic] = useState(false);
  const hasAnnouncedReveal = useRef(false);
  const hasAutoRevealed = useRef(false);

  // Animation duration based on speed
  const getAnimationDuration = useCallback(() => {
    switch (animationSpeed) {
      case 'instant': return 400;
      case 'quick': return 800;
      case 'gentle': return 1200;
      case 'rich': return 1800;
      default: return 1200;
    }
  }, [animationSpeed]);

  console.log('🎈 Balloon component rendered with props:', { isRevealed, onReveal: typeof onReveal, accentColor, animationSpeed });

  const handleClick = useCallback(() => {
    console.log('🎈 Balloon clicked! Current state:', { isRevealed, isPopping, canClick });
    
    if (!canClick || isPopping || isRevealed) return;
    
    console.log('🎈 Starting balloon pop animation...');
    setCanClick(false);
    setIsPopping(true);
    
    const duration = getAnimationDuration();
    
    // Balloon pops immediately
    setTimeout(() => {
      console.log('🎊 Starting confetti burst...');
      setShowConfetti(true);
    }, duration * 0.2);
    
    // Treasure card appears after confetti settles
    setTimeout(() => {
      console.log('📝 Showing treasure card...');
      setShowTreasureCard(true);
      setTreasureCardEmerging(true);
      setShowMessage(true);
      // Delay setting messageLocked slightly to ensure props are ready before triggering audio
      setTimeout(() => {
        setMessageLocked(true);
      }, 50);
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
    
  }, [canClick, isPopping, isRevealed, onReveal, getAnimationDuration]);

  const handleStartOver = () => {
    console.log('🏠 Going back to home screen...');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleGiveAnother = () => {
    console.log('📝 Getting another message...');
    if (onPlayNarration) {
      // Use actual message and action from props instead of hardcoded values
      const narrationMessage = action || message || '';
      const narrationActionType = actionType || 'ACTION';
      onPlayNarration(narrationMessage, narrationActionType, mood ?? null, context ?? null, audioIndex ?? null, true);
    }
  };

  // Keep message locked and visible permanently
  useEffect(() => {
    if (messageLocked && !hasAnnouncedReveal.current) {
      hasAnnouncedReveal.current = true;
      onReveal();
    }
  }, [messageLocked, onReveal]);

  useEffect(() => {
    if (!messageLocked || !onPlayNarration) return;
    // Use actual message and action from props instead of hardcoded values
    const narrationMessage = action || message || '';
    const narrationActionType = actionType || 'ACTION';
    
    // Only play audio if we have a valid message and audioIndex
    // This ensures props are ready before attempting to play audio
    if (!narrationMessage || narrationMessage.trim() === '') {
      console.warn('[Balloon] Skipping audio - no message available yet');
      return;
    }
    
    // Small delay to ensure all props are properly set
    const timeoutId = setTimeout(() => {
      onPlayNarration(narrationMessage, narrationActionType, mood ?? null, context ?? null, audioIndex ?? null, true);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messageLocked, onPlayNarration, mood, context, audioIndex, action, message, actionType]);

  useEffect(() => {
    if (!isRevealed || messageLocked || hasAutoRevealed.current) return;

    hasAutoRevealed.current = true;
    setCanClick(false);
    setIsPopping(false);
    setShowConfetti(true);
    setShowMessage(true);
    // Delay setting messageLocked slightly to ensure props are ready
    setTimeout(() => {
      setMessageLocked(true);
    }, 50);
    setIsHovered(false);
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
  }, [isRevealed, messageLocked]);

  useEffect(() => {
    if (!isRevealed) {
      hasAutoRevealed.current = false;
    }
  }, [isRevealed]);

  return (
    <div className="balloon-experience-container">
      {/* Main Balloon */}
      <div 
        className={`balloon-main ${isPopping ? 'popping' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: canClick ? 'pointer' : 'default' }}
      >
        {/* Balloon Body - Lottie Inspired */}
        <div 
          className="balloon-body-modern" 
          style={{ 
            backgroundColor: accentColor,
            boxShadow: `0 8px 32px ${accentColor}40, inset -8px -8px 16px ${accentColor}20`
          }}
        >
          {/* Balloon Highlight */}
          <div className="balloon-highlight-modern"></div>
          
          {/* Balloon Shine */}
          <div className="balloon-shine-modern"></div>
          
          {/* Balloon Reflection */}
          <div className="balloon-reflection"></div>
        </div>
        
        {/* Balloon String */}
        <div className="balloon-string-modern"></div>
        
        {/* Balloon Knot */}
        <div 
          className="balloon-knot-modern" 
          style={{ backgroundColor: accentColor }}
        ></div>
        
        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="float-element float-1">✨</div>
          <div className="float-element float-2">💫</div>
          <div className="float-element float-3">🌟</div>
        </div>
      </div>

      {/* Burst Effect */}
      {isPopping && (
        <div className="burst-effect">
          {/* Pop Flash */}
          <div className="pop-flash"></div>
          
          {/* Balloon Fragments */}
          <div className="balloon-fragments">
            {[...Array(12)].map((_, i) => (
              <div
                key={`fragment-${i}`}
                className="fragment"
                style={{
                  backgroundColor: accentColor,
                  '--angle': `${i * 30}deg`,
                  '--distance': `${80 + Math.random() * 60}px`,
                  '--delay': `${Math.random() * 0.2}s`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Confetti */}
      {showConfetti && (
        <div className="confetti-burst-modern">
          {[...Array(40)].map((_, i) => {
            const colors = [accentColor, '#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF6347', '#9370DB', '#FFA500'];
            const shapes = ['circle', 'square', 'triangle', 'star'];
            return (
              <div
                key={`confetti-${i}`}
                className={`confetti-modern confetti-${shapes[i % 4]}`}
                style={{
                  backgroundColor: colors[i % colors.length],
                  '--angle': `${Math.random() * 360}deg`,
                  '--distance': `${100 + Math.random() * 150}px`,
                  '--delay': `${Math.random() * 0.8}s`,
                  '--rotation': `${Math.random() * 720}deg`,
                  '--scale': `${0.5 + Math.random() * 0.5}`
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {/* Interaction Hint */}
      {canClick && !isPopping && (
        <div className="interaction-hint-modern">
          <div className="hint-text-modern">🎈 Tap to pop! 🎈</div>
          <div className="hint-pulse-modern"></div>
        </div>
      )}

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

      <style jsx>{`
        .balloon-experience-container {
          position: relative;
          width: 300px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card-bg-strong);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--card-shadow-lg);
          border: var(--card-border-strong);
        }

        .dark-mode .hint-text-modern {
          color: #9ca3af;
        }

        /* Mobile Responsive Design */
        @media (max-width: 768px) {
          .balloon-experience-container {
            width: 90vw;
            max-width: 350px;
            height: 300px;
          }

          .balloon-body-modern {
            width: 120px;
            height: 150px;
          }

          .balloon-string-modern {
            width: 2px;
            height: 60px;
          }

          .balloon-basket-modern {
            width: 40px;
            height: 20px;
          }

          .message-card-balloon {
            width: 90vw;
            max-width: 320px;
            padding: 20px;
            margin: 20px;
          }

          .card-title-balloon {
            font-size: 18px;
            margin-bottom: 12px;
          }

          .card-message-balloon {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 16px;
          }

          .card-actions-balloon {
            flex-direction: column;
            gap: 12px;
          }

          .action-button-balloon {
            padding: 12px 20px;
            font-size: 14px;
            width: 100%;
          }

          .interaction-hint-modern {
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 300px;
          }

          .hint-text-modern {
            font-size: 14px;
            padding: 8px 12px;
          }
        }

        /* Small Mobile Devices */
        @media (max-width: 480px) {
          .balloon-experience-container {
            width: 95vw;
            max-width: 320px;
            height: 280px;
          }

          .balloon-body-modern {
            width: 100px;
            height: 130px;
          }

          .balloon-string-modern {
            width: 2px;
            height: 50px;
          }

          .balloon-basket-modern {
            width: 35px;
            height: 18px;
          }

          .message-card-balloon {
            width: 95vw;
            max-width: 95vw;
            padding: 16px;
            margin: 10px;
          }

          .card-title-balloon {
            font-size: 16px;
            margin-bottom: 10px;
          }

          .card-message-balloon {
            font-size: 13px;
            margin-bottom: 14px;
          }

          .card-actions-balloon {
            gap: 10px;
          }

          .action-button-balloon {
            padding: 10px 16px;
            font-size: 13px;
            min-height: 40px;
          }

          .interaction-hint-modern {
            bottom: -50px;
            width: 95%;
            max-width: 280px;
          }

          .hint-text-modern {
            font-size: 13px;
            padding: 6px 10px;
          }
        }

        /* Main Balloon */
        .balloon-main {
          position: relative;
          transition: transform 0.3s ease;
        }

        .balloon-main:hover {
          transform: scale(1.05) rotateY(5deg);
        }

        .balloon-main.popping {
          animation: balloon-pop 0.6s ease-out forwards;
        }

        /* Balloon Body - Modern Design */
        .balloon-body-modern {
          width: 140px;
          height: 180px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          position: relative;
          background: linear-gradient(135deg, var(--accent-color, #F59E0B) 0%, 
                                      var(--accent-color-light, #FCD34D) 30%, 
                                      var(--accent-color, #F59E0B) 100%);
          box-shadow: 
            0 12px 48px rgba(0, 0, 0, 0.15),
            inset -12px -12px 24px rgba(0, 0, 0, 0.1),
            inset 8px 8px 16px rgba(255, 255, 255, 0.3);
          animation: float-gentle 4s ease-in-out infinite;
        }

        .balloon-highlight-modern {
          position: absolute;
          top: 20%;
          left: 25%;
          width: 30px;
          height: 40px;
          background: radial-gradient(ellipse, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
          border-radius: 50%;
          transform: rotate(-20deg);
        }

        .balloon-shine-modern {
          position: absolute;
          top: 30%;
          left: 15%;
          width: 60px;
          height: 80px;
          background: radial-gradient(ellipse, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
          border-radius: 50%;
          transform: rotate(-15deg);
        }

        .balloon-reflection {
          position: absolute;
          top: 15%;
          right: 20%;
          width: 20px;
          height: 35px;
          background: linear-gradient(45deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
          border-radius: 50%;
          transform: rotate(15deg);
        }

        /* String and Knot */
        .balloon-string-modern {
          position: absolute;
          top: 180px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom, #64748b 0%, #475569 100%);
          border-radius: 1px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .balloon-knot-modern {
          position: absolute;
          top: 240px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        /* Floating Elements */
        .floating-elements {
          position: absolute;
          top: -40px;
          left: -40px;
          right: -40px;
          bottom: -40px;
          pointer-events: none;
        }

        .float-element {
          position: absolute;
          font-size: 16px;
          opacity: 0.7;
          animation: float-around 6s ease-in-out infinite;
        }

        .float-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .float-2 {
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }

        .float-3 {
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        /* Burst Effect */
        .burst-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .pop-flash {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          animation: flash-pop 0.3s ease-out forwards;
        }

        .balloon-fragments {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .fragment {
          position: absolute;
          width: 8px;
          height: 12px;
          border-radius: 2px;
          animation: fragment-burst 1s ease-out forwards;
          transform-origin: center;
        }

        /* Enhanced Confetti */
        .confetti-burst-modern {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .confetti-modern {
          position: absolute;
          width: 8px;
          height: 8px;
          animation: confetti-burst 2.5s ease-out forwards;
        }

        .confetti-circle {
          border-radius: 50%;
        }

        .confetti-square {
          border-radius: 1px;
        }

        .confetti-triangle {
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 8px solid;
          background: transparent !important;
        }

        .confetti-star {
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }

        /* Interaction Hint */
        .interaction-hint-modern {
          position: absolute;
          bottom: -80px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          pointer-events: none;
        }

        .hint-text-modern {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #64748b;
          margin-bottom: 8px;
          animation: hint-pulse 2s ease-in-out infinite;
        }

        .hint-pulse-modern {
          width: 24px;
          height: 24px;
          background: rgba(245, 158, 11, 0.3);
          border-radius: 50%;
          margin: 0 auto;
          animation: ripple-pulse 2s ease-in-out infinite;
        }

        /* Message Card */
        .message-card-balloon {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 320px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          box-shadow: 
            0 12px 48px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          transform: translate(-50%, -50%) scale(0.8) translateY(40px);
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          z-index: 10000;
        }

        .dark-mode .message-card-balloon {
          background: rgba(30, 41, 59, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.3);
          box-shadow: 
            0 12px 48px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .message-card-balloon.visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1) translateY(0);
          pointer-events: all;
        }

        .card-content-balloon {
          text-align: center;
          padding: 32px;
        }

        .card-icon-balloon {
          font-size: 48px;
          margin-bottom: 20px;
          animation: bounce-gentle 2s ease infinite;
        }

        .card-title-balloon {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          color: #1e293b;
          font-size: 22px;
          margin-bottom: 16px;
        }

        .dark-mode .card-title-balloon {
          color: #f1f5f9;
        }

        .card-message-balloon {
          font-family: 'Inter', sans-serif;
          color: #64748b;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .dark-mode .card-message-balloon {
          color: #cbd5e1;
        }

        .card-actions-balloon {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .action-button-balloon {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .start-over-button {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #475569;
        }

        .dark-mode .start-over-button {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          color: #f1f5f9;
        }

        .start-over-button:hover {
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .dark-mode .start-over-button:hover {
          background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .give-another-button {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
        }

        .give-another-button:hover {
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
        }

        /* Animations */
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }

        @keyframes float-around {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: translate(10px, -15px) scale(1.1);
            opacity: 1;
          }
        }

        @keyframes balloon-pop {
          0% { transform: scale(1); }
          30% { transform: scale(1.2); }
          60% { transform: scale(0.8); }
          100% { 
            transform: scale(0);
            opacity: 0;
          }
        }

        @keyframes flash-pop {
          0% { 
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        @keyframes fragment-burst {
          0% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% { 
            transform: translate(calc(cos(var(--angle)) * var(--distance)), 
                               calc(sin(var(--angle)) * var(--distance))) 
                      rotate(720deg) scale(0);
            opacity: 0;
          }
        }

        @keyframes confetti-burst {
          0% { 
            transform: translate(0, 0) rotate(0deg) scale(var(--scale));
            opacity: 1;
          }
          100% { 
            transform: translate(calc(cos(var(--angle)) * var(--distance)), 
                               calc(sin(var(--angle)) * var(--distance) + 200px)) 
                      rotate(var(--rotation)) scale(0);
            opacity: 0;
          }
        }

        @keyframes hint-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes ripple-pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes bounce-gentle {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
