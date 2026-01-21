'use client';

import { motion } from 'framer-motion';

import { GlassCard, Typography, colors } from '@/design-system';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  reward: string;
  avatar?: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'CryptoMaster', score: 12500, reward: '2.5 SOL' },
  { rank: 2, name: 'QuizWizard', score: 11800, reward: '1.8 SOL' },
  { rank: 3, name: 'BlockchainPro', score: 11200, reward: '1.2 SOL' },
  { rank: 4, name: 'Web3Expert', score: 9800, reward: '0.8 SOL' },
  { rank: 5, name: 'SolanaKing', score: 9200, reward: '0.6 SOL' },
];

const getRankIcon = (rank: number) => {
  return (
    <div 
      className="w-8 h-8 rounded-none flex items-center justify-center font-black text-xs border border-black"
    >
      {rank}
    </div>
  );
};

const getRankGradient = (rank: number): [string, string] => {
  if (rank === 1) return ['#FFFFFF', '#EDEDED'];
  if (rank === 2) return ['#FFFFFF', '#FBFBFB'];
  if (rank === 3) return ['#FBFBFB', '#EDEDED'];
  return ['#FBFBFB', '#FBFBFB'];
};

export function LeaderboardPreview() {
  return (
    <div className="w-full">
      <div className="mb-8 border-b-2 border-black pb-4 flex justify-between items-end">
        <div>
          <Typography variant="h3" className="font-black uppercase text-black">
            Top Players
          </Typography>
          <Typography variant="body-xs" className="uppercase font-black opacity-30 tracking-widest">
            Protocol Rankings
          </Typography>
        </div>
        <Typography variant="display-xs" className="font-black opacity-10 leading-none">01</Typography>
      </div>

      <div className="space-y-4">
        {mockLeaderboard.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`
              flex items-center gap-6 p-4 border-2 transition-all duration-300
              ${entry.rank === 1 ? 'border-black bg-white' : 'border-black/5 bg-transparent'}
            `}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-none flex items-center justify-center font-black text-lg flex-shrink-0 border border-black/10 uppercase"
                style={{ background: getRankGradient(entry.rank)[0] }}
              >
                {entry.name.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <Typography 
                  variant="body" 
                  className="font-black uppercase tracking-tight truncate text-black"
                >
                  {entry.name}
                </Typography>
                <Typography variant="body-xs" className="font-black uppercase opacity-40 text-[10px]">
                  {entry.reward} CLAIMED
                </Typography>
              </div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              <Typography 
                variant="h4" 
                className="font-black leading-none text-black"
              >
                {entry.score.toLocaleString()}
              </Typography>
              <Typography variant="body-xs" className="uppercase font-black tracking-widest text-[10px] opacity-30">
                POINTS
              </Typography>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-8 pt-8 border-t-2 border-black/5"
      >
        <Typography 
          variant="body-xs" 
          className="text-center font-black uppercase tracking-[0.2em] opacity-40"
        >
          ARENA STATUS: ACTIVE
        </Typography>
      </motion.div>
    </div>
  );
}

