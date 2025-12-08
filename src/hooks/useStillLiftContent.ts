import { useMemo } from 'react';
import { 
  getRandomMessage, 
  getAllMessages, 
  getRandomMessages, 
  type Mood, 
  type Context, 
  type ContentMessage 
} from '@/lib/still-lift-content';

export interface UseContentOptions {
  mood: Mood | null;
  context: Context | null;
  count?: number;
  shuffle?: boolean;
}

export function useContent(options: UseContentOptions) {
  const { mood, context, count = 3, shuffle = true } = options;

  const content = useMemo(() => {
    if (!mood || !context) {
      return {
        messages: [],
        randomMessage: null,
        allMessages: [],
        isLoading: false,
        error: null
      };
    }

    try {
      let messages: ContentMessage[] = getAllMessages(mood, context);

      // Shuffle if requested
      if (shuffle && messages.length > 0) {
        messages = [...messages].sort(() => Math.random() - 0.5);
      }

      // Limit to requested count
      const limitedMessages = messages.slice(0, count);

      // Get a single random message
      const randomMessage = getRandomMessage(mood, context);

      return {
        messages: limitedMessages,
        randomMessage,
        allMessages: getAllMessages(mood, context),
        isLoading: false,
        error: null
      };
    } catch (error) {
      return {
        messages: [],
        randomMessage: null,
        allMessages: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, [mood, context, count, shuffle]);

  return content;
}

// Hook for getting a single random message
export function useRandomMessage(mood: Mood | null, context: Context | null) {
  return useMemo(() => {
    if (!mood || !context) return null;
    return getRandomMessage(mood, context);
  }, [mood, context]);
}

// Hook for getting multiple random messages
export function useRandomMessages(mood: Mood | null, context: Context | null, count: number = 3) {
  return useMemo(() => {
    if (!mood || !context) return [];
    return getRandomMessages(mood, context, count);
  }, [mood, context, count]);
}

// Hook for getting all messages for a mood-context combination
export function useAllMessages(mood: Mood | null, context: Context | null) {
  return useMemo(() => {
    if (!mood || !context) return [];
    return getAllMessages(mood, context);
  }, [mood, context]);
}







