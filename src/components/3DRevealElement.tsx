'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import TreasureChest from './3DTreasureChest';
import Balloon from './3DBalloon';
import Stamp from './3DStamp';
import WarmCup from './3DWarmCup';
import Window from './3DWindow';
import Bandage from './3DBandage';
import LightSwitch from './3DLightSwitch';
import Sticker from './3DSticker';
import Envelope from './3DEnvelope';
import RibbonSlide from './3DRibbonSlide';
import GlowPatch from './3DGlowPatch';
import AutoFlip from './3DAutoFlip';
import PlayingCard from './3DPlayingCard';

interface RevealElementProps {
  revealType: string;
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
  message?: string;
  action?: string;
  actionType?: string;
  onStartOver?: () => void;
  onTryAnother?: () => void;
  mood?: string | null;
  onPlayNarration?: (
    message: string,
    actionType?: string,
    overrideMood?: string | null,
    overrideContext?: string | null,
    audioIndexOverride?: number | null,
    preferExact?: boolean
  ) => void;
  context?: string | null;
  audioIndex?: number;
}

export default function RevealElement({ 
  revealType, 
  isRevealed, 
  onReveal, 
  accentColor, 
  animationSpeed,
  message,
  action,
  actionType,
  onStartOver,
  onTryAnother,
  mood,
  onPlayNarration,
  context,
  audioIndex,
}: RevealElementProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleReveal = () => {
    setIsAnimating(true);
    onReveal();
  };

  // Avoid dimming overlay for treasure-chest, playing-card, balloon, envelope, and bandage so the screen doesn't get dull
  const shouldShowOverlay = isRevealed && isMounted && !['treasure-chest', 'playing-card', 'balloon', 'balloon-pop', 'envelope', 'bandage'].includes(revealType);
  const overlay = shouldShowOverlay
    ? createPortal(
        <div className="reveal-overlay" aria-hidden="true" />,
        document.body
      )
    : null;

  // Render the appropriate 3D element based on reveal type
  const renderElement = () => {
    const handleCustomNarration = (
      fallbackMessage: string,
      fallbackActionType?: string,
      overrideMood?: string | null,
      overrideContext?: string | null,
      audioIndexOverride?: number | null,
      preferExact?: boolean
    ) => {
      if (!onPlayNarration) return;
      const resolvedIndex = (audioIndexOverride ?? audioIndex) ?? null;
      onPlayNarration(
        fallbackMessage,
        fallbackActionType,
        mood ?? overrideMood ?? null,
        context ?? overrideContext ?? null,
        resolvedIndex,
        preferExact
      );
    };

    switch (revealType) {
      case 'treasure-chest':
        return (
          <TreasureChest
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
            message={message ?? ''}
            action={action ?? ''}
            actionType={actionType}
            onStartOver={onStartOver}
            onTryAnother={onTryAnother}
            onPlayNarration={handleCustomNarration}
            mood={mood ?? undefined}
            context={context ?? undefined}
            audioIndex={audioIndex}
          />
        );
      
      case 'balloon':
        return (
          <Balloon
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
            onPlayNarration={handleCustomNarration}
            mood={mood ?? undefined}
            context={context ?? undefined}
            message={message ?? ''}
            action={action ?? ''}
            actionType={actionType}
            onStartOver={onStartOver}
            onTryAnother={onTryAnother}
            audioIndex={audioIndex}
          />
        );
      
      case 'balloon-pop':
        return (
          <Balloon
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
            onPlayNarration={handleCustomNarration}
            mood={mood ?? undefined}
            context={context ?? undefined}
            message={message ?? ''}
            action={action ?? ''}
            actionType={actionType}
            onStartOver={onStartOver}
            onTryAnother={onTryAnother}
            audioIndex={audioIndex}
          />
        );
      
      case 'envelope':
        return (
          <Envelope
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
            onPlayNarration={handleCustomNarration}
            message={message ?? ''}
            action={action ?? ''}
            actionType={actionType}
            onStartOver={onStartOver}
            onTryAnother={onTryAnother}
          />
        );
      
      case 'ribbon-slide':
        return (
          <RibbonSlide
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
          />
        );
      
      case 'glow-patch':
        return (
          <GlowPatch
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
          />
        );
      
      case 'auto-flip':
        return (
          <AutoFlip
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
            message={message ?? ''}
            action={action ?? ''}
            actionType={actionType as 'ACTION' | 'REPEAT' | 'VISUALIZE' | 'BREATHE' | 'LISTEN'}
            onStartOver={onStartOver}
            onTryAnother={onTryAnother}
            onPlayNarration={handleCustomNarration}
            mood={mood ?? undefined}
            context={context ?? undefined}
          />
        );
      
      case 'playing-card':
        return (
          <PlayingCard
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
            message={message ?? ''}
            action={action ?? ''}
            actionType={actionType as 'ACTION' | 'REPEAT' | 'VISUALIZE' | 'BREATHE' | 'LISTEN'}
            onStartOver={onStartOver}
            onTryAnother={onTryAnother}
            mood={mood ?? undefined}
            onPlayNarration={handleCustomNarration}
            context={context ?? undefined}
            audioIndex={audioIndex}
          />
        );
      
      case 'stamp':
        return (
          <Stamp
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
          />
        );
      
      case 'warm-cup':
        return (
          <WarmCup
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
          />
        );
      
      case 'window-wipe':
        return (
          <Window
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
          />
        );
      
      case 'bandage':
        return (
          <Bandage
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
            onPlayNarration={handleCustomNarration}
            mood={mood ?? undefined}
            context={context ?? undefined}
            message={message ?? ''}
            action={action ?? ''}
            actionType={actionType}
            onStartOver={onStartOver}
            onTryAnother={onTryAnother}
          />
        );
      
      case 'light-switch':
        return (
          <LightSwitch
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
          />
        );
      
      case 'sticker':
        return (
          <Sticker
            isRevealed={isRevealed}
            onReveal={handleReveal}
            accentColor={accentColor}
            animationSpeed={animationSpeed}
          />
        );
      
      default:
        // Fallback to a simple animated element for unknown types
        return (
          <div 
            className="fallback-reveal-element"
            onClick={handleReveal}
            style={{ 
              cursor: isRevealed ? 'default' : 'pointer',
              backgroundColor: accentColor,
              color: 'white',
              padding: '2rem',
              borderRadius: '16px',
              textAlign: 'center',
              fontSize: '3rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              transform: isRevealed ? 'scale(1.1)' : 'scale(1)',
              filter: isRevealed ? 'brightness(1.2)' : 'brightness(1)'
            }}
          >
            ✨
            {!isRevealed && (
              <div style={{ fontSize: '1rem', marginTop: '1rem', opacity: 0.8 }}>
                Tap to reveal
              </div>
            )}
          </div>
        );
    }
  };

  const element = renderElement();

  // Return element directly without wrapper container
  return (
    <>
      {overlay}
      {element}
    </>
  );
}
