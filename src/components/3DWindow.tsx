'use client';

import { useState, useEffect } from 'react';

interface WindowProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
}

export default function Window({ isRevealed, onReveal, accentColor, animationSpeed }: WindowProps) {
  const [isWiping, setIsWiping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClean, setIsClean] = useState(false);

  const handleClick = () => {
    if (!isRevealed && !isWiping) {
      setIsWiping(true);
      setIsClean(true);
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
    if (isWiping) {
      const timer = setTimeout(() => {
        setIsWiping(false);
      }, getAnimationDuration());
      return () => clearTimeout(timer);
    }
  }, [isWiping, animationSpeed]);

  return (
    <div 
      className="window-container"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isRevealed ? 'default' : 'pointer' }}
    >
      {/* 3D Window */}
      <div className={`window ${isWiping ? 'wiping' : ''} ${isRevealed ? 'revealed' : ''} ${isHovered ? 'hovered' : ''} ${isClean ? 'clean' : ''}`}>
        {/* Window Frame */}
        <div className="window-frame" style={{ backgroundColor: accentColor }}>
          <div className="frame-shadow"></div>
          <div className="frame-highlight"></div>
        </div>
        
        {/* Window Glass */}
        <div className="window-glass">
          <div className="glass-reflection"></div>
          <div className="glass-shine"></div>
        </div>
        
        {/* Window Sill */}
        <div className="window-sill" style={{ backgroundColor: accentColor }}>
          <div className="sill-shadow"></div>
        </div>
        
        {/* Dirt/Fog Layer */}
        <div className="dirt-layer">
          <div className="dirt-spot dirt-1"></div>
          <div className="dirt-spot dirt-2"></div>
          <div className="dirt-spot dirt-3"></div>
          <div className="dirt-spot dirt-4"></div>
          <div className="dirt-spot dirt-5"></div>
        </div>
        
        {/* Wipe Animation */}
        <div className="wipe-animation">
          <div className="wipe-line wipe-line-1" style={{ backgroundColor: accentColor }}></div>
          <div className="wipe-line wipe-line-2" style={{ backgroundColor: accentColor }}></div>
          <div className="wipe-line wipe-line-3" style={{ backgroundColor: accentColor }}></div>
        </div>
        
        {/* Clean Sparkles */}
        <div className="clean-sparkles">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">✨</div>
          <div className="sparkle sparkle-3">✨</div>
        </div>
        
        {/* Window Glow */}
        <div className="window-glow" style={{ backgroundColor: accentColor }}></div>
      </div>
      
      {/* Tap Hint */}
      {!isRevealed && !isWiping && (
        <div className="tap-hint">
          <span className="hint-text">Tap to clean</span>
          <span className="hint-sparkles">✨</span>
        </div>
      )}
    </div>
  );
}
