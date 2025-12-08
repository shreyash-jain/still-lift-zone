'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import {
  playMessageAudio,
  type PlayTextAudioOptions,
  stopAudioByIntent,
} from '@/lib/audio';

interface TaskAudioPayload {
  title?: string;
  message: string;
  options?: PlayTextAudioOptions;
}

interface AudioControllerValue {
  playHomepageAudio: () => Promise<void>;
  stopHomepageAudio: () => void;
  playTaskAudio: (payload: TaskAudioPayload) => Promise<void>;
  stopTaskAudio: () => void;
}

const AudioControllerContext = createContext<AudioControllerValue | null>(null);

export function AudioControllerProvider({ children }: { children: React.ReactNode }) {
  const playHomepageAudio = useCallback(async () => {
    await playMessageAudio('Homepage Audio', 'Welcome to StillLift', {
      isHomepage: true,
      audioIntent: 'homepage',
    });
  }, []);

  const stopHomepageAudio = useCallback(() => {
    stopAudioByIntent('homepage');
  }, []);

  const playTaskAudio = useCallback(async ({ title, message, options }: TaskAudioPayload) => {
    await playMessageAudio(title, message, {
      ...(options ?? {}),
      audioIntent: 'task',
      isHomepage: false,
    });
  }, []);

  const stopTaskAudio = useCallback(() => {
    stopAudioByIntent('task');
  }, []);

  const value = useMemo<AudioControllerValue>(
    () => ({ playHomepageAudio, stopHomepageAudio, playTaskAudio, stopTaskAudio }),
    [playHomepageAudio, stopHomepageAudio, playTaskAudio, stopTaskAudio]
  );

  return (
    <AudioControllerContext.Provider value={value}>
      {children}
    </AudioControllerContext.Provider>
  );
}

export function useAudioController(): AudioControllerValue {
  const context = useContext(AudioControllerContext);
  if (!context) {
    throw new Error('useAudioController must be used within an AudioControllerProvider');
  }
  return context;
}

