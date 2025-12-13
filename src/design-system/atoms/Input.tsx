'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { colors, borderRadius, spacing, typography, animations } from '../tokens';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'neon';

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
}

interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {}
interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, size = 'md', variant = 'default', fullWidth = true, className = '', ...props }, ref) => {
    const sizeStyles = {
      sm: { padding: `${spacing[2]} ${spacing[3]}`, fontSize: '0.875rem' },
      md: { padding: `${spacing[3]} ${spacing[4]}`, fontSize: '1rem' },
      lg: { padding: `${spacing[4]} ${spacing[6]}`, fontSize: '1.125rem' },
    };

    const variantStyles = {
      default: {
        background: 'rgba(17, 24, 39, 0.5)',
        border: `2px solid ${colors.semantic.border}`,
        focusBorder: colors.primary.purple[500],
      },
      neon: {
        background: colors.background.glass,
        border: `2px solid ${colors.primary.purple[500]}40`,
        focusBorder: colors.primary.purple[500],
      },
    };

    const currentSize = sizeStyles[size];
    const currentVariant = variantStyles[variant];

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            className="block font-semibold mb-2"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.875rem',
              color: colors.text.secondary,
            }}
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={`
            transition-all backdrop-blur-sm
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-500
            ${error ? 'border-red-500' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            background: currentVariant.background,
            border: error ? `2px solid ${colors.state.error}` : currentVariant.border,
            borderRadius: borderRadius.lg,
            color: colors.text.primary,
            transition: `all ${animations.duration.normal} ${animations.easing.smooth}`,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? colors.state.error : currentVariant.focusBorder;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? colors.state.error : currentVariant.border;
          }}
          {...props}
        />
        
        {error && (
          <p
            className="mt-1"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.state.error,
            }}
          >
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p
            className="mt-1"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.text.muted,
            }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, size = 'md', variant = 'default', fullWidth = true, className = '', rows = 4, ...props }, ref) => {
    const sizeStyles = {
      sm: { padding: `${spacing[2]} ${spacing[3]}`, fontSize: '0.875rem' },
      md: { padding: `${spacing[3]} ${spacing[4]}`, fontSize: '1rem' },
      lg: { padding: `${spacing[4]} ${spacing[6]}`, fontSize: '1.125rem' },
    };

    const variantStyles = {
      default: {
        background: 'rgba(17, 24, 39, 0.5)',
        border: `2px solid ${colors.semantic.border}`,
        focusBorder: colors.primary.purple[500],
      },
      neon: {
        background: colors.background.glass,
        border: `2px solid ${colors.primary.purple[500]}40`,
        focusBorder: colors.primary.purple[500],
      },
    };

    const currentSize = sizeStyles[size];
    const currentVariant = variantStyles[variant];

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            className="block font-semibold mb-2"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.875rem',
              color: colors.text.secondary,
            }}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          className={`
            transition-all backdrop-blur-sm resize-none
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-500
            ${error ? 'border-red-500' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            background: currentVariant.background,
            border: error ? `2px solid ${colors.state.error}` : currentVariant.border,
            borderRadius: borderRadius.lg,
            color: colors.text.primary,
            transition: `all ${animations.duration.normal} ${animations.easing.smooth}`,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? colors.state.error : currentVariant.focusBorder;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? colors.state.error : currentVariant.border;
          }}
          {...props}
        />
        
        {error && (
          <p
            className="mt-1"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.state.error,
            }}
          >
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p
            className="mt-1"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.text.muted,
            }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
