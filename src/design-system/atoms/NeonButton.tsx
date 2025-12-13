'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, MouseEvent } from 'react';
import { colors, shadows, animations, typography, borderRadius, spacing } from '../tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
type NeonColor = 'orange' | 'purple' | 'pink';

interface NeonButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  neonColor?: NeonColor;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function NeonButton({
  children,
  variant = 'primary',
  size = 'md',
  neonColor = 'orange',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}: NeonButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  const sizeStyles = {
    sm: { px: spacing[4], py: spacing[2], text: '0.875rem' },
    md: { px: spacing[6], py: spacing[3], text: '1rem' },
    lg: { px: spacing[8], py: spacing[4], text: '1.125rem' },
    xl: { px: spacing[12], py: spacing[6], text: '1.5rem' },
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${colors.primary[neonColor][500]}, ${colors.primary[neonColor][400]})`,
      boxShadow: shadows.neon[neonColor].md,
      border: 'none',
      color: colors.text.primary,
    },
    secondary: {
      background: colors.background.glass,
      boxShadow: shadows.neon[neonColor].md,
      border: `2px solid ${colors.primary[neonColor][500]}40`,
      color: colors.text.primary,
    },
    ghost: {
      background: 'transparent',
      boxShadow: 'none',
      border: 'none',
      color: colors.primary[neonColor][400],
    },
    danger: {
      background: `linear-gradient(135deg, ${colors.state.error}, #DC2626)`,
      boxShadow: '0 0 40px rgba(239, 68, 68, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3)',
      border: 'none',
      color: colors.text.primary,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const hoverShadow = variant === 'primary' || variant === 'secondary'
    ? shadows.neon[neonColor].xl
    : variant === 'danger'
    ? '0 0 80px rgba(239, 68, 68, 0.6), 0 20px 40px rgba(0, 0, 0, 0.4)'
    : 'none';

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        group relative font-bold rounded-full overflow-hidden transition-all
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        fontFamily: typography.fontFamily.body,
        fontSize: currentSize.text,
        paddingLeft: currentSize.px,
        paddingRight: currentSize.px,
        paddingTop: currentSize.py,
        paddingBottom: currentSize.py,
        ...currentVariant,
      }}
      whileHover={
        !disabled && !loading
          ? {
              y: -8,
              boxShadow: hoverShadow,
              scale: 1.02,
            }
          : {}
      }
      whileTap={
        !disabled && !loading
          ? {
              scale: 0.98,
              y: -4,
            }
          : {}
      }
      transition={{
        duration: parseFloat(animations.duration.normal) / 1000,
        ease: animations.easing.smooth.split('(')[1].split(')')[0].split(',').map(Number),
      }}
      {...props}
    >
      {variant === 'primary' && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[neonColor][600]}, ${colors.primary[neonColor][500]})`,
          }}
        />
      )}

      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <div
            className="animate-spin rounded-full border-b-2 border-white"
            style={{ width: '1em', height: '1em' }}
          />
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>

      {/* Ripple effect container */}
      <span className="absolute inset-0 pointer-events-none" />
    </motion.button>
  );
}
