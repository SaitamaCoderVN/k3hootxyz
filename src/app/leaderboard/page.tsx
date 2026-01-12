'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaAward, FaSpinner } from 'react-icons/fa';
import { GlassCard, Typography, colors, spacing } from '@/design-system';
import { useWallet } from '@solana/wallet-adapter-react';
import { SimpleK3HootClient } from '@/lib/simple-solana-client';
import { LeaderboardEntry } from '@/types/quiz';
import { PageTemplate } from '@/components/layout/PageTemplate';

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

export default function LeaderboardPage() {
  const wallet = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!wallet.publicKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const client = new SimpleK3HootClient(
          wallet as any,
          'devnet'
        );

        const data = await client.getLeaderboard();

        // Sort by reward amount (highest first)
        const sorted = data.sort((a, b) => b.rewardAmount - a.rewardAmount);

        setLeaderboard(sorted);
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [wallet.publicKey]);

  return (
    <PageTemplate>
      <div className="py-12 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Typography variant="h1" gradient="purple-pink" className="mb-4">
            🏆 Global Leaderboard
          </Typography>
          <Typography variant="body" color={`${colors.primary.purple[300]}cc`}>
            Top players competing for rewards on K3HOOT
          </Typography>
        </motion.div>

        {/* Wallet Connection Required */}
        {!wallet.connected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard variant="purple" size="lg" className="text-center">
              <Typography variant="h4" gradient="purple-pink" className="mb-4">
                Connect Your Wallet
              </Typography>
              <Typography variant="body" color={`${colors.primary.purple[300]}99`}>
                Please connect your wallet to view the leaderboard
              </Typography>
            </GlassCard>
          </motion.div>
        )}

        {/* Loading State */}
        {wallet.connected && loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaSpinner className="animate-spin text-4xl mb-4 mx-auto" style={{ color: colors.primary.purple[400] }} />
            <Typography variant="body" color={`${colors.primary.purple[300]}99`}>
              Loading leaderboard from blockchain...
            </Typography>
          </motion.div>
        )}

        {/* Error State */}
        {wallet.connected && error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GlassCard variant="purple" size="lg" className="text-center">
              <Typography variant="h4" className="mb-4" style={{ color: '#ef4444' }}>
                ❌ Error Loading Leaderboard
              </Typography>
              <Typography variant="body" color={`${colors.primary.purple[300]}99`}>
                {error}
              </Typography>
            </GlassCard>
          </motion.div>
        )}

        {/* Leaderboard Content */}
        {wallet.connected && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard variant="purple" size="lg" hover={false}>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Typography variant="h4" className="mb-4" style={{ color: colors.primary.purple[300] }}>
                    No Winners Yet
                  </Typography>
                  <Typography variant="body" color={`${colors.primary.purple[400]}99`}>
                    Be the first to win a quiz and appear on the leaderboard!
                  </Typography>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentUser = entry.winner === wallet.publicKey?.toString();

                    return (
                      <motion.div
                        key={`${entry.quizSetId}-${entry.questionIndex}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                          ${rank <= 3 ? 'hover:scale-[1.02]' : 'hover:scale-[1.01]'}
                          ${isCurrentUser ? 'ring-2 ring-purple-400' : ''}
                        `}
                        style={{
                          background: `linear-gradient(135deg, ${getRankGradient(rank)[0]}, ${getRankGradient(rank)[1]})`,
                          borderColor: rank <= 3
                            ? `${colors.primary.purple[400]}60`
                            : `${colors.semantic.border}40`,
                          boxShadow: rank <= 3
                            ? `0 4px 20px ${colors.primary.purple[400]}20`
                            : 'none',
                        }}
                      >
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          {getRankIcon(rank)}
                        </div>

                        {/* Winner Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Typography
                              variant="body"
                              className="font-semibold font-mono truncate"
                              style={{ color: rank <= 3 ? colors.primary.purple[200] : colors.primary.purple[300] }}
                            >
                              {entry.winnerDisplay}
                            </Typography>
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200">
                                You
                              </span>
                            )}
                          </div>
                          <Typography variant="body-xs" color={`${colors.primary.purple[400]}99`} className="truncate">
                            {entry.quizSetName || `Quiz #${entry.quizSetId}`}
                          </Typography>
                        </div>

                        {/* Reward */}
                        <div className="flex-shrink-0 text-right">
                          <Typography
                            variant="h5"
                            gradient={rank <= 3 ? 'purple-pink' : undefined}
                            style={rank > 3 ? { color: colors.primary.purple[300] } : undefined}
                            className="font-bold"
                          >
                            {entry.rewardAmount.toFixed(2)} SOL
                          </Typography>
                          <Typography variant="body-xs" color={`${colors.primary.purple[400]}99`}>
                            {entry.isClaimed ? '✅ Claimed' : '⏳ Pending'}
                          </Typography>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              {leaderboard.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 pt-6 border-t"
                  style={{ borderColor: `${colors.semantic.border}40` }}
                >
                  <Typography
                    variant="body-sm"
                    color={`${colors.primary.purple[400]}cc`}
                    className="text-center"
                  >
                    🎯 Play now to join the leaderboard and win rewards!
                  </Typography>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </div>
    </PageTemplate>
  );
}
