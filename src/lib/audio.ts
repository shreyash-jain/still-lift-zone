export interface PlayTextAudioOptions {
  title?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceHintNames?: string[];
  mood?: string;
  context?: string;
  isHomepage?: boolean;
  audioIndex?: number;
  preferExactIndex?: boolean;
  audioIntent?: AudioIntent;
}

export type AudioIntent = 'homepage' | 'task' | 'other';

let activeAudio: HTMLAudioElement | null = null;
let activeSpeech: SpeechSynthesisUtterance | null = null;
let activeAudioIntent: AudioIntent | null = null;
// When we cancel or stop audio, browsers may fire a spurious TTS "interrupted"
// error. Suppress error logging for a short window to avoid noisy console.
let suppressTtsErrorsUntil = 0;

type ExternalAudioStopper = () => void;

const externalAudioStopHandlers = new Set<ExternalAudioStopper>();
let isStoppingNarration = false;

export function registerExternalAudioStopper(handler: ExternalAudioStopper): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  externalAudioStopHandlers.add(handler);

  return () => {
    externalAudioStopHandlers.delete(handler);
  };
}

export function stopAllNarration() {
  if (typeof window === 'undefined') return;

  if (isStoppingNarration) return;

  isStoppingNarration = true;

  try {
    const handlers = Array.from(externalAudioStopHandlers);
    for (const handler of handlers) {
      try {
        handler();
      } catch (error) {
        console.warn('[audio] External audio stop handler failed:', error);
      }
    }

    if (activeAudio) {
      activeAudio.pause();
      try {
        activeAudio.currentTime = 0;
      } catch (error) {
        console.warn('[audio] Unable to reset audio currentTime:', error);
      }
      activeAudio = null;
    }

    if (activeSpeech) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        console.warn('[audio] Unable to cancel speech synthesis:', error);
      }
      // Suppress the inevitable "interrupted" errors fired by some browsers
      suppressTtsErrorsUntil = Date.now() + 1000;
      activeSpeech = null;
    }
    activeAudioIntent = null;
  } finally {
    isStoppingNarration = false;
  }
}

export function stopAudioByIntent(intent: AudioIntent) {
  if (activeAudioIntent === intent) {
    stopAllNarration();
  }
}

