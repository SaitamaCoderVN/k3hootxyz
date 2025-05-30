'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// Skeleton loader for different content types
export function SkeletonLoader({ type = 'text' }: { type?: 'text' | 'card' | 'button' }) {
  const classes = {
    text: 'h-4 bg-purple-900/30 rounded w-3/4',
    card: 'h-32 bg-purple-900/30 rounded-xl',
    button: 'h-12 bg-purple-900/30 rounded-lg w-32'
  };

  return (
    <motion.div
      className={`${classes[type]} animate-pulse`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  );
}

// Full page loader with context
export function PageLoader({ message = 'Loading...', submessage }: { message?: string; submessage?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Custom animated loader */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            className="absolute inset-0 border-4 border-purple-500/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 bg-purple-500/20 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        
        <h2 className="text-2xl font-bold gradient-text mb-2">{message}</h2>
        {submessage && (
          <p className="text-purple-300 text-sm">{submessage}</p>
        )}
      </motion.div>
    </div>
  );
}

// Inline loader for buttons and small areas
export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizes[size]} relative`}>
      <motion.div
        className="absolute inset-0 border-2 border-purple-500/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Content loader wrapper
export function ContentLoader({ 
  loading, 
  error, 
  empty, 
  children,
  emptyMessage = 'No data found',
  errorMessage = 'Something went wrong',
  onRetry
}: {
  loading: boolean;
  error?: Error | null;
  empty?: boolean;
  children: ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
}) {
  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <motion.div
        className="min-h-[400px] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold mb-2">{errorMessage}</h3>
          <p className="text-purple-300 mb-4">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (empty) {
    return (
      <motion.div
        className="min-h-[400px] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold mb-2">{emptyMessage}</h3>
          <p className="text-purple-300">Check back later or create your own!</p>
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
