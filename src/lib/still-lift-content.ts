// Content management system for mood-context combinations
// This file contains all the content that will be displayed to users

export interface ContentMessage {
  actionType: 'VISUALIZE' | 'ACTION' | 'REPEAT' | 'BREATHE' | 'LISTEN';
  message: string;
  displayTime: number; // Time in seconds to display the message
  audioIndex: number; // Required: Index of the pre-recorded audio file (1-indexed, matches array position). Single digits map to zero-padded files: 1→01, 2→02, ..., 9→09, 10→10, etc.
}

export interface MoodContextContent {
  [context: string]: ContentMessage[];
}

export interface ContentLibrary {
  [mood: string]: MoodContextContent;
}

// Define the available moods and contexts
export const MOODS = ['good', 'okay', 'bad', 'awful'] as const;
export const CONTEXTS = ['still', 'move', 'focused'] as const;

export type Mood = typeof MOODS[number];
export type Context = typeof CONTEXTS[number];

// Main content library
export const CONTENT_LIBRARY: ContentLibrary = {
  good: {
    still: [
      {
        actionType: "VISUALIZE",
        message: "Do a mindful body scan",
        displayTime: 120,
        audioIndex: 1
      },
      {
        actionType: "ACTION",
        message: "Write down three things you're grateful for",
        displayTime: 180,
        audioIndex: 2
      },
      {
        actionType: "REPEAT",
        message: "Recite a positive affirmation aloud",
        displayTime: 60,
        audioIndex: 3
      },
      {
        actionType: "VISUALIZE",
        message: "Visualise your ideal day",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "REPEAT",
        message: "Repeat the phrase: 'Today, I am at peace'",
        displayTime: 60,
        audioIndex: 5
      },
      {
        actionType: "ACTION",
        message: "Stretch your arms slowly and smile",
        displayTime: 120,
        audioIndex: 6
      },
      {
        actionType: "ACTION",
        message: "Sit with eyes closed and breathe deeply",
        displayTime: 180,
        audioIndex: 7
      },
      {
        actionType: "REPEAT",
        message: "'I choose calm over chaos'",
        displayTime: 60,
        audioIndex: 8
      },
      {
        actionType: "ACTION",
        message: "Draw a doodle of how you feel",
        displayTime: 240,
        audioIndex: 9
      },
      {
        actionType: "VISUALIZE",
        message: "Imagine yourself floating on calm water",
        displayTime: 120,
        audioIndex: 10
      },
      {
        actionType: "REPEAT",
        message: "'Joy flows through me'",
        displayTime: 60,
        audioIndex: 11
      },
      {
        actionType: "ACTION",
        message: "Light a candle and focus on the flame",
        displayTime: 180,
        audioIndex: 12
      },
      {
        actionType: "VISUALIZE",
        message: "Visualise a place you love",
        displayTime: 120,
        audioIndex: 13
      },
      {
        actionType: "REPEAT",
        message: "'I am rooted and grounded'",
        displayTime: 60,
        audioIndex: 14
      },
      {
        actionType: "ACTION",
        message: "Do a 4-7-8 breathing pattern",
        displayTime: 120,
        audioIndex: 15
      }
    ],
    move: [
      {
        actionType: "ACTION",
        message: "Walk while noticing five things around you",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "'Every step energises me'",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "VISUALIZE",
        message: "Visualise your feet touching light with each step",
        displayTime: 120,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Stretch one arm at a time while walking",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "REPEAT",
        message: "Repeat your favourite quote as you walk",
        displayTime: 60,
        audioIndex: 5
      },
      {
        actionType: "ACTION",
        message: "Swing arms loosely and smile",
        displayTime: 120,
        audioIndex: 6
      },
      {
        actionType: "ACTION",
        message: "Breathe in rhythm with your footsteps",
        displayTime: 120,
        audioIndex: 7
      },
      {
        actionType: "VISUALIZE",
        message: "Picture yourself on a mountain path",
        displayTime: 120,
        audioIndex: 8
      },
      {
        actionType: "REPEAT",
        message: "'Step by step, I move forward'",
        displayTime: 60,
        audioIndex: 9
      },
      {
        actionType: "ACTION",
        message: "Tap fingers to the beat of your walk",
        displayTime: 60,
        audioIndex: 10
      },
      {
        actionType: "VISUALIZE",
        message: "Imagine a bubble of light around you",
        displayTime: 120,
        audioIndex: 11
      },
      {
        actionType: "REPEAT",
        message: "'I am grounded and moving'",
        displayTime: 60,
        audioIndex: 12
      },
      {
        actionType: "ACTION",
        message: "Bounce lightly on your toes",
        displayTime: 60,
        audioIndex: 13
      },
      {
        actionType: "VISUALIZE",
        message: "Picture your body as fluid and strong",
        displayTime: 120,
        audioIndex: 14
      },
      {
        actionType: "REPEAT",
        message: "'Movement is joy'",
        displayTime: 60,
        audioIndex: 15
      }
    ],
    focused: [
      {
        actionType: "ACTION",
        message: "Listen to upbeat instrumental music",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "'I am alert and clear'",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "VISUALIZE",
        message: "Visualise a beam of light guiding your focus",
        displayTime: 120,
        audioIndex: 3
      },
      {
        actionType: "REPEAT",
        message: "Recite a short poem from memory",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "ACTION",
        message: "Listen to a motivational quote recording",
        displayTime: 120,
        audioIndex: 5
      },
      {
        actionType: "VISUALIZE",
        message: "Visualise a calm ocean while breathing",
        displayTime: 120,
        audioIndex: 6
      },
      {
        actionType: "REPEAT",
        message: "'Clarity is my strength'",
        displayTime: 60,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Listen to nature sounds with eyes open",
        displayTime: 180,
        audioIndex: 8
      },
      {
        actionType: "VISUALIZE",
        message: "Imagine your thoughts as clouds passing",
        displayTime: 120,
        audioIndex: 9
      },
      {
        actionType: "REPEAT",
        message: "'Each moment matters'",
        displayTime: 60,
        audioIndex: 10
      },
      {
        actionType: "ACTION",
        message: "Focus on one sound in your environment",
        displayTime: 120,
        audioIndex: 11
      },
      {
        actionType: "VISUALIZE",
        message: "Visualise your brain lighting up",
        displayTime: 120,
        audioIndex: 12
      },
      {
        actionType: "REPEAT",
        message: "'I am present and attentive'",
        displayTime: 60,
        audioIndex: 13
      },
      {
        actionType: "ACTION",
        message: "Listen to calming binaural beats",
        displayTime: 180,
        audioIndex: 14
      },
      {
        actionType: "VISUALIZE",
        message: "Picture a tunnel narrowing toward one goal",
        displayTime: 120,
        audioIndex: 15
      }
    ]
  },
  okay: {
    still: [
      {
        actionType: "BREATHE",
        message: "Box breathing: Inhale 4s, hold 4s, exhale 4s, hold 4s × 6 cycles",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "I can handle this, one thing at a time",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "ACTION",
        message: "5–4–3–2–1 sensing: name 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste",
        displayTime: 180,
        audioIndex: 3
      },
      {
        actionType: "BREATHE",
        message: "Even-count breathing: Inhale 5s, exhale 5s × 10 cycles",
        displayTime: 180,
        audioIndex: 4
      },
      {
        actionType: "REPEAT",
        message: "Steady and present",
        displayTime: 60,
        audioIndex: 5
      },
      {
        actionType: "ACTION",
        message: "Shoulder roll and neck release: 5 slow circles each side",
        displayTime: 120,
        audioIndex: 6
      },
      {
        actionType: "BREATHE",
        message: "Count 20 breaths quietly, reset if you lose track",
        displayTime: 180,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Write one small win and one next step",
        displayTime: 180,
        audioIndex: 8
      },
      {
        actionType: "REPEAT",
        message: "Calm attention grows with practice",
        displayTime: 60,
        audioIndex: 9
      },
      {
        actionType: "BREATHE",
        message: "4–6 breathing: Inhale 4s, exhale 6s × 10 cycles",
        displayTime: 180,
        audioIndex: 10
      },
      {
        actionType: "BREATHE",
        message: "Hands-on-belly breathing: feel the rise and fall × 20 breaths",
        displayTime: 180,
        audioIndex: 11
      },
      {
        actionType: "VISUALIZE",
        message: "A quiet room; sit there breathing evenly",
        displayTime: 120,
        audioIndex: 12
      },
      {
        actionType: "REPEAT",
        message: "Just this task, just this moment",
        displayTime: 60,
        audioIndex: 13
      },
      {
        actionType: "ACTION",
        message: "Scan for tension; soften your jaw and shoulders on each exhale",
        displayTime: 120,
        audioIndex: 14
      },
      {
        actionType: "ACTION",
        message: "Write a short 3-item to-do list, then circle only one priority",
        displayTime: 180,
        audioIndex: 15
      }
    ],
    move: [
      {
        actionType: "BREATHE",
        message: "Cadence match: Inhale for 3 steps, exhale for 4 steps × 10 rounds",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "Steady pace, steady mind",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "ACTION",
        message: "Awareness walk: notice your left and right foot alternation for 60 steps",
        displayTime: 180,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Head-up scan: widen your peripheral vision for 30 to 60 seconds",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "BREATHE",
        message: "Inhale through your nose, exhale through your nose at a natural pace × 20 breaths",
        displayTime: 180,
        audioIndex: 5
      },
      {
        actionType: "REPEAT",
        message: "I move with ease and care",
        displayTime: 60,
        audioIndex: 6
      },
      {
        actionType: "ACTION",
        message: "Name three colours you see and three sounds you hear",
        displayTime: 120,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Posture check: lengthen your spine, soften and rotate your shoulders every 30 seconds",
        displayTime: 120,
        audioIndex: 8
      },
      {
        actionType: "ACTION",
        message: "Step count focus: take 80 calm steps without looking at your phone",
        displayTime: 180,
        audioIndex: 9
      },
      {
        actionType: "BREATHE",
        message: "Triangle breath while walking: Inhale 4s, hold 2s, exhale 4s × 8",
        displayTime: 180,
        audioIndex: 10
      },
      {
        actionType: "REPEAT",
        message: "I am safe and aware",
        displayTime: 60,
        audioIndex: 11
      },
      {
        actionType: "ACTION",
        message: "Notice ground contact: heel to mid to toe sequence for 20 steps",
        displayTime: 120,
        audioIndex: 12
      },
      {
        actionType: "BREATHE",
        message: "Inhale when your left foot lands, exhale when your right foot lands × 20",
        displayTime: 180,
        audioIndex: 13
      },
      {
        actionType: "ACTION",
        message: "Gaze horizon check: look far ahead for 10 seconds, then return to a near view",
        displayTime: 120,
        audioIndex: 14
      },
      {
        actionType: "REPEAT",
        message: "Calm carries me forward and steady",
        displayTime: 60,
        audioIndex: 15
      }
    ],
    focused: [
      {
        actionType: "BREATHE",
        message: "Attentional breath: Inhale 4s, exhale 4s × 12 to stabilise focus",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "One task now, and fully focused",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "LISTEN",
        message: "A calm musical segment",
        displayTime: 180,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Eyes-soft focus: relax your brow and widen your view for 30 to 60 seconds",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "BREATHE",
        message: "4–7–8 light: Inhale 4s, hold 3s, exhale 7s × 6 cycles",
        displayTime: 180,
        audioIndex: 5
      },
      {
        actionType: "REPEAT",
        message: "Attention returns when I breathe",
        displayTime: 60,
        audioIndex: 6
      },
      {
        actionType: "REPEAT",
        message: "I am focused, I can do this",
        displayTime: 60,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Count back by 5 from 60 to engage your working memory",
        displayTime: 120,
        audioIndex: 8
      },
      {
        actionType: "BREATHE",
        message: "Even breath through your nose only × 20 breaths",
        displayTime: 180,
        audioIndex: 9
      },
      {
        actionType: "REPEAT",
        message: "I am calm and precise",
        displayTime: 60,
        audioIndex: 10
      },
      {
        actionType: "BREATHE",
        message: "Inhale for 4 seconds and, while blowing up your cheeks, exhale slowly for 6 seconds. Repeat 10 times, taking a few breaths in between repetitions",
        displayTime: 240,
        audioIndex: 11
      },
      {
        actionType: "ACTION",
        message: "Name three concrete details about the task out loud",
        displayTime: 120,
        audioIndex: 12
      },
      {
        actionType: "BREATHE",
        message: "Paced exhale: Inhale 4s, exhale 6s × 10 cycles",
        displayTime: 180,
        audioIndex: 13
      },
      {
        actionType: "REPEAT",
        message: "Present. Patient. Precise.",
        displayTime: 60,
        audioIndex: 14
      },
      {
        actionType: "VISUALIZE",
        message: "How good you will feel when you've completed the task, and imagine someone congratulating you",
        displayTime: 120,
        audioIndex: 15
      }
    ]
  },
  bad: {
    still: [
      {
        actionType: "BREATHE",
        message: "Rescue breath: In 3s, hold 2s, out 6s × 10 cycles",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "It's okay to pause",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "BREATHE",
        message: "Weighted exhale: count 1–5 on the out-breath × 12",
        displayTime: 180,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Tense–release fists 5×; pair each release with a long exhale",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "REPEAT",
        message: "I don't need to solve it now",
        displayTime: 60,
        audioIndex: 5
      },
      {
        actionType: "BREATHE",
        message: "Hand-on-chest breathing: In 4s, out 6s × 12",
        displayTime: 180,
        audioIndex: 6
      },
      {
        actionType: "ACTION",
        message: "Name one safe object in the room and describe it for 30 seconds",
        displayTime: 120,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Hum on exhale softly for 10 breaths to relax vagal tone",
        displayTime: 180,
        audioIndex: 8
      },
      {
        actionType: "REPEAT",
        message: "This wave of feeling bad will pass",
        displayTime: 60,
        audioIndex: 9
      },
      {
        actionType: "BREATHE",
        message: "4–4–6: Inhale 4s, hold 4s, exhale 6s × 10 cycles",
        displayTime: 180,
        audioIndex: 10
      },
      {
        actionType: "ACTION",
        message: "Calming wrap: cross arms and hold your shoulders, breathing slowly × 12 breaths",
        displayTime: 180,
        audioIndex: 11
      },
      {
        actionType: "ACTION",
        message: "Grounding: press feet into the floor and scrunch your toes for 5 seconds × 6 rounds",
        displayTime: 120,
        audioIndex: 12
      },
      {
        actionType: "REPEAT",
        message: "I am safe enough to rest",
        displayTime: 60,
        audioIndex: 13
      },
      {
        actionType: "VISUALIZE",
        message: "Visualise a safe place and breathe evenly for 2 minutes",
        displayTime: 120,
        audioIndex: 14
      },
      {
        actionType: "BREATHE",
        message: "Rescue count: 10 slow breaths, reset if your mind wanders",
        displayTime: 180,
        audioIndex: 15
      }
    ],
    move: [
      {
        actionType: "BREATHE",
        message: "Soothe-walk: In 3 steps, out 5 steps × 10 rounds",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "Gentle pace, gentle mind",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "ACTION",
        message: "Peripheral check: move your eyes to expand side vision for 30 seconds, then return to normal",
        displayTime: 120,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Scan posture: unlock your knees and relax your jaw every 20 steps",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "BREATHE",
        message: "Nasal breathing only; keep your mouth closed × 20 breaths",
        displayTime: 180,
        audioIndex: 5
      },
      {
        actionType: "REPEAT",
        message: "I can move through this turbulence",
        displayTime: 60,
        audioIndex: 6
      },
      {
        actionType: "ACTION",
        message: "Count 30 even steps; restart if distracted",
        displayTime: 120,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Sigh release: one gentle sigh every 30 seconds × 4",
        displayTime: 180,
        audioIndex: 8
      },
      {
        actionType: "ACTION",
        message: "Low-gaze walking: look about 10 metres ahead to reduce overload",
        displayTime: 120,
        audioIndex: 9
      },
      {
        actionType: "BREATHE",
        message: "4–2–6 walk-breath: In 4s, hold 2s, out 6s × 8",
        displayTime: 180,
        audioIndex: 10
      },
      {
        actionType: "REPEAT",
        message: "Calm will return, step by step",
        displayTime: 60,
        audioIndex: 11
      },
      {
        actionType: "ACTION",
        message: "Notice three stable surfaces you pass",
        displayTime: 120,
        audioIndex: 12
      },
      {
        actionType: "BREATHE",
        message: "Match breath to footsteps for 1 minute, then return to normal",
        displayTime: 180,
        audioIndex: 13
      },
      {
        actionType: "ACTION",
        message: "Name two neutral objects and one calming sound",
        displayTime: 120,
        audioIndex: 14
      },
      {
        actionType: "ACTION",
        message: "Release shoulders with each out-breath for 60 seconds",
        displayTime: 120,
        audioIndex: 15
      }
    ],
    focused: [
      {
        actionType: "BREATHE",
        message: "Paced breathing for focus: In 4s, out 6s × 12",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "One thing only",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "ACTION",
        message: "Safe anchor: just be aware of your feet for 20 breaths",
        displayTime: 180,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Name 3 facts about the current task out loud",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "BREATHE",
        message: "4–4–8 breath: In 4s, hold 4s, out 8s × 8",
        displayTime: 180,
        audioIndex: 5
      },
      {
        actionType: "REPEAT",
        message: "I can proceed carefully, I am safe",
        displayTime: 60,
        audioIndex: 6
      },
      {
        actionType: "LISTEN",
        message: "Steady heartbeat sound",
        displayTime: 180,
        audioIndex: 7
      },
      {
        actionType: "VISUALIZE",
        message: "Your neck relaxing, tension melting away",
        displayTime: 120,
        audioIndex: 8
      },
      {
        actionType: "BREATHE",
        message: "Nasal-only breathing × 20 breaths to stabilise arousal",
        displayTime: 180,
        audioIndex: 9
      },
      {
        actionType: "REPEAT",
        message: "Slow and steady. I feel safe",
        displayTime: 60,
        audioIndex: 10
      },
      {
        actionType: "VISUALIZE",
        message: "Your self-reward after completing this task",
        displayTime: 120,
        audioIndex: 11
      },
      {
        actionType: "ACTION",
        message: "Timebox: set a 2-minute timer; start, no judgement",
        displayTime: 180,
        audioIndex: 12
      },
      {
        actionType: "BREATHE",
        message: "In 3s, out 6s × 10 to lengthen exhale and focus",
        displayTime: 180,
        audioIndex: 13
      },
      {
        actionType: "REPEAT",
        message: "Present and careful. I am fully focused",
        displayTime: 60,
        audioIndex: 14
      },
      {
        actionType: "LISTEN",
        message: "Calming ocean waves",
        displayTime: 180,
        audioIndex: 15
      }
    ]
  },
  awful: {
    still: [
      {
        actionType: "BREATHE",
        message: "Safe breath: In 3s, out 6s × 12; whisper \"feeling safer now\" on each exhale",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "ACTION",
        message: "Name three safe objects you see, touch one, and describe it",
        displayTime: 180,
        audioIndex: 2
      },
      {
        actionType: "REPEAT",
        message: "I can conquer this feeling",
        displayTime: 60,
        audioIndex: 3
      },
      {
        actionType: "BREATHE",
        message: "Count down from 5 to 1, taking slow breaths between each number",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "VISUALIZE",
        message: "A safe room with soft lighting, and mentally furnish it for comfort",
        displayTime: 120,
        audioIndex: 5
      },
      {
        actionType: "BREATHE",
        message: "Inhale for 4 seconds, exhale through your nose for 6 seconds, then inhale again for 4 seconds and exhale through your mouth for 6 seconds × 10",
        displayTime: 240,
        audioIndex: 6
      },
      {
        actionType: "REPEAT",
        message: "Just this calm breathing, and I feel right",
        displayTime: 60,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Take a cool sip of water; notice the temperature and the path as you swallow",
        displayTime: 120,
        audioIndex: 8
      },
      {
        actionType: "ACTION",
        message: "Grip a cushion, then release it slowly on the out-breath × 10",
        displayTime: 180,
        audioIndex: 9
      },
      {
        actionType: "ACTION",
        message: "Weighted exhale humming: make a soft \"mmm\" sound on each out-breath × 10",
        displayTime: 180,
        audioIndex: 10
      },
      {
        actionType: "REPEAT",
        message: "I'm safe enough to pause",
        displayTime: 60,
        audioIndex: 11
      },
      {
        actionType: "BREATHE",
        message: "Square breath small: Inhale 3s, hold 3s, exhale 3s, hold 3s × 8 cycles",
        displayTime: 180,
        audioIndex: 12
      },
      {
        actionType: "ACTION",
        message: "Notice two smells and two sounds, and name them neutrally",
        displayTime: 120,
        audioIndex: 13
      },
      {
        actionType: "VISUALIZE",
        message: "A guardian presence standing beside you",
        displayTime: 120,
        audioIndex: 14
      },
      {
        actionType: "REPEAT",
        message: "I can get through this minute and the next",
        displayTime: 60,
        audioIndex: 15
      }
    ],
    move: [
      {
        actionType: "BREATHE",
        message: "Safety walk: eyes on your path; breathe in for 3 steps, breathe out for 5 steps × 10",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "I am aware of myself and this surrounding",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "ACTION",
        message: "Scan ahead for 10 seconds and avoid obstacles deliberately",
        displayTime: 120,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Name any landmarks you pass without judging them",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "BREATHE",
        message: "Inhale through your nose for 3 seconds, exhale through your nose for 5 seconds while walking × 10",
        displayTime: 180,
        audioIndex: 5
      },
      {
        actionType: "REPEAT",
        message: "I'm safe enough to keep moving",
        displayTime: 60,
        audioIndex: 6
      },
      {
        actionType: "ACTION",
        message: "Count 20 safe and even steps; restart if distracted",
        displayTime: 120,
        audioIndex: 7
      },
      {
        actionType: "ACTION",
        message: "Horizon check every 30 to 45 seconds to reduce tunnel vision",
        displayTime: 120,
        audioIndex: 8
      },
      {
        actionType: "ACTION",
        message: "Feel your shoes contact the ground, noting the heel-to-toe sequence for 20 steps",
        displayTime: 120,
        audioIndex: 9
      },
      {
        actionType: "BREATHE",
        message: "Exhale longer than inhale for 10 rounds (3s in, 5s out)",
        displayTime: 180,
        audioIndex: 10
      },
      {
        actionType: "REPEAT",
        message: "Forward and onward, safe and steady",
        displayTime: 60,
        audioIndex: 11
      },
      {
        actionType: "ACTION",
        message: "Name three stable surfaces you can step on next",
        displayTime: 120,
        audioIndex: 12
      },
      {
        actionType: "BREATHE",
        message: "Match your breath to your pace: in for 3 steps, out for 6 steps × 8",
        displayTime: 180,
        audioIndex: 13
      },
      {
        actionType: "ACTION",
        message: "Roll your shoulders back gently while walking, once every 10 steps",
        displayTime: 120,
        audioIndex: 14
      },
      {
        actionType: "REPEAT",
        message: "I am enjoying this walk",
        displayTime: 60,
        audioIndex: 15
      }
    ],
    focused: [
      {
        actionType: "BREATHE",
        message: "Anchor to your breath: inhale for 3 seconds, exhale for 6 seconds × 12; stay aware of your task",
        displayTime: 180,
        audioIndex: 1
      },
      {
        actionType: "REPEAT",
        message: "Just onward with the next safe step",
        displayTime: 60,
        audioIndex: 2
      },
      {
        actionType: "ACTION",
        message: "Name three neutral facts about your current task",
        displayTime: 120,
        audioIndex: 3
      },
      {
        actionType: "ACTION",
        message: "Observe one object's edges for 30 to 60 seconds to ground your vision",
        displayTime: 120,
        audioIndex: 4
      },
      {
        actionType: "BREATHE",
        message: "Inhale for 4 seconds, hold for 2, exhale for 6, eyes open and scanning × 10",
        displayTime: 180,
        audioIndex: 5
      },
      {
        actionType: "REPEAT",
        message: "Stay with this task — gentle and focused",
        displayTime: 60,
        audioIndex: 6
      },
      {
        actionType: "ACTION",
        message: "List aloud two safe options for the next minute",
        displayTime: 120,
        audioIndex: 7
      },
      {
        actionType: "LISTEN",
        message: "The calm sound of ocean waves lapping against the shore",
        displayTime: 180,
        audioIndex: 8
      },
      {
        actionType: "BREATHE",
        message: "Take even nasal-only breaths × 20 to reduce arousal",
        displayTime: 180,
        audioIndex: 9
      },
      {
        actionType: "REPEAT",
        message: "Slow breath first, then action",
        displayTime: 60,
        audioIndex: 10
      },
      {
        actionType: "ACTION",
        message: "Adjust your seat or stance for stability; check that your feet are firmly grounded",
        displayTime: 120,
        audioIndex: 11
      },
      {
        actionType: "BREATHE",
        message: "Inhale deeply for 4 seconds, exhale with a soft humming sound for 6 seconds",
        displayTime: 180,
        audioIndex: 12
      },
      {
        actionType: "BREATHE",
        message: "Exhale slowly to a count of 6 × 10, keeping your focus on each out-breath",
        displayTime: 180,
        audioIndex: 13
      },
      {
        actionType: "REPEAT",
        message: "I can do one small thing, I can do bigger things",
        displayTime: 60,
        audioIndex: 14
      },
      {
        actionType: "ACTION",
        message: "Name two supports available to you right now — a person, or a helpful tool",
        displayTime: 120,
        audioIndex: 15
      }
    ]
  }
};

