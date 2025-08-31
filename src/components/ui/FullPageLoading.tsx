'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LoadingContainer } from '@/components/layout/MinHeightContainer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BlockchainLoadingIndicator } from './LoadingStates';

interface FullPageLoadingProps {
  message?: string;
  showSkeletons?: boolean;
  skeletonComponent?: ReactNode;
  className?: string;
}

export default function FullPageLoading({
  message = "Loading from Solana blockchain...",
  showSkeletons = false,
  skeletonComponent,
  className = ""
}: FullPageLoadingProps) {
  return (
    <main className={`min-h-screen bg-black text-white overflow-hidden ${className}`}>
      <SpaceBackground />
      <Stars />
      <Header />
      
      <LoadingContainer>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          {/* Header giống như create/page.tsx */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Title và description */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
                Loading...
              </h1>
              <p className="text-lg text-purple-300 max-w-2xl mx-auto">
                Please wait while we fetch data from Solana blockchain
              </p>
            </div>

            {/* Loading indicator giống như create/page.tsx */}
            <div className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-8">
              <div className="py-8">
                <BlockchainLoadingIndicator 
                  message={message}
                  showProgress={false}
                />
              </div>
            </div>

            {/* Skeletons nếu cần */}
            {showSkeletons && skeletonComponent && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {skeletonComponent}
              </motion.div>
            )}
          </motion.div>
        </div>
      </LoadingContainer>
      
      <Footer />
    </main>
  );
}

// Specialized loading cho Leaderboard - giống logic create/page.tsx
export function LeaderboardLoading() {
  return (
    <FullPageLoading
      message="Loading topics from blockchain..."
      showSkeletons={true}
      skeletonComponent={
        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-green-300">Available Topics</h4>
            <div className="text-green-300">Loading...</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700/50 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700/50 rounded"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-purple-500/30 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

// Specialized loading cho Play - giống logic create/page.tsx
export function PlayLoading() {
  return (
    <FullPageLoading
      message="Loading topics from blockchain..."
      showSkeletons={true}
      skeletonComponent={
        <div className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-purple-300">Available Topics</h4>
            <div className="text-purple-300">Loading...</div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 animate-pulse">
                <div className="h-8 bg-purple-500/30 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700/50 rounded"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
                  <div className="h-10 bg-purple-500/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

// Specialized loading cho Create - giống logic create/page.tsx
export function CreateLoading() {
  return (
    <FullPageLoading
      message="Preparing your workspace..."
      showSkeletons={false}
    />
  );
}
