'use client';

import { motion } from 'framer-motion';
import { useState, ReactNode } from 'react';

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  whileHover?: any;
  whileTap?: any;
  transition?: any;
  onClick?: () => void;
}

export function RippleButton({
  children,
  className = '',
  style = {},
  whileHover = {},
  whileTap = {},
  transition = {},
  onClick,
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    onClick?.();
  };

  return (
    <motion.button
      className={`relative overflow-visible ${className}`}
      style={style}
      whileHover={whileHover}
      whileTap={whileTap}
      transition={transition}
      onClick={handleClick}
    >
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(249, 115, 22, 0.6) 50%, transparent 70%)',
            boxShadow: '0 0 60px rgba(168, 85, 247, 0.8)',
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 80, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
      {children}
    </motion.button>
  );
}
