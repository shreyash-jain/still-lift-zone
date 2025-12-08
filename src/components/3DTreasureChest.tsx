'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { CONTENT_LIBRARY, Mood } from '@/lib/still-lift-content';
import ActionRevealCard from './ActionRevealCard';

const CHEST_ACTION_TYPE = 'ACTION';
const CHEST_MESSAGE_ACTION = "Practice gratitude by naming three things you appreciate right now";
const CHEST_MESSAGE_BODY = "Take a moment to appreciate this feeling. You're doing well, and that's worth celebrating.";

interface TreasureChestProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
  message?: string;
  action?: string;
  actionType?: string;
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
  audioIndex?: number;
}

export default function TreasureChest({ 
  isRevealed,
  onReveal,
  animationSpeed = 'gentle',
  message = CHEST_MESSAGE_BODY,
  action = CHEST_MESSAGE_ACTION,
  actionType = CHEST_ACTION_TYPE,
  onStartOver,
  onTryAnother,
  onPlayNarration,
  mood,
  context,
  audioIndex,
}: TreasureChestProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageEmerging, setMessageEmerging] = useState(false);
  const [chestHidden, setChestHidden] = useState(false);
  const [canClick, setCanClick] = useState(true);
  const [messageStaysPermanent, setMessageStaysPermanent] = useState(false);
  const [messageStatic, setMessageStatic] = useState(false);
  const [showTreasureCard, setShowTreasureCard] = useState(false);
  const [treasureCardEmerging, setTreasureCardEmerging] = useState(false);
  const [treasureCardFullyRevealed, setTreasureCardFullyRevealed] = useState(false);
  const [treasureCardStatic, setTreasureCardStatic] = useState(false);
  const hasAnnouncedReveal = useRef(false);
  const hasNarrated = useRef(false);
  const hasAutoRevealed = useRef(false);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);
  const [overrideActionType, setOverrideActionType] = useState<string | null>(null);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState<number | null>(null);
  const previousIndexRef = useRef<number | null>(null);

  const getDisplayActionType = (raw: string | null | undefined): string => {
    const value = (raw ?? '').toUpperCase();
    if (value === 'RECITE' || value === 'REPEAT/RECITE' || value === 'REPEAT') return 'REPEAT';
    return raw ?? 'ACTION';
  };

  const selectRandomForGoodSafe = useCallback(() => {
    if (mood === 'good' && context === 'still') {
      const actions = CONTENT_LIBRARY['good' as Mood]?.['still'];
      if (actions && actions.length > 0) {
        let randomIndex = Math.floor(Math.random() * actions.length);
        if (actions.length > 1 && previousIndexRef.current === randomIndex) {
          randomIndex = (randomIndex + 1) % actions.length;
        }
        previousIndexRef.current = randomIndex;
        const picked = actions[randomIndex];
        setOverrideMessage(picked.message);
        setOverrideActionType(picked.actionType || 'ACTION');
        setSelectedAudioIndex(picked.audioIndex);
      }
      return true;
    }
    return false;
  }, [mood, context, onPlayNarration]);

  // Animation duration based on speed
  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case 'instant': return 200;
      case 'quick': return 600;
      case 'gentle': return 1000;
      case 'rich': return 1500;
      default: return 1000;
    }
  };

  const handleClick = useCallback(() => {
    if (!canClick || isOpening) return;
    
    console.log('TreasureChest: Click detected, starting animation');
    setCanClick(false);
    setIsOpening(true);
    
    // If specifically Good + Still and Safe, choose a random action and map audio index
    if (selectRandomForGoodSafe()) {
      // already set overrides and triggered audio via narrator
    } else {
      // For other combos, clear overrides so props flow through
      setOverrideMessage(null);
      setOverrideActionType(null);
      // Use audioIndex prop if available, otherwise null
      setSelectedAudioIndex(audioIndex ?? null);
    }

    const duration = getAnimationDuration();
    
    // Chest opens
    setTimeout(() => {
      setIsOpened(true);
      setShowCoins(true);
      console.log('TreasureChest: Chest opened, showing coins');
    }, duration * 0.3);
    
    // Message starts emerging from chest
    setTimeout(() => {
      setMessageEmerging(true);
      console.log('TreasureChest: Message emerging from chest');
    }, duration * 0.6);
    
    // Message fully appears and becomes impactful
    setTimeout(() => {
      setShowMessage(true);
      setIsOpening(false);
      console.log('TreasureChest: Message fully revealed');
    }, duration * 1.0);
    
    // Message becomes static at impactful size
    setTimeout(() => {
      setMessageStatic(true);
      console.log('TreasureChest: Message now static and impactful');
    }, duration * 1.1);
    
    // Chest disappears completely, but message stays static
    setTimeout(() => {
      setChestHidden(true);
      console.log('TreasureChest: Chest hidden, message remains static');
    }, duration * 1.3);
    
    // Message becomes permanent - never disappears
    setTimeout(() => {
      setMessageStaysPermanent(true);
      // Show treasure card after animation completes
      setShowTreasureCard(true);
      setTreasureCardEmerging(true);
      // Don't call onReveal() to prevent message from disappearing
      console.log('TreasureChest: Animation complete, message permanent and static');
    }, duration * 1.5);
    
    // Treasure card fully revealed
    setTimeout(() => {
      setTreasureCardFullyRevealed(true);
      setTreasureCardEmerging(false);
    }, duration * 1.7);
    
    // Treasure card becomes static
    setTimeout(() => {
      setTreasureCardStatic(true);
    }, duration * 1.9);
    
  }, [canClick, isOpening, onReveal, animationSpeed, mood, context, selectRandomForGoodSafe, audioIndex]);

  useEffect(() => {
    if (!hasAnnouncedReveal.current && (showMessage || messageStaysPermanent)) {
      hasAnnouncedReveal.current = true;
      onReveal();
    }
  }, [showMessage, messageStaysPermanent, onReveal]);

  useEffect(() => {
    if (!isRevealed || hasAutoRevealed.current || showMessage || messageStaysPermanent) {
      return;
    }

    hasAutoRevealed.current = true;
    setCanClick(false);
    setIsOpening(false);
    setIsOpened(true);
    setShowCoins(false);
    setMessageEmerging(true);
    setShowMessage(true);
    setMessageStatic(true);
    setMessageStaysPermanent(true);
    setChestHidden(true);
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

    if (!hasAnnouncedReveal.current) {
      hasAnnouncedReveal.current = true;
      onReveal();
    }
  }, [isRevealed, showMessage, messageStaysPermanent, onReveal]);

  useEffect(() => {
    hasAutoRevealed.current = false;
    // Reset narration flag when message source changes
    hasNarrated.current = false;
  }, [message, action, overrideMessage, overrideActionType]);

  useEffect(() => {
    if (!messageStaysPermanent || hasNarrated.current) return;
    if (!onPlayNarration) return;

    const finalMessage = overrideMessage ?? message;
    const finalActionType = overrideActionType ?? actionType;
    const audioIndexOverride = selectedAudioIndex ?? null;
    const preferExact = audioIndexOverride !== null;

    onPlayNarration(finalMessage, finalActionType, mood ?? null, context ?? null, audioIndexOverride, preferExact);
    hasNarrated.current = true;
  }, [messageStaysPermanent, onPlayNarration, message, actionType, mood, context, overrideMessage, overrideActionType, selectedAudioIndex]);

  const handleReplay = () => {
    console.log('TreasureChest: Replay clicked');
    // Don't reset the message if it's already permanent
    if (!messageStaysPermanent) {
      setIsOpening(false);
      setIsOpened(false);
      setShowCoins(false);
      setShowMessage(false);
      setMessageEmerging(false);
      setChestHidden(false);
      setCanClick(true);
    } else {
      // If message is permanent, just reset the chest states
      setIsOpening(false);
      setIsOpened(false);
      setShowCoins(false);
      setChestHidden(false);
      setCanClick(true);
      // Keep message visible permanently
      setShowMessage(true);
      setMessageEmerging(true);
    }
  };

  const handleTryAnotherClick = () => {
    // For Good + Still: re-randomize in place and play matching audio
    if (selectRandomForGoodSafe()) {
      // Ensure the treasure card remains visible
      setShowTreasureCard(true);
      setTreasureCardEmerging(true);
      setTimeout(() => {
        setTreasureCardFullyRevealed(true);
        setTreasureCardEmerging(false);
      }, 300);
      setTimeout(() => {
        setTreasureCardStatic(true);
      }, 600);
      setIsOpening(false);
      setIsOpened(true);
      setShowCoins(false);
      setMessageEmerging(true);
      setShowMessage(true);
      setMessageStatic(true);
      setMessageStaysPermanent(true);
      setChestHidden(true);
      setCanClick(true);
      return;
    }
    // Fallback to parent behavior for other contexts
    if (onTryAnother) {
      onTryAnother();
    } else {
      handleReplay();
    }
  };



  return (
    <div className="treasure-chest-container">
      {/* Treasure Chest - Lottie Style */}
      <div 
        className={`treasure-chest ${isOpening ? 'opening' : ''} ${isOpened ? 'opened' : ''} ${chestHidden ? 'hidden' : ''}`}
        onClick={handleClick}
      >
        {/* Chest Base - Simple Rectangle */}
        <div className="chest-base">
          {/* Base rectangle */}
          <div className="base-rect"></div>
          
          {/* Lock */}
          <div className="chest-lock">
            <div className="lock-body">🔒</div>
          </div>
          
          {/* Chest decorative bands */}
          <div className="chest-band chest-band-1"></div>
          <div className="chest-band chest-band-2"></div>
        </div>
        
        {/* Chest Lid - Simple Rectangle */}
        <div className="chest-lid">
          <div className="lid-rect"></div>
          
          {/* Handle */}
          <div className="chest-handle"></div>
        </div>
        
        {/* Magical glow when opened */}
        <div className="magical-glow"></div>
      </div>

      {/* Coins */}
      {showCoins && (
        <div className="coins-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="coin"
              style={{
                left: `${45 + Math.random() * 10}%`,
                animationDelay: `${Math.random() * 800}ms`,
                animationDuration: `${1.2 + Math.random() * 0.8}s`
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}

      {/* Interaction Hint */}
      {canClick && !showMessage && (
        <div className="interaction-hint">
          <div className="hint-text">✨ Tap to open ✨</div>
          <div className="hint-pulse"></div>
        </div>
      )}

      {/* Treasure Card - Use shared component */}
      <ActionRevealCard
        message={!overrideMessage ? message : undefined}
        action={overrideMessage ?? action}
        actionType={overrideActionType ?? actionType}
        onStartOver={onStartOver}
        onTryAnother={handleTryAnotherClick}
        showCard={showTreasureCard}
        isEmerging={treasureCardEmerging}
        isFullyRevealed={treasureCardFullyRevealed}
        isStatic={treasureCardStatic}
      />

      <style jsx>{`
        .treasure-chest-container {
          position: relative;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card-bg-strong);
          border-radius: 20px;
          box-shadow: var(--card-shadow-lg);
          border: var(--card-border-strong);
        }

        .dark-mode .hint-text {
          color: #9ca3af;
          text-shadow: 
            0 0 8px rgba(255, 255, 255, 0.3),
            0 0 16px rgba(255, 255, 255, 0.2);
        }

        /* Mobile Responsive Design */
        @media (max-width: 768px) {
          .treasure-chest-container {
            width: 90vw;
            max-width: 350px;
            height: 250px;
          }

          .treasure-chest {
            width: 160px;
            height: 128px;
          }

          .chest-base {
            width: 160px;
            height: 96px;
          }

          .chest-lid {
            width: 160px;
            height: 32px;
          }

          .chest-lock {
            font-size: 20px;
          }

          .message-card {
            width: 90vw;
            max-width: 320px;
            padding: 20px;
            margin: 20px;
          }

          .message-title {
            font-size: 18px;
            margin-bottom: 12px;
          }

          .message-content {
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 16px;
          }

          .message-actions {
            flex-direction: column;
            gap: 12px;
          }

          .message-button {
            padding: 12px 20px;
            font-size: 14px;
            width: 100%;
          }

          .chest-hint {
            bottom: -80px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 300px;
          }

          .interaction-hint {
            bottom: -80px !important;
          }

          .hint-text {
            font-size: 14px;
            padding: 8px 12px;
          }
        }

        /* Small Mobile Devices */
        @media (max-width: 480px) {
          .treasure-chest-container {
            width: 95vw;
            max-width: 320px;
            height: 220px;
          }

          .treasure-chest {
            width: 140px;
            height: 112px;
          }

          .chest-base {
            width: 140px;
            height: 84px;
          }

          .chest-lid {
            width: 140px;
            height: 28px;
          }

          .chest-lock {
            font-size: 18px;
          }

          .message-card {
            width: 95vw;
            max-width: 95vw;
            padding: 16px;
            margin: 10px;
          }

          .message-title {
            font-size: 16px;
            margin-bottom: 10px;
          }

          .message-content {
            font-size: 13px;
            margin-bottom: 14px;
          }

          .message-actions {
            gap: 10px;
          }

          .message-button {
            padding: 10px 16px;
            font-size: 13px;
            min-height: 40px;
          }

          .chest-hint {
            bottom: -70px;
            width: 95%;
            max-width: 280px;
          }

          .interaction-hint {
            bottom: -70px !important;
          }

          .hint-text {
            font-size: 13px;
            padding: 6px 10px;
          }
        }

        .treasure-chest {
          position: relative;
          width: 200px;
          height: 160px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .treasure-chest:hover {
          transform: scale(1.05);
        }

        .treasure-chest.opening {
          animation: bounce 0.6s ease;
        }

        .treasure-chest.hidden {
          opacity: 0;
          transform: scale(0.8) translateY(50px);
          transition: all 1s ease-out;
          pointer-events: none;
        }

        /* Chest Base - Lottie Style Rectangle */
        .chest-base {
          position: absolute;
          bottom: 0;
          width: 200px;
          height: 120px;
        }

        .base-rect {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #B8860B 0%, #8B4513 50%, #654321 100%);
          border-radius: 10px;
          box-shadow: 
            0 6px 0 #4A3728,
            0 12px 24px rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 215, 0, 0.2);
          position: relative;
          border: 1px solid #654321;
        }

        .dark-mode .base-rect {
          background: linear-gradient(145deg, #92741A 0%, #6B3410 50%, #4A2C0A 100%);
          box-shadow: 
            0 6px 0 #2A1F14,
            0 12px 24px rgba(0, 0, 0, 0.6),
            inset 0 2px 4px rgba(255, 215, 0, 0.15);
          border: 1px solid #4A2C0A;
        }

        /* Decorative bands */
        .chest-band {
          position: absolute;
          width: 100%;
          height: 10px;
          background: linear-gradient(145deg, #4A3728 0%, #2F2317 100%);
          border-radius: 5px;
          box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.5),
            0 1px 0 rgba(255, 215, 0, 0.1);
        }

        .dark-mode .chest-band {
          background: linear-gradient(145deg, #2A1F14 0%, #1A1209 100%);
          box-shadow: 
            inset 0 1px 2px rgba(0, 0, 0, 0.7),
            0 1px 0 rgba(255, 215, 0, 0.05);
        }

        .chest-band-1 {
          top: 25%;
        }

        .chest-band-2 {
          top: 75%;
        }

        /* Lock - Simplified */
        .chest-lock {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
        }

        .lock-body {
          font-size: 32px;
          text-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.4),
            0 0 15px rgba(255, 215, 0, 0.7),
            0 0 25px rgba(255, 215, 0, 0.3);
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
        }

        .treasure-chest.opened .lock-body {
          opacity: 0;
          transform: scale(0.5);
        }

        /* Chest Lid - Lottie Style Rectangle */
        .chest-lid {
          position: absolute;
          top: 0;
          width: 200px;
          height: 40px;
          transform-origin: 0 100%;
          transition: transform 1s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .treasure-chest.opened .chest-lid {
          transform: rotateX(-110deg);
        }

        .lid-rect {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #DAA520 0%, #CD853F 50%, #A0522D 100%);
          border-radius: 10px;
          box-shadow: 
            0 3px 0 #8B4513,
            0 6px 18px rgba(0, 0, 0, 0.2),
            inset 0 1px 2px rgba(255, 215, 0, 0.3);
          position: relative;
          border: 1px solid #A0522D;
        }

        .dark-mode .lid-rect {
          background: linear-gradient(145deg, #B8901C 0%, #A86B2F 50%, #7D3F1A 100%);
          box-shadow: 
            0 3px 0 #5A2A0A,
            0 6px 18px rgba(0, 0, 0, 0.4),
            inset 0 1px 2px rgba(255, 215, 0, 0.2);
          border: 1px solid #7D3F1A;
        }

        /* Handle - Improved Design */
        .chest-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 36px;
          height: 12px;
          background: linear-gradient(145deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          border-radius: 6px;
          transform: translate(-50%, -50%);
          box-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          border: 1px solid #CC8400;
        }

        .dark-mode .chest-handle {
          background: linear-gradient(145deg, #D4AF37 0%, #DAA520 50%, #B8860B 100%);
          box-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3);
          border: 1px solid #8B6914;
        }

        /* Magical Glow Effect */
        .magical-glow {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
          border-radius: 20px;
          opacity: 0;
          animation: magical-pulse 2s ease-in-out infinite alternate;
        }

        .treasure-chest.opened .magical-glow {
          opacity: 1;
        }

        /* Coins */
        .coins-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .coin {
          position: absolute;
          font-size: 32px;
          top: 40%;
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
          text-shadow: 
            0 0 15px rgba(255, 215, 0, 0.8),
            0 0 25px rgba(255, 215, 0, 0.4);
          animation: coin-glow 2s ease-in-out infinite alternate;
        }

        .coin:nth-child(3n+1) {
          animation: coin-fly-1 2s ease-out forwards;
        }

        .coin:nth-child(3n+2) {
          animation: coin-fly-2 2.2s ease-out forwards;
        }

        .coin:nth-child(3n+3) {
          animation: coin-fly-3 1.8s ease-out forwards;
        }

        /* Interaction Hint */
        .interaction-hint {
          position: absolute;
          bottom: -80px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          pointer-events: none;
        }

        .hint-text {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #64748b;
          margin-bottom: 8px;
          animation: pulse 2s ease-in-out infinite;
          text-shadow: 
            0 0 8px rgba(255, 255, 255, 0.6),
            0 0 16px rgba(255, 255, 255, 0.3);
        }

        .hint-pulse {
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          margin: 0 auto;
          animation: ripple 2s ease-in-out infinite;
        }

        .dark-mode .hint-pulse {
          background: rgba(139, 92, 246, 0.4);
        }

        /* Treasure Message Scroll */
        .treasure-message-scroll {
          position: fixed;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 60px;
          transform: translate(-50%, -50%) scale(0.1) rotateY(45deg);
          opacity: 0;
          transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          pointer-events: none;
          /* Ensure message sits above all other elements - highest priority */
          z-index: 10000;
          isolation: isolate;
        }

        .treasure-message-scroll.emerging {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.6) rotateY(15deg);
        }

        .treasure-message-scroll.fully-revealed {
          opacity: 1;
          width: 95vw;
          max-width: 600px;
          height: auto;
          min-height: 400px;
          transform: translate(-50%, -50%) scale(1) rotateY(0deg);
          pointer-events: all;
        }

        .treasure-message-scroll.static {
          transition: none !important;
          transform: translate(-50%, -50%) scale(1) rotateY(0deg) !important;
          animation: none !important;
        }

        .scroll-container {
          width: 100%;
          height: 100%;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
          /* Removed backdrop blur to prevent dialog appearing blurred */
          z-index: 10001; /* one layer above the container */
          isolation: isolate;
        }

        .dark-mode .scroll-container {
          background: var(--card-bg-strong);
          border: var(--card-border-strong);
          box-shadow: var(--card-shadow-lg);
        }

        .dark-mode .scroll-container h2,
        .dark-mode .scroll-container p {
          color: #ffffff !important;
        }

        .dark-mode .treasure-message-scroll h2,
        .dark-mode .treasure-message-scroll p,
        body.dark-mode .treasure-message-scroll h2,
        body.dark-mode .treasure-message-scroll p,
        html.dark-mode .treasure-message-scroll h2,
        html.dark-mode .treasure-message-scroll p {
          color: #ffffff !important;
        }

        .scroll-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--card-bg);
          opacity: 0.1;
          pointer-events: none;
        }

        .scroll-header {
          text-align: center;
          padding: 20px 20px 15px;
          border-bottom: var(--card-border);
          margin-bottom: 20px;
          background: var(--card-bg);
          /* Ensure header content remains crisp */
          opacity: 1;
        }

        .treasure-gems {
          margin-bottom: 10px;
        }

        .gem {
          display: inline-block;
          margin: 0 12px;
          font-size: 28px;
          animation: sparkle 2s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          text-shadow: 
            0 0 10px rgba(255, 255, 255, 0.8),
            0 0 20px rgba(0, 191, 255, 0.6),
            0 0 30px rgba(0, 191, 255, 0.4);
        }

        .gem:nth-child(2) {
          animation-delay: 0.5s;
        }

        .gem:nth-child(3) {
          animation-delay: 1s;
        }

        .scroll-title {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 22px;
          color: #1e293b;
          text-shadow: 
            0.5px 0.5px 1px rgba(0, 0, 0, 0.05),
            0 0 10px rgba(255, 255, 255, 0.4);
          letter-spacing: 0.3px;
        }

        .dark-mode .scroll-title,
        body.dark-mode .scroll-title {
          color: #ffffff !important;
          text-shadow: 
            0.5px 0.5px 1px rgba(0, 0, 0, 0.3),
            0 0 10px rgba(255, 255, 255, 0.1);
        }

        .scroll-content {
          padding: 0 32px 24px;
          text-align: center;
        }

        .action-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 12px;
          font-weight: 700;
          color: white;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .treasure-action {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          color: #1e293b;
          font-size: 22px;
          line-height: 1.4;
          margin-bottom: 16px;
          text-shadow: none;
        }

        .dark-mode .treasure-action,
        body.dark-mode .treasure-action {
          color: #ffffff !important;
        }

        .treasure-message {
          font-family: 'Inter', sans-serif;
          color: #475569;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 24px;
          font-weight: 400;
          text-shadow: none;
          max-width: 88%;
          margin-left: auto;
          margin-right: auto;
        }

        .dark-mode .treasure-message,
        body.dark-mode .treasure-message {
          color: #ffffff !important;
          opacity: 0.9;
        }

        .treasure-divider {
          text-align: center;
          margin: 22px 0;
          font-size: 24px;
          color: #A59A8C;
          opacity: 0.8;
          text-shadow: 
            0 0 8px rgba(255, 215, 0, 0.4),
            0 0 16px rgba(255, 215, 0, 0.2);
          animation: divider-glow 3s ease-in-out infinite alternate;
        }

        .dark-mode .treasure-divider {
          color: #9ca3af;
          opacity: 0.9;
          text-shadow: 
            0 0 8px rgba(255, 215, 0, 0.6),
            0 0 16px rgba(255, 215, 0, 0.3);
        }


        .treasure-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 8px;
        }

        .treasure-btn {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 130px;
          justify-content: center;
          text-transform: capitalize;
          letter-spacing: 0.2px;
        }

        .treasure-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s;
        }

        .treasure-btn:hover::before {
          left: 100%;
        }

        .btn-icon {
          font-size: 20px;
          text-shadow: 
            0 0 8px rgba(255, 255, 255, 0.6),
            0 0 16px rgba(255, 255, 255, 0.3);
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
          transition: all 0.3s ease;
        }

        .treasure-btn:hover .btn-icon {
          transform: scale(1.1);
          text-shadow: 
            0 0 12px rgba(255, 255, 255, 0.8),
            0 0 24px rgba(255, 255, 255, 0.5);
        }

        .treasure-btn.primary {
          background: linear-gradient(135deg, #A59A8C 0%, #B8ADA0 50%, #CCC1B4 100%);
          color: #FDFDFC;
          border: 1px solid #8B8075;
          box-shadow: 
            0 4px 12px rgba(165, 154, 140, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        .treasure-btn.primary:hover {
          background: linear-gradient(135deg, #B8ADA0 0%, #CCC1B4 50%, #DDD2C5 100%);
          transform: translateY(-1px) scale(1.005);
          box-shadow: 
            0 6px 16px rgba(165, 154, 140, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.35);
        }

        .dark-mode .treasure-btn.primary {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
          color: #ffffff;
          border: 1px solid #2563eb;
          box-shadow: 
            0 4px 12px rgba(59, 130, 246, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
        }

        .dark-mode .treasure-btn.primary:hover {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
          transform: translateY(-1px) scale(1.005);
          box-shadow: 
            0 6px 16px rgba(59, 130, 246, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.25);
        }

        .treasure-btn.secondary {
          background: linear-gradient(135deg, #FAFAF8 0%, #F1F0ED 50%, #EDEAE5 100%);
          color: #4A453F;
          border: 1px solid #C5BDB1;
          box-shadow: 
            0 4px 12px rgba(197, 189, 177, 0.1),
            inset 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        .treasure-btn.secondary:hover {
          background: linear-gradient(135deg, #F1F0ED 0%, #EDEAE5 50%, #E8E4DF 100%);
          transform: translateY(-1px) scale(1.005);
          box-shadow: 
            0 6px 16px rgba(197, 189, 177, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.6);
        }

        .dark-mode .treasure-btn.secondary {
          background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
          color: #f9fafb;
          border: 1px solid #4b5563;
          box-shadow: 
            0 4px 12px rgba(31, 41, 59, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        .dark-mode .treasure-btn.secondary:hover {
          background: linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%);
          transform: translateY(-1px) scale(1.005);
          box-shadow: 
            0 6px 16px rgba(31, 41, 59, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.15);
        }

        .scroll-footer {
          padding: 12px;
          border-top: var(--card-border);
          background: var(--card-bg);
          /* Ensure footer content remains crisp */
          opacity: 1;
        }

        .golden-border {
          height: 2px;
          background: var(--card-border);
          border-radius: 1px;
          box-shadow: var(--card-shadow);
        }

        /* Animations */
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-8px) scale(1.02); }
          60% { transform: translateY(-4px) scale(1.01); }
        }

        @keyframes magical-pulse {
          0% { 
            opacity: 0.4;
            transform: scale(1);
          }
          100% { 
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes coin-fly-1 {
          0% {
            transform: translateY(0) translateX(0) scale(1) rotateZ(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(-80px) translateX(30px) scale(1.2) rotateZ(180deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-120px) translateX(50px) scale(1.1) rotateZ(360deg);
            opacity: 0.9;
          }
          75% {
            transform: translateY(-40px) translateX(70px) scale(0.9) rotateZ(540deg);
            opacity: 0.6;
          }
          100% {
            transform: translateY(150px) translateX(100px) scale(0.7) rotateZ(720deg);
            opacity: 0;
          }
        }

        @keyframes coin-fly-2 {
          0% {
            transform: translateY(0) translateX(0) scale(1) rotateZ(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(-90px) translateX(-25px) scale(1.1) rotateZ(200deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-130px) translateX(-45px) scale(1.0) rotateZ(400deg);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-50px) translateX(-65px) scale(0.8) rotateZ(600deg);
            opacity: 0.5;
          }
          100% {
            transform: translateY(160px) translateX(-90px) scale(0.6) rotateZ(800deg);
            opacity: 0;
          }
        }

        @keyframes coin-fly-3 {
          0% {
            transform: translateY(0) translateX(0) scale(1) rotateZ(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(-70px) translateX(15px) scale(1.3) rotateZ(160deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-110px) translateX(25px) scale(1.2) rotateZ(320deg);
            opacity: 0.9;
          }
          75% {
            transform: translateY(-30px) translateX(35px) scale(1.0) rotateZ(480deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(140px) translateX(60px) scale(0.8) rotateZ(640deg);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes coin-glow {
          0% {
            text-shadow: 
              0 0 15px rgba(255, 215, 0, 0.8),
              0 0 25px rgba(255, 215, 0, 0.4);
            transform: scale(1);
          }
          100% {
            text-shadow: 
              0 0 20px rgba(255, 215, 0, 1),
              0 0 35px rgba(255, 215, 0, 0.6),
              0 0 45px rgba(255, 215, 0, 0.3);
            transform: scale(1.05);
          }
        }

        @keyframes divider-glow {
          0% {
            text-shadow: 
              0 0 8px rgba(255, 215, 0, 0.4),
              0 0 16px rgba(255, 215, 0, 0.2);
            transform: scale(1);
          }
          100% {
            text-shadow: 
              0 0 12px rgba(255, 215, 0, 0.6),
              0 0 24px rgba(255, 215, 0, 0.4),
              0 0 32px rgba(255, 215, 0, 0.2);
            transform: scale(1.1);
          }
        }

        /* AGGRESSIVE DARK MODE OVERRIDES */
        .dark-mode .treasure-message-scroll .scroll-title,
        .dark-mode .treasure-message-scroll .treasure-action,
        .dark-mode .treasure-message-scroll .treasure-message,
        .dark-mode .treasure-message-scroll h2,
        .dark-mode .treasure-message-scroll p,
        body.dark-mode .treasure-message-scroll .scroll-title,
        body.dark-mode .treasure-message-scroll .treasure-action,
        body.dark-mode .treasure-message-scroll .treasure-message,
        body.dark-mode .treasure-message-scroll h2,
        body.dark-mode .treasure-message-scroll p,
        html.dark-mode .treasure-message-scroll .scroll-title,
        html.dark-mode .treasure-message-scroll .treasure-action,
        html.dark-mode .treasure-message-scroll .treasure-message,
        html.dark-mode .treasure-message-scroll h2,
        html.dark-mode .treasure-message-scroll p {
          color: #ffffff !important;
        }

        .dark-mode .treasure-message-scroll .treasure-message,
        .dark-mode .treasure-message-scroll p {
          opacity: 0.95 !important;
        }
      `}</style>
    </div>
  );
}
