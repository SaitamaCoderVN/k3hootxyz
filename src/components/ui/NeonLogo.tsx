'use client';

import { motion } from 'framer-motion';
import { colors, shadows, animations, typography } from '@/design-system';

export default function NeonLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className="text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter"
        style={{
          fontFamily: typography.fontFamily.display,
          color: colors.grayscale.ink,
        }}
      >
        K3
      </span>
    </div>
  );
}