export function getActiveAudioIntent(): AudioIntent | null {
  return activeAudioIntent;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Try to play a pre-generated audio file using various naming strategies.
 * Returns true if audio file playback started, else false.
 */
async function tryPlayAudioFile(
  title: string | undefined,
  message: string,
  options: PlayTextAudioOptions | undefined,
  intent: AudioIntent
): Promise<boolean> {
  const candidates: string[] = [];
  
  // Strategy 1: Mood-Context structured files in organized folders - PRIORITY
  if (options?.mood && options?.context) {
    const folderName = getMoodContextFolder(options.mood, options.context);
    if (folderName) {
      // audioIndex is optional in PlayTextAudioOptions (for backwards compatibility), 
      // but required when coming from ContentMessage. Default to 1 if not provided.
      const primaryIndex = Math.max(1, Math.floor(options.audioIndex ?? 1));
      const indicesToTry: number[] = [primaryIndex];

      if (!options?.preferExactIndex && primaryIndex !== 1) {
        indicesToTry.push(1);
      }

      // Map mood and context for file naming
      const moodCapitalized = options.mood.charAt(0).toUpperCase() + options.mood.slice(1);
      const contextMapped = mapContextToFileNaming(options.context);
      
      // Support multiple naming patterns for flexibility
      const formats = ['mp3', 'm4a', 'ogg', 'wav'];
      for (const idx of indicesToTry) {
        // Format index with zero-padding (01, 02, etc.) and without (1, 2, etc.)
        const idxPadded = idx.toString().padStart(2, '0');
        const idxUnpadded = idx.toString();
        
        for (const format of formats) {
          // Try the actual file naming pattern: Mood_{Mood}_Content_{Context}_Audio_{index}.mp3
          candidates.push(
            `/still-lift-audio/${folderName}/Mood_${moodCapitalized}_Content_${contextMapped}_Audio_${idxPadded}.${format}`,
            `/still-lift-audio/${folderName}/Mood_${moodCapitalized}_Content_${contextMapped}_Audio_${idxUnpadded}.${format}`
          );
          
          // Also try simplified patterns for backwards compatibility
          candidates.push(
            `/still-lift-audio/${folderName}/Audio_${idxPadded}.${format}`,
            `/still-lift-audio/${folderName}/Audio_${idxUnpadded}.${format}`,
            `/still-lift-audio/${folderName}/audio_${idxPadded}.${format}`,
            `/still-lift-audio/${folderName}/audio_${idxUnpadded}.${format}`,
            `/still-lift-audio/${folderName}/${idxPadded}.${format}`,
            `/still-lift-audio/${folderName}/${idxUnpadded}.${format}`
          );
        }
      }
    }
  }
  
  // Strategy 2: Homepage audio (only if no mood/context or explicitly requested)
  if (options?.isHomepage && (!options?.mood || !options?.context)) {
    candidates.push('/still-lift-audio/homepage audio.mp3');
  }
  
  // Strategy 3: Message-based slugs (original approach)
  const combinedKey = title && title.trim().length > 0 ? `${title} ${message}` : '';
  const slugsToTry = [
    ...(combinedKey ? [slugify(combinedKey).slice(0, 120)] : []),
    slugify(message).slice(0, 120),
  ];

  for (const slug of slugsToTry) {
    candidates.push(
      `/still-lift-audio/${slug}.mp3`,
      `/still-lift-audio/${slug}.m4a`,
      `/still-lift-audio/${slug}.ogg`,
      `/still-lift-audio/${slug}.wav`
    );
  }

  console.log('[audio] Trying audio candidates:', candidates);
  console.log('[audio] Looking for audio with options:', { mood: options?.mood, context: options?.context, audioIndex: options?.audioIndex, preferExactIndex: options?.preferExactIndex });

  for (const src of candidates) {
    try {
      const audio = new Audio(src);
      
      // Try to load and play audio with fallback strategies
      // First, try immediate play (works if audio is cached)
      try {
        const immediatePlayPromise = audio.play();
        if (immediatePlayPromise !== undefined) {
          await immediatePlayPromise;
          console.log('[audio] ✅ Playing pre-generated file (cached):', src);
          if (activeAudio && activeAudio !== audio) {
            activeAudio.pause();
          }
          activeAudio = audio;
          activeAudioIntent = intent;
          audio.onended = () => {
            if (activeAudio === audio) {
              activeAudio = null;
              activeAudioIntent = null;
            }
          };
          return true;
        }
      } catch (immediateError) {
        // If immediate play fails, try loading first
        console.log('[audio] Immediate play failed, trying to load:', src);
      }
      
      // If immediate play didn't work, wait for audio to load
      try {
        await new Promise<void>((resolve, reject) => {
          let timeoutId: NodeJS.Timeout | null = null;
          let resolved = false;
          
          const cleanup = () => {
            if (resolved) return;
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('loadeddata', onCanPlay);
            audio.removeEventListener('error', onError);
            if (timeoutId) clearTimeout(timeoutId);
          };
          
          const onCanPlay = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            resolve();
          };
          
          const onError = (e: Event) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            const error = e instanceof Error ? e : new Error('Audio load failed');
            reject(error);
          };
          
          // Try multiple events for better browser compatibility
          audio.addEventListener('canplaythrough', onCanPlay, { once: true });
          audio.addEventListener('canplay', onCanPlay, { once: true });
          audio.addEventListener('loadeddata', onCanPlay, { once: true });
          audio.addEventListener('error', onError, { once: true });
          
          // Set a shorter timeout for loading (2 seconds)
          timeoutId = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              cleanup();
              // Don't reject - try to play anyway
              resolve();
            }
          }, 2000);
          
          // Start loading the audio
          audio.load();
        });
      } catch (loadError) {
        console.log('[audio] Audio load had issues, trying to play anyway:', src);
      }
      
      // Try to play after loading (or even if loading had issues)
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('[audio] ✅ Playing pre-generated file:', src);
        if (activeAudio && activeAudio !== audio) {
          activeAudio.pause();
        }
        activeAudio = audio;
        activeAudioIntent = intent;
        audio.onended = () => {
          if (activeAudio === audio) {
            activeAudio = null;
            activeAudioIntent = null;
          }
        };
        return true;
      }
    } catch (err) {
      // Handle different types of errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.log('[audio] ❌ Failed to load/play:', src, errorMessage);
      continue;
    }
  }
  
  console.warn('[audio] No matching audio file found for title/message. Falling back to TTS.');
  return false;
}

