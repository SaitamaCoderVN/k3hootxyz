'use client';

import { PublicKey } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SimpleQuizCardProps {
  quizId: number;
  question: string;
  rewardAmount: number;
  winner: PublicKey | null;
  isClaimed: boolean;
  onPlay?: () => void;
}

/**
 * Simple Quiz Card Component
 * Displays quiz summary for listing page
 */
export function SimpleQuizCard({
  quizId,
  question,
  rewardAmount,
  winner,
  isClaimed,
  onPlay
}: SimpleQuizCardProps) {
  const router = useRouter();
  const hasWinner = winner !== null;
  
  const handleClick = () => {
    if (onPlay) {
      onPlay();
    } else {
      router.push(`/quiz/${quizId}`);
    }
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-400">Quiz #{quizId}</span>
              {hasWinner && (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isClaimed 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {isClaimed ? 'Claimed' : 'Won'}
                </span>
              )}
              {!hasWinner && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 animate-pulse">
                  Available
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
              {question}
            </h3>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-sm text-gray-400">Reward</div>
              <div className="text-lg font-bold text-cyan-400">
                {rewardAmount} SOL
              </div>
            </div>
          </div>

          {hasWinner && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div className="text-right">
                <div className="text-sm text-gray-400">Winner</div>
                <div className="text-xs font-mono text-purple-400">
                  {winner.toString().slice(0, 4)}...{winner.toString().slice(-4)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleClick}
          disabled={hasWinner}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold
            transition-all duration-300
            ${hasWinner
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 hover:shadow-lg hover:shadow-cyan-500/50'
            }
          `}
        >
          {hasWinner ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Play Now</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>
      </div>

      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    </motion.div>
  );
}

