/**
 * Shadow Tokens
 * Neon Glassmorphism Web3 Theme
 */

export const shadows = {
  // Standard elevation shadows (subtle)
  elevation: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  // Neon glow effects (colored)
  neon: {
    orange: {
      sm: '0 0 10px rgba(249, 115, 22, 0.3)',
      md: '0 0 20px rgba(249, 115, 22, 0.4)',
      lg: '0 0 40px rgba(249, 115, 22, 0.5)',
      xl: '0 0 80px rgba(249, 115, 22, 0.6)',
    },
    purple: {
      sm: '0 0 10px rgba(168, 85, 247, 0.3)',
      md: '0 0 20px rgba(168, 85, 247, 0.4)',
      lg: '0 0 40px rgba(168, 85, 247, 0.5)',
      xl: '0 0 80px rgba(168, 85, 247, 0.6)',
    },
    pink: {
      sm: '0 0 10px rgba(236, 72, 153, 0.3)',
      md: '0 0 20px rgba(236, 72, 153, 0.4)',
      lg: '0 0 40px rgba(236, 72, 153, 0.5)',
      xl: '0 0 80px rgba(236, 72, 153, 0.6)',
    },
  },

  // Inner shadows for glassmorphism
  inner: {
    subtle: 'inset 0 1px 2px 0 rgb(255 255 255 / 0.05)',
    medium: 'inset 0 2px 4px 0 rgb(255 255 255 / 0.1)',
  },

  // Text shadows for neon typography
  text: {
    neon: {
      orange: '0 0 20px rgba(249, 115, 22, 0.8), 0 0 40px rgba(249, 115, 22, 0.5)',
      purple: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.5)',
      pink: '0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(236, 72, 153, 0.5)',
    },
    subtle: '0 2px 4px rgba(0, 0, 0, 0.5)',
  },
} as const;
