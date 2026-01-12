'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaPlay, FaCopy, FaCheck, FaUsers } from 'react-icons/fa';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations';
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
    if (!resolvedParams.sessionId) {
      console.error('Session ID is undefined');
      setLoading(false);
      return;
    }
    loadSessionData();
    subscribeToUpdates();
  }, [resolvedParams.sessionId]);

  const loadSessionData = async () => {
    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*, quiz_sets(id,name,question_count)')
        .eq('id', resolvedParams.sessionId)
        .single();

      if (sessionError) {
        console.error('Session error:', {
          message: sessionError.message,
          details: sessionError.details,
          hint: sessionError.hint,
          code: sessionError.code
        });
        throw sessionError;
      }
      setSession(sessionData as any);

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', resolvedParams.sessionId)
        .order('joined_at', { ascending: true });

      if (participantsError) {
        console.error('Participants error:', participantsError);
        throw participantsError;
      }
      setParticipants(participantsData as any);
    } catch (error: any) {
      console.error('Failed to load session:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    console.log('[LOBBY] Setting up subscriptions for session:', resolvedParams.sessionId);
    
    // Subscribe to session updates
    const sessionChannel = supabase
      .channel(`session_updates_${resolvedParams.sessionId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${resolvedParams.sessionId}`,
        },
        (payload: any) => {
          console.log('[LOBBY] Session update received:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            setSession(payload.new as any);
            
            // If game started, navigate to play page
            if (payload.new.status === 'playing') {
              console.log('[LOBBY] Game started, navigating to play page');
              router.push(`/game/play/${resolvedParams.sessionId}?role=${role}`);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[LOBBY] Session channel status:', status);
      });

    // Subscribe to participants updates
    const participantsChannel = supabase
      .channel(`participants_updates_${resolvedParams.sessionId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `session_id=eq.${resolvedParams.sessionId}`,
        },
        (payload: any) => {
          console.log('[LOBBY] Participant event received:', payload);
          loadSessionData();
        }
      )
      .subscribe((status) => {
        console.log('[LOBBY] Participants channel status:', status);
      });

    return () => {
      console.log('[LOBBY] Cleaning up subscriptions');
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
      <PageTemplate title="Loading..." showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: colors.primary.purple[400] }}></div>
            <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`}>
              Loading game session...
            </Typography>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (!session) {
    return (
      <PageTemplate title="Session Not Found" showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <GlassCard variant="default" size="lg" hover={false} className="text-center">
            <Typography variant="h4" color={colors.state.error} className="mb-4">
              Session not found
            </Typography>
            <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`}>
              The game session you're looking for doesn't exist or has expired.
            </Typography>
          </GlassCard>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Game Lobby"
      subtitle={(session as any).quiz_sets?.name || 'Quiz Game'}
      containerClassName="pb-16"
    >
      <div className="pt-8">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PIN Display */}
            <ScrollReveal type="scaleIn" delay={0.2} amount={40}>
              <GlassCard variant="purple" size="lg" hover={true} className="lg:col-span-1">
                <div className="text-center">
                  <Typography variant="body-xs" color={colors.primary.purple[400]} className="mb-4 tracking-[0.2em] uppercase" style={{ textShadow: `0 0 20px ${colors.primary.purple[400]}40` }}>
                    Game PIN
                  </Typography>
                  <Typography variant="display-lg" gradient="orange" className="mb-8 tracking-[0.3em]" style={{ textShadow: '0 0 40px rgba(249, 115, 22, 0.4)' }}>
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
                    <div className="mt-10 pt-8" style={{ borderTop: `1px solid ${colors.semantic.border}60` }}>
                      <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`} className="mb-6">
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
            </ScrollReveal>

            {/* Players List */}
            <ScrollReveal type="fadeInRight" delay={0.3} amount={60}>
              <GlassCard variant="purple" size="lg" hover={false} className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-8">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary.purple[500]}20, ${colors.primary.pink[500]}10)`,
                      border: `1px solid ${colors.primary.purple[400]}30`,
                    }}
                  >
                    <FaUsers style={{ fontSize: '1.5rem', color: colors.primary.purple[400] }} />
                  </div>
                  <Typography variant="h3" gradient="purple-pink">
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
                        className="flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary.purple[500]}10, ${colors.primary.pink[500]}05)`,
                          borderColor: `${colors.primary.purple[400]}40`,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary.purple[500]}, ${colors.primary.pink[500]})`,
                              boxShadow: `0 4px 15px ${colors.primary.purple[400]}40`,
                            }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <Typography variant="body-lg" className="font-semibold" style={{ color: colors.primary.purple[200] }}>
                              {(participant as any).player_name}
                            </Typography>
                            {(participant as any).wallet_address && (
                              <Typography variant="body-sm" color={`${colors.primary.purple[400]}99`}>
                                {(participant as any).wallet_address.slice(0, 6)}...{(participant as any).wallet_address.slice(-4)}
                              </Typography>
                            )}
                          </div>
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: colors.state.success,
                            boxShadow: `0 0 10px ${colors.state.success}80`,
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {participants.length === 0 && (
                    <div className="text-center py-16">
                      <div 
                        className="flex justify-center mb-6 p-6 rounded-2xl mx-auto w-fit"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary.purple[500]}20, ${colors.primary.pink[500]}10)`,
                          border: `1px solid ${colors.primary.purple[400]}30`,
                        }}
                      >
                        <FaUsers style={{ fontSize: '3rem', color: colors.primary.purple[400] }} />
                      </div>
                      <Typography variant="h4" gradient="purple" className="mb-2">
                        Waiting for players
                      </Typography>
                      <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`}>
                        Share the PIN to invite players to join
                      </Typography>
                    </div>
                  )}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>

          {!isHost && (
            <ScrollReveal type="fadeInUp" delay={0.5} amount={40}>
              <div className="text-center mt-12">
                <GlassCard variant="default" size="md" hover={false} className="max-w-md mx-auto">
                  <Typography variant="body-lg" color={`${colors.primary.purple[300]}dd`} className="mb-2">
                    ⏳ Waiting for host to start the game...
                  </Typography>
                  <Typography variant="body-sm" color={`${colors.primary.purple[400]}99`}>
                    Get ready! The game will begin soon.
                  </Typography>
                </GlassCard>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}