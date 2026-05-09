// Content management system for Still Zone
// Structure: mood → context → supportType → timeKey → messages[]
// This allows precise content delivery based on all 4 user selections.

export interface ContentSegment {
  duration: number;    // seconds for this segment
  message: string;     // text shown during this segment
  audioUrl?: string;   // voice audio for this segment
}

export interface StillZoneContentMessage {
  actionType: 'VISUALIZE' | 'ACTION' | 'REPEAT' | 'BREATHE' | 'LISTEN';
  heading?: string;
  message: string;           // for single-segment entries
  displayTime: number;       // total duration in seconds
  audioIndex: number;        // legacy
  audioSrc?: string;         // for single-segment entries
  audioLoop?: boolean;          // if true, main audio repeats until timer ends
  backgroundAudioSrc?: string;  // loops after voice audio ends
  backgroundAudioMode?: 'with' | 'after'; // play with main audio or after it ends
  completionAudioSrc?: string;  // plays when timer finishes
  beepAudioSrc?: string;        // plays between segments
  // Per-track volume (0–100). undefined falls back to defaults in the player.
  audioVolume?: number;
  backgroundAudioVolume?: number;
  completionAudioVolume?: number;
  beepAudioVolume?: number;
  // Multi-segment support (replaces hardcoded combo)
  isCombo?: boolean;
  segments?: ContentSegment[];  // dynamic segments defined by admin
  // Legacy combo fields (kept for backward compatibility)
  comboFirstAudioIndex?: number;
  comboSecondAudioIndex?: number;
  comboSecondMessage?: string;
  comboFirstAudioSrc?: string;
  comboSecondAudioSrc?: string;
}

// mood → context → supportType → timeKey → messages[]
export interface StillZoneContentLibrary {
  [mood: string]: {
    [context: string]: {
      [supportType: string]: {
        [timeKey: string]: StillZoneContentMessage[];
      };
    };
  };
}

export const STILL_ZONE_MOODS = ['overwhelmed', 'sad', 'anxious', 'tired', 'focus', 'curious'] as const;
export const STILL_ZONE_CONTEXTS = ['still', 'move', 'focused'] as const;
export const STILL_ZONE_SUPPORT_TYPES = ['visual-breathing', 'audio-tool', 'immediate-advice', 'havening', 'nlp-micro', 'resources'] as const;
export const STILL_ZONE_TIME_KEYS = ['1min', '2min', '3min', '5min'] as const;

// Beep audio played between the 3min and 2min parts in a 5min combo
export const COMBO_BEEP_AUDIO = '/audio/beep_transition.mp3';

export type StillZoneMood = typeof STILL_ZONE_MOODS[number];
export type StillZoneContext = typeof STILL_ZONE_CONTEXTS[number];
export type StillZoneSupportType = typeof STILL_ZONE_SUPPORT_TYPES[number];
export type StillZoneTimeKey = typeof STILL_ZONE_TIME_KEYS[number];

