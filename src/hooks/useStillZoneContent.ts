// Hook for managing Still Zone content
// Fetches from database API with fallback to hardcoded content

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
  is_combo: boolean;
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
    audioIndex: 0, // legacy field, not used from DB
    audioSrc: row.audio_url || undefined,
    isCombo: row.is_combo,
    comboSecondMessage: row.combo_second_message || undefined,
    comboFirstAudioSrc: row.combo_first_audio_url || undefined,
    comboSecondAudioSrc: row.combo_second_audio_url || undefined,
  };
}

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
          // Pick a random message from the results
          const randomIdx = Math.floor(Math.random() * json.data.length);
          setMessage(dbRowToMessage(json.data[randomIdx]));
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
