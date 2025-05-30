'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'quiz' | 'wallet' | 'search' | 'error';
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  illustration = 'quiz'
}: EmptyStateProps) {
  const illustrations = {
    quiz: '🎯',
    wallet: '👛',
    search: '🔍',
    error: '😕'
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] text-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Illustration */}
      <motion.div
        className="text-8xl mb-6"
        animate={{ 
          y: [0, -10, 0],
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {icon || illustrations[illustration]}
      </motion.div>

      {/* Text Content */}
      <h3 className="text-2xl font-bold mb-3 gradient-text">{title}</h3>
      {description && (
        <p className="text-purple-300 max-w-md mb-6">{description}</p>
      )}

      {/* Action Button */}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}

      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </motion.div>
  );
}
