'use client';

import { PublicKey } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Typography, GlassCard, NeonButton, colors } from '@/design-system';

interface SimpleQuizCardProps {
  quizId: string; // Changed from number to string (Solana PDA)
  question: string;
  rewardAmount: number;
  winner: PublicKey | null;
  isClaimed: boolean;
  onPlay?: () => void;
  onHostGame?: () => void; // NEW: Host multiplayer game
}

export function SimpleQuizCard({
  quizId,
  question,
  rewardAmount,
  winner,
  isClaimed,
  onPlay,
  onHostGame
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

  const handleHostGame = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onHostGame) {
      onHostGame();
    } else {
      router.push(`/multiplayer/host?quizId=${quizId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative"
    >
      <GlassCard 
        variant={hasWinner ? "default" : "purple"} 
        size="md" 
        hover={!hasWinner}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Typography variant="body-sm" color={colors.text.muted} className="font-mono">
                {quizId.slice(0, 4)}...{quizId.slice(-4)}
              </Typography>
              {hasWinner && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: isClaimed ? `${colors.state.success}33` : `${colors.primary.orange[500]}33`,
                    color: isClaimed ? colors.state.success : colors.primary.orange[400]
                  }}
                >
                  {isClaimed ? 'Claimed' : 'Won'}
                </span>
              )}
              {!hasWinner && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold animate-pulse"
                  style={{
                    background: `${colors.primary.purple[500]}33`,
                    color: colors.primary.purple[400]
                  }}
                >
                  Available
                </span>
              )}
            </div>
            <Typography
              variant="body-lg"
              className="line-clamp-2 font-bold transition-colors group-hover:text-cyan-400"
            >
              {question}
            </Typography>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <Typography variant="body-xs" color={colors.text.muted}>
                Reward
              </Typography>
              <Typography variant="h5" gradient="purple">
                {rewardAmount} SOL
              </Typography>
            </div>
          </div>

          {hasWinner && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div className="text-right">
                <Typography variant="body-xs" color={colors.text.muted}>
                  Winner
                </Typography>
                <Typography 
                  variant="body-xs" 
                  color={colors.primary.pink[400]}
                  className="font-mono"
                >
                  {winner.toString().slice(0, 4)}...{winner.toString().slice(-4)}
                </Typography>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <NeonButton
            onClick={handleClick}
            disabled={hasWinner}
            variant={hasWinner ? "ghost" : "primary"}
            neonColor="purple"
            size="md"
            fullWidth
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
          </NeonButton>

          {!hasWinner && (
            <NeonButton
              onClick={handleHostGame}
              variant="secondary"
              neonColor="orange"
              size="sm"
              fullWidth
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Host Multiplayer</span>
              </span>
            </NeonButton>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}