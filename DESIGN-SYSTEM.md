# K3HOOT Design System Documentation

## Overview
The K3HOOT Design System is a comprehensive, token-based design framework that ensures perfect consistency across all pages and components. It follows Atomic Design principles and provides a unified experience throughout the application.

---

## Architecture

### 1. Design Tokens (`src/design-system/tokens/index.ts`)
All visual properties are defined as reusable tokens to ensure consistency.

#### Colors
```typescript
import { colors } from '@/design-system';

// Primary Colors
colors.primary.orange[500]  // #F97316
colors.primary.purple[500]  // #A855F7
colors.primary.pink[500]    // #EC4899

// Background
colors.background.primary   // #0A001F (Deep Space)
colors.background.glass     // rgba(255, 255, 255, 0.03)

// Text
colors.text.primary         // #FFFFFF
colors.text.secondary       // rgba(255, 255, 255, 0.85)
colors.text.muted           // rgba(255, 255, 255, 0.40)

// State
colors.state.success        // #10B981
colors.state.error          // #EF4444
```

#### Typography
```typescript
import { typography } from '@/design-system';

// Font Families
typography.fontFamily.display  // var(--font-display) - For headlines
typography.fontFamily.body     // var(--font-space) - For body text

// Font Sizes (Responsive)
typography.fontSize.display['2xl']  // 16rem (256px) - Massive hero text
typography.fontSize.h1              // 3.5rem (56px)
typography.fontSize.body            // 1rem (16px)
```

#### Spacing
All spacing uses a 4px base unit:
```typescript
import { spacing } from '@/design-system';

spacing[4]   // 1rem (16px)
spacing[8]   // 2rem (32px)
spacing[16]  // 4rem (64px)
```

#### Shadows
```typescript
import { shadows } from '@/design-system';

// Neon Glow Shadows
shadows.neon.orange.md   // Perfect for CTAs
shadows.neon.purple.lg   // Enhanced hover states
shadows.neon.pink.xl     // Maximum impact
```

#### Animations
```typescript
import { animations } from '@/design-system';

// Duration
animations.duration.fast      // 150ms
animations.duration.normal    // 300ms
animations.duration.slow      // 500ms

// Easing
animations.easing.smooth      // cubic-bezier(0.22, 1, 0.36, 1)
animations.easing.easeOut     // cubic-bezier(0, 0, 0.2, 1)
```

---

## Atomic Components

### Typography
Unified text component with gradient support:

```tsx
import { Typography } from '@/design-system';

// Display Text (Hero sections)
<Typography variant="display-2xl" gradient="orange-purple">
  THE ULTIMATE WEB3 QUIZ
</Typography>

// Headings
<Typography variant="h2" gradient="purple">
  Section Title
</Typography>

// Body Text
<Typography variant="body" color={colors.text.secondary}>
  Regular paragraph text
</Typography>
```

**Available Variants:**
- `display-2xl`, `display-xl`, `display-lg`, `display-md`, `display-sm`, `display-xs`
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- `body-xl`, `body-lg`, `body`, `body-sm`, `body-xs`

**Gradients:**
- `orange`, `purple`, `pink`
- `orange-purple`, `purple-pink`, `orange-pink`, `purple-orange`

### NeonButton
Primary CTA component with consistent hover effects:

```tsx
import { NeonButton } from '@/design-system';
import { FaGamepad } from 'react-icons/fa';

<NeonButton
  size="xl"
  variant="primary"
  neonColor="orange"
  leftIcon={<FaGamepad />}
  onClick={handleClick}
>
  Play Now
</NeonButton>
```

**Props:**
- `variant`: `primary`, `secondary`, `ghost`, `danger`
- `size`: `sm`, `md`, `lg`, `xl`
- `neonColor`: `orange`, `purple`, `pink`
- `fullWidth`: boolean
- `loading`: boolean
- `disabled`: boolean

### GlassCard
Glassmorphic container with consistent hover animations:

```tsx
import { GlassCard } from '@/design-system';

<GlassCard
  variant="purple"
  size="md"
  hover={true}
>
  <Content />
</GlassCard>
```

**Props:**
- `variant`: `default`, `orange`, `purple`, `pink`
- `size`: `sm`, `md`, `lg`, `xl`
- `hover`: boolean (enables hover lift effect)

### Input / Textarea
Form inputs with consistent styling:

```tsx
import { Input, Textarea } from '@/design-system';

<Input
  label="Quiz Name"
  placeholder="Enter quiz name"
  size="md"
  variant="neon"
  error={errors.name}
  hint="Choose a memorable name"
/>

<Textarea
  label="Description"
  rows={4}
  size="md"
/>
```

---

## Molecular Components

### StatCard
Pre-composed stat display:

```tsx
import { StatCard } from '@/design-system';
import { FaCoins } from 'react-icons/fa';

<StatCard
  icon={<FaCoins />}
  value="2847"
  label="SOL Distributed"
  variant="orange"
/>
```

### IconButton
Button with icon:

```tsx
import { IconButton } from '@/design-system';
import { FaRocket } from 'react-icons/fa';

<IconButton
  icon={<FaRocket />}
  label="Create Quiz"
  neonColor="purple"
  variant="secondary"
  iconPosition="left"
/>
```

### FormGroup
Vertical form layout with consistent spacing:

