'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlowingButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: ReactNode;
}

export default function GlowingButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: GlowingButtonProps) {
  const baseClasses = 'pixel-button pixel-corners transform-gpu backface-hidden';
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-amber-100 hover:bg-amber-200 text-black border-2 border-amber-400/30'
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 15
      }}
      {...props}
    >
      {children}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 opacity-0 hover:opacity-100 transition-opacity pixel-corners" />
    </motion.button>
  );
} 