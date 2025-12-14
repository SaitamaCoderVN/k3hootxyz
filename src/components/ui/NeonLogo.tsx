'use client';

import { motion } from 'framer-motion';
import { colors, shadows, animations, typography } from '@/design-system';

export default function NeonLogo({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{
        willChange: 'filter',
        transform: 'translate3d(0, 0, 0)',
      }}
      animate={{
        filter: [
          `drop-shadow(${shadows.neon.orange.sm}) drop-shadow(${shadows.neon.purple.sm})`,
          `drop-shadow(${shadows.neon.orange.md}) drop-shadow(${shadows.neon.purple.md})`,
          `drop-shadow(${shadows.neon.orange.sm}) drop-shadow(${shadows.neon.purple.sm})`,
        ],
      }}
      transition={{
        duration: parseFloat(animations.duration.slower) / 1000,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <span
        className="text-6xl md:text-7xl lg:text-8xl font-bold"
        style={{
          fontFamily: typography.fontFamily.display,
          background: `linear-gradient(135deg, ${colors.primary.orange[500]}, ${colors.primary.purple[500]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        K3
      </span>
    </motion.div>
  );
}