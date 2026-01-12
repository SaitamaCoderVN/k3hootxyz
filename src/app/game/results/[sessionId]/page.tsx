'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Typography, NeonButton, GlassCard } from '@/design-system';
import { FaTrophy, FaMedal, FaHome, FaRedo } from 'react-icons/fa';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase-client';
import type { GameParticipant, GameSession } from '@/types/quiz';

const PODIUM_COLORS = {
  1: { bg: 'from-yellow-500 to-orange-500', text: '#fbbf24', height: 'h-64' },
  2: { bg: 'from-gray-300 to-gray-400', text: '#d1d5db', height: 'h-52' },
  3: { bg: 'from-orange-600 to-orange-700', text: '#fb923c', height: 'h-40' },
};

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'player';
  const isHost = role === 'host';

  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [resolvedParams.sessionId]);

  const loadResults = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, quiz_sets(*)')
        .eq('id', resolvedParams.sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData as any);

      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', resolvedParams.sessionId)
        .order('score', { ascending: false });

      if (participantsError) throw participantsError;
      setParticipants(participantsData as any);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper minHeight="screen">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Typography variant="h3">Loading results...</Typography>
        </div>
      </PageWrapper>
    );
  }

  const topThree = participants.slice(0, 3);
  const others = participants.slice(3);
  const myParticipantId = localStorage.getItem('participantId');
  const myRank = participants.findIndex(p => p.id === myParticipantId) + 1;
  const myScore = participants.find(p => p.id === myParticipantId)?.score || 0;

  return (
    <PageWrapper minHeight="screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Typography variant="display-lg" gradient="orange-purple" className="mb-4">
              GAME RESULTS
            </Typography>
            <Typography variant="h5" color="#a78bfab3">
              {(session as any)?.quiz_sets?.title || 'Quiz Game'}
            </Typography>
          </motion.div>

          {/* Podium */}
          <div className="mb-20">
            <div className="flex items-end justify-center gap-8 mb-12">
              {/* 2nd Place */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <FaMedal className="text-6xl mb-4" style={{ color: PODIUM_COLORS[2].text }} />
                  <Typography variant="h4" className="mb-2">
                    {(topThree[1] as any).player_name}
                  </Typography>
                  <Typography variant="h3" gradient="purple" className="mb-4">
                    {topThree[1].score}
                  </Typography>
                  <div
                    className={`w-40 ${PODIUM_COLORS[2].height} bg-gradient-to-t ${PODIUM_COLORS[2].bg} rounded-t-2xl flex items-center justify-center`}
                  >
                    <Typography variant="display-sm" color="white">
                      2
                    </Typography>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <FaTrophy className="text-7xl mb-4" style={{ color: PODIUM_COLORS[1].text }} />
                  <Typography variant="h3" className="mb-2">
                    {(topThree[0] as any).player_name}
                  </Typography>
                  <Typography variant="display-xs" gradient="orange" className="mb-4">
                    {topThree[0].score}
                  </Typography>
                  <div
                    className={`w-48 ${PODIUM_COLORS[1].height} bg-gradient-to-t ${PODIUM_COLORS[1].bg} rounded-t-2xl flex items-center justify-center`}
                  >
                    <Typography variant="display-sm" color="white">
                      1
                    </Typography>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <FaMedal className="text-5xl mb-4" style={{ color: PODIUM_COLORS[3].text }} />
                  <Typography variant="h5" className="mb-2">
                    {(topThree[2] as any).player_name}
                  </Typography>
                  <Typography variant="h4" gradient="pink" className="mb-4">
                    {topThree[2].score}
                  </Typography>
                  <div
                    className={`w-32 ${PODIUM_COLORS[3].height} bg-gradient-to-t ${PODIUM_COLORS[3].bg} rounded-t-2xl flex items-center justify-center`}
                  >
                    <Typography variant="display-sm" color="white">
                      3
                    </Typography>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Player's Result */}
          {!isHost && myRank > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <GlassCard variant="purple" size="lg" className="text-center">
                <Typography variant="h4" className="mb-4">
                  Your Result
                </Typography>
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <Typography variant="body-sm" color="#a78bfa99" className="mb-2">
                      Rank
                    </Typography>
                    <Typography variant="display-xs" gradient="orange">
                      #{myRank}
                    </Typography>
                  </div>
                  <div className="h-16 w-px bg-purple-500/30" />
                  <div>
                    <Typography variant="body-sm" color="#a78bfa99" className="mb-2">
                      Score
                    </Typography>
                    <Typography variant="display-xs" gradient="purple">
                      {myScore}
                    </Typography>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Full Leaderboard */}
          {others.length > 0 && (
            <div className="mb-12">
              <Typography variant="h4" className="mb-6 text-center">
                Full Leaderboard
              </Typography>
              <GlassCard variant="purple">
                <div className="space-y-3">
                  {others.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                          {index + 4}
                        </div>
                        <Typography variant="body-lg">
                          {(participant as any).player_name}
                        </Typography>
                      </div>
                      <Typography variant="h5" gradient="purple">
                        {participant.score}
                      </Typography>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <NeonButton
              size="xl"
              neonColor="purple"
              leftIcon={<FaHome />}
              onClick={() => router.push('/')}
            >
              Home
            </NeonButton>
            {isHost && (
              <NeonButton
                size="xl"
                neonColor="orange"
                leftIcon={<FaRedo />}
                onClick={() => router.push('/game/host')}
              >
                Host New Game
              </NeonButton>
            )}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}