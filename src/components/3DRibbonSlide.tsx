'use client';

import { useState, useEffect } from 'react';

interface RibbonSlideProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
}

export default function RibbonSlide({ 
  isRevealed, 
  onReveal, 
  accentColor, 
  animationSpeed 
}: RibbonSlideProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [ribbonSlid, setRibbonSlid] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);

  const handleClick = () => {
    if (isAnimating || isRevealed) return;
    
    setIsAnimating(true);
    setRibbonSlid(true);
    
    // Wait for ribbon animation, then show message
    setTimeout(() => {
      setMessageVisible(true);
      onReveal();
    }, 300);
  };

  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case 'instant': return 100;
      case 'quick': return 300;
      case 'gentle': return 800;
      case 'rich': return 600;
      default: return 300;
    }
  };

  return (
    <div 
      className={`ribbon-slide-container ${isRevealed ? 'revealed' : ''}`}
      onClick={handleClick}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
    >
      {/* Message Card Base */}
      <div className="message-card-base">
        <div className="card-front">
          <div className="card-content">
            <div className="card-icon">💌</div>
            <div className="card-title">Your Message</div>
            <div className="card-subtitle">Tap to reveal</div>
          </div>
        </div>
      </div>

      {/* Ribbon */}
      <div className={`ribbon ${ribbonSlid ? 'slid' : ''}`}>
        <div className="ribbon-body">
          <div className="ribbon-knot">
            <div className="knot-center"></div>
            <div className="knot-left"></div>
            <div className="knot-right"></div>
          </div>
          <div className="ribbon-tails">
            <div className="ribbon-tail left-tail"></div>
            <div className="ribbon-tail right-tail"></div>
          </div>
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
          <span>Tap to slide ribbon</span>
        </div>
      )}

      <style jsx>{`
        .ribbon-slide-container {
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

        .ribbon {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }

        .ribbon.slid {
          transform: translateX(-50%) translateY(-60px) rotateX(90deg);
          opacity: 0;
        }

        .ribbon-body {
          position: relative;
          width: 120px;
          height: 40px;
        }

        .ribbon-knot {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          transform-style: preserve-3d;
        }

        .knot-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: var(--accent-color);
          border-radius: 50%;
          transform: translate(-50%, -50%) translateZ(2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .knot-left,
        .knot-right {
          position: absolute;
          top: 50%;
          width: 8px;
          height: 20px;
          background: var(--accent-color);
          border-radius: 4px;
          transform: translateY(-50%);
        }

        .knot-left {
          left: -4px;
          transform: translateY(-50%) rotateY(90deg) translateZ(10px);
        }

        .knot-right {
          right: -4px;
          transform: translateY(-50%) rotateY(-90deg) translateZ(10px);
        }

        .ribbon-tails {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 20px;
        }

        .ribbon-tail {
          position: absolute;
          width: 50px;
          height: 20px;
          background: var(--accent-color);
          border-radius: 10px;
        }

        .left-tail {
          left: 0;
          transform: rotate(-15deg);
          transform-origin: right center;
        }

        .right-tail {
          right: 0;
          transform: rotate(15deg);
          transform-origin: left center;
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
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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

        .ribbon-slide-container:hover .ribbon:not(.slid) {
          transform: translateX(-50%) translateY(-5px);
          transition: transform 0.2s ease;
        }

        .ribbon-slide-container:hover .knot-center {
          transform: translate(-50%, -50%) translateZ(2px) scale(1.1);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}

