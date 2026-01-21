'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../tokens';

type GlassCardVariant = 'default' | 'orange' | 'purple' | 'pink';
type GlassCardSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassCardProps {
  children: ReactNode;
  variant?: GlassCardVariant;
  size?: GlassCardSize;
  hover?: boolean;
  className?: string;
}

const sizeClasses: Record<GlassCardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const getVariantStyles = (variant: GlassCardVariant) => {
  switch (variant) {
    case 'orange':
    case 'purple':
    case 'pink':
      return {
        bg: colors.background.contrast, // Ink Black
        text: colors.text.inverse,      // Bone White
        borderColor: colors.grayscale.graphite,
      };
    default:
      return {
        bg: colors.background.tertiary, // Pure White
        text: colors.text.primary,      // Ink Black
        borderColor: colors.grayscale.ink,
      };
  }
};

export function GlassCard({
  children,
  variant = 'default',
  size = 'md',
  hover = false,
  className = '',
}: GlassCardProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeClass = sizeClasses[size];

  const cardContent = (
    <div
      className={`relative rounded-none border-2 transition-all duration-300 ${sizeClass} ${className}`}
      style={{
        background: variantStyles.bg,
        borderColor: variantStyles.borderColor,
        color: variantStyles.text,
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ x: 4, y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative"
      >
        {/* Layered shadow effect for luxury feel */}
        <div 
          className="absolute inset-0 bg-black translate-x-[4px] translate-y-[4px] -z-10" 
          style={{ opacity: 0.1 }}
        />
        <div
          className={`relative rounded-none border-2 transition-all duration-300 ${sizeClass} ${className}`}
          style={{
            background: variantStyles.bg,
            borderColor: variantStyles.borderColor,
            color: variantStyles.text,
          }}
        >
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </motion.div>
    );
  }

  return cardContent;
}

