'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { Copy, Rocket, User, CheckCircle } from 'lucide-react';
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

  return (
    <PageTemplate
      title="Protocol Interface"
      subtitle="Initialise Sequence Verification Environment"
    >
      <div className="max-w-4xl mx-auto pt-12 pb-32 px-4 space-y-12">
        {!connected ? (
          <div className="max-w-2xl mx-auto border-4 border-black p-12 bg-white text-center">
            <Typography variant="h3" className="font-black uppercase mb-6">
              Authentication Required
            </Typography>
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-black !text-white !font-black !px-10 !py-5 !rounded-none !uppercase !tracking-[0.2em] !text-[12px] !transition-all !duration-200 hover:!scale-[1.02] active:!scale-95 !shadow-[12px_12px_0px_rgba(0,0,0,0.1)] !border-0 !h-auto !flex !items-center !justify-center" />
            </div>
          </div>
        ) : !quizId ? (
          <div className="max-w-2xl mx-auto border-4 border-black p-12 bg-white text-center">
            <Typography variant="h3" className="font-black uppercase mb-6">
              Target Selection Missing
            </Typography>
            <button
              onClick={() => router.push('/play')}
              className="px-12 py-4 bg-black text-white font-black uppercase tracking-widest hover:scale-105 transition-all"
            >
              Select Protocol
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side: Quiz Info & PIN */}
            <div className="space-y-12">
              <div className="border-8 border-black p-10 bg-white shadow-[16px_16px_0px_#00000010]">
                <Typography variant="body-xs" className="font-black uppercase tracking-[0.3em] opacity-40 mb-6 underline">
                  Target Identity
                </Typography>
                <Typography variant="h3" className="font-black uppercase leading-tight mb-8">
                  {currentQuiz?.question || 'SYNCING...'}
                </Typography>
                <div className="grid grid-cols-2 gap-8 border-t-2 border-black pt-8">
                  <div>
                    <Typography variant="body-xs" className="font-black uppercase opacity-40 mb-1">Assigned Reward</Typography>
                    <Typography variant="h4" className="font-black">{currentQuiz?.rewardAmount} SOL</Typography>
                  </div>
                  <div>
                    <Typography variant="body-xs" className="font-black uppercase opacity-40 mb-1">Nodes</Typography>
                    <Typography variant="h4" className="font-black">{currentQuiz?.options.length || 0}</Typography>
                  </div>
                </div>

                {!gamePin && (
                  <button
                    onClick={handleCreateSession}
                    disabled={creating}
                    className="w-full mt-10 py-6 bg-black text-white font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-[8px_8px_0px_#00000020]"
                  >
                    {creating ? 'GENERATING...' : 'GENERATE PORT'}
                  </button>
                )}
              </div>

              {gamePin && (
                <div className="border-8 border-black p-10 bg-black text-white shadow-[16px_16px_0px_#00000010]">
                  <Typography variant="body-xs" className="font-black uppercase tracking-[0.3em] opacity-50 mb-6 text-white">
                    Access Code
                  </Typography>
                  <div className="flex items-center justify-between gap-6">
                    <Typography variant="display-sm" className="font-black tracking-[0.2em] leading-none text-2xl sm:text-3xl md:text-5xl">
                      {gamePin}
                    </Typography>
                    <button
                      onClick={copyPin}
                      className="p-3 border-2 border-white/20 hover:border-white hover:bg-white/10 transition-all flex-shrink-0"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mt-8 leading-relaxed">
                    Distribute code to operators for arena synchronization.
                  </Typography>
                </div>
              )}
            </div>

            {/* Right side: Players List */}
            {gamePin && (
              <div className="space-y-12">
                <div className="border-8 border-black p-10 bg-white shadow-[16px_16px_0px_#00000010]">
                  <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-6">
                      <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mt-2">
                        {participants.length} Operatives Ready
                      </Typography>
                    </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {participants.length > 0 ? (
                        participants.map((participant, index) => (
                          <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 border-2 border-black flex items-center justify-between hover:bg-bone transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 border-2 border-black flex items-center justify-center font-black text-xs">
                                {index + 1}
                              </div>
                              <Typography variant="body" className="font-black uppercase truncate max-w-[120px]">
                                {participant.player_name}
                              </Typography>
                            </div>
                            {participant.wallet_address && (
                              <Typography variant="body-xs" className="font-black uppercase opacity-30 font-mono">
                                {participant.wallet_address.slice(0, 4)}...{participant.wallet_address.slice(-4)}
                              </Typography>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12 border-4 border-black border-dashed opacity-20">
                          <Typography variant="body-xs" className="font-black uppercase tracking-widest">
                            Awaiting Signal...
                          </Typography>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-12 space-y-4">
                    <button
                      onClick={handleStartGame}
                      disabled={participants.length === 0}
                      className={`
                        w-full py-6 font-black uppercase tracking-[0.4em] transition-all border-4
                        ${participants.length > 0 ? 'bg-black text-white hover:scale-[1.02] shadow-[8px_8px_0px_#00000020]' : 'border-black/5 text-black/10 cursor-not-allowed'}
                      `}
                    >
                      {participants.length === 0 ? 'WAITING' : 'OPEN INQUIRY CHANNEL'}
                    </button>
                    <button
                      onClick={() => router.push('/play')}
                      className="w-full py-3 font-black uppercase tracking-widest text-[10px] opacity-20 hover:opacity-100 transition-all"
                    >
                      ABORT COMMAND
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
