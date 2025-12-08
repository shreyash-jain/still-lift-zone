// Content management system for Still Zone
// This file contains all the content that will be displayed to users in Still Zone
// This is separate from Still Lift content to avoid confusion

export interface StillZoneContentMessage {
  actionType: 'VISUALIZE' | 'ACTION' | 'REPEAT' | 'BREATHE' | 'LISTEN';
  message: string;
  displayTime: number; // Time in seconds to display the message
  audioIndex: number; // Required: Index of the pre-recorded audio file (1-indexed, matches array position)
}

export interface StillZoneMoodContextContent {
  [context: string]: StillZoneContentMessage[];
}

export interface StillZoneContentLibrary {
  [mood: string]: StillZoneMoodContextContent;
}

// Define the available moods and contexts for Still Zone
// These can be different from Still Lift if needed
export const STILL_ZONE_MOODS = ['good', 'okay', 'bad', 'awful'] as const;
export const STILL_ZONE_CONTEXTS = ['still', 'move', 'focused'] as const;

export type StillZoneMood = typeof STILL_ZONE_MOODS[number];
export type StillZoneContext = typeof STILL_ZONE_CONTEXTS[number];

// Main content library for Still Zone
// TODO: Add your Still Zone specific content here
export const STILL_ZONE_CONTENT_LIBRARY: StillZoneContentLibrary = {
  good: {
    still: [
      // Add Still Zone specific content here
      // Example structure:
      // {
      //   actionType: "VISUALIZE",
      //   message: "Your Still Zone message here",
      //   displayTime: 120,
      //   audioIndex: 1
      // },
    ],
    move: [],
    focused: []
  },
  okay: {
    still: [],
    move: [],
    focused: []
  },
  bad: {
    still: [],
    move: [],
    focused: []
  },
  awful: {
    still: [],
    move: [],
    focused: []
  }
};

// Utility functions for Still Zone content management
export function getStillZoneRandomMessage(
  mood: StillZoneMood, 
  context: StillZoneContext, 
  excludeMessage?: StillZoneContentMessage | null
): StillZoneContentMessage | null {
  const messages = STILL_ZONE_CONTENT_LIBRARY[mood]?.[context];
  if (!messages || messages.length === 0) {
    return null;
  }
  
  // If we need to exclude a message, filter it out
  let availableMessages = messages;
  if (excludeMessage) {
    availableMessages = messages.filter(msg => {
      const isSameMessage = msg.message === excludeMessage.message && msg.audioIndex === excludeMessage.audioIndex;
      return !isSameMessage;
    });
    
    if (availableMessages.length === 0) {
      console.warn('[still-zone-content] All messages were excluded, but there are no other messages available.');
      availableMessages = messages;
    }
  }
  
  if (availableMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    return availableMessages[randomIndex];
  }
  
  return null;
}

export function getAllStillZoneMessages(mood: StillZoneMood, context: StillZoneContext): StillZoneContentMessage[] {
  return STILL_ZONE_CONTENT_LIBRARY[mood]?.[context] || [];
}

export function getStillZoneRandomMessages(
  mood: StillZoneMood, 
  context: StillZoneContext, 
  count: number = 3
): StillZoneContentMessage[] {
  const allMessages = getAllStillZoneMessages(mood, context);
  if (allMessages.length === 0) return [];
  
  const shuffled = [...allMessages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allMessages.length));
}

// Validation function to ensure Still Zone content structure is correct
export function validateStillZoneContentLibrary(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const mood of STILL_ZONE_MOODS) {
    if (!STILL_ZONE_CONTENT_LIBRARY[mood]) {
      errors.push(`[Still Zone] Missing content for mood: ${mood}`);
      continue;
    }
    
    for (const context of STILL_ZONE_CONTEXTS) {
      if (!STILL_ZONE_CONTENT_LIBRARY[mood][context]) {
        errors.push(`[Still Zone] Missing content for mood-context combination: ${mood}-${context}`);
        continue;
      }
      
      if (STILL_ZONE_CONTENT_LIBRARY[mood][context].length === 0) {
        errors.push(`[Still Zone] Empty content array for mood-context combination: ${mood}-${context}`);
        continue;
      }
      
      STILL_ZONE_CONTENT_LIBRARY[mood][context].forEach((message, index) => {
        if (!message.actionType || !message.message || !message.displayTime) {
          errors.push(`[Still Zone] Invalid message structure at ${mood}-${context}[${index}]: missing actionType, message, or displayTime`);
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