// Utility functions for content management
export function getRandomMessage(mood: Mood, context: Context, excludeMessage?: ContentMessage | null): ContentMessage | null {
  const messages = CONTENT_LIBRARY[mood]?.[context];
  if (!messages || messages.length === 0) {
    return null;
  }
  
  // If we need to exclude a message, filter it out
  let availableMessages = messages;
  if (excludeMessage) {
    availableMessages = messages.filter(msg => {
      // Exclude if both message text AND audioIndex match (meaning it's the same message)
      const isSameMessage = msg.message === excludeMessage.message && msg.audioIndex === excludeMessage.audioIndex;
      return !isSameMessage;
    });
    
    // Log for debugging
    if (availableMessages.length === 0) {
      console.warn('[content] All messages were excluded, but there are no other messages available. This should not happen unless there\'s only 1 message total.');
      // If there's literally only 1 message in the entire array, we can't avoid showing it
      // But we'll still filter to show that we tried
      availableMessages = messages;
    } else if (availableMessages.length === messages.length) {
      console.warn('[content] Exclusion filter did not remove any messages. Previous message may not match any current messages.');
    }
  }
  
  // If after filtering we have messages available, select randomly from them
  if (availableMessages.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    const selected = availableMessages[randomIndex];
    
    // Double-check that we didn't accidentally select the excluded message
    if (excludeMessage && selected.message === excludeMessage.message && selected.audioIndex === excludeMessage.audioIndex) {
      console.error('[content] ERROR: Selected the same message that should have been excluded!', {
        selected: selected.message,
        excluded: excludeMessage.message
      });
      // Try to find a different one
      const otherMessages = availableMessages.filter(msg => 
        msg.message !== excludeMessage.message || msg.audioIndex !== excludeMessage.audioIndex
      );
      if (otherMessages.length > 0) {
        const fallbackIndex = Math.floor(Math.random() * otherMessages.length);
        return otherMessages[fallbackIndex];
      }
    }
    
    return selected;
  }
  
  // Fallback: if somehow no messages are available, return null
  return null;
}

