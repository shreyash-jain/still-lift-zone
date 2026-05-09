// Hook for managing Still Zone content
// Fetches from database API with fallback to hardcoded content
// Tracks recently played content to avoid immediate repeats

import { useState, useEffect } from 'react';
import {
  getStillZoneRandomMessage,
  type StillZoneContentMessage
} from '@/lib/still-zone-content';

// DB row shape from the API
interface DbContentRow {
  id: string;
  mood: string;
  context: string;
  support_type: string;
  time_key: string;
  action_type: string;
  heading: string | null;
  message: string;
  display_time: number;
  audio_url: string | null;
  background_audio_url: string | null;
  completion_audio_url: string | null;
  beep_audio_url: string | null;
  audio_volume: number | null;
  background_audio_volume: number | null;
  completion_audio_volume: number | null;
  beep_audio_volume: number | null;
  audio_loop: boolean | null;
  background_audio_mode: 'with' | 'after' | null;
  is_combo: boolean;
  segments: { duration: number; message: string; audio_url?: string }[] | null;
  combo_second_message: string | null;
  combo_first_audio_url: string | null;
  combo_second_audio_url: string | null;
  is_active: boolean;
  sort_order: number;
}

// Convert a DB row to the StillZoneContentMessage interface
function dbRowToMessage(row: DbContentRow): StillZoneContentMessage {
  return {
    actionType: row.action_type as StillZoneContentMessage['actionType'],
    heading: row.heading || undefined,
    message: row.message,
    displayTime: row.display_time,
    audioIndex: 0,
    audioSrc: row.audio_url || undefined,
    audioLoop: row.audio_loop ?? false,
    backgroundAudioSrc: row.background_audio_url || undefined,
    backgroundAudioMode: row.background_audio_mode === 'with' ? 'with' : 'after',
    completionAudioSrc: row.completion_audio_url || undefined,
    beepAudioSrc: row.beep_audio_url || undefined,
    audioVolume: row.audio_volume ?? undefined,
    backgroundAudioVolume: row.background_audio_volume ?? undefined,
    completionAudioVolume: row.completion_audio_volume ?? undefined,
    beepAudioVolume: row.beep_audio_volume ?? undefined,
    isCombo: row.is_combo,
    segments: row.segments || undefined,
    comboSecondMessage: row.combo_second_message || undefined,
    comboFirstAudioSrc: row.combo_first_audio_url || undefined,
    comboSecondAudioSrc: row.combo_second_audio_url || undefined,
  };
}

// ─── Recently Played Tracking ─────────────────────────────────────────────────

const STORAGE_KEY = 'sz_recently_played';
const MAX_HISTORY = 10; // Remember last 10 played IDs

function getRecentlyPlayed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function addToRecentlyPlayed(id: string) {
  if (typeof window === 'undefined') return;
  const recent = getRecentlyPlayed();
  // Remove if already exists, then add to front
  const updated = [id, ...recent.filter(r => r !== id)].slice(0, MAX_HISTORY);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Pick a non-repeating entry from the list.
 * Avoids recently played IDs. If all have been played, picks the least recent.
 */
function pickNonRepeating(entries: DbContentRow[]): DbContentRow {
  if (entries.length === 1) return entries[0];

  const recent = getRecentlyPlayed();

  // Filter out recently played
  const fresh = entries.filter(e => !recent.includes(e.id));

  if (fresh.length > 0) {
    // Pick random from fresh entries
    const picked = fresh[Math.floor(Math.random() * fresh.length)];
    addToRecentlyPlayed(picked.id);
    return picked;
  }

  // All entries have been played — pick the one played longest ago
  // (last in the recent list = played longest ago)
  const leastRecent = entries.reduce((best, entry) => {
    const bestIdx = recent.indexOf(best.id);
    const entryIdx = recent.indexOf(entry.id);
    // Higher index = played longer ago. -1 means not in list = very old
    if (entryIdx === -1) return entry;
    if (bestIdx === -1) return best;
    return entryIdx > bestIdx ? entry : best;
  }, entries[0]);

  addToRecentlyPlayed(leastRecent.id);
  return leastRecent;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseStillZoneContentOptions {
  mood: string;
  context: string;
  supportType: string;
  timeKey: string;
}

export function useStillZoneContent(options: UseStillZoneContentOptions) {
  const { mood, context, supportType, timeKey } = options;
  const [message, setMessage] = useState<StillZoneContentMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mood || !context || !supportType || !timeKey) {
      setMessage(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const fetchContent = async () => {
      try {
        const params = new URLSearchParams({ mood, context, supportType, timeKey });
        const res = await fetch(`/still-zone/api/content?${params}`);
        const json = await res.json();

        if (!cancelled && json.success && json.data && json.data.length > 0) {
          // Pick a non-repeating entry
          const picked = pickNonRepeating(json.data);
          setMessage(dbRowToMessage(picked));
          setIsLoading(false);
          return;
        }
      } catch {
        // Fall through to hardcoded fallback
      }

      // Fallback: use hardcoded content library
      if (!cancelled) {
        const fallback = getStillZoneRandomMessage(mood, context, supportType, timeKey);
        setMessage(fallback);
        setIsLoading(false);
      }
    };

    fetchContent();
    return () => { cancelled = true; };
  }, [mood, context, supportType, timeKey]);

  return { message, isLoading };
}
