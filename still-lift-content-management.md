# Still Lift - Content Management System

This document explains how to manage the content library for Still Lift mood and context combinations.

## Overview

The content system is centralized in `src/lib/still-lift-content.ts` and provides a structured way to manage all the messages that users see based on their selected mood and context.

## Structure

### Moods
- `good` - User is feeling positive
- `okay` - User is feeling neutral
- `bad` - User is feeling negative
- `awful` - User is feeling very negative

### Contexts
- `still` - User is in a safe, stationary place
- `move` - User is on the move but safe
- `focused` - User is on the move and focused

### Content Structure

Each message has the following structure:

```typescript
interface ContentMessage {
  actionType: 'VISUALIZE' | 'ACTION' | 'REPEAT' | 'BREATHE' | 'LISTEN';  // Required: Primary classification of activity type
  message: string;         // The actual message content
  displayTime: number;     // How long to show the message (seconds)
  audioIndex: number;     // Required: Index of the pre-recorded audio file (1-indexed, matches array position)
}
```

#### Understanding audioIndex

**`audioIndex`** (Required):
- **Purpose**: Specifies which pre-recorded audio file to play for this message
- **How It Works**: The system uses this index to locate audio files in organized folders within `public/still-lift-audio`
- **Folder Structure**: Audio files are organized by mood and context in folders:
  ```
  public/still-lift-audio/
    ├── good-still/
    ├── good-move/
    ├── good-focused/
    ├── okay-still/
    ├── okay-move/
    ├── okay-focused/
    ├── bad-still/
    ├── bad-move/
    ├── bad-focused/
    ├── awful-still/
    ├── awful-move/
    └── awful-focused/
  ```
  
- **File Naming Pattern**: Audio files can be named using any of these formats:
  - `Audio_{audioIndex}.mp3` (e.g., `Audio_1.mp3`, `Audio_5.mp3`)
  - `audio_{audioIndex}.mp3` (e.g., `audio_1.mp3`, `audio_5.mp3`)
  - `{audioIndex}.mp3` (e.g., `1.mp3`, `5.mp3`)
  
  The system supports multiple formats: `.mp3`, `.m4a`, `.ogg`, `.wav`
  
- **Examples**:
  - `mood: 'good'`, `context: 'still'`, `audioIndex: 1` → Looks for `/still-lift-audio/good-still/Audio_1.mp3` (or other formats)
  - `mood: 'good'`, `context: 'move'`, `audioIndex: 5` → Looks for `/still-lift-audio/good-move/Audio_5.mp3` (or other formats)
  - `mood: 'bad'`, `context: 'focused'`, `audioIndex: 12` → Looks for `/still-lift-audio/bad-focused/Audio_12.mp3` (or other formats)

- **Context Mapping**: 
  - `still` → `still` folder
  - `move` → `move` folder
  - `focused` → `focused` folder (note: folder uses "focused", not "focused")

- **How It's Used**:
  1. When a message is displayed and audio is enabled, the system uses the message's `audioIndex` to locate the audio file
  2. It constructs the folder path based on mood and context (e.g., `good-still`, `okay-move`)
  3. It tries multiple file naming patterns in the folder to find the audio file
  4. If the pre-recorded audio file exists, it plays that file
  5. If the audio file is not found, the system falls back to Text-to-Speech (TTS)

- **Note**: `audioIndex` is **1-indexed** (starts at 1, not 0) and **must match the message's position in the array** (position 0 = audioIndex 1, position 1 = audioIndex 2, etc.). This ensures each message corresponds to the correct audio file for its mood+context combination.

## How to Add Your Content

### Direct Editing

1. Open `src/lib/still-lift-content.ts`
2. Find the `CONTENT_LIBRARY` object
3. Navigate to the mood-context combination you want to edit
4. Add your messages to the array

Example:
```typescript
good: {
  still: [
    {
      actionType: "VISUALIZE",
      message: "Close your eyes and imagine a peaceful place. Take 3 deep breaths and feel the calm wash over you.",
      displayTime: 20,
      audioIndex: 1
    },
    // Add more messages...
  ],
  // ... other contexts
}
```

## Technical Details

### Hooks Available

React hooks that automatically re-compute when mood/context changes. These are used in your React components to access content.

#### `useContent(options)`
**Location**: `src/hooks/useStillLiftContent.ts`

**What it does**: 
- Returns filtered, shuffled messages based on mood and context
- Optionally limits the number of messages returned
- Includes error handling and loading states

**Parameters**:
- `mood`: Mood value (`'good' | 'okay' | 'bad' | 'awful'`)
- `context`: Context value (`'still' | 'move' | 'focused'`)
- `count?`: Optional number of messages to return (default: 3)
- `shuffle?`: Optional boolean to shuffle messages (default: true)

**Returns**:
```typescript
{
  messages: ContentMessage[],      // Limited/shuffled messages
  randomMessage: ContentMessage | null,  // Single random message
  allMessages: ContentMessage[],   // All messages for the combination
  isLoading: boolean,              // Always false (synchronous)
  error: string | null              // Error message if any
}
```

**Example Usage** (from `src/app/cards/page.tsx`):
```typescript
const { messages: cardMessages, isLoading, error } = useContent({
  mood: currentMood as Mood | null,
  context: currentContext as Context | null,
  count: 3,
  shuffle: true
});
```

**How it works**: Uses React's `useMemo` to cache results. When mood/context changes, it:
1. Gets all messages for the mood+context combination
2. Optionally shuffles them randomly
3. Limits to the requested count
4. Also provides a single random message and all messages

---

#### `useRandomMessage(mood, context)`
**Location**: `src/hooks/useStillLiftContent.ts`

**What it does**: Returns a single random message for the given mood+context combination.

