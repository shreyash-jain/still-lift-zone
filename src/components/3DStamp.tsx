'use client';

import { useState, useEffect } from 'react';

interface StampProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
}

export default function Stamp({ isRevealed, onReveal, accentColor, animationSpeed }: StampProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!isRevealed && !isPressing) {
      setIsPressing(true);
      setIsPressed(true);
      onReveal();
    }
  };

  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case 'instant': return 100;
      case 'quick': return 300;
      case 'gentle': return 800;
      case 'rich': return 1200;
      default: return 600;
    }
  };

  useEffect(() => {
    if (isPressing) {
      const timer = setTimeout(() => {
        setIsPressing(false);
      }, getAnimationDuration());
      return () => clearTimeout(timer);
    }
  }, [isPressing, animationSpeed]);

  return (
    <div 
      className="stamp-container"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isRevealed ? 'default' : 'pointer' }}
    >
      {/* 3D Stamp */}
      <div className={`stamp ${isPressing ? 'pressing' : ''} ${isRevealed ? 'revealed' : ''} ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}>
        {/* Stamp Handle */}
        <div className="stamp-handle" style={{ backgroundColor: accentColor }}>
          <div className="handle-grip"></div>
          <div className="handle-shadow"></div>
        </div>
        
        {/* Stamp Base */}
        <div className="stamp-base" style={{ backgroundColor: accentColor }}>
          <div className="base-shadow"></div>
          <div className="base-highlight"></div>
        </div>
        
        {/* Stamp Face */}
        <div className="stamp-face" style={{ backgroundColor: accentColor }}>
          <div className="face-pattern">★</div>
          <div className="face-shine"></div>
        </div>
        
        {/* Ink Pad */}
        <div className="ink-pad">
          <div className="ink-surface" style={{ backgroundColor: accentColor }}></div>
          <div className="ink-shadow"></div>
        </div>
        
        {/* Press Animation Elements */}
        <div className="press-elements">
          <div className="press-ink press-ink-1" style={{ backgroundColor: accentColor }}></div>
          <div className="press-ink press-ink-2" style={{ backgroundColor: accentColor }}></div>
          <div className="press-ink press-ink-3" style={{ backgroundColor: accentColor }}></div>
          <div className="press-ink press-ink-4" style={{ backgroundColor: accentColor }}></div>
        </div>
        
        {/* Stamp Glow */}
        <div className="stamp-glow" style={{ backgroundColor: accentColor }}></div>
      </div>
      
      {/* Tap Hint */}
      {!isRevealed && !isPressing && (
        <div className="tap-hint">
          <span className="hint-text">Tap to stamp</span>
          <span className="hint-sparkles">✨</span>
        </div>
      )}
    </div>
  );
}
