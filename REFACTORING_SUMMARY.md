# Still Zone Refactoring Summary

## Overview
This refactoring improves code reusability, readability, and maintainability across the Still Zone application by extracting common UI patterns into reusable components.

## New Reusable Components

All components are located in `/src/components/still-zone/` and can be imported from the index file:

```typescript
import { SelectionCard, StatCard, ToolCard, BadgeCard, FormFieldWithIcon, MoodTrackerGrid, PageHeader, SectionHeader } from '@/components/still-zone';
```

### 1. **SelectionCard** (`SelectionCard.tsx`)
A versatile selection card component that handles three variants:
- **mood**: For mood selection with emoji and label
- **context**: For context selection with emoji, label, and description
- **time**: For time selection with label only

**Props:**
- `selected`: boolean - Whether the card is selected
- `onClick`: function - Click handler
- `emoji?`: string - Emoji to display
- `label`: string - Main label text
- `description?`: string - Optional description (context variant)
- `variant`: 'mood' | 'context' | 'time' - Card variant
- `className?`: string - Additional CSS classes

**Usage:**
```typescript
<SelectionCard
  selected={mood === 'anxious'}
  onClick={() => setMood('anxious')}
  emoji="😰"
  label="Anxious / Restless"
  variant="mood"
/>
```

### 2. **StatCard** (`StatCard.tsx`)
Displays statistics with an icon, value, and label.

**Props:**
- `icon`: LucideIcon - Icon component to display
- `value`: ReactNode - Value to display (can be string, number, or JSX)
- `label`: string - Label text
- `iconColor?`: string - Icon color classes
- `iconBgColor?`: string - Icon background color classes
- `valueColor?`: string - Value color classes

**Usage:**
```typescript
<StatCard
  icon={User}
  value="6"
  label="Sessions This Week"
  iconColor="text-blue-600 dark:text-blue-400"
  iconBgColor="bg-blue-100 dark:bg-blue-900/30"
/>
```

### 3. **ToolCard** (`ToolCard.tsx`)
Displays tool/feature cards with icon, title, and subtitle.

**Props:**
- `icon`: LucideIcon - Icon component
- `title`: string - Tool title
- `subtitle`: string - Tool subtitle/description
- `iconColor?`: string - Icon color classes
- `iconBgColor?`: string - Icon background color classes
- `onClick?`: function - Click handler

**Usage:**
```typescript
<ToolCard
  icon={Wind}
  title="Breathing"
  subtitle="Relaxation"
  iconColor="text-cyan-600 dark:text-cyan-400"
  iconBgColor="bg-cyan-100 dark:bg-cyan-900/30"
/>
```

### 4. **BadgeCard** (`BadgeCard.tsx`)
Displays achievement badges with emoji and title.

**Props:**
- `emoji`: string - Badge emoji
- `title`: string - Badge title
- `locked?`: boolean - Whether badge is locked
- `bgColor?`: string - Background color classes

**Usage:**
```typescript
<BadgeCard
  emoji="👍"
  title="Calm Streak"
  locked={true}
  bgColor="bg-amber-100 dark:bg-amber-900/30"
/>
```

### 5. **FormFieldWithIcon** (`FormFieldWithIcon.tsx`)
Form input field with an icon on the left side.

**Props:**
- `id`: string - Input ID
- `label`: string - Field label
- `value`: string - Input value
- `onChange`: function - Change handler (receives value string)
- `icon`: LucideIcon - Icon component
- `placeholder?`: string - Placeholder text
- `disabled?`: boolean - Whether field is disabled
- `type?`: string - Input type (default: 'text')

**Usage:**
```typescript
<FormFieldWithIcon
  id="email"
  label="Email Address"
  value={formData.email}
  onChange={(value) => setFormData({ ...formData, email: value })}
  icon={Mail}
  placeholder="Enter your email"
  type="email"
/>
```

### 6. **MoodTrackerGrid** (`MoodTrackerGrid.tsx`)
Displays a 7-day mood tracking grid with emoji indicators.

