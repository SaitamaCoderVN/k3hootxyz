'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { colors, shadows, borderRadius, animations } from '../tokens';

type CardVariant = 'default' | 'orange' | 'purple' | 'pink';
type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'size'> {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  hover?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  variant = 'default',
  size = 'md',
  hover = true,
  className = '',
  ...props
}: GlassCardProps) {
  const sizeStyles = {
    sm: { padding: '1rem', borderRadius: borderRadius.xl },
    md: { padding: '2rem', borderRadius: borderRadius['2xl'] },
    lg: { padding: '3rem', borderRadius: borderRadius['3xl'] },
    xl: { padding: '4rem', borderRadius: borderRadius['4xl'] },
  };

  const variantStyles = {
    default: {
      background: colors.background.glass,
      border: `1px solid ${colors.semantic.border}`,
      boxShadow: shadows.md,
    },
    orange: {
      background: colors.background.glass,
      border: `1px solid ${colors.primary.orange[500]}30`,
      boxShadow: shadows.neon.orange.md,
    },
    purple: {
      background: colors.background.glass,
      border: `1px solid ${colors.primary.purple[500]}30`,
      boxShadow: shadows.neon.purple.md,
    },
    pink: {
      background: colors.background.glass,
      border: `1px solid ${colors.primary.pink[500]}30`,
      boxShadow: shadows.neon.pink.md,
    },
  };

  const hoverShadows = {
    default: shadows.lg,
    orange: shadows.neon.orange.lg,
    purple: shadows.neon.purple.lg,
    pink: shadows.neon.pink.lg,
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <motion.div
      className={`backdrop-blur-xl transition-all ${className}`}
      style={{
        ...currentVariant,
        padding: currentSize.padding,
        borderRadius: currentSize.borderRadius,
      }}
      whileHover={
        hover
          ? {
              y: -8,
              boxShadow: hoverShadows[variant],
              borderColor: variant !== 'default' ? `${colors.primary[variant][500]}60` : colors.semantic.borderHover,
              scale: 1.02,
            }
          : {}
      }
      transition={{
        duration: parseFloat(animations.duration.normal) / 1000,
        ease: animations.easing.smooth.split('(')[1].split(')')[0].split(',').map(Number),
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
