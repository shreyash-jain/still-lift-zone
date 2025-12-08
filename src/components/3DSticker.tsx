'use client';

import { useState, useEffect } from 'react';

interface StickerProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
}

export default function Sticker({ isRevealed, onReveal, accentColor, animationSpeed }: StickerProps) {
  const [isPeeling, setIsPeeling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPeeled, setIsPeeled] = useState(false);

  const handleClick = () => {
    if (!isRevealed && !isPeeling) {
      setIsPeeling(true);
      setIsPeeled(true);
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
    if (isPeeling) {
      const timer = setTimeout(() => {
        setIsPeeling(false);
      }, getAnimationDuration());
      return () => clearTimeout(timer);
    }
  }, [isPeeling, animationSpeed]);

  return (
    <div 
      className="sticker-container"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isRevealed ? 'default' : 'pointer' }}
    >
      {/* 3D Sticker */}
      <div className={`sticker ${isPeeling ? 'peeling' : ''} ${isRevealed ? 'revealed' : ''} ${isHovered ? 'hovered' : ''} ${isPeeled ? 'peeled' : ''}`}>
        {/* Sticker Base */}
        <div className="sticker-base" style={{ backgroundColor: accentColor }}>
          <div className="base-shadow"></div>
          <div className="base-highlight"></div>
          <div className="base-pattern">★</div>
        </div>
        
        {/* Sticker Adhesive */}
        <div className="sticker-adhesive">
          <div className="adhesive-surface"></div>
          <div className="adhesive-shine"></div>
        </div>
        
        {/* Peel Animation */}
        <div className="peel-animation">
          <div className="peel-corner peel-corner-1" style={{ backgroundColor: accentColor }}></div>
          <div className="peel-corner peel-corner-2" style={{ backgroundColor: accentColor }}></div>
          <div className="peel-corner peel-corner-3" style={{ backgroundColor: accentColor }}></div>
          <div className="peel-corner peel-corner-4" style={{ backgroundColor: accentColor }}></div>
        </div>
        
        {/* Peel Lines */}
        <div className="peel-lines">
          <div className="peel-line peel-line-1" style={{ backgroundColor: accentColor }}></div>
          <div className="peel-line peel-line-2" style={{ backgroundColor: accentColor }}></div>
          <div className="peel-line peel-line-3" style={{ backgroundColor: accentColor }}></div>
        </div>
        
        {/* Sticker Sparkles */}
        <div className="sticker-sparkles">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">✨</div>
          <div className="sparkle sparkle-3">✨</div>
        </div>
        
        {/* Sticker Glow */}
        <div className="sticker-glow" style={{ backgroundColor: accentColor }}></div>
        
        {/* Surface Shadow */}
        <div className="surface-shadow"></div>
      </div>
      
      {/* Tap Hint */}
      {!isRevealed && !isPeeling && (
        <div className="tap-hint">
          <span className="hint-text">Tap to peel</span>
          <span className="hint-sparkles">✨</span>
        </div>
      )}
    </div>
  );
}