**Props:**
- `className?`: string - Additional CSS classes

**Usage:**
```typescript
<MoodTrackerGrid />
```

### 7. **PageHeader** (`PageHeader.tsx`)
Animated page header with title and optional subtitle.

**Props:**
- `title`: string - Page title
- `subtitle?`: string - Optional subtitle
- `className?`: string - Additional CSS classes

**Usage:**
```typescript
<PageHeader
  title="How are you feeling today?"
  subtitle="Select your current state to begin a personalized session."
/>
```

### 8. **SectionHeader** (`SectionHeader.tsx`)
Section header with teal accent bar.

**Props:**
- `title`: string - Section title
- `className?`: string - Additional CSS classes

**Usage:**
```typescript
<SectionHeader title="Choose your context" />
```

## Refactored Pages

### 1. **Main Dashboard Page** (`/app/still-zone/(protected)/page.tsx`)
**Before:** 186 lines with repetitive selection card code
**After:** 133 lines using reusable components

**Changes:**
- Replaced mood selection cards with `SelectionCard` components
- Replaced context selection buttons with `SelectionCard` components
- Replaced time selection buttons with `SelectionCard` components
- Replaced page header with `PageHeader` component
- Replaced section headers with `SectionHeader` components

### 2. **Dashboard Page** (`/app/still-zone/(protected)/dashboard/page.tsx`)
**Before:** 262 lines with repetitive card structures
**After:** 196 lines using reusable components

**Changes:**
- Replaced mood tracker grid with `MoodTrackerGrid` component
- Replaced statistics cards with `StatCard` components
- Replaced tool cards with `ToolCard` components
- Replaced badge cards with `BadgeCard` components

### 3. **Profile Page** (`/app/still-zone/(protected)/profile/page.tsx`)
**Before:** 217 lines with repetitive form field code
**After:** 171 lines using reusable components

**Changes:**
- Replaced all form input fields with `FormFieldWithIcon` components
- Reduced code duplication for name, email, and phone fields

## Benefits

### 1. **Code Reusability**
- Components can be used across multiple pages
- Consistent behavior and styling
- Single source of truth for UI patterns

### 2. **Maintainability**
- Changes to component styling/behavior only need to be made once
- Easier to understand and modify code
- Clear component boundaries and responsibilities

### 3. **Readability**
- Cleaner JSX with less nesting
- Self-documenting component names
- Props clearly define component behavior

### 4. **Consistency**
- Ensures UI consistency across the application
- Standardized prop interfaces
- Predictable component behavior

### 5. **Type Safety**
- TypeScript interfaces for all components
- Compile-time error checking
- Better IDE autocomplete support

## Code Reduction Summary

| Page | Before | After | Reduction |
|------|--------|-------|-----------|
| Main Dashboard | 186 lines | 133 lines | ~28% |
| Dashboard | 262 lines | 196 lines | ~25% |
| Profile | 217 lines | 171 lines | ~21% |
| **Total** | **665 lines** | **500 lines** | **~25%** |

## Future Improvements

1. **Data-driven components**: Pass data arrays to components instead of hardcoding
2. **Storybook integration**: Create stories for all components
3. **Unit tests**: Add tests for each component
4. **Theme variants**: Support multiple color schemes
5. **Animation variants**: Add more animation options
6. **Accessibility**: Enhance ARIA labels and keyboard navigation

## Migration Guide

If you need to add new pages or features:

1. Import components from `@/components/still-zone`
2. Use the appropriate component for your use case
3. Pass required props and customize with optional props
4. Refer to this README for prop documentation

Example:
```typescript
import { SelectionCard, PageHeader } from '@/components/still-zone';

export default function NewPage() {
  return (
    <main>
      <PageHeader title="New Page" subtitle="Description" />
      <SelectionCard
        selected={true}
        onClick={() => {}}
        label="Option"
        variant="mood"
      />
    </main>
  );
}
```
