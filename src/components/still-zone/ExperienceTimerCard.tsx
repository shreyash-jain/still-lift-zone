'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, Shuffle, CheckCircle2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Segment {
  duration: number;
  message: string;
  audioUrl?: string;
}

interface ExperienceTimerCardProps {
  message: string;
  action: string;
  actionType: string;
  totalDuration: number;
  isCombo?: boolean;
  /** Dynamic segments for multi-part sessions (admin-defined) */
  segments?: Segment[];
  audioSrc?: string;
  backgroundAudioSrc?: string;
  completionAudioSrc?: string;
  /** Beep/transition sound between segments (admin-configurable) */
  beepAudioSrc?: string;
  /** Legacy combo fields */
  comboSecondMessage?: string;
  comboFirstAudioSrc?: string;
  comboSecondAudioSrc?: string;
  onTryAnother?: () => void;
  onStartOver?: () => void;
  onComplete?: () => void;
}

type SessionPhase = 'ready' | 'playing' | 'completed';

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
  segments,
  comboSecondMessage,
  audioSrc,
  backgroundAudioSrc,
  completionAudioSrc,
  beepAudioSrc,
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
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bellAudioRef = useRef<HTMLAudioElement | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Build segment boundaries from dynamic segments or legacy combo ──
  const resolvedSegments: Segment[] = useMemo(() => {
    if (segments && segments.length > 0) return segments;
    // Legacy: convert old combo to segments
    if (isCombo && comboSecondMessage) {
      const firstDuration = 180; // legacy default
      return [
        { duration: firstDuration, message, audioUrl: comboFirstAudioSrc },
        { duration: totalDuration - firstDuration, message: comboSecondMessage, audioUrl: comboSecondAudioSrc },
      ];
    }
    // Single segment
    return [{ duration: totalDuration, message, audioUrl: audioSrc }];
  }, [segments, isCombo, comboSecondMessage, message, comboFirstAudioSrc, comboSecondAudioSrc, totalDuration, audioSrc]);

  const isMultiSegment = resolvedSegments.length > 1;

  // Cumulative end times: [120, 300] for segments of [120s, 180s]
  const segmentEndTimes = useMemo(() => {
    let sum = 0;
    return resolvedSegments.map(s => { sum += s.duration; return sum; });
  }, [resolvedSegments]);

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

  // ── Background audio helpers ──────────────────────────────────────────────
  const startBgAudio = useCallback(() => {
    if (!backgroundAudioSrc || !bgAudioRef.current) return;
    bgAudioRef.current.src = backgroundAudioSrc;
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.4; // softer than main audio
    bgAudioRef.current.currentTime = 0;
    bgAudioRef.current.play().catch(() => {});
  }, [backgroundAudioSrc]);

  const stopBgAudio = useCallback(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
  }, []);

  // ── Start timer ───────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setPhase('playing');
    setElapsed(0);
    setIsPaused(false);
    setCurrentSegmentIdx(0);
    setCurrentMessage(resolvedSegments[0]?.message || message);
    stopBgAudio();
    // Play first segment's audio
    const firstAudio = resolvedSegments[0]?.audioUrl;
    setTimeout(() => playSessionAudio(firstAudio), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  // ── Auto-start on mount ───────────────────────────────────────────────────
  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startTimer();
    }
    return () => { stopSessionAudio(); stopBgAudio(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Start background audio when main audio ends ───────────────────────────
  useEffect(() => {
    const audio = sessionAudioRef.current;
    if (!audio || !backgroundAudioSrc) return;

    const handleMainEnded = () => {
      // Main audio finished — start looping background audio
      if (phase === 'playing' && !isPaused) {
        startBgAudio();
      }
    };

    audio.addEventListener('ended', handleMainEnded);
    return () => audio.removeEventListener('ended', handleMainEnded);
  }, [backgroundAudioSrc, phase, isPaused, startBgAudio]);

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

  // ── Handle segment transitions (seamless — no pause, no "transitioning" state) ──
  useEffect(() => {
    if (!isMultiSegment || phase !== 'playing') return;

    const nextIdx = currentSegmentIdx + 1;
    if (nextIdx >= resolvedSegments.length) return;

    const transitionAt = segmentEndTimes[currentSegmentIdx];
    if (elapsed < transitionAt) return;

    // Seamless transition: swap message + audio, play beep overlay
    stopSessionAudio();
    stopBgAudio();

    // Play beep as overlay (doesn't pause anything)
    if (beepAudioRef.current) {
      if (beepAudioSrc) beepAudioRef.current.src = beepAudioSrc;
      beepAudioRef.current.currentTime = 0;
      beepAudioRef.current.play().catch(() => {});
    }

    // Immediately switch to next segment
    setCurrentSegmentIdx(nextIdx);
    setCurrentMessage(resolvedSegments[nextIdx].message);
    if (resolvedSegments[nextIdx].audioUrl) {
      playSessionAudio(resolvedSegments[nextIdx].audioUrl);
    }
    // Phase stays 'playing' — no interruption
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, phase, currentSegmentIdx, isMultiSegment]);

  // ── Handle completion ─────────────────────────────────────────────────────
  useEffect(() => {
    if (elapsed >= totalDuration && phase !== 'completed' && phase !== 'ready') {
      setPhase('completed');
      stopSessionAudio();
      stopBgAudio();
      // Play completion sound: per-entry override → default bell
      if (completionAudioSrc && bellAudioRef.current) {
        bellAudioRef.current.src = completionAudioSrc;
      }
      if (bellAudioRef.current) {
        bellAudioRef.current.currentTime = 0;
        bellAudioRef.current.play().catch(() => {});
      }
    }
  }, [elapsed, totalDuration, phase, stopBgAudio, completionAudioSrc]);

  // ── Pause / Resume ────────────────────────────────────────────────────────
  const togglePause = () => {
    if (phase === 'completed') return;
    setIsPaused((prev) => {
      if (prev) {
        // Resuming
        sessionAudioRef.current?.play().catch(() => {});
        bgAudioRef.current?.play().catch(() => {});
      } else {
        // Pausing
        sessionAudioRef.current?.pause();
        bgAudioRef.current?.pause();
      }
      return !prev;
    });
  };

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = () => {
    startTimer();
  };

  // ── Render: phase label for 5min combo ────────────────────────────────────
  const phaseLabel = isMultiSegment
    ? `Part ${currentSegmentIdx + 1} of ${resolvedSegments.length}`
    : null;

  return (
    <div className="experience-timer-card">
      {/* Hidden audio elements */}
      <audio ref={sessionAudioRef} preload="auto" style={{ display: 'none' }} />
      <audio ref={bgAudioRef} preload="auto" style={{ display: 'none' }} />
      <audio ref={bellAudioRef} src={completionAudioSrc || '/still-zone-audio/bell_complete.mp3'} preload="auto" style={{ display: 'none' }} />
      <audio ref={beepAudioRef} src={beepAudioSrc || '/still-zone-audio/beep_transition.mp3'} preload="auto" style={{ display: 'none' }} />

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
            stroke={phase === 'completed' ? '#10b981' : badgeColor}
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
          {/* Segment boundary markers */}
          {isMultiSegment && segmentEndTimes.slice(0, -1).map((endTime, i) => (
            <div
              key={i}
              className="combo-marker"
              style={{ left: `${(endTime / totalDuration) * 100}%` }}
            >
              <div className="combo-marker-dot" />
              <span className="combo-marker-label">{formatTime(endTime)}</span>
            </div>
          ))}
        </div>
        <div className="progress-bar-labels">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* ── Message ────────────────────────────────────────────────── */}
      <div className="message-area">
        {phase === 'completed' ? (
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
