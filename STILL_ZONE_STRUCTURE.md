# Still Zone - Project Structure

This document outlines the clear separation between **Still Lift** and **Still Zone** products.

## Directory Structure

### Still Zone Specific Files

```
src/
├── lib/
│   └── still-zone-content.ts          # Still Zone content library (separate from Still Lift)
│
├── hooks/
│   └── useStillZoneContent.ts         # Still Zone content hooks (separate from Still Lift)
│
├── app/
│   └── still-zone/                     # Still Zone pages directory
│       ├── page.tsx                    # Still Zone main page
│       └── content-manager/
│           └── page.tsx                # Still Zone content manager
│
└── components/
    └── still-zone/                     # Still Zone specific components (if needed)

public/
├── still-zone-audio/                   # Still Zone audio files (separate from still-lift-audio)
│   ├── README.txt
│   └── [mood-context folders]
│
└── still-zone-animations/              # Still Zone animations (separate from still-lift-animations)
    └── README.txt
```

### Still Lift Files (Existing)

```
src/
├── lib/
│   └── still-lift-content.ts          # Still Lift content library
│
├── hooks/
│   └── useStillLiftContent.ts         # Still Lift content hooks
│
├── app/
│   ├── page.tsx                       # Still Lift main page
│   └── still-lift-content-manager/
│       └── page.tsx                   # Still Lift content manager
│
└── components/                        # Still Lift components

public/
├── still-lift-audio/                  # Still Lift audio files
└── still-lift-animations/             # Still Lift animations
```

## Key Differences

### 1. Content Management
- **Still Lift**: `src/lib/still-lift-content.ts` → `CONTENT_LIBRARY`
- **Still Zone**: `src/lib/still-zone-content.ts` → `STILL_ZONE_CONTENT_LIBRARY`

### 2. Hooks
- **Still Lift**: `src/hooks/useStillLiftContent.ts` → `useContent()`
- **Still Zone**: `src/hooks/useStillZoneContent.ts` → `useStillZoneContent()`

### 3. Pages
- **Still Lift**: `src/app/page.tsx` (root)
- **Still Zone**: `src/app/still-zone/page.tsx`

### 4. Content Manager Pages
- **Still Lift**: `src/app/still-lift-content-manager/page.tsx`
- **Still Zone**: `src/app/still-zone/content-manager/page.tsx`

### 5. Audio Files
- **Still Lift**: `public/still-lift-audio/`
- **Still Zone**: `public/still-zone-audio/`

### 6. Animations
- **Still Lift**: `public/still-lift-animations/`
- **Still Zone**: `public/still-zone-animations/`

### 7. Documentation
- **Still Lift**: 
  - `still-lift-content-management.md`
  - `still-lift-content-format-example.md`
- **Still Zone**: 
  - `STILL_ZONE_STRUCTURE.md`

## Naming Conventions

All Still Zone files and functions are prefixed with `StillZone` or `still-zone` to ensure clear separation:

- Types: `StillZoneContentMessage`, `StillZoneMood`, `StillZoneContext`
- Constants: `STILL_ZONE_CONTENT_LIBRARY`, `STILL_ZONE_MOODS`, `STILL_ZONE_CONTEXTS`
- Functions: `getStillZoneRandomMessage()`, `getAllStillZoneMessages()`
- Hooks: `useStillZoneContent()`, `useAllStillZoneMessages()`
- Directories: `still-zone/`, `still-zone-audio/`, `still-zone-animations/`

## Benefits of This Structure

1. **Clear Separation**: No confusion between Still Lift and Still Zone assets
2. **Independent Development**: Each product can be developed and maintained separately
3. **Easy Navigation**: Clear naming conventions make it easy to find Still Zone files
4. **Scalability**: Easy to add more products in the future with similar structure
5. **No Conflicts**: Separate content libraries, hooks, and pages prevent accidental mixing

## Next Steps

1. Add Still Zone specific content to `src/lib/still-zone-content.ts`
2. Create Still Zone specific components in `src/components/still-zone/` if needed
3. Add Still Zone audio files to `public/still-zone-audio/`
4. Add Still Zone animations to `public/still-zone-animations/`
5. Build out Still Zone pages and features

