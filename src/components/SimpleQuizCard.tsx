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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div 
        className="border-4 border-black p-8 bg-white transition-all duration-300 hover:translate-y-[-8px]"
      >
        <div className="flex items-start justify-between mb-8 border-b-2 border-black pb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Typography variant="body-xs" className="font-black opacity-30 tracking-widest uppercase">
                Node {quizId.slice(-4)}
              </Typography>
              {hasWinner && (
                <span
                  className="px-2 py-0.5 border border-black text-[10px] font-black uppercase tracking-tighter"
                  style={{
                    background: isClaimed ? colors.grayscale.ink : 'transparent',
                    color: isClaimed ? colors.grayscale.bone : colors.grayscale.ink
                  }}
                >
                  {isClaimed ? 'Secured' : 'Won'}
                </span>
              )}
              {!hasWinner && (
                <span
                  className="px-2 py-0.5 border border-black bg-black text-white text-[10px] font-black uppercase tracking-tighter"
                >
                  Available
                </span>
              )}
            </div>
            <Typography
              variant="h4"
              className="line-clamp-2 font-black uppercase leading-tight"
            >
              {question}
            </Typography>
          </div>
        </div>

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-black/10 flex items-center justify-center grayscale opacity-80">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <Typography variant="body-xs" className="font-black uppercase opacity-40">
                Reward
              </Typography>
              <Typography variant="h5" className="font-black uppercase">
                {rewardAmount} SOL
              </Typography>
            </div>
          </div>

          {hasWinner && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-black/10 flex items-center justify-center grayscale opacity-80">
                <span className="text-xl">🏆</span>
              </div>
              <div className="text-right">
                <Typography variant="body-xs" className="font-black uppercase opacity-40">
                  Winner
                </Typography>
                <Typography 
                  variant="body-xs" 
                  className="font-black uppercase truncate max-w-[80px]"
                >
                  {winner.toString().slice(0, 4)}...{winner.toString().slice(-4)}
                </Typography>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <NeonButton
            onClick={handleClick}
            disabled={hasWinner}
            variant={hasWinner ? "ghost" : "primary"}
            size="md"
            fullWidth
          >
            {hasWinner ? "Protocol Secured" : "Engage Program"}
          </NeonButton>

          {!hasWinner && (
            <NeonButton
              onClick={handleHostGame}
              variant="secondary"
              size="sm"
              fullWidth
            >
              Host Arena
            </NeonButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}