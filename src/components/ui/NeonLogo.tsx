'use client';

import { motion } from 'framer-motion';

export default function NeonLogo({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      animate={{
        filter: [
          'drop-shadow(0 0 20px rgba(249, 115, 22, 0.6)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.4))',
          'drop-shadow(0 0 30px rgba(249, 115, 22, 0.8)) drop-shadow(0 0 60px rgba(168, 85, 247, 0.6))',
          'drop-shadow(0 0 20px rgba(249, 115, 22, 0.6)) drop-shadow(0 0 40px rgba(168, 85, 247, 0.4))',
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <span
        className="text-6xl md:text-7xl lg:text-8xl font-bold"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, #f97316, #a855f7)',
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
