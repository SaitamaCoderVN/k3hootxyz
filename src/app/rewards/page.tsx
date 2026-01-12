'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaTrophy, FaCheckCircle, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

interface UnclaimedReward {
  game_id: string;
  quiz_set_id: string;
  quiz_title: string;
  reward_amount: number;
  completed_at: string;
  claim_error: string | null;
  claim_attempts: number;
  pin: string;
}

export default function RewardsPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  const [mounted, setMounted] = useState(false);
  const [rewards, setRewards] = useState<UnclaimedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUnclaimedRewards();
    }
  }, [connected, publicKey]);

  const fetchUnclaimedRewards = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/game/unclaimed-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toString() }),
      });

      const data = await res.json();

      if (res.ok) {
        setRewards(data.rewards || []);
      } else {
        setError(data.error || 'Failed to fetch rewards');
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (gameId: string, rewardAmount: number) => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    setClaiming(gameId);
    setError(null);

    try {
      const res = await fetch('/api/game/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          winnerWallet: publicKey.toString(),
          rewardAmount,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Remove claimed reward from list
        setRewards(prev => prev.filter(r => r.game_id !== gameId));
        setError(null);
      } else {
        setError(data.error || 'Failed to claim reward');
        // Refresh to get updated error message
        await fetchUnclaimedRewards();
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      setError('Network error - please try again');
    } finally {
      setClaiming(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted) return null;

  if (!connected) {
    return (
      <PageTemplate
        title="My Rewards"
        subtitle="Connect your wallet to view your rewards"
      >
        <div className="flex justify-center pt-8">
          <WalletMultiButton />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="My Rewards"
      subtitle="Claim your winnings from completed games"
    >
      <div className="max-w-4xl mx-auto pt-8 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mb-4"
              style={{
                borderColor: colors.primary.purple[500],
                borderTopColor: 'transparent',
              }}
            />
            <Typography variant="body" color={colors.text.muted}>
              Loading your rewards...
            </Typography>
          </div>
        ) : rewards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <GlassCard variant="purple" size="lg">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="p-6 rounded-full"
                  style={{
                    background: `${colors.primary.purple[500]}20`,
                    border: `1px solid ${colors.primary.purple[400]}40`,
                  }}
                >
                  <FaTrophy className="text-5xl" style={{ color: colors.primary.purple[400] }} />
                </div>
                <Typography variant="h3" color={colors.text.primary}>
                  No Unclaimed Rewards
                </Typography>
                <Typography variant="body" color={colors.text.muted}>
                  Win some games to earn rewards!
                </Typography>
                <div className="mt-4">
                  <NeonButton
                    onClick={() => router.push('/play')}
                    neonColor="purple"
                    size="lg"
                  >
                    Play Quiz
                  </NeonButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard variant="orange" size="lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="p-4 rounded-full"
                      style={{
                        background: `${colors.primary.orange[500]}20`,
                        border: `1px solid ${colors.primary.orange[400]}40`,
                      }}
                    >
                      <FaTrophy className="text-3xl" style={{ color: colors.primary.orange[400] }} />
                    </div>
                    <div>
                      <Typography variant="body-sm" color={colors.text.muted}>
                        Total Unclaimed
                      </Typography>
                      <Typography variant="h3" gradient="orange-pink">
                        {rewards.reduce((sum, r) => sum + r.reward_amount, 0).toFixed(2)} SOL
                      </Typography>
                    </div>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" color={colors.text.muted}>
                      Games Won
                    </Typography>
                    <Typography variant="h3" color={colors.text.primary}>
                      {rewards.length}
                    </Typography>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Rewards List */}
            <div className="space-y-4">
              <AnimatePresence>
                {rewards.map((reward, index) => (
                  <motion.div
                    key={reward.game_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard variant="purple" size="lg">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Typography variant="h4" color={colors.text.primary}>
                              {reward.quiz_title}
                            </Typography>
                            <div className="flex items-center gap-4 mt-2">
                              <Typography variant="body-sm" color={colors.text.muted}>
                                Game PIN: {reward.pin}
                              </Typography>
                              <Typography variant="body-sm" color={colors.text.muted}>
                                {formatDate(reward.completed_at)}
                              </Typography>
                            </div>
                          </div>
                          <div className="text-right">
                            <Typography variant="body-sm" color={colors.text.muted}>
                              Reward
                            </Typography>
                            <Typography variant="h3" gradient="orange">
                              {reward.reward_amount.toFixed(2)} SOL
                            </Typography>
                          </div>
                        </div>

                        {reward.claim_error && (
                          <div
                            className="p-3 rounded-lg flex items-start gap-2"
                            style={{
                              background: `${colors.state.warning}20`,
                              border: `1px solid ${colors.state.warning}40`,
                            }}
                          >
                            <FaExclamationTriangle
                              className="mt-1"
                              style={{ color: colors.state.warning }}
                            />
                            <div className="flex-1">
                              <Typography variant="body-sm" color={colors.state.warning}>
                                Previous claim failed: {reward.claim_error}
                              </Typography>
                              <Typography variant="body-sm" color={colors.text.muted}>
                                Attempts: {reward.claim_attempts}
                              </Typography>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <NeonButton
                            onClick={() => handleClaimReward(reward.game_id, reward.reward_amount)}
                            loading={claiming === reward.game_id}
                            disabled={claiming !== null}
                            neonColor={reward.claim_error ? 'orange' : 'purple'}
                            size="md"
                            fullWidth
                            leftIcon={reward.claim_error ? <FaRedo /> : <FaCheckCircle />}
                          >
                            {reward.claim_error ? 'Retry Claim' : 'Claim Reward'}
                          </NeonButton>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-lg text-center"
            style={{
              background: `${colors.state.error}20`,
              border: `1px solid ${colors.state.error}40`,
            }}
          >
            <Typography variant="body" color={colors.state.error}>
              {error}
            </Typography>
            <button
              onClick={fetchUnclaimedRewards}
              className="mt-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                background: `${colors.state.error}30`,
                color: colors.state.error,
              }}
            >
              Retry
            </button>
          </motion.div>
        )}
      </div>
    </PageTemplate>
  );
}
