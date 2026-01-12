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
  const variantColor = variant === 'default' ? 'purple' : variant;
  const primaryColor = colors.primary[variantColor][500];
  
  return {
    borderColor: `${primaryColor}40`,
    borderColorHover: `${primaryColor}60`,
    glowColor: `${primaryColor}20`,
  };
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
      className={`relative rounded-2xl backdrop-blur-xl border transition-all duration-300 ${sizeClass} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.background.glass}dd, ${colors.background.glass}aa)`,
        borderColor: variantStyles.borderColor,
        boxShadow: `0 20px 60px ${colors.semantic.shadow}80, 0 8px 32px ${variantStyles.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      }}
    >
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${variantStyles.glowColor}, transparent 70%)`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div
          className="absolute -inset-1 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl"
          style={{
            background: `linear-gradient(135deg, ${variantStyles.glowColor}80, transparent)`,
          }}
        />
        <div
          className={`relative rounded-2xl backdrop-blur-xl border transition-all duration-500 hover:border-opacity-80 ${sizeClass} ${className}`}
          style={{
            background: `linear-gradient(135deg, ${colors.background.glass}dd, ${colors.background.glass}aa)`,
            borderColor: variantStyles.borderColor,
            boxShadow: `0 20px 60px ${colors.semantic.shadow}80, 0 8px 32px ${variantStyles.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
          }}
        >
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${variantStyles.glowColor}60, transparent 70%)`,
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </motion.div>
    );
  }

  return cardContent;
}