// ─── Content Library ──────────────────────────────────────────────────────────
export const STILL_ZONE_CONTENT_LIBRARY: StillZoneContentLibrary = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOOD: Anxious / Restless
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  anxious: {
    // ── ZONE: Still ──────────────────────────────────────────────────────────
    still: {
      // ── Visual Breathing Tool ──────────────────────────────────────────────
      'visual-breathing': {
        '1min': [
          { actionType: 'BREATHE', message: 'Take a slow breath in. Pause at the top, two, three, four. Exhale gently for five. Feel yourself grounded. Feel yourself calm.', displayTime: 60, audioIndex: 1 },
          { actionType: 'BREATHE', message: 'Take two short breaths in through the nose. Then release it with a long, slow exhale. We\'ll do five rounds. With each round let the exhale soften you.', displayTime: 60, audioIndex: 2 },
          { actionType: 'BREATHE', message: 'Try a soft box breath. Inhale for four, hold for two, exhale for four, pause here for two. We will repeat this six times.', displayTime: 60, audioIndex: 3 },
          { actionType: 'BREATHE', message: 'We\'re going to try triangle breathing. Inhale for three, exhale for three, pause for three. Repeat this cycle ten times, gently.', displayTime: 60, audioIndex: 4 },
          { actionType: 'BREATHE', message: 'Inhale for five seconds, exhale for six seconds. Slowly complete eight cycles. Remember, do not strain, but breathe calmly with intention.', displayTime: 60, audioIndex: 5 },
          { actionType: 'BREATHE', message: 'Let your breath out be slightly longer than your breath in. Breathe in softly. And breathe out just a little slower. Continue like this for a couple of minutes, allowing the longer exhale to settle your body.', displayTime: 60, audioIndex: 6, audioSrc: '/still-zone-audio/ElevenLabs_2026-04-08T04_13_18_Clara - Relaxing_pvc_sp100_s50_sb75_se0_b_m2.mp3' },
          { actionType: 'BREATHE', message: 'Take a slow breath in. Now purse your lips gently, as if you\'re cooling hot soup. Exhale slowly through the lips. Again. We will do ten slow, steady exhales, soft and controlled.', displayTime: 60, audioIndex: 7 },
          { actionType: 'BREATHE', message: 'Take a breath in. As you breathe out, begin counting down slowly from eight… seven… six… all the way down to one. If you lose your place, that\'s okay. Simply begin again. Repeat the countdown once more, easy and unhurried.', displayTime: 60, audioIndex: 8 },
          { actionType: 'BREATHE', message: 'Bring your attention to the sensation of breath at your nostrils. Feel the coolness as you breathe in. The warmth as you breathe out. If your mind drifts, gently return to that feeling.', displayTime: 60, audioIndex: 9 },
          { actionType: 'BREATHE', message: 'Take a slow breath in. As you exhale, soften your jaw. Let your tongue rest. Let your teeth part slightly. Continue for twelve easy breaths, releasing tension each time you breathe out.', displayTime: 60, audioIndex: 10 },
        ],
        '2min': [
          { actionType: 'BREATHE', message: 'Breathe in and silently say, "Here." Breathe out and silently say, "Now." Again. "Here." "Now." Continue for twelve slow, steady cycles.', displayTime: 120, audioIndex: 11 },
          { actionType: 'BREATHE', message: 'Breathe in for four seconds and out for six seconds. No holding. Just gentle, steady breathing. Complete eight calm cycles.', displayTime: 120, audioIndex: 12 },
          { actionType: 'BREATHE', message: 'Take a big natural breath in. As you exhale, let it be thin and slow, like you\'re breathing out through a straw. Inhale normally. Exhale long and narrow. Continue for ten breaths.', displayTime: 120, audioIndex: 13 },
          { actionType: 'BREATHE', message: 'Breathe in for five seconds and exhale over seven seconds. As you breathe out, let your shoulders drop. Repeat for six times.', displayTime: 120, audioIndex: 14 },
          { actionType: 'BREATHE', message: 'Take a breath in. As you exhale, make it slightly longer than the inhale and pause gently for three seconds at the end. Then allow the next inhale to arrive. Continue for eight calm cycles.', displayTime: 120, audioIndex: 15 },
          { actionType: 'BREATHE', message: 'Breathe in soft and deep. As you exhale slowly, imagine being in your favourite calming space. Repeat 10 times.', displayTime: 120, audioIndex: 16 },
          { actionType: 'BREATHE', message: 'Let the inhale come naturally, without effort. As you breathe out, let your belly soften. Continue for ten easy breaths.', displayTime: 120, audioIndex: 17 },
          { actionType: 'BREATHE', message: 'Take a normal breath in and out. In the next breath, increase the exhale time. Then return to one normal breath. Alternate like this ten times.', displayTime: 120, audioIndex: 18 },
          { actionType: 'BREATHE', message: 'Keep your eyes shut. Take a slow breath in. As you exhale through your mouth, imagine lightly fogging a mirror. Continue for ten calm breaths.', displayTime: 120, audioIndex: 19 },
          { actionType: 'BREATHE', message: 'Breathe in for three seconds and let the slower exhale for six seconds trigger relaxing your whole body. Complete ten rounds.', displayTime: 120, audioIndex: 20 },
        ],
        '3min': [
          { actionType: 'BREATHE', message: 'Take a breath in. As you exhale, relax your shoulders. Continue for three minutes allowing the shoulders to relax more and more.', displayTime: 180, audioIndex: 21 },
          { actionType: 'BREATHE', message: 'Breathe in. After each slow exhale, silently say, "I am Resetting". Continue for three minutes.', displayTime: 180, audioIndex: 22 },
          { actionType: 'BREATHE', message: 'Take a slow and deep inhale. As you exhale, silently say, "I\'m at Peace, Steady and Calm." Let the words fill the exhale. Keep repeating for three minutes.', displayTime: 180, audioIndex: 23 },
          { actionType: 'BREATHE', message: 'Breathe in for four seconds, hold for four seconds, and exhale for seven seconds as you imagine your head and neck relaxing. Continue for three minutes.', displayTime: 180, audioIndex: 24 },
          { actionType: 'BREATHE', message: 'Take a deep inhale and a slow longer exhale. Focus on sensing the air entering and leaving your nostrils. Continue for three minutes.', displayTime: 180, audioIndex: 25 },
          { actionType: 'BREATHE', message: 'Take one normal breath in and out. Then repeat with a longer inhale and exhale. Alternate between the short and long breathing for three minutes.', displayTime: 180, audioIndex: 26 },
          { actionType: 'BREATHE', message: 'Breathe in slow and gentle. Let your exhale be longer as you picture your favourite flower. Continue for three minutes.', displayTime: 180, audioIndex: 27 },
          { actionType: 'BREATHE', message: 'Breathe in slowly and as you exhale, imagine dropping some weight from your chest. Let it fall away, releasing a little more burden each cycle. Keep repeating for three minutes.', displayTime: 180, audioIndex: 28 },
          { actionType: 'BREATHE', message: 'Breathe in for four seconds, hold for four seconds and exhale slowly over 6 seconds. At the end of the exhale repeat "I am in control, I\'m OK" and continue for three minutes.', displayTime: 180, audioIndex: 29 },
          { actionType: 'BREATHE', message: 'Do ten rapid shallow breaths followed by two breaths with a slow long inhale and exhale. Repeat this cycle of ten rapid and two long breaths for 3 minutes. Feel the calm.', displayTime: 180, audioIndex: 30 },
        ],
        // 5min = 3min audio → beep → 2min audio
        '5min': [
          { actionType: 'BREATHE', message: 'Take a breath in. As you exhale, relax your shoulders. Continue for three minutes allowing the shoulders to relax more and more.', displayTime: 300, audioIndex: 31, isCombo: true, comboFirstAudioIndex: 21, comboSecondAudioIndex: 11, comboSecondMessage: 'Breathe in and silently say, "Here." Breathe out and silently say, "Now." Again. "Here." "Now." Continue for twelve slow, steady cycles.' },
          { actionType: 'BREATHE', message: 'Breathe in. After each slow exhale, silently say, "I am Resetting". Continue for three minutes.', displayTime: 300, audioIndex: 32, isCombo: true, comboFirstAudioIndex: 22, comboSecondAudioIndex: 12, comboSecondMessage: 'Breathe in for four seconds and out for six seconds. No holding. Just gentle, steady breathing. Complete eight calm cycles.' },
          { actionType: 'BREATHE', message: 'Take a slow and deep inhale. As you exhale, silently say, "I\'m at Peace, Steady and Calm." Let the words fill the exhale. Keep repeating for three minutes.', displayTime: 300, audioIndex: 33, isCombo: true, comboFirstAudioIndex: 23, comboSecondAudioIndex: 13, comboSecondMessage: 'Take a big natural breath in. As you exhale, let it be thin and slow, like you\'re breathing out through a straw. Inhale normally. Exhale long and narrow. Continue for ten breaths.' },
          { actionType: 'BREATHE', message: 'Breathe in for four seconds, hold for four seconds, and exhale for seven seconds as you imagine your head and neck relaxing. Continue for three minutes.', displayTime: 300, audioIndex: 34, isCombo: true, comboFirstAudioIndex: 24, comboSecondAudioIndex: 14, comboSecondMessage: 'Breathe in for five seconds and exhale over seven seconds. As you breathe out, let your shoulders drop. Repeat for six times.' },
          { actionType: 'BREATHE', message: 'Take a deep inhale and a slow longer exhale. Focus on sensing the air entering and leaving your nostrils. Continue for three minutes.', displayTime: 300, audioIndex: 35, isCombo: true, comboFirstAudioIndex: 25, comboSecondAudioIndex: 15, comboSecondMessage: 'Take a breath in. As you exhale, make it slightly longer than the inhale and pause gently for three seconds at the end. Then allow the next inhale to arrive. Continue for eight calm cycles.' },
          { actionType: 'BREATHE', message: 'Take one normal breath in and out. Then repeat with a longer inhale and exhale. Alternate between the short and long breathing for three minutes.', displayTime: 300, audioIndex: 36, isCombo: true, comboFirstAudioIndex: 26, comboSecondAudioIndex: 16, comboSecondMessage: 'Breathe in soft and deep. As you exhale slowly, imagine being in your favourite calming space. Repeat 10 times.' },
          { actionType: 'BREATHE', message: 'Breathe in slow and gentle. Let your exhale be longer as you picture your favourite flower. Continue for three minutes.', displayTime: 300, audioIndex: 37, isCombo: true, comboFirstAudioIndex: 27, comboSecondAudioIndex: 17, comboSecondMessage: 'Let the inhale come naturally, without effort. As you breathe out, let your belly soften. Continue for ten easy breaths.' },
          { actionType: 'BREATHE', message: 'Breathe in slowly and as you exhale, imagine dropping some weight from your chest. Let it fall away, releasing a little more burden each cycle. Keep repeating for three minutes.', displayTime: 300, audioIndex: 38, isCombo: true, comboFirstAudioIndex: 28, comboSecondAudioIndex: 18, comboSecondMessage: 'Take a normal breath in and out. In the next breath, increase the exhale time. Then return to one normal breath. Alternate like this ten times.' },
          { actionType: 'BREATHE', message: 'Breathe in for four seconds, hold for four seconds and exhale slowly over 6 seconds. At the end of the exhale repeat "I am in control, I\'m OK" and continue for three minutes.', displayTime: 300, audioIndex: 39, isCombo: true, comboFirstAudioIndex: 29, comboSecondAudioIndex: 19, comboSecondMessage: 'Keep your eyes shut. Take a slow breath in. As you exhale through your mouth, imagine lightly fogging a mirror. Continue for ten calm breaths.' },
          { actionType: 'BREATHE', message: 'Do ten rapid shallow breaths followed by two breaths with a slow long inhale and exhale. Repeat this cycle of ten rapid and two long breaths for 3 minutes. Feel the calm.', displayTime: 300, audioIndex: 40, isCombo: true, comboFirstAudioIndex: 30, comboSecondAudioIndex: 20, comboSecondMessage: 'Breathe in for three seconds and let the slower exhale for six seconds trigger relaxing your whole body. Complete ten rounds.' },
        ],
      },

      // ── Audio Tool ─────────────────────────────────────────────────────────
      'audio-tool': {
        '1min': [
          { actionType: 'LISTEN', message: 'In a moment, you\'ll hear the sound of rain on glass. As you listen, notice the different layers of sound. See if you can find the farthest layer in the distance. Let your attention rest there as the sound continues.', displayTime: 60, audioIndex: 1 },
          { actionType: 'LISTEN', message: 'You\'re about to hear the sound of ocean waves. Allow your breath to follow the rhythm of the swell. Breathing in as the wave rises… And breathing out as it falls.', displayTime: 60, audioIndex: 2 },
          { actionType: 'LISTEN', message: 'In a moment, you\'ll hear a steady pink noise. Notice how constant and even the sound is. Let that steadiness guide your attention.', displayTime: 60, audioIndex: 3 },
          { actionType: 'LISTEN', message: 'You\'ll hear a single singing bowl. Listen closely as the tone rings out. Follow the sound all the way until it fades into silence.', displayTime: 60, audioIndex: 4 },
          { actionType: 'LISTEN', message: 'You\'re about to hear the sounds of a forest. As the audio begins, choose one layer to focus on. Perhaps the wind… the leaves… or the birds. Let that single sound hold your attention.', displayTime: 60, audioIndex: 5 },
          { actionType: 'LISTEN', message: 'You\'ll hear a low, steady brown noise. Imagine the sound as a soft blanket surrounding you. Let it settle gently around your awareness.', displayTime: 60, audioIndex: 6 },
          { actionType: 'LISTEN', message: 'You\'re about to hear a soft metronome. Allow the rhythm to guide you. Breathe naturally, and let every second beat cue a slow exhale.', displayTime: 60, audioIndex: 7 },
          { actionType: 'LISTEN', message: 'You\'ll hear gentle chimes. Each time a chime sounds, allow your exhale to lengthen slightly. Let the sound guide the rhythm of your breath.', displayTime: 60, audioIndex: 8 },
          { actionType: 'LISTEN', message: 'In a moment, you\'ll hear the sound of a quiet stream. Let your attention settle on the middle layer of the sound. Rest there, simply listening.', displayTime: 60, audioIndex: 9 },
          { actionType: 'LISTEN', message: 'You\'re about to hear a gentle breathing rhythm. Let the sound guide your breath in… and out. There\'s no need to hold the breath. Just follow the pace comfortably.', displayTime: 60, audioIndex: 10 },
        ],
        '2min': [
          { actionType: 'LISTEN', message: 'As the audio begins, you\'ll hear a soft white noise. Let your jaw soften and allow your breathing to settle naturally as you listen.', displayTime: 120, audioIndex: 11 },
          { actionType: 'LISTEN', message: 'You\'re about to hear a simple piano loop. For the next moment, there\'s nothing to do. Just listen.', displayTime: 120, audioIndex: 12 },
          { actionType: 'LISTEN', message: 'You\'ll soon hear a bell every few seconds. Each time the bell sounds, quietly remind yourself: "This passes."', displayTime: 120, audioIndex: 13 },
          { actionType: 'LISTEN', message: 'You\'re about to hear a soft humming sound. Let your exhale grow slightly longer than your inhale. Allow the sound to carry you into a steady rhythm.', displayTime: 120, audioIndex: 14 },
          { actionType: 'LISTEN', message: 'You\'ll hear two short prompts. "Feet" and later, "Hands". Just breathe normally, but at each prompt focus and feel that body part relax.', displayTime: 120, audioIndex: 15 },
          { actionType: 'LISTEN', message: 'As the audio begins, you\'ll hear the sound of quiet paper turning. Let your attention settle into the small details of the sound.', displayTime: 120, audioIndex: 16 },
          { actionType: 'LISTEN', message: 'You\'re about to hear wind moving through trees. Allow your attention to stay wide and open. Simply receiving the sound.', displayTime: 120, audioIndex: 17 },
          { actionType: 'LISTEN', message: 'You\'ll hear a slow, heartbeat-like drum. Let your breath move naturally to the rhythm.', displayTime: 120, audioIndex: 18 },
          { actionType: 'LISTEN', message: 'You\'re about to hear a short, simple story. As you listen, allow your body to soften and settle. Try imaging the scene as it plays out.', displayTime: 120, audioIndex: 19 },
          { actionType: 'LISTEN', message: 'You\'ll hear the quiet murmur of a café in the background. Imagine sitting there comfortably, unnoticed.', displayTime: 120, audioIndex: 20 },
        ],
        '3min': [
          { actionType: 'LISTEN', message: 'You will soon hear a prompt. Let the words land softly and imagine how it could shape your thoughts. "You can slow down. You deserve this brief moment of reflection."', displayTime: 180, audioIndex: 21 },
          { actionType: 'LISTEN', message: 'You\'ll hear a gentle tone to focus on. If your mind wanders, come back to the tone and let it envelope you.', displayTime: 180, audioIndex: 22 },
          { actionType: 'LISTEN', message: 'You\'re about to hear distant thunder. Each time you hear a rumble, allow yourself a long, slow exhale and find calmness in this storm.', displayTime: 180, audioIndex: 23 },
          { actionType: 'LISTEN', message: 'You will hear the sounds of insects moving gently through a warm summer evening. Concentrate on the steady rhythm and repetition in the sound.', displayTime: 180, audioIndex: 24 },
          { actionType: 'LISTEN', message: 'You\'re about to hear soft flute and strings. Each time you exhale, focus on relaxing a body part starting from your feet and working up to the top of your head.', displayTime: 180, audioIndex: 25 },
          { actionType: 'LISTEN', message: 'You\'ll hear light rainfall and birds. Try to picture the scene and see if you can notice three different layers in the soundscape. Can you hear wind, rain, birds? Or all three?', displayTime: 180, audioIndex: 26 },
          { actionType: 'LISTEN', message: 'Breathe normally and reflect internally and externally on the grounding prompt you are about to hear. "You have arrived to be aware".', displayTime: 180, audioIndex: 27 },
          { actionType: 'LISTEN', message: 'You\'ll hear a short sequence of words. Simply let yourself melt into those feelings. "Thinking… feeling… letting-go."', displayTime: 180, audioIndex: 28 },
          { actionType: 'LISTEN', message: 'You may hear a gentle breath-counting rhythm. Just follow along and let calm and relaxation seep in.', displayTime: 180, audioIndex: 29 },
          { actionType: 'LISTEN', message: 'When the audio finishes, reflect on how your body feels. Take slow breaths and sense the calm that remains.', displayTime: 180, audioIndex: 30 },
        ],
        // 5min = 3min audio → beep → 2min audio
        '5min': [
          { actionType: 'LISTEN', message: 'You will soon hear a prompt. Let the words land softly and imagine how it could shape your thoughts. "You can slow down. You deserve this brief moment of reflection."', displayTime: 300, audioIndex: 31, isCombo: true, comboFirstAudioIndex: 21, comboSecondAudioIndex: 11, comboSecondMessage: 'As the audio begins, you\'ll hear a soft white noise. Let your jaw soften and allow your breathing to settle naturally as you listen.' },
          { actionType: 'LISTEN', message: 'You\'ll hear a gentle tone to focus on. If your mind wanders, come back to the tone and let it envelope you.', displayTime: 300, audioIndex: 32, isCombo: true, comboFirstAudioIndex: 22, comboSecondAudioIndex: 12, comboSecondMessage: 'You\'re about to hear a simple piano loop. For the next moment, there\'s nothing to do. Just listen.' },
          { actionType: 'LISTEN', message: 'You\'re about to hear distant thunder. Each time you hear a rumble, allow yourself a long, slow exhale and find calmness in this storm.', displayTime: 300, audioIndex: 33, isCombo: true, comboFirstAudioIndex: 23, comboSecondAudioIndex: 13, comboSecondMessage: 'You\'ll soon hear a bell every few seconds. Each time the bell sounds, quietly remind yourself: "This passes."' },
          { actionType: 'LISTEN', message: 'You will hear the sounds of insects moving gently through a warm summer evening. Concentrate on the steady rhythm and repetition in the sound.', displayTime: 300, audioIndex: 34, isCombo: true, comboFirstAudioIndex: 24, comboSecondAudioIndex: 14, comboSecondMessage: 'You\'re about to hear a soft humming sound. Let your exhale grow slightly longer than your inhale. Allow the sound to carry you into a steady rhythm.' },
          { actionType: 'LISTEN', message: 'You\'re about to hear soft flute and strings. Each time you exhale, focus on relaxing a body part starting from your feet and working up to the top of your head.', displayTime: 300, audioIndex: 35, isCombo: true, comboFirstAudioIndex: 25, comboSecondAudioIndex: 15, comboSecondMessage: 'You\'ll hear two short prompts. "Feet" and later, "Hands". Just breathe normally, but at each prompt focus and feel that body part relax.' },
          { actionType: 'LISTEN', message: 'You\'ll hear light rainfall and birds. Try to picture the scene and see if you can notice three different layers in the soundscape. Can you hear wind, rain, birds? Or all three?', displayTime: 300, audioIndex: 36, isCombo: true, comboFirstAudioIndex: 26, comboSecondAudioIndex: 16, comboSecondMessage: 'As the audio begins, you\'ll hear the sound of quiet paper turning. Let your attention settle into the small details of the sound.' },
          { actionType: 'LISTEN', message: 'Breathe normally and reflect internally and externally on the grounding prompt you are about to hear. "You have arrived to be aware".', displayTime: 300, audioIndex: 37, isCombo: true, comboFirstAudioIndex: 27, comboSecondAudioIndex: 17, comboSecondMessage: 'You\'re about to hear wind moving through trees. Allow your attention to stay wide and open. Simply receiving the sound.' },
          { actionType: 'LISTEN', message: 'You\'ll hear a short sequence of words. Simply let yourself melt into those feelings. "Thinking… feeling… letting-go."', displayTime: 300, audioIndex: 38, isCombo: true, comboFirstAudioIndex: 28, comboSecondAudioIndex: 18, comboSecondMessage: 'You\'ll hear a slow, heartbeat-like drum. Let your breath move naturally to the rhythm.' },
          { actionType: 'LISTEN', message: 'You may hear a gentle breath-counting rhythm. Just follow along and let calm and relaxation seep in.', displayTime: 300, audioIndex: 39, isCombo: true, comboFirstAudioIndex: 29, comboSecondAudioIndex: 19, comboSecondMessage: 'You\'re about to hear a short, simple story. As you listen, allow your body to soften and settle. Try imaging the scene as it plays out.' },
          { actionType: 'LISTEN', message: 'When the audio finishes, reflect on how your body feels. Take slow breaths and sense the calm that remains.', displayTime: 300, audioIndex: 40, isCombo: true, comboFirstAudioIndex: 30, comboSecondAudioIndex: 20, comboSecondMessage: 'You\'ll hear the quiet murmur of a café in the background. Imagine sitting there comfortably, unnoticed.' },
        ],
      },

      // ── Immediate Advice ───────────────────────────────────────────────────
      'immediate-advice': {
        '1min': [
          { actionType: 'ACTION', message: 'Pause for a moment. Remind yourself: This is anxiety, not danger. You\'re doing okay. You don\'t have to solve everything right now. Simply focus on the next single task in front of you.', displayTime: 60, audioIndex: 1 },
          { actionType: 'ACTION', message: 'Breathe normally. Cut out the multiple thoughts and ask yourself: What needs my attention most? Just that. Think of nothing more.', displayTime: 60, audioIndex: 2 },
          { actionType: 'ACTION', message: 'Breathe slowly and turn your mind to what is happening right now, and how you feel.', displayTime: 60, audioIndex: 3 },
          { actionType: 'ACTION', message: 'You don\'t have to feel perfectly calm. Right now, aim for steady. Steady is enough.', displayTime: 60, audioIndex: 4 },
          { actionType: 'ACTION', message: 'If you find yourself checking to see if things are improving, pause. Let the process work without measuring it. You\'re allowed to simply continue.', displayTime: 60, audioIndex: 5 },
          { actionType: 'ACTION', message: 'So much effort to deal with how you feel. Just dial down that effort with each slow breath, and notice how your body settles easily when it\'s not pushed so hard.', displayTime: 60, audioIndex: 6 },
          { actionType: 'ACTION', message: 'If something important needs deciding, give it time. Remember that big decisions can wait until your body feels steadier.', displayTime: 60, audioIndex: 7 },
          { actionType: 'ACTION', message: 'Instead of asking "why can\'t I settle anything," try asking: "How can I settle just ten percent?" Focus on that one small task for a minute.', displayTime: 60, audioIndex: 8 },
          { actionType: 'ACTION', message: 'Let anxious thoughts be like background radio noise. You don\'t need to acknowledge them. Let them play quietly while you continue with your moment.', displayTime: 60, audioIndex: 9 },
          { actionType: 'ACTION', message: 'Remind yourself: You only have to manage this moment. Not the whole day. Just here and now.', displayTime: 60, audioIndex: 10 },
        ],
        '2min': [
          { actionType: 'ACTION', message: 'If the problems you\'re facing feel too big, you\'re allowed to shrink them down. What is one small thing you can focus on today?', displayTime: 120, audioIndex: 11 },
          { actionType: 'ACTION', message: 'Speak to yourself with neutral or positive language. If you have negative thoughts, they remain agitated in the body. Let them dissipate and rise above. This is activation.', displayTime: 120, audioIndex: 12 },
          { actionType: 'ACTION', message: 'Try to imagine your body relaxing. Unclench your jaw for a moment. Let your shoulders soften. Feel this release throughout your body. Then return to what you were doing, without analysing it.', displayTime: 120, audioIndex: 13 },
          { actionType: 'ACTION', message: 'For the next two minutes, release yourself from the feeling of needing to fix everything. Simply sit, and rest and allow yourself this moment.', displayTime: 120, audioIndex: 14 },
          { actionType: 'ACTION', message: 'If the outcome seems too large, change the goal slightly. Your job right now is simply to practise the skill. Not to perfect the outcome. Practising is enough.', displayTime: 120, audioIndex: 15 },
          { actionType: 'ACTION', message: 'If the feeling of restlessness rises like a wave, let it form at its peak, and break. Imagine your anxiety breaking with the wave, and flowing out to sea. For the next couple of minutes, your only job is to imagine this wave breaking and to remember that the peak of restlessness cannot last forever.', displayTime: 120, audioIndex: 16 },
          { actionType: 'ACTION', message: 'Think of one kind sentence you might say to a friend in this moment. Now offer those same words to yourself and reflect on how that makes you feel.', displayTime: 120, audioIndex: 17 },
          { actionType: 'ACTION', message: 'Close your eyes, breathe normally and find one simple detail around you to reflect upon. Just let your attention rest there.', displayTime: 120, audioIndex: 18 },
          { actionType: 'ACTION', message: 'Remember that you are allowed to be imperfect, to be normal, to re-do. There is no one path to your success, you can take the next step imperfectly. The goal should always be simply taking the step.', displayTime: 120, audioIndex: 19 },
          { actionType: 'ACTION', message: 'If things feel urgent, slow them into sequence. First one step. Then the next. There is nothing else to focus on right now.', displayTime: 120, audioIndex: 20 },
        ],
        '3min': [
          { actionType: 'ACTION', message: 'Take a minute to remind yourself: You can carry some discomfort and still function. You\'re doing okay. And you will be okay.', displayTime: 180, audioIndex: 21 },
          { actionType: 'ACTION', message: 'If your mind is telling a dramatic and disturbing story, gently label it as: the catastrophe story. Then return to the present moment with slow breaths to find peace.', displayTime: 180, audioIndex: 22 },
          { actionType: 'ACTION', message: 'Remind yourself that you don\'t need perfection and certainty right now. You only need the next small step.', displayTime: 180, audioIndex: 23 },
          { actionType: 'ACTION', message: 'If you feel the urge to escape or fix everything quickly, remember that these feelings are not permanent, they are like the weather, they come and go. You don\'t have to act on them immediately.', displayTime: 180, audioIndex: 24 },
          { actionType: 'ACTION', message: 'Choose one simple anchor. The feeling of air in your breath… The chair beneath you… Your feet on the floor. Return to your favourite anchor whenever you need.', displayTime: 180, audioIndex: 25 },
          { actionType: 'ACTION', message: 'If you notice using words like \'must\' or \'should\' in your thoughts, soften them. Try replacing them with \'I choose\' or \'I prefer\'. Let the pressure ease a little.', displayTime: 180, audioIndex: 26 },
          { actionType: 'ACTION', message: 'For the next three minutes, allow "good enough" to be the standard. You don\'t have to push beyond that.', displayTime: 180, audioIndex: 27 },
          { actionType: 'ACTION', message: 'If you find yourself monitoring every symptom, take a moment to pause. Constantly checking just worsens the disturbance. Instead, allow your attention to rest elsewhere, on something pleasant and calm.', displayTime: 180, audioIndex: 28 },
          { actionType: 'ACTION', message: 'Remember to give yourself some credit. Practising this moment counts. When you still feel unsettled, your self reward will protect you.', displayTime: 180, audioIndex: 29 },
          { actionType: 'ACTION', message: 'Take three slow breaths, with long exhales. Let your jaw soften and your shoulders drop. Keep repeating.', displayTime: 180, audioIndex: 30 },
        ],
        // 5min = 3min audio → beep → 2min audio
        '5min': [
          { actionType: 'ACTION', message: 'Take a minute to remind yourself: You can carry some discomfort and still function. You\'re doing okay. And you will be okay.', displayTime: 300, audioIndex: 31, isCombo: true, comboFirstAudioIndex: 21, comboSecondAudioIndex: 11, comboSecondMessage: 'If the problems you\'re facing feel too big, you\'re allowed to shrink them down. What is one small thing you can focus on today?' },
          { actionType: 'ACTION', message: 'If your mind is telling a dramatic and disturbing story, gently label it as: the catastrophe story. Then return to the present moment with slow breaths to find peace.', displayTime: 300, audioIndex: 32, isCombo: true, comboFirstAudioIndex: 22, comboSecondAudioIndex: 12, comboSecondMessage: 'Speak to yourself with neutral or positive language. If you have negative thoughts, they remain agitated in the body. Let them dissipate and rise above. This is activation.' },
          { actionType: 'ACTION', message: 'Remind yourself that you don\'t need perfection and certainty right now. You only need the next small step.', displayTime: 300, audioIndex: 33, isCombo: true, comboFirstAudioIndex: 23, comboSecondAudioIndex: 13, comboSecondMessage: 'Try to imagine your body relaxing. Unclench your jaw for a moment. Let your shoulders soften. Feel this release throughout your body. Then return to what you were doing, without analysing it.' },
          { actionType: 'ACTION', message: 'If you feel the urge to escape or fix everything quickly, remember that these feelings are not permanent, they are like the weather, they come and go. You don\'t have to act on them immediately.', displayTime: 300, audioIndex: 34, isCombo: true, comboFirstAudioIndex: 24, comboSecondAudioIndex: 14, comboSecondMessage: 'For the next two minutes, release yourself from the feeling of needing to fix everything. Simply sit, and rest and allow yourself this moment.' },
          { actionType: 'ACTION', message: 'Choose one simple anchor. The feeling of air in your breath… The chair beneath you… Your feet on the floor. Return to your favourite anchor whenever you need.', displayTime: 300, audioIndex: 35, isCombo: true, comboFirstAudioIndex: 25, comboSecondAudioIndex: 15, comboSecondMessage: 'If the outcome seems too large, change the goal slightly. Your job right now is simply to practise the skill. Not to perfect the outcome. Practising is enough.' },
          { actionType: 'ACTION', message: 'If you notice using words like \'must\' or \'should\' in your thoughts, soften them. Try replacing them with \'I choose\' or \'I prefer\'. Let the pressure ease a little.', displayTime: 300, audioIndex: 36, isCombo: true, comboFirstAudioIndex: 26, comboSecondAudioIndex: 16, comboSecondMessage: 'If the feeling of restlessness rises like a wave, let it form at its peak, and break. Imagine your anxiety breaking with the wave, and flowing out to sea. For the next couple of minutes, your only job is to imagine this wave breaking and to remember that the peak of restlessness cannot last forever.' },
          { actionType: 'ACTION', message: 'For the next three minutes, allow "good enough" to be the standard. You don\'t have to push beyond that.', displayTime: 300, audioIndex: 37, isCombo: true, comboFirstAudioIndex: 27, comboSecondAudioIndex: 17, comboSecondMessage: 'Think of one kind sentence you might say to a friend in this moment. Now offer those same words to yourself and reflect on how that makes you feel.' },
          { actionType: 'ACTION', message: 'If you find yourself monitoring every symptom, take a moment to pause. Constantly checking just worsens the disturbance. Instead, allow your attention to rest elsewhere, on something pleasant and calm.', displayTime: 300, audioIndex: 38, isCombo: true, comboFirstAudioIndex: 28, comboSecondAudioIndex: 18, comboSecondMessage: 'Close your eyes, breathe normally and find one simple detail around you to reflect upon. Just let your attention rest there.' },
          { actionType: 'ACTION', message: 'Remember to give yourself some credit. Practising this moment counts. When you still feel unsettled, your self reward will protect you.', displayTime: 300, audioIndex: 39, isCombo: true, comboFirstAudioIndex: 29, comboSecondAudioIndex: 19, comboSecondMessage: 'Remember that you are allowed to be imperfect, to be normal, to re-do. There is no one path to your success, you can take the next step imperfectly. The goal should always be simply taking the step.' },
          { actionType: 'ACTION', message: 'Take three slow breaths, with long exhales. Let your jaw soften and your shoulders drop. Keep repeating.', displayTime: 300, audioIndex: 40, isCombo: true, comboFirstAudioIndex: 30, comboSecondAudioIndex: 20, comboSecondMessage: 'If things feel urgent, slow them into sequence. First one step. Then the next. There is nothing else to focus on right now.' },
        ],
      },

      // ── Havening Technique ─────────────────────────────────────────────────
      'havening': {
        '1min': [
          { actionType: 'ACTION', message: 'Place your hands on the opposite shoulder. Slowly stroke your arms down toward your elbows. Then back up again. Move gently and slowly, breathing out a little longer each time.', displayTime: 60, audioIndex: 1 },
          { actionType: 'ACTION', message: 'Rub your palms together for a few seconds, creating a little warmth. Now rest your palms lightly together. Feel the warmth between them as you breathe slowly.', displayTime: 60, audioIndex: 2 },
          { actionType: 'ACTION', message: 'Cross your arms and place your hands on your upper arms. Gently squeeze one side… then the other. Continue for a full minute.', displayTime: 60, audioIndex: 3 },
          { actionType: 'ACTION', message: 'Place your hands on your thighs and slowly slide them down to cup your knees. Then slowly but firmly slide them up the thighs again. Keep repeating.', displayTime: 60, audioIndex: 4 },
          { actionType: 'ACTION', message: 'Place your palms on your thighs. Press gently down for a few seconds. Then release. As you press down, breathe in, then slowly exhale and you stop pressing. Continue to repeat this.', displayTime: 60, audioIndex: 5 },
          { actionType: 'ACTION', message: 'Place one hand over your heart. Feel the warmth beneath your palm. Let your exhale grow slightly longer as you rest there.', displayTime: 60, audioIndex: 6 },
          { actionType: 'ACTION', message: 'Bring your thumb and forefinger together. Slowly stroke your thumb with your finger. With each exhale, remind yourself that you are in a safe space.', displayTime: 60, audioIndex: 7 },
          { actionType: 'ACTION', message: 'Hold something cool in your hands, like a bottle or a cup. Notice the coolness in your palms. Focus on that sensation as you breathe normally.', displayTime: 60, audioIndex: 8 },
          { actionType: 'ACTION', message: 'Bring your forearms together. Gently roll them against each other. Slow, soothing movement. Let your breath lengthen as you move.', displayTime: 60, audioIndex: 9 },
          { actionType: 'ACTION', message: 'Cup your ears with your palms. Gently press for five seconds and partially release for five seconds. Immerse yourself in the changing sound.', displayTime: 60, audioIndex: 10 },
        ],
        '2min': [
          { actionType: 'ACTION', message: 'Place your hands on the opposite shoulder. Slowly stroke your arms down toward your elbows. Then back up again. Move gently and slowly, breathing out a little longer each time.', displayTime: 120, audioIndex: 11 },
          { actionType: 'ACTION', message: 'Rub your palms together for a few seconds, creating a little warmth. Now rest your palms lightly together. Feel the warmth between them as you breathe slowly.', displayTime: 120, audioIndex: 12 },
          { actionType: 'ACTION', message: 'Cross your arms and place your hands on your upper arms. Gently squeeze one side… then the other. Continue for a full minute.', displayTime: 120, audioIndex: 13 },
          { actionType: 'ACTION', message: 'Place your hands on your thighs and slowly slide them down to cup your knees. Then slowly but firmly slide them up the thighs again. Keep repeating.', displayTime: 120, audioIndex: 14 },
          { actionType: 'ACTION', message: 'Place your palms on your thighs. Press gently down for a few seconds. Then release. As you press down, breathe in, then slowly exhale and you stop pressing. Continue to repeat this.', displayTime: 120, audioIndex: 15 },
          { actionType: 'ACTION', message: 'Place one hand over your heart. Feel the warmth beneath your palm. Let your exhale grow slightly longer as you rest there.', displayTime: 120, audioIndex: 16 },
          { actionType: 'ACTION', message: 'Bring your thumb and forefinger together. Slowly stroke your thumb with your finger. With each exhale, remind yourself that you are in a safe space.', displayTime: 120, audioIndex: 17 },
          { actionType: 'ACTION', message: 'Hold something cool in your hands, like a bottle or a cup. Notice the coolness in your palms. Focus on that sensation as you breathe normally.', displayTime: 120, audioIndex: 18 },
          { actionType: 'ACTION', message: 'Bring your forearms together. Gently roll them against each other. Slow, soothing movement. Let your breath lengthen as you move.', displayTime: 120, audioIndex: 19 },
          { actionType: 'ACTION', message: 'Cup your ears with your palms. Gently press for five seconds and partially release for five seconds. Immerse yourself in the changing sound.', displayTime: 120, audioIndex: 20 },
        ],
        '3min': [
          { actionType: 'ACTION', message: 'Place your hands on the opposite shoulder. Slowly stroke your arms down toward your elbows. Then back up again. Move gently and slowly, breathing out a little longer each time.', displayTime: 180, audioIndex: 21 },
          { actionType: 'ACTION', message: 'Rub your palms together for a few seconds, creating a little warmth. Now rest your palms lightly together. Feel the warmth between them as you breathe slowly.', displayTime: 180, audioIndex: 22 },
          { actionType: 'ACTION', message: 'Cross your arms and place your hands on your upper arms. Gently squeeze one side… then the other. Continue for a full minute.', displayTime: 180, audioIndex: 23 },
          { actionType: 'ACTION', message: 'Place your hands on your thighs and slowly slide them down to cup your knees. Then slowly but firmly slide them up the thighs again. Keep repeating.', displayTime: 180, audioIndex: 24 },
          { actionType: 'ACTION', message: 'Place your palms on your thighs. Press gently down for a few seconds. Then release. As you press down, breathe in, then slowly exhale and you stop pressing. Continue to repeat this.', displayTime: 180, audioIndex: 25 },
          { actionType: 'ACTION', message: 'Place one hand over your heart. Feel the warmth beneath your palm. Let your exhale grow slightly longer as you rest there.', displayTime: 180, audioIndex: 26 },
          { actionType: 'ACTION', message: 'Bring your thumb and forefinger together. Slowly stroke your thumb with your finger. With each exhale, remind yourself that you are in a safe space.', displayTime: 180, audioIndex: 27 },
          { actionType: 'ACTION', message: 'Hold something cool in your hands, like a bottle or a cup. Notice the coolness in your palms. Focus on that sensation as you breathe normally.', displayTime: 180, audioIndex: 28 },
          { actionType: 'ACTION', message: 'Bring your forearms together. Gently roll them against each other. Slow, soothing movement. Let your breath lengthen as you move.', displayTime: 180, audioIndex: 29 },
          { actionType: 'ACTION', message: 'Cup your ears with your palms. Gently press for five seconds and partially release for five seconds. Immerse yourself in the changing sound.', displayTime: 180, audioIndex: 30 },
        ],
        // 5min = 3min audio → beep → 2min audio (havening uses same exercises at different durations)
        '5min': [
          { actionType: 'ACTION', message: 'Place your hands on the opposite shoulder. Slowly stroke your arms down toward your elbows. Then back up again. Move gently and slowly, breathing out a little longer each time.', displayTime: 300, audioIndex: 31, isCombo: true, comboFirstAudioIndex: 21, comboSecondAudioIndex: 11, comboSecondMessage: 'Place your hands on the opposite shoulder. Slowly stroke your arms down toward your elbows. Then back up again. Move gently and slowly, breathing out a little longer each time.' },
          { actionType: 'ACTION', message: 'Rub your palms together for a few seconds, creating a little warmth. Now rest your palms lightly together. Feel the warmth between them as you breathe slowly.', displayTime: 300, audioIndex: 32, isCombo: true, comboFirstAudioIndex: 22, comboSecondAudioIndex: 12, comboSecondMessage: 'Rub your palms together for a few seconds, creating a little warmth. Now rest your palms lightly together. Feel the warmth between them as you breathe slowly.' },
          { actionType: 'ACTION', message: 'Cross your arms and place your hands on your upper arms. Gently squeeze one side… then the other. Continue for a full minute.', displayTime: 300, audioIndex: 33, isCombo: true, comboFirstAudioIndex: 23, comboSecondAudioIndex: 13, comboSecondMessage: 'Cross your arms and place your hands on your upper arms. Gently squeeze one side… then the other. Continue for a full minute.' },
          { actionType: 'ACTION', message: 'Place your hands on your thighs and slowly slide them down to cup your knees. Then slowly but firmly slide them up the thighs again. Keep repeating.', displayTime: 300, audioIndex: 34, isCombo: true, comboFirstAudioIndex: 24, comboSecondAudioIndex: 14, comboSecondMessage: 'Place your hands on your thighs and slowly slide them down to cup your knees. Then slowly but firmly slide them up the thighs again. Keep repeating.' },
          { actionType: 'ACTION', message: 'Place your palms on your thighs. Press gently down for a few seconds. Then release. As you press down, breathe in, then slowly exhale and you stop pressing. Continue to repeat this.', displayTime: 300, audioIndex: 35, isCombo: true, comboFirstAudioIndex: 25, comboSecondAudioIndex: 15, comboSecondMessage: 'Place your palms on your thighs. Press gently down for a few seconds. Then release. As you press down, breathe in, then slowly exhale and you stop pressing. Continue to repeat this.' },
          { actionType: 'ACTION', message: 'Place one hand over your heart. Feel the warmth beneath your palm. Let your exhale grow slightly longer as you rest there.', displayTime: 300, audioIndex: 36, isCombo: true, comboFirstAudioIndex: 26, comboSecondAudioIndex: 16, comboSecondMessage: 'Place one hand over your heart. Feel the warmth beneath your palm. Let your exhale grow slightly longer as you rest there.' },
          { actionType: 'ACTION', message: 'Bring your thumb and forefinger together. Slowly stroke your thumb with your finger. With each exhale, remind yourself that you are in a safe space.', displayTime: 300, audioIndex: 37, isCombo: true, comboFirstAudioIndex: 27, comboSecondAudioIndex: 17, comboSecondMessage: 'Bring your thumb and forefinger together. Slowly stroke your thumb with your finger. With each exhale, remind yourself that you are in a safe space.' },
          { actionType: 'ACTION', message: 'Hold something cool in your hands, like a bottle or a cup. Notice the coolness in your palms. Focus on that sensation as you breathe normally.', displayTime: 300, audioIndex: 38, isCombo: true, comboFirstAudioIndex: 28, comboSecondAudioIndex: 18, comboSecondMessage: 'Hold something cool in your hands, like a bottle or a cup. Notice the coolness in your palms. Focus on that sensation as you breathe normally.' },
          { actionType: 'ACTION', message: 'Bring your forearms together. Gently roll them against each other. Slow, soothing movement. Let your breath lengthen as you move.', displayTime: 300, audioIndex: 39, isCombo: true, comboFirstAudioIndex: 29, comboSecondAudioIndex: 19, comboSecondMessage: 'Bring your forearms together. Gently roll them against each other. Slow, soothing movement. Let your breath lengthen as you move.' },
          { actionType: 'ACTION', message: 'Cup your ears with your palms. Gently press for five seconds and partially release for five seconds. Immerse yourself in the changing sound.', displayTime: 300, audioIndex: 40, isCombo: true, comboFirstAudioIndex: 30, comboSecondAudioIndex: 20, comboSecondMessage: 'Cup your ears with your palms. Gently press for five seconds and partially release for five seconds. Immerse yourself in the changing sound.' },
        ],
      },
    },
    // Placeholder for other contexts (move, focused) — to be populated later
    move: {},
    focused: {},
  },

  // Placeholder entries for other moods — to be populated later
  overwhelmed: { still: {}, move: {}, focused: {} },
  sad: { still: {}, move: {}, focused: {} },
  tired: { still: {}, move: {}, focused: {} },
  focus: { still: {}, move: {}, focused: {} },
  curious: { still: {}, move: {}, focused: {} },
};

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Get a random message for a specific mood + context + supportType + time combination.
 */
