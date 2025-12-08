'use client';

import { useState, useEffect } from 'react';

interface WarmCupProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
}

export default function WarmCup({ isRevealed, onReveal, accentColor, animationSpeed }: WarmCupProps) {
  const [isSteaming, setIsSteaming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWarm, setIsWarm] = useState(false);

  const handleClick = () => {
    if (!isRevealed && !isSteaming) {
      setIsSteaming(true);
      setIsWarm(true);
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
    if (isSteaming) {
      const timer = setTimeout(() => {
        setIsSteaming(false);
      }, getAnimationDuration());
      return () => clearTimeout(timer);
    }
  }, [isSteaming, animationSpeed]);

  return (
    <div 
      className="warm-cup-container"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isRevealed ? 'default' : 'pointer' }}
    >
      {/* 3D Warm Cup */}
      <div className={`warm-cup ${isSteaming ? 'steaming' : ''} ${isRevealed ? 'revealed' : ''} ${isHovered ? 'hovered' : ''} ${isWarm ? 'warm' : ''}`}>
        {/* Cup Body */}
        <div className="cup-body" style={{ backgroundColor: accentColor }}>
          <div className="cup-highlight"></div>
          <div className="cup-shine"></div>
          <div className="cup-pattern"></div>
        </div>
        
        {/* Cup Handle */}
        <div className="cup-handle">
          <div className="handle-shadow"></div>
        </div>
        
        {/* Cup Rim */}
        <div className="cup-rim" style={{ backgroundColor: accentColor }}>
          <div className="rim-highlight"></div>
        </div>
        
        {/* Steam Animation */}
        <div className="steam-container">
          <div className="steam steam-1"></div>
          <div className="steam steam-2"></div>
          <div className="steam steam-3"></div>
          <div className="steam steam-4"></div>
        </div>
        
        {/* Warm Glow */}
        <div className="warm-glow" style={{ backgroundColor: accentColor }}></div>
        
        {/* Steam Particles */}
        <div className="steam-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
        
        {/* Cup Shadow */}
        <div className="cup-shadow"></div>
      </div>
      
      {/* Tap Hint */}
      {!isRevealed && !isSteaming && (
        <div className="tap-hint">
          <span className="hint-text">Tap to warm</span>
          <span className="hint-sparkles">✨</span>
        </div>
      )}
    </div>
  );
}
