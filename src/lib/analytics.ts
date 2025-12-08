import * as amplitude from '@amplitude/analytics-browser';

// Initialize Amplitude
const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || 'f3173e0e52e9f783511c7e57b800efe1';

let isInitialized = false;

export const initAnalytics = () => {
  if (typeof window === 'undefined' || isInitialized) {
    return;
  }

  try {
    amplitude.init(AMPLITUDE_API_KEY, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: false,
        fileDownloads: false,
      },
    });
    isInitialized = true;
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
};

// Track mood selection
export const trackMoodSelected = (mood: string) => {
  amplitude.track('Mood Selected', {
    mood: mood,
    timestamp: new Date().toISOString(),
  });
};

// Track context selection
export const trackContextSelected = (context: string) => {
  amplitude.track('Context Selected', {
    context: context,
    timestamp: new Date().toISOString(),
  });
};

// Track mood-context combination
export const trackMoodContextCombination = (mood: string, context: string) => {
  amplitude.track('Mood Context Combination', {
    mood: mood,
    context: context,
    combination: `${mood}_${context}`,
    timestamp: new Date().toISOString(),
  });
};

// Track micro-habit reveal
export const trackMicroHabitRevealed = (mood: string, context: string, revealType: string, actionType: string) => {
  amplitude.track('Micro Habit Revealed', {
    mood: mood,
    context: context,
    revealType: revealType,
    actionType: actionType,
    combination: `${mood}_${context}`,
    timestamp: new Date().toISOString(),
  });
};

// Track user actions
export const trackUserAction = (action: string, mood?: string, context?: string) => {
  amplitude.track('User Action', {
    action: action,
    mood: mood,
    context: context,
    timestamp: new Date().toISOString(),
  });
};

// Track experience completion
export const trackExperienceCompleted = (mood: string, context: string, action: string) => {
  amplitude.track('Experience Completed', {
    mood: mood,
    context: context,
    action: action,
    combination: `${mood}_${context}`,
    timestamp: new Date().toISOString(),
  });
};
