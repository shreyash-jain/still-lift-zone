'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Shuffle, CheckCircle2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExperienceTimerCardProps {
  /** Primary message to display */
  message: string;
  /** Action/heading text */
  action: string;
  /** Badge type: breathing, audio, advice, havening, nlp, resources */
  actionType: string;
  /** Total duration in seconds */
  totalDuration: number;
  /** Whether this is a 5min combo (3min + 2min) */
  isCombo?: boolean;
  /** Message for the second part of a 5min combo */
  comboSecondMessage?: string;
  /** Audio file to play during the session (path relative to /public) */
  audioSrc?: string;
  /** Audio for the first part of a 5min combo */
  comboFirstAudioSrc?: string;
  /** Audio for the second part of a 5min combo */
  comboSecondAudioSrc?: string;
  /** Called when user clicks "Try Another" */
  onTryAnother?: () => void;
  /** Called when user clicks "Start Over" */
  onStartOver?: () => void;
  /** Called when user marks session as complete */
  onComplete?: () => void;
}

type SessionPhase = 'ready' | 'playing' | 'transitioning' | 'completed';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getDisplayActionType = (raw: string): string => {
  const v = raw.toUpperCase();
  if (v === 'BREATHING') return 'BREATHE';
  if (v === 'RECITE' || v === 'REPEAT/RECITE' || v === 'REPEAT') return 'REPEAT';
  return v || 'ACTION';
};

const getBadgeColor = (type: string): string => {
  const t = type.toUpperCase();
  if (t === 'BREATHE' || t === 'BREATHING') return '#0891b2'; // cyan-600
  if (t === 'LISTEN' || t === 'AUDIO') return '#7c3aed';     // violet-600
  if (t === 'HAVENING') return '#e11d48';                      // rose-600
  if (t === 'VISUALIZE') return '#8B5CF6';
  if (t === 'REPEAT') return '#10B981';
  return '#006B7A'; // primary teal
};

