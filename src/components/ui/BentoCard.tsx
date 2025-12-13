'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  size?: 'small' | 'medium' | 'large' | 'wide';
  delay?: number;
}

export default function BentoCard({ 
  children, 
  className = '', 
  glowColor = 'rgba(139, 92, 246, 0.4)',
  size = 'medium',
  delay = 0
}: BentoCardProps) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
    wide: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-1',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative ${sizeClasses[size]} ${className}`}
    >
      <motion.div
        className="absolute -inset-[1px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent)`,
          filter: 'blur(12px)',
        }}
        whileHover={{ scale: 1.02 }}
      />
      
      <div 
        className="relative h-full bg-white/[0.03] backdrop-blur-[60px] rounded-[32px] border border-white/[0.08] group-hover:border-white/[0.15] transition-all duration-500 overflow-hidden"
        style={{
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
        }}
      >
        <div className="relative z-10 h-full p-6 md:p-8">
          {children}
        </div>
        
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`,
          }}
        />
      </div>
    </motion.div>
  );
}
