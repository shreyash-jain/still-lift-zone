# Still Lift - Content Format Example

Here's how to format your Still Lift content with the new structure:

## New Content Structure

```typescript
{
  actionType: "VISUALIZE" | "ACTION" | "REPEAT",
  message: "Your message content in quotes",
  displayTime: 15, // Time in seconds to display the message
  audioIndex: 1 // Required: Index of the pre-recorded audio file (1-indexed, matches array position)
}
```

## Example Content for "Good + Safe"

```typescript
good: {
  safe: [
      {
        actionType: "VISUALIZE",
        message: "Close your eyes and imagine a peaceful place. Take 3 deep breaths and feel the calm wash over you.",
        displayTime: 20,
        audioIndex: 1
      },
      {
        actionType: "ACTION", 
        message: "Write down 3 things you're grateful for today. Keep this list somewhere you can see it.",
        displayTime: 15,
        audioIndex: 2
      },
      {
        actionType: "REPEAT",
        message: "Repeat this affirmation: 'I am worthy of love and happiness. I choose to focus on the positive.'",
        displayTime: 12,
        audioIndex: 3
      }
  ],
  // ... other contexts
}
```

## Action Types Explained

- **VISUALIZE**: Mental exercises, imagination, visualization
- **ACTION**: Physical activities, tasks, things to do
- **REPEAT**: Things to say, repeat, affirmations, mantras

## How to Add Your Content

1. **Open** `src/lib/still-lift-content.ts`
2. **Find** the mood-context combination you want to edit
3. **Replace** the existing array with your content
4. **Follow** the format above

## Example: Adding Content for "Bad + Moving"

```typescript
bad: {
  moving: [
    {
      actionType: "ACTION",
      message: "Take 5 deep breaths while walking. Count each step as you inhale and exhale.",
      displayTime: 18,
      audioIndex: 1
    },
    {
      actionType: "REPEAT",
      message: "Repeat to yourself: 'This feeling is temporary. I am safe and I will get through this.'",
      displayTime: 15,
      audioIndex: 2
    },
    {
      actionType: "VISUALIZE",
      message: "Imagine each step you take is leaving behind negative energy. Feel it dissolving with each step.",
      displayTime: 20,
      audioIndex: 3
    }
  ]
}
```