/**
 * Map mood and context to folder path
 */
function getMoodContextFolder(mood: string, context: string): string | null {
  const moodLower = mood.toLowerCase();
  const contextLower = context.toLowerCase();
  
  // Map context names
  let contextMapped: string;
  switch (contextLower) {
    case 'still': contextMapped = 'still'; break;
    case 'move': contextMapped = 'move'; break;
    case 'focused': contextMapped = 'focused'; break; // Note: folder uses "focused", not "focused"
    default: contextMapped = contextLower;
  }
  
  // Build folder name: mood-context
  const folderName = `${moodLower}-${contextMapped}`;
  return folderName;
}

/**
 * Map context to file naming convention (capitalized for Content_{Context} in filename)
 */
function mapContextToFileNaming(context: string): string {
  switch (context.toLowerCase()) {
    case 'still': return 'Still';
    case 'move': return 'Move';
    case 'focused': return 'Focused'; // Note: file uses "Focused", not "focused"
    default: return context.charAt(0).toUpperCase() + context.slice(1);
  }
}

/**
 * Speak text via Web Speech API.
 */
function speakWithTts(text: string, options: PlayTextAudioOptions | undefined, intent: AudioIntent) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[audio] Speech synthesis not available');
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.95;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 0.9;

    if (options?.voiceHintNames && options.voiceHintNames.length > 0) {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => options.voiceHintNames!.some(h => v.name.includes(h)));
      if (preferred) utterance.voice = preferred;
    }

    // Add error handling for TTS
    utterance.onerror = (event) => {
      const err = (event as SpeechSynthesisErrorEvent).error as string | undefined;
      // Ignore benign interruption/cancel events or those triggered during stop
      const shouldSuppress =
        Date.now() < suppressTtsErrorsUntil ||
        err === 'interrupted' ||
        err === 'canceled' ||
        err === 'not-allowed';
      if (shouldSuppress) {
        console.warn('[audio] TTS notice (suppressed):', err);
      } else {
        console.error('[audio] TTS error:', err);
      }
      if (activeSpeech === utterance) {
        activeSpeech = null;
      }
    };

    utterance.onend = () => {
      if (activeSpeech === utterance) {
        activeSpeech = null;
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    activeSpeech = utterance;
    activeAudioIntent = intent;
    console.log('[audio] 🔊 Playing TTS:', text);
  } catch (error) {
    console.error('[audio] Error in TTS:', error);
  }
}

/**
 * Plays a pre-generated audio file for the given message if available, otherwise TTS.
 * Now supports your actual file naming patterns!
 */
export async function playMessageAudio(
  title: string | undefined,
  message: string,
  options?: PlayTextAudioOptions
): Promise<void> {
  if (typeof window === 'undefined') return;

  const intent: AudioIntent = options?.audioIntent
    ?? (options?.isHomepage ? 'homepage' : 'task');

  try {
    stopAllNarration();
    // Prefer pre-generated audio
    const played = await tryPlayAudioFile(title, message, options, intent);
    if (played) return;

    // No TTS fallback - if audio file not found, silently fail
    console.warn('[audio] Audio file not found and TTS fallback disabled. No audio will play.');
  } catch (error) {
    console.error('[audio] Error in playMessageAudio:', error);
    // No TTS fallback - silently fail if there's an error
    console.warn('[audio] Audio playback failed and TTS fallback disabled. No audio will play.');
  }
}

export function getSuggestedAudioSlug(title: string | undefined, message: string): string {
  const key = title && title.trim().length > 0 ? `${title} ${message}` : message;
  return slugify(key).slice(0, 120);
}


