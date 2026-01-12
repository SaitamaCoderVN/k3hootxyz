'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, GlassCard } from '@/design-system';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';
import { supabase } from '@/lib/supabase-client';

interface LeaderboardEntry {
  id: string;
  player_name: string;
  wallet_address: string | null;
  score: number;
  correct_answers: number;
  total_correct_onchain: number;
  rank: number;
  joined_at: string;
}

interface RealtimeLeaderboardProps {
  sessionId: string;
  className?: string;
}

const RANK_COLORS = {
  1: { bg: 'from-yellow-500/20', border: 'border-yellow-500', icon: 'text-yellow-400' },
  2: { bg: 'from-gray-400/20', border: 'border-gray-400', icon: 'text-gray-300' },
  3: { bg: 'from-orange-600/20', border: 'border-orange-600', icon: 'text-orange-400' },
};

export default function RealtimeLeaderboard({ sessionId, className = '' }: RealtimeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    subscribeToUpdates();
  }, [sessionId]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('score', { ascending: false })
        .order('last_answer_at', { ascending: true });

      if (error) throw error;

      const ranked = (data || []).map((entry, index) => ({
        id: entry.id,
        player_name: entry.player_name,
        wallet_address: entry.wallet_address,
        score: entry.score || 0,
        correct_answers: entry.correct_answers || 0,
        total_correct_onchain: entry.total_correct_onchain || 0,
        rank: index + 1,
        joined_at: entry.joined_at,
      }));

      setLeaderboard(ranked);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`leaderboard_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          // Reload leaderboard on any change
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <GlassCard variant="purple" className={className}>
        <Typography variant="h6" className="text-center">
          Loading leaderboard...
        </Typography>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="purple" className={className}>
      <div className="flex items-center gap-2 mb-4">
        <FaTrophy className="text-yellow-400 text-xl" />
        <Typography variant="h5">Leaderboard</Typography>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {leaderboard.map((entry, index) => {
            const rankColor = RANK_COLORS[entry.rank as keyof typeof RANK_COLORS];
            const isTopThree = entry.rank <= 3;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  p-3 rounded-lg border-2 transition-all
                  ${isTopThree 
                    ? `bg-gradient-to-r ${rankColor?.bg || ''} ${rankColor?.border || ''}` 
                    : 'bg-black/20 border-purple-500/30'
                  }
                  ${entry.rank === 1 ? 'ring-2 ring-yellow-400/50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 text-center">
                    {isTopThree ? (
                      <div className={rankColor?.icon || ''}>
                        {entry.rank === 1 && <FaTrophy className="text-xl" />}
                        {entry.rank === 2 && <FaMedal className="text-xl" />}
                        {entry.rank === 3 && <FaAward className="text-xl" />}
                      </div>
                    ) : (
                      <Typography variant="body" className="text-purple-300">
                        #{entry.rank}
                      </Typography>
                    )}
                  </div>

                  {/* Player Name */}
                  <div className="flex-1 min-w-0">
                    <Typography 
                      variant="body" 
                      className={`font-semibold truncate ${isTopThree ? 'text-white' : 'text-purple-200'}`}
                    >
                      {entry.player_name}
                    </Typography>
                    {entry.wallet_address && (
                      <Typography variant="body" className="text-purple-400/60 truncate text-sm">
                        {entry.wallet_address.slice(0, 8)}...{entry.wallet_address.slice(-6)}
                      </Typography>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <Typography 
                      variant="h6" 
                      className={isTopThree ? 'text-yellow-400' : 'text-purple-300'}
                    >
                      {entry.score}
                    </Typography>
                    <Typography variant="body" style={{fontSize: "0.875rem"}} className="text-purple-400/60">
                      {entry.correct_answers}/{entry.total_correct_onchain || entry.correct_answers} ✓
                    </Typography>
                  </div>
                </div>

                {/* Progress Bar */}
                {entry.total_correct_onchain > 0 && (
                  <div className="mt-2 h-1 bg-purple-900/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(entry.total_correct_onchain / entry.correct_answers) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <Typography variant="body" className="text-purple-400/60">
              No players yet
            </Typography>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

