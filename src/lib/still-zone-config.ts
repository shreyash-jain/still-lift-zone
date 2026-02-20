/**
 * Still Zone — Dynamic Configuration
 * Single source of truth for all mood, context, time, and support options.
 * No hardcoded values in any page — everything reads from here.
 * Audio files stay local; DB stores only the key.
 */

// ─── Mood Options ──────────────────────────────────────────────────────────────
export interface MoodOption {
    key: string;
    label: string;
    emoji: string;
    sentiment: 'positive' | 'neutral' | 'negative';
}

export const MOOD_OPTIONS: MoodOption[] = [
    { key: 'overwhelmed', label: 'Overwhelmed / Stressed', emoji: '😰', sentiment: 'negative' },
    { key: 'sad', label: 'Sad / Low Mood', emoji: '😔', sentiment: 'negative' },
    { key: 'anxious', label: 'Anxious / Restless', emoji: '😟', sentiment: 'negative' },
    { key: 'tired', label: 'Tired / Burned Out', emoji: '😴', sentiment: 'neutral' },
    { key: 'focus', label: 'Seeking Focus', emoji: '🧐', sentiment: 'positive' },
    { key: 'curious', label: 'Just Curious', emoji: '🤔', sentiment: 'positive' },
];

// ─── Context Options ───────────────────────────────────────────────────────────
export interface ContextOption {
    key: string;
    label: string;
    icon: string;
    description?: string;
}

export const CONTEXT_OPTIONS: ContextOption[] = [
    { key: 'still', label: 'Still and Safe', icon: '🪑', description: 'At home or a quiet safe space' },
    { key: 'move', label: 'On the Move, but Safe', icon: '🚶', description: 'Walking, commuting (passenger)' },
    { key: 'focused', label: 'On the Move and Focused', icon: '🎯', description: 'Driving, active commuting' },
];

// ─── Time Options ──────────────────────────────────────────────────────────────
export interface TimeOption {
    key: string;
    value: number;   // minutes
    label: string;
}

export const TIME_OPTIONS: TimeOption[] = [
    { key: '1min', value: 1, label: '1 minute' },
    { key: '2min', value: 2, label: '2 minutes' },
    { key: '5min', value: 5, label: '5 minutes' },
    { key: '10min', value: 10, label: '10 minutes' },
];

// ─── Support Options ───────────────────────────────────────────────────────────
export interface SupportOption {
    key: string;
    label: string;
    iconName: string;         // lucide icon name for dynamic rendering
    description: string;
    color: string;
    bg: string;
    message: string;          // message shown in experience page
    action: string;           // action text shown in experience page
    actionType: string;
    audioKey?: string;        // audio file key — maps to local file at runtime
}

export const SUPPORT_OPTIONS: SupportOption[] = [
    {
        key: 'visual-breathing',
        label: 'Visual Breathing',
        iconName: 'Wind',
        description: 'Guided breathing exercises',
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        message: 'Take a deep breath. Inhale calm, exhale tension.',
        action: 'Practice deep breathing for 2 minutes',
        actionType: 'breathing',
        audioKey: 'breathing_calm',
    },
    {
        key: 'audio-tool',
        label: 'Audio Tool',
        iconName: 'Headphones',
        description: 'Calming audio guidance',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        message: 'Listen mindfully. Let the sounds guide you to peace.',
        action: 'Listen to calming audio guidance',
        actionType: 'audio',
        audioKey: 'audio_soothing',
    },
    {
        key: 'immediate-advice',
        label: 'Immediate Advice',
        iconName: 'Lightbulb',
        description: 'Quick helpful tips',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        message: 'You are stronger than you think. This moment will pass.',
        action: 'Remember: One step at a time',
        actionType: 'advice',
    },
    {
        key: 'havening',
        label: 'Havening Technique',
        iconName: 'User',
        description: 'Self-soothing practice',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        message: 'Gently touch your arms. Feel safe and grounded.',
        action: 'Practice havening technique for comfort',
        actionType: 'havening',
    },
    {
        key: 'nlp-micro',
        label: 'NLP Micro Tool',
        iconName: 'Brain',
        description: 'Mental reframing exercises',
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-100 dark:bg-violet-900/30',
        message: 'Reframe this thought: What would my best self say?',
        action: 'Challenge and reframe your current thought',
        actionType: 'nlp',
    },
    {
        key: 'resources',
        label: 'Suggested Resources',
        iconName: 'BookOpen',
        description: 'Curated materials',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        message: 'Knowledge is power. Explore resources that can help.',
        action: 'Discover helpful articles and tools',
        actionType: 'resources',
    },
];

// ─── Audio file local mapping ──────────────────────────────────────────────────
// DB stores only the key. This maps key → local file path at runtime.
export const AUDIO_FILE_MAP: Record<string, string> = {
    breathing_calm: '/audio/breathing_calm.mp3',
    audio_soothing: '/audio/audio_soothing.mp3',
    // Add more mappings as audio files are added to /public/audio/
};

/**
 * Resolve an audio key from the DB to a local file path.
 * Returns undefined if key not found.
 */
export function resolveAudioPath(audioKey: string | null | undefined): string | undefined {
    if (!audioKey) return undefined;
    return AUDIO_FILE_MAP[audioKey];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
export function getMoodByKey(key: string): MoodOption | undefined {
    return MOOD_OPTIONS.find((m) => m.key === key);
}

export function getContextByKey(key: string): ContextOption | undefined {
    return CONTEXT_OPTIONS.find((c) => c.key === key);
}

export function getTimeByKey(key: string): TimeOption | undefined {
    return TIME_OPTIONS.find((t) => t.key === key);
}

export function getSupportByKey(key: string): SupportOption | undefined {
    return SUPPORT_OPTIONS.find((s) => s.key === key);
}

// ─── Mood score map — consistent with MoodTrackingGraph MOOD_CONFIG ────────────
// Higher = more positive. Used for average mood calculation.
export const MOOD_SCORES: Record<string, number> = {
    curious: 6,
    focus: 5,
    tired: 4,
    overwhelmed: 3,
    anxious: 2,
    sad: 1,
};

/**
 * Given multiple mood keys, calculate the average score and return
 * the MoodOption whose score is closest to that average.
 * Returns undefined if no valid keys provided.
 */
export function getMoodByAverageScore(keys: string[]): MoodOption | undefined {
    const validKeys = keys.filter(k => MOOD_SCORES[k] !== undefined);
    if (validKeys.length === 0) return undefined;

    const avg = validKeys.reduce((sum, k) => sum + MOOD_SCORES[k], 0) / validKeys.length;

    // Find the mood key whose score is closest to the average
    let closestKey = validKeys[0];
    let minDiff = Math.abs(MOOD_SCORES[closestKey] - avg);
    for (const k of Object.keys(MOOD_SCORES)) {
        const diff = Math.abs(MOOD_SCORES[k] - avg);
        if (diff < minDiff) {
            minDiff = diff;
            closestKey = k;
        }
    }

    return getMoodByKey(closestKey);
}
