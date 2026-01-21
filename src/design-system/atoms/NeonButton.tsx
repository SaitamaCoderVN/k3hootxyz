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
      background: colors.grayscale.ink,
      border: `2px solid ${colors.grayscale.ink}`,
      color: colors.text.inverse,
    },
    secondary: {
      background: 'transparent',
      border: `2px solid ${colors.grayscale.ink}`,
      color: colors.text.primary,
    },
    ghost: {
      background: 'transparent',
      border: 'none',
      color: colors.text.primary,
    },
    danger: {
      background: colors.semantic.error,
      border: `2px solid ${colors.grayscale.ink}`,
      color: colors.text.inverse,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        group relative font-black rounded-none overflow-hidden transition-all
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        fontFamily: typography.fontFamily.display,
        fontSize: currentSize.text,
        paddingLeft: currentSize.px,
        paddingRight: currentSize.px,
        paddingTop: currentSize.py,
        paddingBottom: currentSize.py,
        ...currentVariant,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
      whileHover={
        !disabled && !loading
          ? {
              background: variant === 'primary' ? colors.grayscale.bone : colors.grayscale.ink,
              color: variant === 'primary' ? colors.grayscale.ink : colors.grayscale.bone,
              scale: 0.98,
            }
          : {}
      }
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      {...props}
    >
      <span className="relative flex items-center justify-center gap-3 px-1">
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="border-2 border-current border-t-transparent"
            style={{ width: '1.2em', height: '1.2em' }}
          />
        )}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className="tracking-widest">{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
    </motion.button>
  );
}
