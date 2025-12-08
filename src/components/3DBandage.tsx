'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ActionRevealCard from './ActionRevealCard';

interface BandageProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: 'rich' | 'quick' | 'gentle' | 'instant';
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

const prescriptionMessages = [
  {
    id: 1,
    text: "Practice square breathing (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s)",
    type: "[ACTION]"
  },
  {
    id: 2,
    text: "'I'm doing just fine' (1 min)",
    type: "[REPEAT]"
  },
  {
    id: 3,
    text: "Visualise your favourite quiet place (2 min)",
    type: "[VISUALIZE]"
  }
];

const mapPrescriptionTypeToActionType = (type: string): string => {
  if (type.includes('VISUALIZE')) return 'VISUALIZE';
  if (type.includes('REPEAT')) return 'REPEAT';
  if (type.includes('BREATHE')) return 'BREATHE';
  if (type.includes('LISTEN')) return 'LISTEN';
  return 'ACTION';
};

export default function Bandage({ isRevealed, onReveal, accentColor, animationSpeed, onPlayNarration, mood, context, message, action, actionType, onStartOver, onTryAnother }: BandageProps) {
  const [showBandage, setShowBandage] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [isPasted, setIsPasted] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [sequenceKey, setSequenceKey] = useState(0);
  const [showTreasureCard, setShowTreasureCard] = useState(false);
  const [treasureCardEmerging, setTreasureCardEmerging] = useState(false);
  const [treasureCardFullyRevealed, setTreasureCardFullyRevealed] = useState(false);
  const [treasureCardStatic, setTreasureCardStatic] = useState(false);
  const hasAutoRevealed = useRef(false);
  const hasAnnouncedReveal = useRef(false);

  const getAnimationDuration = useCallback(() => {
    switch (animationSpeed) {
      case 'instant': return 100;
      case 'quick': return 300;
      case 'gentle': return 800;
      case 'rich': return 1200;
      default: return 600;
    }
  }, [animationSpeed]);

  // Automatic animation sequence
  useEffect(() => {
    if (isRevealed) {
      return;
    }

    console.log('🩹 Starting automatic bandage sequence...');
    const showBandageTimeout = setTimeout(() => {
      console.log('🩹 Showing bandage...');
      setShowBandage(true);
      setIsPasting(true);
    }, 1000);

    const pasteBandageTimeout = setTimeout(() => {
      console.log('🩹 Bandage pasted');
      setIsPasting(false);
      setIsPasted(true);
    }, 1500);

    const showPrescriptionTimeout = setTimeout(() => {
      console.log('💊 Prescription message revealed');
      setShowPrescription(true);
      // Show treasure card after prescription
      setShowTreasureCard(true);
      setTreasureCardEmerging(true);
      setTimeout(() => {
        setTreasureCardFullyRevealed(true);
        setTreasureCardEmerging(false);
      }, 300);
      setTimeout(() => {
        setTreasureCardStatic(true);
      }, 600);
    }, 3000);

    return () => {
      clearTimeout(showBandageTimeout);
      clearTimeout(pasteBandageTimeout);
      clearTimeout(showPrescriptionTimeout);
    };
  }, [sequenceKey, isRevealed]);

  const handleReplay = () => {
    console.log('🔄 Replaying bandage animation...');
    setShowBandage(false);
    setIsPasting(false);
    setIsPasted(false);
    setShowPrescription(false);
    setShowTreasureCard(false);
    setTreasureCardEmerging(false);
    setTreasureCardFullyRevealed(false);
    setTreasureCardStatic(false);
    setSequenceKey((prev) => prev + 1);
  };

  const handleGiveAnother = () => {
    console.log('📝 Getting another prescription...');
    setCurrentMessageIndex((prev) => (prev + 1) % prescriptionMessages.length);
  };

  const getCurrentMessage = () => prescriptionMessages[currentMessageIndex];

  useEffect(() => {
    if (!showPrescription || !onPlayNarration) return;
    const current = prescriptionMessages[currentMessageIndex];
    onPlayNarration(
      current.text,
      mapPrescriptionTypeToActionType(current.type),
      mood ?? null,
      context ?? null
    );
  }, [showPrescription, currentMessageIndex, onPlayNarration, mood, context]);

  useEffect(() => {
    if (showPrescription && !hasAnnouncedReveal.current) {
      hasAnnouncedReveal.current = true;
      onReveal();
    }
  }, [showPrescription, onReveal]);

  useEffect(() => {
    if (!isRevealed || hasAutoRevealed.current || showPrescription) return;

    hasAutoRevealed.current = true;
    setShowBandage(true);
    setIsPasting(false);
    setIsPasted(true);
    setShowPrescription(true);
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
  }, [isRevealed, showPrescription]);

  useEffect(() => {
    if (!isRevealed) {
      hasAutoRevealed.current = false;
      hasAnnouncedReveal.current = false;
    }
  }, [isRevealed]);



  return (
    <div className="bandage-wrap-container">
      {/* Skin Area - Always Visible */}
      <div className="skin-area">
        <div className="skin-base" />
        <div className="skin-texture" />
        <div className="healed-mark">
          <div className="healed-glow" />
          <div className="healed-center" />
        </div>
      </div>

      {/* Realistic Bandage Wrap - Shows automatically */}
      {showBandage && (
        <div
          className={`bandage-wrap ${isPasting ? 'pasting' : ''} ${isPasted ? 'pasted' : ''}`}
          style={{ userSelect: 'none' }}
        >
          <div className="bandage-shadow" />
          <div className="bandage-body">
            <div className="bandage-texture" />
            <div className="bandage-pad">
              <div className="pad-texture" />
            </div>
            <div className="bandage-dots" />
          </div>
          <div className="bandage-heart" style={{ color: accentColor }}>❤️</div>
          <div
            className="healing-glow"
            style={{ background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)` }}
          />
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
        .bandage-wrap-container {
          position: relative;
          width: 400px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card-bg-strong);
          border-radius: 20px;
          overflow: visible;
          perspective: 1000px;
          padding-bottom: max(16px, env(safe-area-inset-bottom));
          box-shadow: var(--card-shadow-lg);
          border: var(--card-border-strong);
          transition: background 0.4s ease;
        }

        .dark-mode .bandage-wrap-container {
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
        }

        .skin-area {
          position: absolute;
          width: 220px;
          height: 220px;
          background: linear-gradient(135deg, #f8d6b8 0%, #efb88f 45%, #d8916d 100%);
          border-radius: 24px;
          box-shadow:
            inset 0 3px 6px rgba(255, 255, 255, 0.34),
            inset 0 -3px 8px rgba(145, 73, 29, 0.25),
            0 10px 22px rgba(212, 136, 90, 0.25);
        }

        .dark-mode .skin-area {
          background: linear-gradient(135deg, #9a6a4b 0%, #7c5237 45%, #5d3d2b 100%);
          box-shadow:
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -3px 8px rgba(20, 14, 11, 0.55),
            0 16px 28px rgba(0, 0, 0, 0.5);
        }

        .skin-base,
        .skin-texture {
          position: absolute;
          inset: 0;
          border-radius: inherit;
        }

        .skin-base {
          background:
            radial-gradient(circle at 28% 30%, rgba(255, 255, 255, 0.38) 0%, transparent 55%),
            radial-gradient(circle at 72% 70%, rgba(217, 140, 89, 0.22) 0%, transparent 45%);
        }

        .dark-mode .skin-base {
          background:
            radial-gradient(circle at 30% 35%, rgba(255, 255, 255, 0.18) 0%, transparent 55%),
            radial-gradient(circle at 68% 72%, rgba(214, 138, 94, 0.25) 0%, transparent 45%);
        }

        .skin-texture {
          background:
            repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 2px, transparent 2px, transparent 6px),
            repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.06) 0px, rgba(0, 0, 0, 0.06) 1px, transparent 1px, transparent 5px);
          opacity: 0.4;
        }

        .healed-mark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, transparent 70%);
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.25);
        }

        .healed-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, transparent 70%);
          filter: blur(6px);
        }

        .healed-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(145deg, #fdf4e3 0%, #f4c49b 60%, #eba26f 100%);
          border: 1px solid rgba(234, 148, 90, 0.5);
          box-shadow:
            inset 0 2px 4px rgba(235, 155, 102, 0.28),
            0 6px 14px rgba(235, 155, 102, 0.25);
        }

        .dark-mode .healed-glow {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.55) 0%, transparent 70%);
        }

        .dark-mode .healed-center {
          background: linear-gradient(135deg, #fde68a 0%, #fbbf24 65%, #f59e0b 100%);
          border-color: rgba(245, 158, 11, 0.55);
          box-shadow:
            inset 0 2px 6px rgba(245, 158, 11, 0.35),
            0 6px 16px rgba(245, 158, 11, 0.32);
        }

        .bandage-wrap {
          position: relative;
          width: 210px;
          height: 210px;
          cursor: pointer;
          transition: transform 0.35s ease;
          transform-style: preserve-3d;
        }

        .bandage-wrap:hover {
          transform: scale(1.05);
        }

        .bandage-wrap:active {
          transform: scale(0.97);
        }

        .bandage-shadow {
          position: absolute;
          top: 62%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-10deg);
          width: 190px;
          height: 90px;
          background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.25) 0%, transparent 70%);
          filter: blur(10px);
          opacity: 0.6;
        }

        .bandage-body {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-12deg);
          width: 185px;
          height: 82px;
          background: linear-gradient(135deg, #f4d1ae 0%, #e8c4a0 45%, #d3a982 100%);
          border-radius: 40px;
          box-shadow:
            inset 0 2px 3px rgba(255, 255, 255, 0.35),
            inset 0 -2px 4px rgba(0, 0, 0, 0.18),
            0 18px 24px rgba(15, 23, 42, 0.3);
          overflow: hidden;
        }

        .dark-mode .bandage-body {
          background: linear-gradient(135deg, #f5d0a8 0%, #d6ad7b 50%, #b88c53 100%);
        }

        .bandage-wrap.pasting .bandage-body {
          animation: bandage-press 520ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .bandage-wrap.pasted .bandage-body {
          filter: drop-shadow(0 6px 16px rgba(15, 23, 42, 0.32));
        }

        .bandage-texture {
          position: absolute;
          inset: 0;
          background:
            repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.22) 0px, rgba(255, 255, 255, 0.22) 2px, transparent 2px, transparent 8px),
            repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.08) 0px, rgba(0, 0, 0, 0.08) 1px, transparent 1px, transparent 6px);
          opacity: 0.45;
        }

        .bandage-pad {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(3deg);
          width: 78px;
          height: 46px;
          background: linear-gradient(135deg, #ffffff 0%, #f4f4f4 50%, #dedede 100%);
          border-radius: 18px;
          box-shadow:
            inset 0 2px 4px rgba(255, 255, 255, 0.7),
            inset 0 -1px 3px rgba(0, 0, 0, 0.16);
        }

        .dark-mode .bandage-pad {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 55%, #f59e0b 100%);
          box-shadow:
            inset 0 1px 3px rgba(255, 255, 255, 0.65),
            inset 0 -2px 6px rgba(0, 0, 0, 0.25);
        }

        .pad-texture {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.08) 3px, rgba(0, 0, 0, 0.08) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0, 0, 0, 0.08) 3px, rgba(0, 0, 0, 0.08) 4px);
          opacity: 0.35;
        }

        .bandage-dots {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background-image:
            radial-gradient(circle at 12% 35%, rgba(255, 255, 255, 0.55) 1px, transparent 2px),
            radial-gradient(circle at 32% 68%, rgba(255, 255, 255, 0.35) 1px, transparent 2px),
            radial-gradient(circle at 62% 28%, rgba(255, 255, 255, 0.42) 1px, transparent 2px),
            radial-gradient(circle at 82% 55%, rgba(255, 255, 255, 0.32) 1px, transparent 2px);
          background-size: 24px 24px;
          opacity: 0.4;
        }

        .bandage-heart {
          position: absolute;
          top: calc(50% - 74px);
          left: calc(50% + 70px);
          transform: translate(-50%, -50%);
          font-size: 24px;
          text-shadow: 0 6px 14px rgba(15, 23, 42, 0.35);
          filter: drop-shadow(0 2px 3px rgba(15, 23, 42, 0.25));
          animation: heartbeat 2.4s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.12); }
        }

        .healing-glow {
          position: absolute;
          inset: -18px;
          border-radius: 50%;
          opacity: 0;
          animation: healing-pulse 2.8s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        .bandage-wrap.pasted .healing-glow {
          opacity: 1;
        }

        @keyframes healing-pulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.68;
            transform: scale(1.02);
          }
        }

        @keyframes bandage-press {
          0% { transform: translate(-50%, -50%) rotate(-12deg) scale(1); }
          45% { transform: translate(-50%, -50%) rotate(-12deg) scale(0.95); }
          75% { transform: translate(-50%, -50%) rotate(-12deg) scale(1.02); }
          100% { transform: translate(-50%, -50%) rotate(-12deg) scale(0.985); }
        }

        .prescription-card {
          position: fixed;
          top: 50%;
          left: 50%;
          width: 480px;
          min-height: 380px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border-radius: 18px;
          transform: translate(-50%, -50%) scale(0.85);
          opacity: 0;
          transition: all 1.1s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 18px 40px rgba(15, 23, 42, 0.18),
            0 0 0 1px rgba(148, 163, 184, 0.08);
          z-index: 1000;
          max-height: 80vh;
          overflow-y: auto;
          pointer-events: none;
        }

        :global(body.dark-mode) .prescription-card,
        :global(html.dark-mode) .prescription-card,
        :global(.dark-mode) .prescription-card {
          background: rgba(17, 24, 39, 0.94);
          color: #f9fafb;
          box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.65),
            0 0 0 1px rgba(59, 130, 246, 0.15);
        }

        .prescription-card.visible {
          opacity: 1 !important;
          transform: translate(-50%, -50%) scale(1) !important;
          pointer-events: all;
        }

        .prescription-letterhead {
          text-align: center;
          padding: 28px 40px 18px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.25);
          margin-bottom: 28px;
        }

        .dark-mode .prescription-letterhead {
          border-bottom-color: rgba(148, 163, 184, 0.12);
        }

        .letterhead-logo {
          font-size: 44px;
          margin-bottom: 8px;
          filter: drop-shadow(0 6px 16px rgba(16, 185, 129, 0.3));
        }

        .letterhead-title {
          font-family: var(--font-elegant, 'Playfair Display', serif);
          font-size: 26px;
          font-weight: 600;
          color: #1f2937;
          letter-spacing: 1px;
        }

        .letterhead-subtitle {
          font-family: var(--font-elegant, 'Cormorant Garamond', serif);
          font-size: 16px;
          color: #4b5563;
          font-style: italic;
        }

        .dark-mode .letterhead-title {
          color: #e5e7eb;
        }

        .dark-mode .letterhead-subtitle {
          color: #c7d2fe;
        }

        .prescription-body {
          padding: 24px 44px 36px;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .prescription-message {
          text-align: center;
          max-width: 100%;
        }

        .message-content {
          font-family: var(--font-cursive-soft, 'Segoe Script', 'Lucida Handwriting', cursive);
          font-size: clamp(22px, 2.6vw, 28px);
          font-weight: 500;
          color: #1f2937;
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .dark-mode .message-content {
          color: #f9fafb;
          text-shadow: 0 6px 14px rgba(15, 23, 42, 0.55);
        }

        body.dark-mode .prescription-card,
        html.dark-mode .prescription-card {
          color: #f9fafb;
        }

        body.dark-mode .prescription-card .letterhead-title,
        html.dark-mode .prescription-card .letterhead-title,
        body.dark-mode .prescription-card .letterhead-subtitle,
        html.dark-mode .prescription-card .letterhead-subtitle,
        body.dark-mode .prescription-card .message-content,
        html.dark-mode .prescription-card .message-content,
        body.dark-mode .prescription-card .message-type,
        html.dark-mode .prescription-card .message-type {
          color: #f9fafb !important;
        }

        body.dark-mode .prescription-card .message-type,
        html.dark-mode .prescription-card .message-type {
          opacity: 0.85;
        }

        .message-type {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          font-weight: 600;
          color: #64748b;
        }

        .dark-mode .message-type {
          color: #a5b4fc;
        }

        .prescription-actions {
          padding: 20px 36px 30px;
          display: flex;
          gap: 16px;
          justify-content: center;
          border-top: 1px solid rgba(148, 163, 184, 0.22);
        }

        .dark-mode .prescription-actions {
          border-top-color: rgba(148, 163, 184, 0.14);
        }

        .prescription-button {
          padding: 12px 26px;
          border: none;
          border-radius: 999px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 6px 18px rgba(15, 118, 110, 0.2);
        }

        .prescription-button:hover {
          transform: translateY(-1px);
        }

        .start-over-button {
          background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
          color: #065f46;
        }

        .dark-mode .start-over-button {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.92) 0%, rgba(5, 150, 105, 0.98) 100%);
          color: #e0f2f1;
          box-shadow: 0 10px 24px rgba(16, 185, 129, 0.35);
        }

        .another-button {
          background: linear-gradient(135deg, #e0f2fe 0%, #93c5fd 100%);
          color: #1e3a8a;
        }

        .dark-mode .another-button {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(99, 102, 241, 0.95) 100%);
          color: #eef2ff;
          box-shadow: 0 10px 26px rgba(99, 102, 241, 0.35);
        }

        @media (max-width: 768px) {
          .bandage-wrap-container {
            width: min(90vw, 360px);
            height: 260px;
          }

          .skin-area {
            width: 200px;
            height: 200px;
          }

          .bandage-wrap {
            width: 190px;
            height: 190px;
          }

          .bandage-body {
            width: 165px;
            height: 72px;
          }

          .bandage-heart {
            font-size: 22px;
          }

          .prescription-card {
            width: 90vw;
            max-width: 400px;
          }
        }

        @media (max-width: 480px) {
          .bandage-wrap-container {
            width: min(94vw, 320px);
            height: 230px;
          }

          .skin-area {
            width: 180px;
            height: 180px;
          }

          .bandage-wrap {
            width: 170px;
            height: 170px;
          }

          .bandage-body {
            width: 150px;
            height: 66px;
          }

          .bandage-pad {
            width: 66px;
            height: 40px;
          }

          .bandage-heart {
            font-size: 20px;
            top: calc(50% - 68px);
            left: calc(50% + 62px);
          }

          .prescription-card {
            width: 92vw;
            max-width: 92vw;
            min-height: auto;
            margin: 8px;
            max-height: 85vh;
          }

          .prescription-body {
            padding: 20px;
          }

          .prescription-actions {
            flex-direction: column;
          }

          .prescription-button {
            width: 100%;
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}
