'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaCopy, FaUsers, FaRocket, FaUser, FaCheckCircle } from 'react-icons/fa';
import { useSimpleQuiz } from '@/hooks/useSimpleQuiz';
import { supabase } from '@/lib/supabase-client';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

interface Participant {
  id: string;
  player_name: string;
  wallet_address: string | null;
  joined_at: string;
}

export default function HostGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, publicKey } = useWallet();
  const { currentQuiz, fetchQuizById, loading } = useSimpleQuiz();

  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [gamePin, setGamePin] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const quizId = searchParams?.get('quizId');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && quizId) {
      fetchQuizById(quizId);
    }
  }, [connected, quizId, fetchQuizById]);

  const handleCreateSession = async () => {
    if (!quizId || !publicKey) return;

    setCreating(true);
    try {
      const res = await fetch('/api/game/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSetId: quizId,
          hostWallet: publicKey.toString(),
        }),
      });

      const data = await res.json();
      if (data.session) {
        setGamePin(data.session.pin);
        setSessionId(data.session.id);

        // Store host token for reconnection
        if (data.hostToken) {
          localStorage.setItem(`host_token_${data.session.pin}`, data.hostToken);
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleStartGame = async () => {
    if (!sessionId || !gamePin) return;

    try {
      // Advance to first question using new phase system
      await fetch('/api/game/advance-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          targetPhase: 'question',
        }),
      });

      // Navigate to host control panel (NOT play page)
      router.push(`/multiplayer/host-control/${gamePin}`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const copyPin = () => {
    if (gamePin) {
      navigator.clipboard.writeText(gamePin);
    }
  };

  // Real-time participant subscription
  useEffect(() => {
    if (!sessionId) return;

    // Fetch initial participants
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('game_participants')
        .select('id, player_name, wallet_address, joined_at')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (data) {
        setParticipants(data);
      }
    };

    fetchParticipants();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`lobby-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newParticipant = payload.new as Participant;
          setParticipants(prev => [...prev, newParticipant]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'game_participants',
        },
        async () => {
          // Refetch participants to ensure we have the latest state
          // This is more reliable than filtering by session_id on DELETE events
          const { data } = await supabase
            .from('game_participants')
            .select('id, player_name, wallet_address, joined_at')
            .eq('session_id', sessionId)
            .order('joined_at', { ascending: true });

          if (data) {
            setParticipants(data);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId]);

  if (!mounted) return null;

  if (!connected) {
    return (
      <PageTemplate
        title="Host Multiplayer Game"
        subtitle="Connect your wallet to host a game"
      >
        <div className="flex justify-center pt-8">
          <WalletMultiButton />
        </div>
      </PageTemplate>
    );
  }

  if (!quizId) {
    return (
      <PageTemplate title="No Quiz Selected" subtitle="Please select a quiz from the play page">
        <div className="flex justify-center pt-8">
          <NeonButton onClick={() => router.push('/play')} neonColor="purple">
            Go to Play Page
          </NeonButton>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Host Multiplayer Game"
      subtitle={currentQuiz ? currentQuiz.question : 'Loading quiz...'}
    >
      <div className="max-w-2xl mx-auto pt-8 pb-24 space-y-8">
        {/* Quiz Info */}
        {currentQuiz && !gamePin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard variant="purple" size="lg">
              <div className="text-center space-y-4">
                <Typography variant="h3" gradient="purple-pink">
                  {currentQuiz.question}
                </Typography>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <Typography variant="body-sm" color={colors.text.muted}>
                      Reward
                    </Typography>
                    <Typography variant="h4" gradient="orange">
                      {currentQuiz.rewardAmount} SOL
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body-sm" color={colors.text.muted}>
                      Questions
                    </Typography>
                    <Typography variant="h4" color={colors.text.primary}>
                      {currentQuiz.options.length}
                    </Typography>
                  </div>
                </div>
                <NeonButton
                  onClick={handleCreateSession}
                  loading={creating}
                  neonColor="purple"
                  size="lg"
                  fullWidth
                  leftIcon={<FaRocket />}
                >
                  Create Game Room
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Game PIN Display */}
        {gamePin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* PIN Card */}
            <GlassCard variant="orange" size="xl">
              <div className="text-center space-y-6">
                <FaUsers className="text-6xl mx-auto" style={{ color: colors.primary.orange[400] }} />
                <div>
                  <Typography variant="body" color={colors.text.muted}>
                    Game PIN
                  </Typography>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <Typography variant="display-lg" gradient="orange-pink" className="font-mono">
                      {gamePin}
                    </Typography>
                    <button
                      onClick={copyPin}
                      className="p-3 rounded-lg transition-colors"
                      style={{
                        background: `${colors.primary.orange[500]}20`,
                        color: colors.primary.orange[400]
                      }}
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <Typography variant="body-lg" color={colors.text.secondary}>
                  Share this PIN with players to join the game
                </Typography>
              </div>
            </GlassCard>

            {/* Real-time Players List */}
            <GlassCard variant="purple" size="lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        background: `${colors.primary.purple[500]}20`,
                        border: `1px solid ${colors.primary.purple[400]}40`
                      }}
                    >
                      <FaUsers style={{ color: colors.primary.purple[400] }} />
                    </div>
                    <div>
                      <Typography variant="h4" color={colors.text.primary}>
                        Players in Lobby
                      </Typography>
                      <Typography variant="body-sm" color={colors.text.muted}>
                        {participants.length} {participants.length === 1 ? 'player' : 'players'} joined
                      </Typography>
                    </div>
                  </div>
                  <div
                    className="px-4 py-2 rounded-full"
                    style={{
                      background: `${colors.primary.purple[500]}30`,
                      border: `1px solid ${colors.primary.purple[400]}`
                    }}
                  >
                    <Typography variant="h3" gradient="purple-pink">
                      {participants.length}
                    </Typography>
                  </div>
                </div>

                {/* Players Grid */}
                {participants.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                      {participants.map((participant, index) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg flex items-center gap-3"
                          style={{
                            background: `${colors.background.secondary}80`,
                            border: `1px solid ${colors.primary.purple[500]}20`
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary.purple[500]}, ${colors.primary.pink[500]})`,
                            }}
                          >
                            <FaUser className="text-white text-sm" />
                          </div>
                          <div className="flex-1">
                            <Typography variant="body" color={colors.text.primary}>
                              {participant.player_name}
                            </Typography>
                            {participant.wallet_address && (
                              <Typography variant="body-sm" color={colors.text.muted} className="font-mono">
                                {participant.wallet_address.slice(0, 4)}...{participant.wallet_address.slice(-4)}
                              </Typography>
                            )}
                          </div>
                          <FaCheckCircle style={{ color: colors.state.success }} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Typography variant="body" color={colors.text.muted}>
                      Waiting for players to join...
                    </Typography>
                    <Typography variant="body-sm" color={colors.text.muted} className="mt-2">
                      Share the PIN above to start playing
                    </Typography>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <div className="space-y-3">
              <NeonButton
                onClick={handleStartGame}
                disabled={participants.length === 0}
                neonColor="orange"
                size="lg"
                fullWidth
              >
                {participants.length === 0 ? 'Waiting for Players...' : `Start Game (${participants.length} Players)`}
              </NeonButton>
              <button
                onClick={() => router.push('/play')}
                className="w-full py-3 text-center transition-colors"
                style={{ color: colors.text.muted }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </PageTemplate>
  );
}
