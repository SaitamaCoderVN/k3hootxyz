// K3HOOT Design System Tokens
// All design values must reference these tokens for consistency

export const colors = {
  // Primary Palette
  primary: {
    orange: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C', // Main Orange
      500: '#F97316', // Primary Orange
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    purple: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7', // Primary Purple
      600: '#9333EA',
      700: '#7E22CE',
      800: '#6B21A8',
      900: '#581C87',
    },
    pink: {
      50: '#FDF2F8',
      100: '#FCE7F3',
      200: '#FBCFE8',
      300: '#F9A8D4',
      400: '#F472B6',
      500: '#EC4899', // Primary Pink
      600: '#DB2777',
      700: '#BE185D',
      800: '#9F1239',
      900: '#831843',
    },
  },
  
  // Background
  background: {
    primary: '#0A001F', // Deep Space
    secondary: 'rgba(255, 255, 255, 0.02)',
    tertiary: 'rgba(255, 255, 255, 0.05)',
    glass: 'rgba(255, 255, 255, 0.03)',
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.85)',
    tertiary: 'rgba(255, 255, 255, 0.60)',
    muted: 'rgba(255, 255, 255, 0.40)',
  },
  
  // State Colors
  state: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // Semantic
  semantic: {
    border: 'rgba(255, 255, 255, 0.10)',
    borderHover: 'rgba(168, 85, 247, 0.40)',
    borderActive: 'rgba(168, 85, 247, 0.80)',
    shadow: 'rgba(0, 0, 0, 0.40)',
  },
} as const;

export const typography = {
  fontFamily: {
    display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },
  
  fontSize: {
    // Display (Hero sections)
    display: {
      // Responsive scaling: clamp(min_mobile, preferred, max_desktop)
      '2xl': 'clamp(4rem, 8vw + 2rem, 12rem)',      // 64px → 192px (was 256px)
      'xl': 'clamp(3rem, 6vw + 1.5rem, 8rem)',      // 48px → 128px
      'lg': 'clamp(2.5rem, 5vw + 1rem, 6rem)',      // 40px → 96px
      'md': 'clamp(2rem, 4vw + 0.5rem, 4.5rem)',    // 32px → 72px
      'sm': 'clamp(1.75rem, 3vw + 0.5rem, 3.5rem)', // 28px → 56px
      'xs': 'clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem)',// 24px → 40px
    },
    
    // Headings
    h1: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }], // 56px
    h2: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }], // 48px
    h3: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }], // 36px
    h4: ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }], // 30px
    h5: ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }], // 24px
    h6: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }], // 20px
    
    // Body
    xl: ['1.25rem', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '400' }], // 20px
    lg: ['1.125rem', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '400' }], // 18px
    base: ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }], // 16px
    sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }], // 14px
    xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '400' }], // 12px
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
    smooth: 'cubic-bezier(0.22, 1, 0.36, 1)', // Custom smooth curve
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