**Parameters**:
- `mood`: Mood value (can be `null`)
- `context`: Context value (can be `null`)

**Returns**: `ContentMessage | null` (returns `null` if mood/context is invalid)

**Example Usage** (from `src/app/option3/page.tsx` and `src/app/option4/page.tsx`):
```typescript
const randomMessage = useRandomMessage(
  currentMood as Mood | null, 
  currentContext as Context | null
);
```

**How it works**: Calls `getRandomMessage()` internally, wrapped in `useMemo` for performance. Picks one message randomly from the array for that mood+context.

---

#### `useRandomMessages(mood, context, count)`
**Location**: `src/hooks/useStillLiftContent.ts`

**What it does**: Returns multiple random messages (shuffled) for a mood+context combination.

**Parameters**:
- `mood`: Mood value (can be `null`)
- `context`: Context value (can be `null`)
- `count`: Number of messages to return (default: 3)

**Returns**: `ContentMessage[]` (empty array if mood/context is invalid)

**How it works**: Internally calls `getRandomMessages()`, which shuffles all messages and returns the requested count.

---

#### `useAllMessages(mood, context)`
**Location**: `src/hooks/useStillLiftContent.ts`

**What it does**: Returns ALL messages for a mood+context combination, in their original order (no shuffling).

**Parameters**:
- `mood`: Mood value (can be `null`)
- `context`: Context value (can be `null`)

**Returns**: `ContentMessage[]` (empty array if mood/context is invalid)

**Example Usage** (from `src/app/content-manager/page.tsx`):
```typescript
const allMessages = useAllMessages(selectedMood, selectedContext);
```

**How it works**: Directly returns the array from `CONTENT_LIBRARY[mood][context]` without any modification.

---

### Utility Functions

Standalone functions (not React hooks) that can be used anywhere in your codebase.

#### `getRandomMessage(mood, context)`
**Location**: `src/lib/still-lift-content.ts`

**What it does**: Picks one random message from the array for a mood+context combination.

**Returns**: `ContentMessage | null`

**How it works**: 
```typescript
const messages = CONTENT_LIBRARY[mood]?.[context];
const randomIndex = Math.floor(Math.random() * messages.length);
return messages[randomIndex];
```

**Used by**: `useRandomMessage` hook, `src/app/page.tsx` (in `getMicroHabit` function)

---

#### `getAllMessages(mood, context)`
**Location**: `src/lib/still-lift-content.ts`

**What it does**: Returns the entire array of messages for a mood+context combination, in original order.

**Returns**: `ContentMessage[]` (empty array if combination doesn't exist)

**How it works**: 
```typescript
return CONTENT_LIBRARY[mood]?.[context] || [];
```

**Used by**: All hooks internally, `src/app/page.tsx` (to find message position)

---

#### `getRandomMessages(mood, context, count)`
**Location**: `src/lib/still-lift-content.ts`

**What it does**: Returns multiple random messages (shuffled) for a mood+context combination.

**Parameters**:
- `mood`: Mood value
- `context`: Context value  
- `count`: Number of messages to return (default: 3)

**Returns**: `ContentMessage[]`

**How it works**: 
1. Gets all messages for the combination
2. Shuffles them using `sort(() => Math.random() - 0.5)`
3. Returns the first `count` messages

**Used by**: `useRandomMessages` hook

---

#### `validateContentLibrary()`
**Location**: `src/lib/still-lift-content.ts`

**What it does**: Validates that your `CONTENT_LIBRARY` is correctly structured and has no errors.

**Returns**: 
```typescript
{
  isValid: boolean,
  errors: string[]
}
```

**Checks**:
- All moods have content defined
- All contexts have content for each mood
- No empty arrays
- Each message has required fields: `actionType`, `message`, `displayTime`

**Example Usage**:
```typescript
import { validateContentLibrary } from '@/lib/still-lift-content';

const { isValid, errors } = validateContentLibrary();
if (!isValid) {
  console.error('Content validation errors:', errors);
}
```

**How it works**: Iterates through all mood+context combinations in `CONTENT_LIBRARY` and checks for:
- Missing mood definitions
- Missing context definitions  
- Empty message arrays
- Messages missing required properties

## Adding New Moods or Contexts

1. Add the new mood/context to the `MOODS` or `CONTEXTS` arrays
2. Add the new combination to the `CONTENT_LIBRARY` object
3. Update the type definitions if needed
4. Test the new combinations

## Best Practices

1. **Test Regularly**: Check that all mood-context combinations have content
2. **Balance Content**: Ensure each combination has 3-5 messages minimum
3. **Review Content**: Regularly review and update messages for relevance
4. **Backup Content**: Keep backups of your content library
5. **Validate Structure**: Use the validation function to check for errors

## Example Content Addition

```typescript
// In src/lib/still-lift-content.ts, add to the CONTENT_LIBRARY:

good: {
  still: [
    // ... existing messages
    {
      actionType: "ACTION",
      message: "Start your day by thinking of three things you're grateful for. This simple practice can set a positive tone for your entire day.",
      displayTime: 15
    }
  ],
  // ... other contexts
}
```

## Troubleshooting

### Common Issues

1. **Missing Content**: Check that all mood-context combinations have at least one message
2. **Type Errors**: Ensure all messages have required `title` and `message` fields
3. **Import Errors**: Make sure you're importing the correct types and functions

### Validation

Use the built-in validation function to check your content:

```typescript
import { validateContentLibrary } from '@/lib/still-lift-content';

const { isValid, errors } = validateContentLibrary();
if (!isValid) {
  console.error('Content validation errors:', errors);
}
```

This system makes it easy to manage your content library and ensures consistency across all your app's pages.