export function getStillZoneMessage(
  mood: string,
  context: string,
  supportType: string,
  timeKey: string,
  excludeMessage?: StillZoneContentMessage | null
): StillZoneContentMessage | null {
  const messages = STILL_ZONE_CONTENT_LIBRARY[mood]?.[context]?.[supportType]?.[timeKey];
  if (!messages || messages.length === 0) return null;

  let available = messages;
  if (excludeMessage) {
    available = messages.filter(
      (msg) => msg.message !== excludeMessage.message || msg.audioIndex !== excludeMessage.audioIndex
    );
    if (available.length === 0) available = messages;
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get all messages for a specific combination.
 */
export function getAllStillZoneMessages(
  mood: string,
  context: string,
  supportType?: string,
  timeKey?: string
): StillZoneContentMessage[] {
  if (supportType && timeKey) {
    return STILL_ZONE_CONTENT_LIBRARY[mood]?.[context]?.[supportType]?.[timeKey] || [];
  }
  // If no supportType/timeKey, flatten all messages for mood+context
  const contextContent = STILL_ZONE_CONTENT_LIBRARY[mood]?.[context];
  if (!contextContent) return [];
  const all: StillZoneContentMessage[] = [];
  for (const st of Object.values(contextContent)) {
    for (const msgs of Object.values(st)) {
      all.push(...msgs);
    }
  }
  return all;
}

/**
 * Get multiple random messages for a specific combination.
 */
export function getStillZoneRandomMessages(
  mood: string,
  context: string,
  supportType: string,
  timeKey: string,
  count: number = 3
): StillZoneContentMessage[] {
  const all = getAllStillZoneMessages(mood, context, supportType, timeKey);
  if (all.length === 0) return [];
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, all.length));
}

// Keep backward-compatible alias
export function getStillZoneRandomMessage(
  mood: string,
  context: string,
  supportType?: string,
  timeKey?: string,
  excludeMessage?: StillZoneContentMessage | null
): StillZoneContentMessage | null {
  if (supportType && timeKey) {
    return getStillZoneMessage(mood, context, supportType, timeKey, excludeMessage);
  }
  // Fallback: pick from all messages for mood+context
  const all = getAllStillZoneMessages(mood, context);
  if (all.length === 0) return null;
  let available = all;
  if (excludeMessage) {
    available = all.filter(
      (msg) => msg.message !== excludeMessage.message || msg.audioIndex !== excludeMessage.audioIndex
    );
    if (available.length === 0) available = all;
  }
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Check if content exists for a given combination.
 */
export function hasContentFor(mood: string, context: string, supportType: string, timeKey: string): boolean {
  const msgs = STILL_ZONE_CONTENT_LIBRARY[mood]?.[context]?.[supportType]?.[timeKey];
  return !!msgs && msgs.length > 0;
}
