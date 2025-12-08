# Amplitude Analytics Setup

## Quick Setup

1. **Get your Amplitude API key:**
   - Go to https://amplitude.com and create an account (free tier available)
   - Create a new project
   - Copy your API key from the project settings

2. **Add your API key:**
   - Replace `YOUR_AMPLITUDE_API_KEY_HERE` in `.env.local` with your actual key
   - Example: `NEXT_PUBLIC_AMPLITUDE_API_KEY=ab12345678901234567890abcdef1234`

3. **That's it!** The analytics are already integrated and will track:
   - Mood selections (good, okay, bad, awful)
   - Context selections (safe, moving, focused)
   - Mood-context combinations
   - Micro-habit reveals
   - User actions (start over, try another)

## What Gets Tracked

### Events:
- **Mood Selected**: When user picks their mood
- **Context Selected**: When user picks their context
- **Mood Context Combination**: When both are selected (key metric!)
- **Micro Habit Revealed**: When user opens their personalized experience
- **User Action**: Button clicks (start over, try another)

### Properties tracked for each event:
- Timestamp
- Mood value
- Context value
- Combination string (e.g., "good_safe")
- Reveal type and action type

## Viewing Analytics

In your Amplitude dashboard, you'll see:
- **Most popular moods** (good, okay, bad, awful)
- **Most common contexts** (safe, moving, focused)
- **Popular combinations** (e.g., bad_safe, good_moving)
- **User flow patterns** and drop-off points

This data will help you understand how people are feeling and optimize the experience!
