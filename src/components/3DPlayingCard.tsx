"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import ActionRevealCard from './ActionRevealCard';

interface PlayingCardProps {
  isRevealed: boolean;
  onReveal: () => void;
  accentColor: string;
  animationSpeed: "rich" | "quick" | "gentle" | "instant";
  message: string;
  action: string;
  actionType: "ACTION" | "REPEAT" | "VISUALIZE" | "BREATHE" | "LISTEN";
  onStartOver?: () => void;
  onTryAnother?: () => void;
  mood?: string;
  onPlayNarration?: (
    message: string,
    actionType?: string,
    overrideMood?: string | null,
    overrideContext?: string | null,
    audioIndexOverride?: number | null,
    preferExact?: boolean
  ) => void;
  context?: string;
  audioIndex?: number;
}

export default function PlayingCard({
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
}: PlayingCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canClick, setCanClick] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showTreasureCard, setShowTreasureCard] = useState(false);
  const [treasureCardEmerging, setTreasureCardEmerging] = useState(false);
  const [treasureCardFullyRevealed, setTreasureCardFullyRevealed] = useState(false);
  const [treasureCardStatic, setTreasureCardStatic] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const palette = useMemo(() => {
    switch (mood) {
      case "good":
        return {
          background: "linear-gradient(150deg, #fefbea 0%, #f5f9dc 50%, #eaf3d2 100%)",
          iconFrame: "linear-gradient(160deg, rgba(217, 119, 6, 0.14), rgba(234, 179, 8, 0.1))",
          iconOrb: "linear-gradient(140deg, #fde68a 0%, #facc15 100%)",
          textTone: "#3f3d2e",
          textSubtle: "#4b5563",
          faceFill: "#fef3c7",
          faceStroke: "#b45309"
        };
      case "okay":
        return {
          background: "linear-gradient(150deg, #f5f9ff 0%, #e9f2ff 52%, #dde9ff 100%)",
          iconFrame: "linear-gradient(160deg, rgba(59, 130, 246, 0.16), rgba(14, 165, 233, 0.1))",
          iconOrb: "linear-gradient(140deg, #bfdbfe 0%, #93c5fd 100%)",
          textTone: "#1f2937",
          textSubtle: "#475569",
          faceFill: "#e0f2fe",
          faceStroke: "#1d4ed8"
        };
      case "bad":
        return {
          background: "linear-gradient(150deg, #fff3f2 0%, #ffe1e1 50%, #fdd6d6 100%)",
          iconFrame: "linear-gradient(160deg, rgba(248, 113, 113, 0.18), rgba(251, 113, 133, 0.12))",
          iconOrb: "linear-gradient(140deg, #fca5a5 0%, #f87171 100%)",
          textTone: "#7f1d1d",
          textSubtle: "#9f1239",
          faceFill: "#fee2e2",
          faceStroke: "#b91c1c"
        };
      case "awful":
        return {
          background: "linear-gradient(150deg, #fbf7ff 0%, #f0e8ff 52%, #e4dcff 100%)",
          iconFrame: "linear-gradient(160deg, rgba(147, 51, 234, 0.18), rgba(236, 72, 153, 0.12))",
          iconOrb: "linear-gradient(140deg, #d8b4fe 0%, #f0abfc 100%)",
          textTone: "#4c1d95",
          textSubtle: "#6b21a8",
          faceFill: "#ede9fe",
          faceStroke: "#7c3aed"
        };
      default:
        return {
          background: "linear-gradient(150deg, #111827 0%, #1e293b 55%, #334155 100%)",
          iconFrame: "linear-gradient(160deg, rgba(99, 102, 241, 0.18), rgba(14, 165, 233, 0.18))",
          iconOrb: "linear-gradient(140deg, #e0f2fe 0%, #c7d2fe 100%)",
          textTone: "#e2e8f0",
          textSubtle: "#cbd5f5",
          faceFill: "#cbd5f5",
          faceStroke: "#1e293b"
        };
    }
  }, [mood]);

  const { label: moodLabel } = useMemo(() => {
    switch (mood) {
      case "good":
        return { label: "Good" };
      case "okay":
        return { label: "Okay" };
      case "bad":
        return { label: "Bad" };
      case "awful":
        return { label: "Awful" };
      default:
        return { label: "Your Mood" };
    }
  }, [mood]);

  // Messages for rotating content
  const messages = [
    {
      action,
      message,
      tag: actionType,
    },
  ];

  const getAnimationDuration = useCallback(() => {
    switch (animationSpeed) {
      case "instant":
        return 300;
      case "quick":
        return 800;
      case "gentle":
        return 1200;
      case "rich":
        return 1600;
      default:
        return 1000;
    }
  }, [animationSpeed]);

  // Ensure portal only renders on client to avoid SSR/hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-flip after delay using transition-based flip (no keyframes)
  useEffect(() => {
    if (!isRevealed && canClick) {
      // For move and focused contexts, show the action immediately as a simple card (no flip)
      if (context === 'move' || context === 'focused') {
        setCanClick(false);
        setIsFlipped(true);
        setShowMessage(true);
        setIsExpanded(true);
        // Show treasure card for moving/focused contexts
        setShowTreasureCard(true);
        setTreasureCardEmerging(true);
        setTimeout(() => {
          setTreasureCardFullyRevealed(true);
          setTreasureCardEmerging(false);
        }, 300);
        setTimeout(() => {
          setTreasureCardStatic(true);
        }, 600);
        const revealTimer = setTimeout(() => onReveal(), 200);
        return () => clearTimeout(revealTimer);
      }
      const flipDelay = animationSpeed === "instant" ? 500 : 1200;

      const flipTimer = setTimeout(() => {
        console.log("🎴 Starting playing card flip (transition)…");
        setCanClick(false);
        const duration = getAnimationDuration();

        // Trigger flip via CSS transition
        setIsFlipped(true);
        console.log("🎴 Playing card flipped - showing message…");

        // Show message shortly after flip starts
        const showMsgDelay = Math.min(250, Math.floor(duration * 0.3));
        const expandDelay = Math.max(450, Math.floor(duration * 0.6));

        const msgTimer = setTimeout(() => {
          setShowMessage(true);
          // Show treasure card after message appears
          setShowTreasureCard(true);
          setTreasureCardEmerging(true);
          // Expand for readability
          const expandTimer = setTimeout(() => {
            setIsExpanded(true);
            setTreasureCardFullyRevealed(true);
            setTreasureCardEmerging(false);
            console.log("🎴 Playing card expanded for better readability");
            // Treasure card becomes static
            const staticTimer = setTimeout(() => {
              setTreasureCardStatic(true);
            }, 300);
            // Notify reveal after a small delay
            const revealTimer = setTimeout(() => {
              onReveal();
            }, 300);
            return () => {
              clearTimeout(revealTimer);
              clearTimeout(staticTimer);
            };
          }, expandDelay);
          return () => clearTimeout(expandTimer);
        }, showMsgDelay);

        return () => clearTimeout(msgTimer);
      }, flipDelay);

      return () => clearTimeout(flipTimer);
    }
  }, [isRevealed, canClick, animationSpeed, getAnimationDuration, onReveal, context]);

  // Debug: log bounding rect to ensure we remain centered
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    console.log("🎯 Card rect", {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    });
  }, [isFlipped, isExpanded]);

  useEffect(() => {
    if (!showMessage || !onPlayNarration) return;
    const currentData = messages[currentMessage];
    if (!currentData) return;

    // Only play audio if audioIndex is provided and valid
    // This prevents TTS fallback from being triggered
    if (audioIndex === null || audioIndex === undefined) {
      console.warn('[PlayingCard] Skipping audio playback - audioIndex is missing', { audioIndex, mood, context, message: currentData.message });
      return;
    }

    // Small delay to ensure all props are ready and component is fully mounted
    const timeoutId = setTimeout(() => {
      console.log('[PlayingCard] Triggering audio playback', { 
        audioIndex, 
        mood, 
        context, 
        message: currentData.message,
        actionType: currentData.tag 
      });
      
      onPlayNarration(
        currentData.message,
        currentData.tag,
        mood ?? null,
        context ?? null,
        audioIndex,
        true // preferExactIndex - always use exact index when provided
      );
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [showMessage, onPlayNarration, messages, currentMessage, mood, context, audioIndex]);

  const handleStartOver = () => {
    console.log("🏠 Going back to home screen...");
    if (onStartOver) {
      onStartOver();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const handleGiveAnother = () => {
    console.log("📝 Getting another message...");
    if (onTryAnother) {
      onTryAnother();
    } else {
      const nextMessage = (currentMessage + 1) % messages.length;
      setCurrentMessage(nextMessage);

      // Reset and re-flip with new message
      setIsFlipping(false);
      setIsFlipped(false);
      setShowMessage(false);
      setIsExpanded(false);
      setCanClick(true);

      const currentData = messages[nextMessage];
      if (onPlayNarration && currentData) {
        onPlayNarration(
          currentData.message,
          currentData.tag,
          mood ?? null,
          context ?? null,
          audioIndex ?? null,
          audioIndex !== undefined && audioIndex !== null
        );
      }
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "VISUALIZE":
        return "#8B5CF6"; // Purple
      case "ACTION":
        return "#3B82F6"; // Blue
      case "REPEAT":
        return "#10B981"; // Green
      case "BREATHE":
        return "#F59E0B"; // Amber/Orange
      case "LISTEN":
        return "#EC4899"; // Pink
      default:
        return accentColor;
    }
  };

  const getDisplayTag = (tag: string) => {
    if (tag === 'REPEAT' || tag === 'RECITE') return 'REPEAT';
    return tag;
  };

  const currentMessageData = messages[currentMessage];
  const cardAnimationDuration = getAnimationDuration();

  const cardThemeStyle = useMemo(() => {
    return {
      "--flip-duration": `${cardAnimationDuration}ms`,
      "--card-back-bg": palette.background,
      "--card-icon-frame": palette.iconFrame,
      "--card-icon-orb": palette.iconOrb,
      "--card-text-tone": palette.textTone,
      "--card-text-subtle": palette.textSubtle ?? palette.textTone,
      "--card-face-fill": palette.faceFill ?? "#f1f5f9",
      "--card-face-stroke": palette.faceStroke ?? "#0f172a"
    } as React.CSSProperties;
  }, [cardAnimationDuration, palette]);

  // For moving and focused contexts, reveal quickly at top-level (no conditional hook usage)
  useEffect(() => {
    if (context !== 'move' && context !== 'focused') return;
    const t = setTimeout(() => onReveal(), 80);
    return () => clearTimeout(t);
  }, [context, onReveal]);

  // Show treasure card for move and focused contexts
  useEffect(() => {
    if (context === 'move' || context === 'focused') {
      // Show treasure card after a short delay
      const timer = setTimeout(() => {
        setShowTreasureCard(true);
        setTreasureCardEmerging(true);
        setTimeout(() => {
          setTreasureCardFullyRevealed(true);
          setTreasureCardEmerging(false);
        }, 300);
        setTimeout(() => {
          setTreasureCardStatic(true);
        }, 600);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [context]);
  
  // Simple, non-flipping card for move and focused contexts - show treasure card instead
  if (context === 'move' || context === 'focused') {
    return (
      <>
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
      </>
    );
  }

  const cardContent = (
    <div className="playing-card-container">
      <div
        ref={cardRef}
        className={`playing-card ${isFlipped ? "flipped" : ""} ${
          isExpanded ? "expanded" : ""
        }`}
        style={cardThemeStyle}
        data-speed={animationSpeed}
      >
        {/* Card Back (shows first) - hidden for move and focused contexts to avoid mirrored branding */}
        {context !== 'move' && context !== 'focused' && (
        <div className="card-face card-back">
          <div className="card-back-content">
            <div className="back-pattern">
              <div className="pattern-layer-1"></div>
              <div className="pattern-layer-2"></div>
              <div className="pattern-layer-3"></div>
            </div>
            <div className="back-branding">
              <div className="back-logo">
                <span className="back-icon">
                  <span className="icon-face">
                    <span className="face-circle"></span>
                    <span className="face-eye left"></span>
                    <span className="face-eye right"></span>
                  <span className="face-smile" data-mood={mood || 'neutral'}></span>
                  </span>
                </span>
              </div>
              <div
                className="back-text"
                style={{ color: 'rgba(71, 85, 105, 0.85)' }}
              >
                Still Lift
              </div>
            </div>
            <div className="mood-text" aria-label={`Feeling ${moodLabel}`}>
              <span className="mood-heading">Feeling</span>
              <span className="mood-label">{moodLabel}</span>
            </div>
            <div className="loading-indicator" aria-hidden="true">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Card Front (shows after flip) */}
        <div className="card-face card-front">
          <div className="message-content">
            {/* Message Tag */}
            <div
              className="message-tag"
              style={{
                backgroundColor: getTagColor(currentMessageData.tag),
                display: 'inline-block',
                alignSelf: 'flex-start',
                padding: '6px 12px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.04em',
                color: '#ffffff'
              }}
            >
              {getDisplayTag(currentMessageData.tag)}
            </div>

            {/* Message Action */}
            <h3 className="message-action">{currentMessageData.action}</h3>

            {/* Message Text */}
            <p className="message-text">{currentMessageData.message}</p>

            {/* Action Buttons */}
            <div className="message-actions">
              <button
                className="action-button start-over"
                onClick={handleStartOver}
              >
                🏠 Start Over
              </button>
              <button
                className="action-button give-another primary"
                onClick={handleGiveAnother}
              >
                🎴 Try Another
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Treasure Card - shown for all contexts */}
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
        .playing-card-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          perspective: 1200px;
          padding: 0 !important;
          margin: 0 !important;
          /* Ensure the card overlay always sits above background and overlays - highest priority */
          z-index: 10000 !important;
          isolation: isolate;
          background: transparent;
          overflow: hidden;
          display: block !important;
          pointer-events: none; /* allow clicks to pass unless on card */
        }

        .playing-card {
          position: fixed !important; /* fix to viewport to avoid any ancestor layout shifts */
          top: 50% !important;
          left: 50% !important;
          width: 250px !important;
          height: 341px !important;
          transform: translate(-50%, -50%) rotateY(0deg) !important;
          transform-style: preserve-3d !important;
          -webkit-transform-style: preserve-3d !important;
          transition: transform var(--flip-duration, 0.8s)
            cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
          cursor: pointer;
          will-change: transform;
          padding: 0 !important;
          margin: 0 auto !important;
          border-radius: 12px;
          transform-origin: center center !important;
          /* Fallback positioning */
          display: block !important;
          z-index: 10010; /* sit above any footers/overlays and background blur */
          isolation: isolate;
          pointer-events: auto; /* receive clicks */
        }

        .playing-card.flipped {
          transform: translate(-50%, -50%) rotateY(180deg) !important;
          transform-origin: center center !important;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important; /* Add transition for smooth expansion */
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
        }

        .playing-card.expanded {
          width: 350px !important;
          height: 480px !important;
          transform: translate(-50%, -50%) rotateY(180deg) scale(1.1) !important;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
          transform-origin: center center !important;
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
        }

        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.1);
          will-change: transform;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .card-back {
          background: var(--card-back-bg, linear-gradient(160deg, #111827 0%, #1e293b 55%, #334155 100%));
          transform: translateZ(0px);
          -webkit-transform: translateZ(0px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
        }

        .card-front {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          transform: rotateY(180deg) translateZ(1px);
          -webkit-transform: rotateY(180deg) translateZ(1px);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          border: 2px solid rgba(30, 58, 138, 0.1);
          overflow-y: auto;
        }

        .dark-mode .card-front {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #f1f5f9;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .dark-mode .card-back {
          border: 2px solid rgba(255, 255, 255, 0.12);
        }

        .back-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.07;
        }

        .pattern-layer-1 {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 28% 24%,
            rgba(255, 255, 255, 0.25) 0%,
            transparent 50%
          );
        }

        .pattern-layer-2 {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 72% 70%,
            rgba(100, 116, 139, 0.28) 0%,
            transparent 65%
          );
        }

        .pattern-layer-3 {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(148, 163, 184, 0.12) 50%,
            transparent 100%
          );
        }

        .back-branding {
          text-align: center;
          z-index: 3;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
        }

        .back-logo {
          font-size: 0;
          margin-bottom: 1rem;
        }

        .back-icon {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 96px;
          height: 96px;
          border-radius: 24px;
          background: var(--card-icon-frame, linear-gradient(160deg, rgba(99, 102, 241, 0.08), rgba(14, 165, 233, 0.08)));
          border: 1px solid rgba(148, 163, 184, 0.25);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.15);
        }

        .icon-face {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
        }

        .face-circle {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--card-face-fill, #f1f5f9);
          border: 2px solid var(--card-face-stroke, #0f172a);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
        }

        .face-eye {
          position: absolute;
          top: 45%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--card-face-stroke, #0f172a);
        }

        .face-eye.left {
          left: 36%;
        }

        .face-eye.right {
          right: 36%;
        }

        .face-smile {
          position: absolute;
          bottom: 28%;
          left: 50%;
          width: 26px;
          height: 14px;
          border-bottom: 2px solid var(--card-face-stroke, #0f172a);
          border-radius: 0 0 18px 18px;
          transform: translateX(-50%);
        }

        .face-smile[data-mood='bad'],
        .face-smile[data-mood='awful'] {
          border-bottom: none;
          border-top: 2px solid var(--card-face-stroke, #0f172a);
          border-radius: 18px 18px 0 0;
          bottom: 35%;
        }
        }
        }

        .back-text {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
          color: rgba(71, 85, 105, 0.85);
          text-transform: uppercase;
        }

        .loading-indicator {
          display: none;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          animation: messageSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          gap: 1.25rem;
          will-change: transform, opacity;
        }

        .message-tag {
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.5px;
          align-self: flex-start;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
        }

        .message-action {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.4;
          letter-spacing: -0.01em;
          flex-shrink: 0;
          margin: 0;
        }

        .dark-mode .message-action {
          color: #f1f5f9;
        }

        .message-text {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #475569;
          flex-grow: 1;
          font-weight: 400;
          overflow-y: auto;
          margin: 0;
        }

        .dark-mode .message-text {
          color: #cbd5e1;
        }

        .message-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
          flex-shrink: 0;
        }

        .action-button {
          flex: 1;
          padding: 0.75rem 0.875rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            box-shadow 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            background 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          font-size: 0.8rem;
          letter-spacing: 0.3px;
          will-change: transform, box-shadow;
        }

        .start-over {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #475569;
        }

        .dark-mode .start-over {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          color: #f1f5f9;
        }

        .start-over:hover {
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .dark-mode .start-over:hover {
          background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .give-another {
          background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
          color: white;
          box-shadow: 0 3px 8px rgba(30, 58, 138, 0.25);
        }

        .give-another:hover {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(30, 58, 138, 0.4);
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Keyframe-based flipping removed to avoid positioning issues */

        @keyframes loadingDots {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          40% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes messageSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .playing-card {
            width: 220px !important;
            height: 300px !important;
          }

          .playing-card.expanded {
            width: 300px !important;
            height: 420px !important;
            transform: translate(-50%, -50%) rotateY(180deg) scale(1.05) !important;
          }

          .playing-card.flipped {
            transform: translate(-50%, -50%) rotateY(180deg) !important;
          }

          .card-front {
            padding: 1.25rem;
          }

          .card-back {
            padding: 1.25rem;
          }

          .message-action {
            font-size: 1rem;
          }

          .message-text {
            font-size: 0.85rem;
          }

          .action-button {
            font-size: 0.75rem;
            padding: 0.65rem 0.75rem;
          }

          .message-actions {
            flex-direction: column;
            gap: 0.6rem;
          }

          .back-text {
            font-size: 1.3rem;
          }

          .back-logo {
            font-size: 3.5rem;
          }

          .message-tag {
            font-size: 0.7rem;
            padding: 0.45rem 0.8rem;
          }

          .loading-indicator p {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .playing-card {
            width: 200px !important;
            height: 273px !important;
          }

          .playing-card.expanded {
            width: 280px !important;
            height: 380px !important;
            transform: translate(-50%, -50%) rotateY(180deg) scale(1.02) !important;
          }

          .playing-card.flipped {
            transform: translate(-50%, -50%) rotateY(180deg) !important;
          }

          .card-front {
            padding: 1rem;
          }

          .card-back {
            padding: 1rem;
          }

          .message-action {
            font-size: 0.95rem;
          }

          .message-text {
            font-size: 0.8rem;
          }

          .back-text {
            font-size: 1.2rem;
          }

          .back-logo {
            font-size: 3rem;
          }

          .message-tag {
            font-size: 0.65rem;
            padding: 0.4rem 0.7rem;
          }

          .loading-indicator p {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );

  if (!mounted) return null;
  return createPortal(cardContent, document.body);
}
