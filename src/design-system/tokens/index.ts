// K3HOOT Design System Tokens
// All design values must reference these tokens for consistency

export const colors = {
  // Monochromatic Luxury Palette
  grayscale: {
    ink: '#0A0A0A',      // Purest black for text/headers
    charcoal: '#262626', // Secondary text
    neutral: '#404040',  // Darkened from #737373
    graphite: '#737373', // Darkened from #A3A3A3
    paper: '#EDEDED',    // Secondary background/Cards
    bone: '#FBFBFB',     // Main background
  },

  primary: {
    black: {
      900: '#0A0A0A',
    },
    gray: {
      500: '#404040',
      100: '#EDEDED',
    },
    // Compatibility Shim for Minimalist Redesign
    orange: { 500: '#0A0A0A', 400: '#262626' },
    purple: { 500: '#FACC15', 400: '#EAB308', 300: '#EAB308', 200: '#FEF08A' },
    pink: { 500: '#FACC15', 400: '#EAB308' },
  },

  background: {
    primary: '#FBFBFB',   // Bone White
    secondary: '#EDEDED', // Paper Gray
    tertiary: '#FFFFFF',  // Pure White
    contrast: '#0A0A0A',  // Ink Black
  },

  text: {
    primary: '#0A0A0A',   // Ink
    secondary: '#262626', // Charcoal
    muted: '#737373',     // Neutral
    inverse: '#FBFBFB',   // Bone
  },

  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    border: '#0A0A0A',    // High-contrast solid black border
    borderSubtle: '#D4D4D4',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
} as const;

export const typography = {
  fontFamily: {
    display: "var(--font-plex-mono), 'Archive', 'Inter', system-ui, sans-serif",
    body: "var(--font-plex-mono), 'Inter', system-ui, sans-serif",
    mono: "var(--font-plex-mono), 'Fira Code', 'Courier New', monospace",
  },

  fontSize: {
    // Display (Hero sections)
    display: {
      '6xl': '8rem',
      '5xl': '6rem',
      '4xl': '4.5rem',
      '3xl': '3rem',
      '2xl': '2.5rem',
      'xl': '2rem',
      'lg': '1.5rem',
      'md': '1.25rem',
      'sm': '1.125rem',
      'xs': '1rem',
    },

    // Headings
    h1: ['4.5rem', { lineHeight: '0.9', letterSpacing: '-0.04em', fontWeight: '900' }],
    h2: ['3.5rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '800' }],
    h3: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
    h4: ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
    h5: ['1.25rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
    h6: ['1rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '600' }],

    // Body
    xl: ['1.5rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
    lg: ['1.25rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
    base: ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
    sm: ['0.875rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
    xs: ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.1em', fontWeight: '500' }],
  },
} as const;

export const spacing = {
  // Base unit: 4px
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  '4xl': '3rem', // 48px
  full: '9999px',
} as const;

// Shadows exported from shadows.ts

export const animations = {
  // Duration tokens
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '800ms',
    slowest: '1200ms',
  },

  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Named animations
  variants: {
    'fade-in': {
      name: 'fade-in',
      duration: '300ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
    },
    'fade-in-slow': {
      name: 'fade-in-slow',
      duration: '800ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
    },
    'slide-up': {
      name: 'slide-up',
      duration: '300ms',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    'slide-up-medium': {
      name: 'slide-up-medium',
      duration: '500ms',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    'neon-pulse': {
      name: 'neon-pulse',
      duration: '2000ms',
      easing: 'ease-in-out',
    },
    'neon-pulse-quick': {
      name: 'neon-pulse-quick',
      duration: '1000ms',
      easing: 'ease-in-out',
    },
    'scale-in': {
      name: 'scale-in',
      duration: '300ms',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
  },
} as const;

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Type exports for TypeScript
export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type AnimationToken = typeof animations;

export * from './animations';
export * from './shadows';