```tsx
import { FormGroup } from '@/design-system';

<FormGroup spacing="6">
  <Input label="Field 1" />
  <Input label="Field 2" />
  <Textarea label="Field 3" />
</FormGroup>
```

---

## State Management

### Zustand Store (`src/store/useAppStore.ts`)

Centralized state management for consistent data flow:

```tsx
import { useAppStore } from '@/store/useAppStore';

function MyComponent() {
  // User State
  const { user, setUser, clearUser } = useAppStore();
  
  // Quiz State
  const { quizzes, availableQuizzes, completedQuizzes, setQuizzes } = useAppStore();
  
  // UI State
  const { isLoading, error, setLoading, setError } = useAppStore();
  
  // Wallet State
  const { isWalletConnected, setWalletConnected } = useAppStore();
}
```

**Available Selectors:**
- `user` - User profile data
- `quizzes` - All quizzes
- `availableQuizzes` - Uncompleted quizzes
- `completedQuizzes` - Finished quizzes
- `isLoading` - Global loading state
- `error` - Global error message
- `isWalletConnected` - Wallet connection status

---

## Usage Guidelines

### 1. Typography Consistency
**Rule:** Always use `Typography` component for text content.

❌ **DON'T:**
```tsx
<h1 className="text-6xl font-bold text-orange-400">
  Title
</h1>
```

✅ **DO:**
```tsx
<Typography variant="display-lg" gradient="orange">
  Title
</Typography>
```

### 2. Button Consistency
**Rule:** All CTAs must use `NeonButton` component.

❌ **DON'T:**
```tsx
<button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-500">
  Click Me
</button>
```

✅ **DO:**
```tsx
<NeonButton size="lg" neonColor="orange">
  Click Me
</NeonButton>
```

### 3. Color Consistency
**Rule:** No hardcoded color values. Use design tokens.

❌ **DON'T:**
```tsx
<div style={{ color: '#F97316', background: '#0A001F' }} />
```

✅ **DO:**
```tsx
<div style={{ 
  color: colors.primary.orange[500], 
  background: colors.background.primary 
}} />
```

### 4. Spacing Consistency
**Rule:** Use spacing tokens for margins, padding, gaps.

❌ **DON'T:**
```tsx
<div style={{ padding: '32px', marginBottom: '48px' }} />
```

✅ **DO:**
```tsx
<div style={{ padding: spacing[8], marginBottom: spacing[12] }} />
```

### 5. Animation Consistency
**Rule:** Use animation tokens for consistent timing.

❌ **DON'T:**
```tsx
transition={{ duration: 0.3 }}
```

✅ **DO:**
```tsx
transition={{ 
  duration: parseFloat(animations.duration.normal) / 1000 
}}
```

---

## Cross-Page Consistency Checklist

When creating or updating a page, verify:

- [ ] All text uses `Typography` component
- [ ] All buttons use `NeonButton` component
- [ ] All cards use `GlassCard` component
- [ ] All colors reference design tokens
- [ ] All spacing uses spacing tokens
- [ ] All animations use animation tokens
- [ ] Form inputs use `Input`/`Textarea` components
- [ ] Stats use `StatCard` component
- [ ] State managed via `useAppStore`

---

## Responsive Behavior

All components are responsive by default:

```tsx
// Typography scales automatically
<Typography variant="display-2xl">
  // Automatically scales from 16rem -> 12rem -> 8rem on mobile
  HERO TEXT
</Typography>

// Buttons adapt to screen size
<NeonButton fullWidth> // Full width on mobile
  Action
</NeonButton>

// Cards maintain consistent padding
<GlassCard size="md"> // Responsive padding
  Content
</GlassCard>
```

---

## Migration Guide

### Converting Existing Components

**Before:**
```tsx
<h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
  Play Quizzes
</h2>
```

**After:**
```tsx
<Typography variant="h1" gradient="purple-pink" className="mb-4">
  Play Quizzes
</Typography>
```

**Before:**
```tsx
<button className="px-12 py-6 text-2xl font-bold rounded-full bg-gradient-to-r from-cyan-500 to-purple-500">
  Play Now
</button>
```

**After:**
```tsx
<NeonButton size="xl" neonColor="purple">
  Play Now
</NeonButton>
```

---

## Best Practices

1. **Component Reusability**: Never duplicate styles. Extract repeated patterns into components.
2. **Token Usage**: Always reference tokens. Never use magic numbers or hardcoded values.
3. **Semantic Naming**: Use semantic color names (`primary.orange`) not values (`#F97316`).
4. **Consistent Animations**: All interactive elements should use the same animation curve.
5. **Accessibility**: Always provide proper ARIA labels and semantic HTML.

---

## Performance Optimizations

- All animations use GPU acceleration
- Components use `React.memo` where appropriate
- Framer Motion animations use `will-change` for performance
- Lazy loading for heavy components (WebGL, etc.)

---

## Future Additions

Planned components:
- `Modal` - Consistent modal dialogs
- `Tooltip` - Hover tooltips
- `Badge` - Status badges
- `ProgressBar` - Loading indicators
- `Alert` - Notification banners

---

## Support

For questions or issues with the Design System:
1. Check this documentation
2. Review token definitions in `src/design-system/tokens`
3. Examine example usage in `src/app/page.tsx`
4. Follow the migration guide above