export function getAllMessages(mood: Mood, context: Context): ContentMessage[] {
  return CONTENT_LIBRARY[mood]?.[context] || [];
}

export function getRandomMessages(mood: Mood, context: Context, count: number = 3): ContentMessage[] {
  const allMessages = getAllMessages(mood, context);
  if (allMessages.length === 0) return [];
  
  // Shuffle and take the requested number
  const shuffled = [...allMessages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allMessages.length));
}

// Validation function to ensure content structure is correct
export function validateContentLibrary(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check that all moods have content
  for (const mood of MOODS) {
    if (!CONTENT_LIBRARY[mood]) {
      errors.push(`Missing content for mood: ${mood}`);
      continue;
    }
    
    // Check that all contexts have content for each mood
    for (const context of CONTEXTS) {
      if (!CONTENT_LIBRARY[mood][context]) {
        errors.push(`Missing content for mood-context combination: ${mood}-${context}`);
        continue;
      }
      
      // Check that each context has at least one message
      if (CONTENT_LIBRARY[mood][context].length === 0) {
        errors.push(`Empty content array for mood-context combination: ${mood}-${context}`);
        continue;
      }
      
      // Validate each message structure
      CONTENT_LIBRARY[mood][context].forEach((message, index) => {
        if (!message.actionType || !message.message || !message.displayTime) {
          errors.push(`Invalid message structure at ${mood}-${context}[${index}]: missing actionType, message, or displayTime`);
        }
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}







