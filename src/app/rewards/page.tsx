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

  return (
    <PageTemplate
      title="Asset Redemption"
      subtitle="Protocol Reward Distribution Center"
    >
      <div className="pt-12 max-w-5xl mx-auto px-4 pb-24">
        {!connected ? (
          <div className="max-w-2xl mx-auto border-4 border-black p-12 bg-white text-center">
            <Typography variant="h3" className="font-black uppercase mb-6">
              Authentication Required
            </Typography>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="text-center py-24 border-4 border-black border-dashed">
                <div className="inline-block animate-spin w-12 h-12 border-4 border-black border-t-transparent mb-6" />
                <Typography variant="body" className="font-black uppercase tracking-widest">
                  Scanning Blockchain...
                </Typography>
              </div>
            ) : rewards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 border-4 border-black bg-white"
              >
                <div className="w-20 h-20 border-2 border-black flex items-center justify-center mx-auto mb-8 grayscale opacity-20">
                  <FaTrophy className="text-3xl" />
                </div>
                <Typography variant="h3" className="font-black uppercase mb-4">
                  Warehouse Empty
                </Typography>
                <Typography variant="body-lg" className="font-bold uppercase opacity-40 mb-10 tracking-[0.2em]">
                  No unclaimed assets detected
                </Typography>
                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/play')}
                    className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Engage Program
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {/* Summary Section */}
                <div className="border-4 border-black p-12 bg-white flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 border-2 border-black flex items-center justify-center grayscale">
                      <FaTrophy className="text-3xl" />
                    </div>
                    <div>
                      <Typography variant="body-xs" className="font-black uppercase opacity-40 tracking-widest mb-1">
                        Aggregate Value
                      </Typography>
                      <Typography variant="display-sm" className="font-black leading-none">
                        {rewards.reduce((sum, r) => sum + r.reward_amount, 0).toFixed(2)} SOL
                      </Typography>
                    </div>
                  </div>
                  <div className="text-center md:text-right border-t-2 md:border-t-0 md:border-l-2 border-black/10 md:pl-12 pt-8 md:pt-0">
                    <Typography variant="body-xs" className="font-black uppercase opacity-40 tracking-widest mb-1">
                      Units Found
                    </Typography>
                    <Typography variant="display-sm" className="font-black leading-none">
                      {rewards.length}
                    </Typography>
                  </div>
                </div>

                {/* List Section */}
                <div className="space-y-6">
                  <AnimatePresence>
                    {rewards.map((reward, index) => (
                      <motion.div
                        key={reward.game_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group border-4 border-black p-8 bg-white hover:translate-x-2 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                          <div className="flex-1">
                            <Typography variant="h4" className="font-black uppercase mb-2">
                              {reward.quiz_title}
                            </Typography>
                            <div className="flex flex-wrap gap-6 items-center">
                              <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-30">
                                PIN: {reward.pin}
                              </Typography>
                              <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-30">
                                {formatDate(reward.completed_at)}
                              </Typography>
                            </div>
                          </div>
                          <div className="text-right md:min-w-[150px]">
                            <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-30 mb-1">
                              Asset Value
                            </Typography>
                            <Typography variant="h4" className="font-black">
                              {reward.reward_amount.toFixed(2)} SOL
                            </Typography>
                          </div>
                        </div>

                        {reward.claim_error && (
                          <div className="mb-8 p-4 border-2 border-dashed border-red-500 bg-red-50 flex items-start gap-4">
                            <FaExclamationTriangle className="text-red-500 mt-1" />
                            <div>
                              <Typography variant="body-xs" className="font-black uppercase text-red-600">
                                Distribution Failure: {reward.claim_error}
                              </Typography>
                              <Typography variant="body-xs" className="font-bold opacity-40 text-red-700">
                                Attempt #{reward.claim_attempts}
                              </Typography>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleClaimReward(reward.game_id, reward.reward_amount)}
                          disabled={claiming !== null}
                          className={`
                            w-full py-4 text-white font-black uppercase tracking-[0.2em] transition-all duration-300
                            ${reward.claim_error ? 'bg-red-600 hover:bg-black' : 'bg-black hover:scale-[1.01]'}
                            disabled:opacity-50 disabled:grayscale
                          `}
                        >
                          {claiming === reward.game_id ? 'Syncing...' : reward.claim_error ? 'Retry Transfer' : 'Transfer Assets'}
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}

        {/* Sync Status Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-12 p-8 border-4 border-black bg-white text-center"
            >
              <Typography variant="h5" className="font-black uppercase text-red-600 mb-4">
                Transmission Interrupted
              </Typography>
              <Typography variant="body-xs" className="font-bold opacity-60 mb-8 max-w-md mx-auto">
                {error}
              </Typography>
              <button
                onClick={fetchUnclaimedRewards}
                className="px-6 py-3 border-2 border-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                Reconnect Node
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTemplate>
  );
}
