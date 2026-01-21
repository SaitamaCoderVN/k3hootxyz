'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';

import { supabase } from '@/lib/supabase-client';
import { useSimpleQuiz } from '@/hooks/useSimpleQuiz';

interface Participant {
  id: string;
  player_name: string;
  wallet_address: string | null;
  score: number;
}

export default function MultiplayerResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { connected, publicKey } = useWallet();
  const { claimReward, claiming } = useSimpleQuiz();

  const pin = params?.pin as string;
  const participantId = searchParams?.get('participantId');

  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch results
  useEffect(() => {
    if (!pin) return;

    const fetchResults = async () => {
      // Get session
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('pin', pin)
        .single();

      if (sessionData) {
        setSession(sessionData);
      }

      // Get leaderboard
      const { data: participantsData } = await supabase
        .from('game_participants')
        .select('*')
        .eq('session_id', sessionData?.id)
        .order('score', { ascending: false });

      if (participantsData) {
        setLeaderboard(participantsData);

        // Find my rank
        if (participantId) {
          const rank = participantsData.findIndex(p => p.id === participantId) + 1;
          setMyRank(rank);

          // Check if I'm rank 1
          if (rank === 1 && connected && publicKey) {
            const myParticipant = participantsData[0];
            if (myParticipant.wallet_address === publicKey.toString()) {
              setCanClaim(true);
            }
          }
        }
      }
    };

    fetchResults();
  }, [pin, participantId, connected, publicKey]);

  const handleClaimReward = async () => {
    if (!connected || !publicKey || !session?.id) return;

    setVerifying(true);
    setClaimError(null);

    try {
      console.log('[Claim] Initiating claim for session:', session.id);

      // Call claim-reward API endpoint
      const claimRes = await fetch('/api/game/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          wallet_address: publicKey.toString(),
        }),
      });

      const claimData = await claimRes.json();
      console.log('[Claim] API response:', claimData);

      if (!claimRes.ok) {
        // Check if requires on-chain transaction
        if (claimData.requires_onchain_tx) {
          console.log('[Claim] Requires on-chain transaction via wallet');
          setClaimError('On-chain claim requires wallet signature. Please use the blockchain claim button.');

          // TODO: If has SimpleK3HootClient, can trigger claimReward here
          // const result = await claimReward(claimData.quiz_set_id);
          // if (result.success) {
          //   // Submit tx signature back to API
          //   await submitClaimSignature(result.signature);
          // }

          setVerifying(false);
          return;
        }

        setClaimError(claimData.error || 'Claim failed');
        setVerifying(false);
        return;
      }

      // Success!
      console.log('[Claim] ✅ Reward claimed!', claimData);
      setClaimed(true);

      // Show success message with tx signature
      if (claimData.tx_signature) {
        console.log('[Claim] Transaction:', claimData.tx_signature);
      }

    } catch (error: any) {
      console.error('[Claim] Error:', error);
      setClaimError(error.message || 'An error occurred while claiming reward');
    } finally {
      setVerifying(false);
    }
  };

  if (!mounted) return null;

  if (!session) {
    return (
      <PageTemplate title="Channel Sync" subtitle="Retrieving Final Ledger">
        <div className="flex justify-center pt-24">
          <div className="w-12 h-12 border-4 border-black border-dashed animate-spin" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Sequence Terminated"
      subtitle={`Arena: ${pin} | HOOT Summary`}
    >
      <div className="max-w-4xl mx-auto pt-12 pb-40 px-4 space-y-16">
        {/* Top 3 Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {/* 2nd Place */}
          {leaderboard[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-4 border-black p-8 bg-white text-center shadow-[12px_12px_0px_#00000005]"
            >
              <Typography variant="body-xs" className="font-black uppercase opacity-20 mb-4 tracking-widest">Rank 02</Typography>
              <Typography variant="h3" className="font-black uppercase mb-2 truncate px-2">{leaderboard[1].player_name}</Typography>
              <Typography variant="h4" className="font-black opacity-30 break-all">{leaderboard[1].score} PT</Typography>
            </motion.div>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-8 border-black p-12 bg-black text-white text-center shadow-[24px_24px_0px_#00000010] relative z-10"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-black font-black text-[10px] tracking-[0.5em] uppercase border-4 border-black flex items-center gap-2">
                Winner
              </div>
              <Typography variant="display-sm" className="font-black uppercase leading-none mb-6 tracking-tighter truncate px-4">
                {leaderboard[0].player_name}
              </Typography>
              <Typography variant="h2" className="font-black text-white/40 mb-2 break-all">{leaderboard[0].score} PT</Typography>
              <div className="w-12 h-[2px] bg-white/20 mx-auto" />
            </motion.div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-4 border-black p-8 bg-white text-center shadow-[12px_12px_0px_#00000005]"
            >
              <Typography variant="body-xs" className="font-black uppercase opacity-20 mb-4 tracking-widest">Rank 03</Typography>
              <Typography variant="h3" className="font-black uppercase mb-2 truncate px-2">{leaderboard[2].player_name}</Typography>
              <Typography variant="h4" className="font-black opacity-30 break-all">{leaderboard[2].score} PT</Typography>
            </motion.div>
          )}
        </div>

        {/* Action Layer: Claim / Status */}
        {myRank && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <Typography variant="body-xs" className="font-black uppercase tracking-[0.3em] opacity-40 mb-2">Performance Analysis</Typography>
              <Typography variant="h3" className="font-black uppercase">
                {myRank === 1 ? 'Node Priority: High' : `Efficiency Rating: #${myRank}`}
              </Typography>
            </div>

            {myRank === 1 && canClaim && !claimed && (
              <div className="border-8 border-black p-10 bg-white shadow-[12px_12px_0px_#00000005] space-y-8">
                <div className="flex items-center gap-6 border-b-2 border-black pb-8">
                  <div className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-2xl">
                    $
                  </div>
                  <div>
                    <Typography variant="body-xs" className="font-black uppercase opacity-40">Allocated Prize Pool</Typography>
                    <Typography variant="h3" className="font-black uppercase">Secure Reward Available</Typography>
                  </div>
                </div>

                {claimError && (
                  <div className="p-4 border-2 border-red-600 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest">
                    ERROR: {claimError}
                  </div>
                )}

                <button
                  onClick={handleClaimReward}
                  disabled={verifying || claiming}
                  className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-[8px_8px_0px_#00000020]"
                >
                  {verifying || claiming ? 'VERIFYING...' : 'INITIATE SECURE TRANSFER'}
                </button>
              </div>
            )}

            {claimed && (
              <div className="border-8 border-black p-10 bg-black text-white text-center shadow-[12px_12px_0px_#00000005]">
                <Typography variant="h3" className="font-black uppercase mb-2">Transfer Finalised</Typography>
                <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40">Assets Dispatched to Authorised Wallet</Typography>
              </div>
            )}
          </div>
        )}

        {/* Complete Ledger */}
        <div className="max-w-2xl mx-auto space-y-8 pt-12 border-t-4 border-black/5">
          <Typography variant="body-xs" className="font-black uppercase tracking-[0.5em] text-center opacity-40">Complete Unit Ledger</Typography>
          <div className="space-y-3">
            {leaderboard.map((participant, index) => (
              <div
                key={participant.id}
                className={`
                  p-5 border-2 flex items-center justify-between transition-all
                  ${participant.id === participantId ? 'border-black bg-bone' : 'border-black/5 opacity-60'}
                `}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-8 h-8 border flex items-center justify-center font-black text-[10px] ${participant.id === participantId ? 'bg-black text-white border-black' : 'border-black/20'}`}>
                    {index + 1}
                  </div>
                  <Typography variant="body" className="font-black uppercase">{participant.player_name}</Typography>
                </div>
                <Typography variant="h4" className="font-black tracking-tighter">{participant.score} PT</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Global Navigation */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-24">
          <button
            onClick={() => router.push('/play')}
            className="px-12 py-5 bg-black text-white font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[12px_12px_0px_#00000020]"
          >
            New Protocol
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-12 py-5 border-4 border-black font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-[12px_12px_0px_#00000010]"
          >
            System Root
          </button>
        </div>
      </div>
    </PageTemplate>
  );
}
