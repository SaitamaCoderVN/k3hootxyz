'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, NeonButton, GlassCard } from '@/design-system';
import { FaPlay, FaCopy, FaCheck, FaUsers } from 'react-icons/fa';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase-client';
import type { GameParticipant, GameSession } from '@/types/quiz';

export default function LobbyPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'player';
  const isHost = role === 'host';

  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
    subscribeToUpdates();
  }, [resolvedParams.sessionId]);

  const loadSessionData = async () => {
    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, quiz_sets(id,name,difficulty,questions_count)')
        .eq('id', resolvedParams.sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData as any);

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', resolvedParams.sessionId)
        .order('joined_at', { ascending: true });

      if (participantsError) throw participantsError;
      setParticipants(participantsData as any);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // Subscribe to session updates
    const sessionChannel = supabase
      .channel(`game_session_${resolvedParams.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${resolvedParams.sessionId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setSession(payload.new as any);
            
            // If game started, navigate to play page
            if (payload.new.status === 'playing') {
              router.push(`/game/play/${resolvedParams.sessionId}?role=${role}`);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to participants updates
    const participantsChannel = supabase
      .channel(`game_participants_${resolvedParams.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `session_id=eq.${resolvedParams.sessionId}`,
        },
        () => {
          loadSessionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(participantsChannel);
    };
  };

  const handleCopyPin = () => {
    if (session) {
      navigator.clipboard.writeText(session.pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/game/update-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: resolvedParams.sessionId,
          status: 'playing',
          currentQuestionIndex: 0,
          startedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start game');
      }

      // Navigation will be handled by realtime subscription
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  if (loading) {
    return (
      <PageWrapper minHeight="screen">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Typography variant="h3">Loading...</Typography>
        </div>
      </PageWrapper>
    );
  }

  if (!session) {
    return (
      <PageWrapper minHeight="screen">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Typography variant="h3">Session not found</Typography>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper minHeight="screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Typography variant="display-sm" gradient="purple-pink" className="mb-4">
              GAME LOBBY
            </Typography>
            <Typography variant="h5" color="#a78bfab3">
              {session.quiz_sets?.name || 'Quiz Game'}
            </Typography>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PIN Display */}
            <GlassCard variant="purple" className="lg:col-span-1">
              <div className="text-center">
                <Typography variant="body-sm" color="#a78bfa" className="mb-4">
                  Game PIN
                </Typography>
                <Typography variant="display-sm" gradient="orange" className="mb-6 tracking-[0.3em]">
                  {session.pin}
                </Typography>
                <NeonButton
                  size="lg"
                  neonColor="purple"
                  variant="secondary"
                  fullWidth
                  leftIcon={copied ? <FaCheck /> : <FaCopy />}
                  onClick={handleCopyPin}
                >
                  {copied ? 'Copied!' : 'Copy PIN'}
                </NeonButton>

                {isHost && (
                  <div className="mt-8 pt-8 border-t border-purple-500/20">
                    <Typography variant="body-sm" color="#a78bfa99" className="mb-4">
                      {participants.length} {participants.length === 1 ? 'player' : 'players'} joined
                    </Typography>
                    <NeonButton
                      size="xl"
                      neonColor="orange"
                      fullWidth
                      leftIcon={<FaPlay />}
                      onClick={handleStartGame}
                      disabled={participants.length === 0}
                    >
                      Start Game
                    </NeonButton>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Players List */}
            <GlassCard variant="purple" className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <FaUsers className="text-purple-400 text-2xl" />
                <Typography variant="h4">
                  Players ({participants.length})
                </Typography>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-purple-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <Typography variant="body-lg">
                            {participant.player_name}
                          </Typography>
                          {participant.wallet_address && (
                            <Typography variant="body-sm" color="#a78bfa66">
                              {participant.wallet_address.slice(0, 6)}...{participant.wallet_address.slice(-4)}
                            </Typography>
                          )}
                        </div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {participants.length === 0 && (
                  <div className="text-center py-12">
                    <Typography variant="body" color="#a78bfa66">
                      Waiting for players to join...
                    </Typography>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {!isHost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-12"
            >
              <Typography variant="body" color="#a78bfa99">
                Waiting for host to start the game...
              </Typography>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}