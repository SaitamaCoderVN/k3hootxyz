'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import Image from 'next/image';
import { LoadingLogo } from './Logo';

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
        {/* K3Hoot logo loader */}
        <div className="mx-auto mb-8">
          <LoadingLogo size="xl" />
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

// Specialized skeleton loaders for K3Hoot
export const TopicSkeleton = () => (
  <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 overflow-hidden relative">
    {/* Shimmer effect */}
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
    
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 bg-gray-700/50 rounded w-32 animate-pulse"></div>
      <div className="h-5 bg-gray-700/50 rounded-full w-16 animate-pulse"></div>
    </div>
    
    <div className="space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-700/50 rounded w-8 animate-pulse"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-700/50 rounded w-8 animate-pulse"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700/50 rounded w-20 animate-pulse"></div>
        </div>
        <div className="h-4 bg-purple-500/30 rounded w-12 animate-pulse"></div>
      </div>
    </div>
    
    <div className="pt-3 border-t border-white/10">
      <div className="h-3 bg-gray-700/50 rounded w-20 mb-2 animate-pulse"></div>
      <div className="h-3 bg-purple-500/30 rounded w-3/4 mb-1 animate-pulse"></div>
      <div className="flex items-center gap-1 mt-1">
        <div className="w-3 h-3 bg-gray-700/50 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-700/50 rounded w-16 animate-pulse"></div>
      </div>
    </div>
    
    {/* Stats section */}
    <div className="mt-3 pt-3 border-t border-white/10">
      <div className="flex justify-between">
        <div className="h-3 bg-green-500/30 rounded w-20 animate-pulse"></div>
        <div className="h-3 bg-yellow-500/30 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export const QuizCardSkeleton = () => (
  <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
    
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 bg-gray-700/50 rounded w-40 animate-pulse"></div>
      <div className="flex gap-2">
        <div className="h-5 bg-green-500/30 rounded-full w-16 animate-pulse"></div>
        <div className="h-5 bg-blue-500/30 rounded-full w-12 animate-pulse"></div>
      </div>
    </div>
    
    <div className="h-4 bg-gray-700/50 rounded w-full mb-4 animate-pulse"></div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-700/50 rounded w-16 animate-pulse"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
        <div className="h-4 bg-purple-500/30 rounded w-20 animate-pulse"></div>
      </div>
    </div>
    
    <div className="h-10 bg-purple-500/20 rounded w-full animate-pulse"></div>
  </div>
);

export const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="p-4 rounded-lg border bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-700/50 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-700/50 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-700/50 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="h-5 bg-gray-700/50 rounded w-16 mb-1 animate-pulse"></div>
            <div className="h-4 bg-purple-500/30 rounded w-20 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-700/50 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const BlockchainLoadingIndicator = ({ 
  message = "Loading from Solana blockchain...",
  showProgress = false,
  progress = 0 
}: { 
  message?: string;
  showProgress?: boolean;
  progress?: number;
}) => (
  <motion.div
    className="flex flex-col items-center justify-center py-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {/* K3Hoot logo loader */}
    <div className="relative w-16 h-16 mb-4">
      <motion.div
        className="absolute inset-0 border-4 border-purple-500/20 rounded-lg"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-lg"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute inset-3 bg-purple-500/10 rounded flex items-center justify-center overflow-hidden"
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/logo.png"
          alt="K3Hoot"
          width={32}
          height={32}
          className="object-contain"
        />
      </motion.div>
    </div>
    
    <div className="text-center">
      <h3 className="text-white font-medium mb-2">{message}</h3>
      <p className="text-gray-400 text-sm mb-4">This may take a few seconds...</p>
      
      {showProgress && (
        <div className="w-64 bg-gray-700/50 rounded-full h-2 mb-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <motion.div
          className="w-4 h-4 relative"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Image
            src="/logo.png"
            alt="K3Hoot"
            width={16}
            height={16}
            className="object-contain opacity-70"
          />
        </motion.div>
        Fetching data from Solana blockchain
      </div>
    </div>
  </motion.div>
);
