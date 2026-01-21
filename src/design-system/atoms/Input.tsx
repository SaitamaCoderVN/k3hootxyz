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
        background: colors.background.tertiary,
        border: `2px solid ${colors.grayscale.ink}`,
        focusBorder: colors.grayscale.ink,
      },
      neon: {
        background: colors.background.secondary,
        border: `2px solid ${colors.grayscale.ink}`,
        focusBorder: colors.grayscale.ink,
      },
    };

    const currentSize = sizeStyles[size];
    const currentVariant = variantStyles[variant];

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            className="block font-black uppercase tracking-widest mb-2"
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: '10px',
              color: colors.text.primary,
            }}
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={`
            transition-all backdrop-blur-sm
            focus:outline-none rounded-none
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            background: currentVariant.background,
            border: error ? `2px solid ${colors.semantic.error}` : currentVariant.border,
            color: colors.text.primary,
            transition: `all ${animations.duration.normal} ease-in-out`,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? colors.semantic.error : currentVariant.focusBorder;
            e.target.style.boxShadow = `4px 4px 0px ${colors.grayscale.ink}10`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? colors.semantic.error : currentVariant.border;
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        
        {error && (
          <p
            className="mt-1 font-bold uppercase tracking-tight"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.semantic.error,
            }}
          >
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p
            className="mt-1 opacity-50 font-medium"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.text.primary,
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
        background: colors.background.tertiary,
        border: `2px solid ${colors.grayscale.ink}`,
        focusBorder: colors.grayscale.ink,
      },
      neon: {
        background: colors.background.secondary,
        border: `2px solid ${colors.grayscale.ink}`,
        focusBorder: colors.grayscale.ink,
      },
    };

    const currentSize = sizeStyles[size];
    const currentVariant = variantStyles[variant];

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            className="block font-black uppercase tracking-widest mb-2"
            style={{
              fontFamily: typography.fontFamily.display,
              fontSize: '10px',
              color: colors.text.primary,
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
            focus:outline-none rounded-none
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            background: currentVariant.background,
            border: error ? `2px solid ${colors.semantic.error}` : currentVariant.border,
            color: colors.text.primary,
            transition: `all ${animations.duration.normal} ease-in-out`,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? colors.semantic.error : currentVariant.focusBorder;
            e.target.style.boxShadow = `4px 4px 0px ${colors.grayscale.ink}10`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? colors.semantic.error : currentVariant.border;
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        
        {error && (
          <p
            className="mt-1 font-bold uppercase tracking-tight"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.semantic.error,
            }}
          >
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p
            className="mt-1 opacity-50 font-medium"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: '0.75rem',
              color: colors.text.primary,
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
