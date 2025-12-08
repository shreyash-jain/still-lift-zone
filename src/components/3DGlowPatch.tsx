'use client';

import { useState, useEffect } from 'react';

interface GlowPatchProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
}

export default function GlowPatch({ 
  isRevealed, 
  onReveal, 
  accentColor, 
  animationSpeed 
}: GlowPatchProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [glowExpanded, setGlowExpanded] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);

  const handleClick = () => {
    if (isAnimating || isRevealed) return;
    
    setIsAnimating(true);
    setGlowExpanded(true);
    
    // Wait for glow animation, then show message
    setTimeout(() => {
      setMessageVisible(true);
      onReveal();
    }, 500);
  };

  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case 'instant': return 100;
      case 'quick': return 300;
      case 'gentle': return 800;
      case 'rich': return 600;
      default: return 500;
    }
  };

  return (
    <div 
      className={`glow-patch-container ${isRevealed ? 'revealed' : ''}`}
      onClick={handleClick}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
    >
      {/* Message Card Base */}
      <div className="message-card-base">
        <div className="card-front">
          <div className="card-content">
            <div className="card-icon">💌</div>
            <div className="card-title">Your Message</div>
            <div className="card-subtitle">Tap the glowing area</div>
          </div>
        </div>
      </div>

      {/* Glow Patch */}
      <div className={`glow-patch ${glowExpanded ? 'expanded' : ''}`}>
        <div className="glow-core"></div>
        <div className="glow-rings">
          <div className="glow-ring ring-1"></div>
          <div className="glow-ring ring-2"></div>
          <div className="glow-ring ring-3"></div>
        </div>
        <div className="glow-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
        </div>
      </div>

      {/* Revealed Message */}
      <div className={`revealed-message ${messageVisible ? 'visible' : ''}`}>
        <div className="message-content">
          <div className="message-icon">✨</div>
          <div className="message-text">Your personalized message is ready!</div>
        </div>
      </div>

      {/* Click Prompt */}
      {!isRevealed && !isAnimating && (
        <div className="click-prompt">
          <span>Tap the glowing area</span>
        </div>
      )}

      <style jsx>{`
        .glow-patch-container {
          position: relative;
          width: 200px;
          height: 150px;
          cursor: pointer;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .message-card-base {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .card-front {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateZ(2px);
        }

        .card-content {
          text-align: center;
          padding: 20px;
        }

        .card-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .card-title {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          color: #1e293b;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .card-subtitle {
          font-family: 'Inter', sans-serif;
          color: #64748b;
          font-size: 12px;
        }

        .glow-patch {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-style: preserve-3d;
          z-index: 1000;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glow-patch.expanded {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0;
        }

        .glow-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: var(--accent-color);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 20px var(--accent-color);
          animation: pulse 2s ease-in-out infinite;
        }

        .glow-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .glow-ring {
          position: absolute;
          border: 2px solid var(--accent-color);
          border-radius: 50%;
          opacity: 0.6;
          animation: expand 2s ease-in-out infinite;
        }

        .ring-1 {
          width: 40px;
          height: 40px;
          animation-delay: 0s;
        }

        .ring-2 {
          width: 60px;
          height: 60px;
          animation-delay: 0.3s;
        }

        .ring-3 {
          width: 80px;
          height: 80px;
          animation-delay: 0.6s;
        }

        .glow-particles {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--accent-color);
          border-radius: 50%;
          animation: float 3s ease-in-out infinite;
        }

        .particle-1 {
          top: -30px;
          left: -30px;
          animation-delay: 0s;
        }

        .particle-2 {
          top: -30px;
          right: -30px;
          animation-delay: 0.5s;
        }

        .particle-3 {
          bottom: -30px;
          left: -30px;
          animation-delay: 1s;
        }

        .particle-4 {
          bottom: -30px;
          right: -30px;
          animation-delay: 1.5s;
        }

        .revealed-message {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border: 2px solid var(--accent-color);
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        .revealed-message.visible {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        .message-content {
          text-align: center;
          padding: 20px;
        }

        .message-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .message-text {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          color: #1e293b;
          font-size: 14px;
          line-height: 1.4;
        }

        .click-prompt {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          color: #64748b;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          opacity: 0.8;
          pointer-events: none;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 20px var(--accent-color);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            box-shadow: 0 0 30px var(--accent-color);
          }
        }

        @keyframes expand {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.8;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .glow-patch-container:hover .glow-core {
          transform: translate(-50%, -50%) scale(1.3);
          box-shadow: 0 0 30px var(--accent-color);
          transition: all 0.2s ease;
        }

        .glow-patch-container:hover .glow-rings {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

