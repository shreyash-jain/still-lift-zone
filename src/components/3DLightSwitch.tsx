'use client';

import { useState, useEffect } from 'react';

interface LightSwitchProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
}

export default function LightSwitch({ isRevealed, onReveal, accentColor, animationSpeed }: LightSwitchProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOn, setIsOn] = useState(false);

  const handleClick = () => {
    if (!isRevealed && !isFlipping) {
      setIsFlipping(true);
      setIsOn(true);
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
    if (isFlipping) {
      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, getAnimationDuration());
      return () => clearTimeout(timer);
    }
  }, [isFlipping, animationSpeed]);

  return (
    <div 
      className="light-switch-container"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: isRevealed ? 'default' : 'pointer' }}
    >
      {/* 3D Light Switch */}
      <div className={`light-switch ${isFlipping ? 'flipping' : ''} ${isRevealed ? 'revealed' : ''} ${isHovered ? 'hovered' : ''} ${isOn ? 'on' : ''}`}>
        {/* Switch Plate */}
        <div className="switch-plate" style={{ backgroundColor: accentColor }}>
          <div className="plate-shadow"></div>
          <div className="plate-highlight"></div>
          <div className="plate-screw plate-screw-1"></div>
          <div className="plate-screw plate-screw-2"></div>
        </div>
        
        {/* Switch Toggle */}
        <div className="switch-toggle">
          <div className="toggle-handle" style={{ backgroundColor: accentColor }}>
            <div className="handle-shadow"></div>
            <div className="handle-highlight"></div>
          </div>
          <div className="toggle-base"></div>
        </div>
        
        {/* Light Rays */}
        <div className="light-rays">
          <div className="ray ray-1" style={{ backgroundColor: accentColor }}></div>
          <div className="ray ray-2" style={{ backgroundColor: accentColor }}></div>
          <div className="ray ray-3" style={{ backgroundColor: accentColor }}></div>
          <div className="ray ray-4" style={{ backgroundColor: accentColor }}></div>
          <div className="ray ray-5" style={{ backgroundColor: accentColor }}></div>
          <div className="ray ray-6" style={{ backgroundColor: accentColor }}></div>
        </div>
        
        {/* Light Particles */}
        <div className="light-particles">
          <div className="particle particle-1" style={{ backgroundColor: accentColor }}></div>
          <div className="particle particle-2" style={{ backgroundColor: accentColor }}></div>
          <div className="particle particle-3" style={{ backgroundColor: accentColor }}></div>
          <div className="particle particle-4" style={{ backgroundColor: accentColor }}></div>
          <div className="particle particle-5" style={{ backgroundColor: accentColor }}></div>
        </div>
        
        {/* Switch Glow */}
        <div className="switch-glow" style={{ backgroundColor: accentColor }}></div>
        
        {/* Wall Shadow */}
        <div className="wall-shadow"></div>
      </div>
      
      {/* Tap Hint */}
      {!isRevealed && !isFlipping && (
        <div className="tap-hint">
          <span className="hint-text">Tap to turn on</span>
          <span className="hint-sparkles">✨</span>
        </div>
      )}
    </div>
  );
}