// ─── SVG Timer Ring constants ─────────────────────────────────────────────────
const RING_SIZE = 180;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExperienceTimerCard({
  message,
  action,
  actionType,
  totalDuration,
  isCombo = false,
  comboSecondMessage,
  audioSrc,
  comboFirstAudioSrc,
  comboSecondAudioSrc,
  onTryAnother,
  onStartOver,
  onComplete,
}: ExperienceTimerCardProps) {
  const [phase, setPhase] = useState<SessionPhase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [comboPhase, setComboPhase] = useState<1 | 2>(1); // for 5min combos
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionAudioRef = useRef<HTMLAudioElement | null>(null);

  // Combo split: 3min = 180s for part 1
  const comboSplitAt = isCombo ? 180 : 0;
  const remaining = Math.max(0, totalDuration - elapsed);
  const progress = totalDuration > 0 ? elapsed / totalDuration : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // Badge display
  const badgeLabel = getDisplayActionType(actionType);
  const badgeColor = getBadgeColor(actionType);

  // ── Tick logic ────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + 1;
      if (next >= totalDuration) {
        return totalDuration;
      }
      return next;
    });
  }, [totalDuration]);

  // ── Play session audio helper ──────────────────────────────────────────────
  const playSessionAudio = useCallback((src?: string) => {
    if (!src) return;
    if (sessionAudioRef.current) {
      sessionAudioRef.current.pause();
      sessionAudioRef.current.src = src;
      sessionAudioRef.current.currentTime = 0;
      sessionAudioRef.current.play().catch(() => {});
    }
  }, []);

  const stopSessionAudio = useCallback(() => {
    if (sessionAudioRef.current) {
      sessionAudioRef.current.pause();
      sessionAudioRef.current.currentTime = 0;
    }
  }, []);

  // ── Start timer ───────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setPhase('playing');
    setElapsed(0);
    setIsPaused(false);
    setComboPhase(1);
    setCurrentMessage(message);
    // Play audio: for combos, play the first part audio; otherwise play the main audio
    const src = isCombo ? comboFirstAudioSrc : audioSrc;
    // Small delay to let React render first
    setTimeout(() => playSessionAudio(src), 100);
  }, [message, audioSrc, isCombo, comboFirstAudioSrc, playSessionAudio]);

  // ── Auto-start on mount ───────────────────────────────────────────────────
  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startTimer();
    }
    return () => stopSessionAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Play audio when audioSrc arrives (async content fetch) ────────────────
  useEffect(() => {
    if (phase === 'playing' && !isPaused && audioSrc && !isCombo) {
      // Only play if session audio isn't already playing this src
      if (sessionAudioRef.current && sessionAudioRef.current.src !== audioSrc) {
        playSessionAudio(audioSrc);
      }
    }
  }, [audioSrc, phase, isPaused, isCombo, playSessionAudio]);

  // ── Interval management ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing' && !isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, isPaused, tick]);

  // ── Handle combo transition at 3min mark ──────────────────────────────────
  useEffect(() => {
    if (isCombo && comboPhase === 1 && elapsed >= comboSplitAt && phase === 'playing') {
      // Transition: pause briefly, play beep, switch message
      setPhase('transitioning');
      setComboPhase(2);

      // Play beep
      if (beepAudioRef.current) {
        beepAudioRef.current.currentTime = 0;
        beepAudioRef.current.play().catch(() => {});
      }

      // After a short pause, resume with second message
      const timeout = setTimeout(() => {
        if (comboSecondMessage) setCurrentMessage(comboSecondMessage);
        setPhase('playing');
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [elapsed, isCombo, comboPhase, comboSplitAt, comboSecondMessage, phase]);

  // ── Handle completion ─────────────────────────────────────────────────────
  useEffect(() => {
    if (elapsed >= totalDuration && phase !== 'completed' && phase !== 'ready') {
      setPhase('completed');
      // Stop session audio and play completion bell
      stopSessionAudio();
      if (bellAudioRef.current) {
        bellAudioRef.current.currentTime = 0;
        bellAudioRef.current.play().catch(() => {});
      }
    }
  }, [elapsed, totalDuration, phase]);

  // ── Pause / Resume ────────────────────────────────────────────────────────
  const togglePause = () => {
    if (phase === 'completed') return;
    setIsPaused((prev) => {
      if (prev) {
        // Resuming — play audio
        sessionAudioRef.current?.play().catch(() => {});
      } else {
        // Pausing — pause audio
        sessionAudioRef.current?.pause();
      }
      return !prev;
    });
  };

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = () => {
    startTimer();
  };

  // ── Render: phase label for 5min combo ────────────────────────────────────
  const phaseLabel = isCombo
    ? comboPhase === 1
      ? 'Part 1 of 2'
      : 'Part 2 of 2'
    : null;

  return (
    <div className="experience-timer-card">
      {/* Hidden audio elements — must be display:none to prevent tooltip/visibility */}
      <audio ref={sessionAudioRef} preload="auto" style={{ display: 'none' }} />
      <audio ref={bellAudioRef} src="/still-zone-audio/bell_complete.mp3" preload="auto" style={{ display: 'none' }} />
      <audio ref={beepAudioRef} src="/still-zone-audio/beep_transition.mp3" preload="auto" style={{ display: 'none' }} />

      {/* ── Badge ──────────────────────────────────────────────────── */}
      <div className="badge-row">
        <span className="action-badge" style={{ backgroundColor: badgeColor }}>
          {badgeLabel}
        </span>
        {phaseLabel && (
          <span className="phase-badge">{phaseLabel}</span>
        )}
      </div>

      {/* ── Timer Ring ─────────────────────────────────────────────── */}
      <div className="timer-ring-container">
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="timer-svg"
        >
          {/* Background track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={phase === 'completed' ? '#10b981' : phase === 'transitioning' ? '#f59e0b' : badgeColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="timer-center">
          {phase === 'completed' ? (
            <CheckCircle2 size={36} className="text-emerald-500" />
          ) : (
            <>
              <span className="timer-remaining">{formatTime(remaining)}</span>
              <span className="timer-label">remaining</span>
            </>
          )}
        </div>
      </div>

      {/* ── Progress Bar ───────────────────────────────────────────── */}
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: phase === 'completed' ? '#10b981' : badgeColor,
              transition: 'width 1s linear, background-color 0.3s ease',
            }}
          />
          {/* Combo marker at 60% (3min of 5min) */}
          {isCombo && (
            <div
              className="combo-marker"
              style={{ left: `${(comboSplitAt / totalDuration) * 100}%` }}
            >
              <div className="combo-marker-dot" />
              <span className="combo-marker-label">3:00</span>
            </div>
          )}
        </div>
        <div className="progress-bar-labels">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* ── Message ────────────────────────────────────────────────── */}
      <div className={`message-area ${phase === 'transitioning' ? 'transitioning' : ''}`}>
        {phase === 'transitioning' ? (
          <p className="transition-text">Transitioning to next exercise...</p>
        ) : phase === 'completed' ? (
          <>
            <h3 className="completion-title">Session Complete</h3>
            <p className="completion-subtitle">Well done. Take a moment before you move on.</p>
          </>
        ) : (
          <>
            {action && <h2 className="message-heading">{action}</h2>}
            <p className="message-body">{currentMessage}</p>
          </>
        )}
      </div>

      {/* ── Controls ───────────────────────────────────────────────── */}
      <div className="controls-area">
        {phase === 'completed' ? (
          <div className="completed-controls">
            <button className="btn-primary btn-complete" onClick={onComplete || onStartOver}>
              <CheckCircle2 size={18} />
              Mark Complete
            </button>
            <div className="secondary-controls">
              <button className="btn-secondary" onClick={restart}>
                <RotateCcw size={16} />
                Replay
              </button>
              <button className="btn-secondary" onClick={onTryAnother}>
                <Shuffle size={16} />
                Try Another
              </button>
            </div>
          </div>
        ) : (
          <div className="playing-controls">
            <button
              className="btn-round"
              onClick={togglePause}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play size={22} /> : <Pause size={22} />}
            </button>
            <div className="secondary-controls">
              <button className="btn-text" onClick={restart}>
                <RotateCcw size={15} />
                Restart
              </button>
              <button className="btn-text" onClick={onTryAnother}>
                <Shuffle size={15} />
                Try Another
              </button>
              <button className="btn-text" onClick={onStartOver}>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Styles ─────────────────────────────────────────────────── */}
      <style jsx>{`
        .experience-timer-card {
          width: 95vw;
          max-width: 520px;
          margin: 0 auto;
          background: var(--card-bg-strong, #fff);
          border: 1px solid var(--card-border, #e2e8f0);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
          padding: 32px 28px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Dark mode */
        :global(.dark) .experience-timer-card,
        :global(.dark-mode) .experience-timer-card {
          background: var(--dark-card-bg, #1e293b);
          border-color: var(--dark-card-border, rgba(148,163,184,0.1));
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        /* ── Badge Row ─────────────────────────── */
        .badge-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .action-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }
        .phase-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted, #6b7280);
          background: var(--slate-100, #f1f5f9);
          letter-spacing: 0.3px;
        }
        :global(.dark) .phase-badge,
        :global(.dark-mode) .phase-badge {
          background: var(--dark-card-hover, #334155);
          color: var(--dark-text-secondary, #cbd5e1);
        }

        /* ── Timer Ring ────────────────────────── */
        .timer-ring-container {
          position: relative;
          width: ${RING_SIZE}px;
          height: ${RING_SIZE}px;
        }
        .timer-svg {
          display: block;
        }
        .timer-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .timer-remaining {
          font-size: 36px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--text-dark, #111827);
          line-height: 1;
        }
        :global(.dark) .timer-remaining,
        :global(.dark-mode) .timer-remaining {
          color: var(--dark-text-primary, #f8fafc);
        }
        .timer-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted, #6b7280);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* ── Progress Bar ──────────────────────── */
        .progress-bar-container {
          width: 100%;
        }
        .progress-bar-track {
          position: relative;
          width: 100%;
          height: 6px;
          background: var(--slate-200, #e2e8f0);
          border-radius: 3px;
          overflow: visible;
        }
        :global(.dark) .progress-bar-track,
        :global(.dark-mode) .progress-bar-track {
          background: var(--dark-card-hover, #334155);
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
          position: relative;
        }

        /* Combo marker */
        .combo-marker {
          position: absolute;
          top: -6px;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }
        .combo-marker-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f59e0b;
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        :global(.dark) .combo-marker-dot,
        :global(.dark-mode) .combo-marker-dot {
          border-color: var(--dark-card-bg, #1e293b);
        }
        .combo-marker-label {
          font-size: 10px;
          font-weight: 600;
          color: #f59e0b;
          margin-top: 4px;
        }

        .progress-bar-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted, #6b7280);
          font-variant-numeric: tabular-nums;
        }

        /* ── Message Area ──────────────────────── */
        .message-area {
          text-align: center;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0 8px;
          transition: opacity 0.4s ease;
        }
        .message-area.transitioning {
          opacity: 0.6;
        }
        .message-heading {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-dark, #111827);
          margin-bottom: 10px;
          line-height: 1.3;
        }
        :global(.dark) .message-heading,
        :global(.dark-mode) .message-heading {
          color: var(--dark-text-primary, #f8fafc);
        }
        .message-body {
          font-size: 16px;
          font-weight: 400;
          color: var(--text-secondary, #374151);
          line-height: 1.7;
          letter-spacing: 0.01em;
        }
        :global(.dark) .message-body,
        :global(.dark-mode) .message-body {
          color: var(--dark-text-secondary, #cbd5e1);
        }
        .transition-text {
          font-size: 15px;
          font-weight: 500;
          color: #f59e0b;
          animation: pulse-text 1.5s ease-in-out infinite;
        }
        .completion-title {
          font-size: 22px;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 6px;
        }
        .completion-subtitle {
          font-size: 15px;
          color: var(--text-muted, #6b7280);
          line-height: 1.6;
        }

        /* ── Controls ──────────────────────────── */
        .controls-area {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        /* Playing controls */
        .playing-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .btn-round {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #006B7A, #004851);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,72,81,0.3);
          transition: var(--transition-smooth, all 0.3s ease);
        }
        .btn-round:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(0,72,81,0.4);
        }
        .btn-round:active {
          transform: scale(0.96);
        }

        .secondary-controls {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-text {
          background: none;
          border: none;
          color: var(--text-muted, #6b7280);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 8px;
          transition: var(--transition-fast, all 0.2s ease);
        }
        .btn-text:hover {
          color: var(--primary-blue, #004851);
          background: var(--slate-100, #f1f5f9);
        }
        :global(.dark) .btn-text:hover,
        :global(.dark-mode) .btn-text:hover {
          color: var(--dark-text-primary, #f8fafc);
          background: var(--dark-card-hover, #334155);
        }

        /* Completed controls */
        .completed-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 32px;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth, all 0.3s ease);
        }
        .btn-complete {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3);
        }
        .btn-complete:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.4);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border: 1px solid var(--slate-300, #cbd5e1);
          border-radius: 10px;
          background: var(--card-bg, #fff);
          color: var(--text-secondary, #374151);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast, all 0.2s ease);
        }
        .btn-secondary:hover {
          background: var(--slate-100, #f1f5f9);
          border-color: var(--slate-400, #94a3b8);
        }
        :global(.dark) .btn-secondary,
        :global(.dark-mode) .btn-secondary {
          background: var(--dark-card-hover, #334155);
          border-color: #4b5563;
          color: var(--dark-text-secondary, #cbd5e1);
        }

        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* ── Responsive ────────────────────────── */
        @media (max-width: 480px) {
          .experience-timer-card {
            padding: 24px 20px 20px;
            gap: 20px;
          }
          .message-heading {
            font-size: 16px;
          }
          .message-body {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
