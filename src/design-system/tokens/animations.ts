/**
 * Animation Tokens
 * Based on Editorial Design System - Shopify Editions Style
 */

export const animations = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '800ms',
    slowest: '1200ms',
  },
  easing: {
    // Standard easing
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    
    // Entrance animations
    enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    
    // Exit animations
    exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
    
    // Elastic bounce for interactive elements
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    
    // Smooth deceleration for scroll reveals
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  },
  stagger: {
    children: 0.1,
    fast: 0.05,
    slow: 0.15,
  },
} as const;

/**
 * Framer Motion Variants
 * Reusable animation presets for consistent motion system
 */
export const motionVariants = {
  // Container animations with stagger
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animations.stagger.children,
        delayChildren: 0.1,
      },
    },
  },

  // Item fade + slide up
  fadeSlideUp: {
    hidden: { 
      opacity: 0, 
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: parseFloat(animations.duration.slow) / 1000,
        ease: [0.4, 0.0, 0.2, 1], // smooth easing
      },
    },
  },

  // Item fade + scale
  fadeScale: {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: parseFloat(animations.duration.normal) / 1000,
        ease: [0.4, 0.0, 0.2, 1],
      },
    },
  },

  // Neon glow pulse
  neonPulse: {
    initial: { 
      filter: 'brightness(1) drop-shadow(0 0 10px currentColor)',
    },
    animate: {
      filter: [
        'brightness(1) drop-shadow(0 0 10px currentColor)',
        'brightness(1.2) drop-shadow(0 0 20px currentColor)',
        'brightness(1) drop-shadow(0 0 10px currentColor)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Button hover/tap interactions
  buttonInteraction: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: parseFloat(animations.duration.fast) / 1000,
        ease: [0.68, -0.55, 0.265, 1.55], // bounce
      },
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: parseFloat(animations.duration.instant) / 1000,
      },
    },
  },
} as const;
