'use client';

import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import { GlassCard, Typography, colors } from '@/design-system';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  reward: string;
  avatar?: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'CryptoMaster', score: 12500, reward: '2.5 SOL', avatar: '👑' },
  { rank: 2, name: 'QuizWizard', score: 11800, reward: '1.8 SOL', avatar: '⭐' },
  { rank: 3, name: 'BlockchainPro', score: 11200, reward: '1.2 SOL', avatar: '🔥' },
  { rank: 4, name: 'Web3Expert', score: 9800, reward: '0.8 SOL', avatar: '💎' },
  { rank: 5, name: 'SolanaKing', score: 9200, reward: '0.6 SOL', avatar: '🚀' },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <FaTrophy style={{ color: '#FFD700', fontSize: '1.5rem' }} />;
  if (rank === 2) return <FaMedal style={{ color: '#C0C0C0', fontSize: '1.5rem' }} />;
  if (rank === 3) return <FaAward style={{ color: '#CD7F32', fontSize: '1.5rem' }} />;
  return (
    <div 
      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
      style={{
        background: `linear-gradient(135deg, ${colors.primary.purple[500]}40, ${colors.primary.pink[500]}40)`,
        border: `1px solid ${colors.primary.purple[400]}60`,
        color: colors.primary.purple[200],
      }}
    >
      {rank}
    </div>
  );
};

const getRankGradient = (rank: number): [string, string] => {
  if (rank === 1) return ['rgba(234, 179, 8, 0.2)', 'rgba(249, 115, 22, 0.2)'];
  if (rank === 2) return ['rgba(156, 163, 175, 0.2)', 'rgba(107, 114, 128, 0.2)'];
  if (rank === 3) return ['rgba(217, 119, 6, 0.2)', 'rgba(180, 83, 9, 0.2)'];
  return [`${colors.primary.purple[500]}20`, `${colors.primary.pink[500]}10`];
};

export function LeaderboardPreview() {
  return (
    <GlassCard variant="purple" size="lg" hover={false} className="w-full">
      <div className="mb-6">
        <Typography variant="h4" gradient="purple-pink" className="mb-2">
          Top Players
        </Typography>
        <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
          Global rankings updated in real-time
        </Typography>
      </div>

      <div className="space-y-3">
        {mockLeaderboard.map((entry, index) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={`
              flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
              ${entry.rank <= 3 ? 'hover:scale-[1.02]' : 'hover:scale-[1.01]'}
            `}
            style={{
              background: `linear-gradient(135deg, ${getRankGradient(entry.rank)[0]}, ${getRankGradient(entry.rank)[1]})`,
              borderColor: entry.rank <= 3 
                ? `${colors.primary.purple[400]}60` 
                : `${colors.semantic.border}40`,
              boxShadow: entry.rank <= 3 
                ? `0 4px 20px ${colors.primary.purple[400]}20` 
                : 'none',
            }}
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.purple[500]}40, ${colors.primary.pink[500]}40)`,
                  border: `1px solid ${colors.primary.purple[400]}60`,
                }}
              >
                {entry.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <Typography 
                  variant="body" 
                  className="font-semibold truncate"
                  style={{ color: entry.rank <= 3 ? colors.primary.purple[200] : colors.primary.purple[300] }}
                >
                  {entry.name}
                </Typography>
                <Typography variant="body-xs" color={`${colors.primary.purple[400]}99`}>
                  {entry.reward} earned
                </Typography>
              </div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              <Typography 
                variant="h5" 
                gradient={entry.rank <= 3 ? "purple-pink" : undefined}
                style={entry.rank > 3 ? { color: colors.primary.purple[300] } : undefined}
                className="font-bold"
              >
                {entry.score.toLocaleString()}
              </Typography>
              <Typography variant="body-xs" color={`${colors.primary.purple[400]}99`}>
                points
              </Typography>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="mt-6 pt-6 border-t"
        style={{ borderColor: `${colors.semantic.border}40` }}
      >
        <Typography 
          variant="body-sm" 
          color={`${colors.primary.purple[400]}cc`}
          className="text-center"
        >
          🎯 Compete now to climb the leaderboard!
        </Typography>
      </motion.div>
    </GlassCard>
  );
}

