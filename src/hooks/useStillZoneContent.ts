// Hook for managing Still Zone content
// Separate from Still Lift content hooks

import { useState, useEffect, useCallback } from 'react';
import {
  getStillZoneRandomMessage,
  getAllStillZoneMessages,
  getStillZoneRandomMessages,
  type StillZoneMood,
  type StillZoneContext,
  type StillZoneContentMessage
} from '@/lib/still-zone-content';

interface UseStillZoneContentOptions {
  mood: StillZoneMood;
  context: StillZoneContext;
  count?: number;
  shuffle?: boolean;
}

export function useStillZoneContent(options: UseStillZoneContentOptions) {
  const { mood, context, count = 1, shuffle = false } = options;
  const [messages, setMessages] = useState<StillZoneContentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    try {
      let fetchedMessages: StillZoneContentMessage[] = [];
      
      if (count === 1) {
        const message = getStillZoneRandomMessage(mood, context);
        fetchedMessages = message ? [message] : [];
      } else {
        fetchedMessages = getStillZoneRandomMessages(mood, context, count);
      }
      
      if (shuffle) {
        fetchedMessages = [...fetchedMessages].sort(() => Math.random() - 0.5);
      }
      
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('[useStillZoneContent] Error fetching Still Zone content:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [mood, context, count, shuffle]);

  return { messages, isLoading };
}

export function useAllStillZoneMessages(mood: StillZoneMood, context: StillZoneContext) {
  const [messages, setMessages] = useState<StillZoneContentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    try {
      const allMessages = getAllStillZoneMessages(mood, context);
      setMessages(allMessages);
    } catch (error) {
      console.error('[useAllStillZoneMessages] Error fetching Still Zone messages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [mood, context]);

  return { messages, isLoading };
}

