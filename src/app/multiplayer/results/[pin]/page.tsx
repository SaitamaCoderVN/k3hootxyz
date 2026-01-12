'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaTrophy, FaMedal, FaCoins } from 'react-icons/fa';
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
      <PageTemplate title="Loading..." subtitle="Please wait">
        <div className="flex justify-center pt-12">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-4"
            style={{ borderColor: colors.primary.purple[400] }}
          />
        </div>
      </PageTemplate>
    );
  }

  const getPodiumColor = (rank: number) => {
    if (rank === 1) return colors.primary.orange[400];
    if (rank === 2) return colors.primary.purple[400];
    if (rank === 3) return colors.primary.pink[400];
    return colors.text.muted;
  };

  const getPodiumIcon = (rank: number) => {
    if (rank === 1) return <FaTrophy />;
    if (rank === 2 || rank === 3) return <FaMedal />;
    return null;
  };

  return (
    <PageTemplate title="Game Results" subtitle={`Game PIN: ${pin}`}>
      <div className="max-w-4xl mx-auto pt-8 pb-24 space-y-8">
        {/* Top 3 Podium */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="orange" size="xl">
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              {leaderboard[1] && (
                <div className="text-center space-y-2">
                  <div className="text-4xl" style={{ color: getPodiumColor(2) }}>
                    {getPodiumIcon(2)}
                  </div>
                  <Typography variant="h4" color={getPodiumColor(2)}>
                    #2
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    {leaderboard[1].player_name}
                  </Typography>
                  <Typography variant="h5" color={colors.primary.purple[400]}>
                    {leaderboard[1].score}
                  </Typography>
                </div>
              )}

              {/* 1st Place */}
              {leaderboard[0] && (
                <div className="text-center space-y-2">
                  <div className="text-6xl animate-bounce" style={{ color: getPodiumColor(1) }}>
                    {getPodiumIcon(1)}
                  </div>
                  <Typography variant="h3" gradient="orange-pink">
                    WINNER
                  </Typography>
                  <Typography variant="h4" className="font-bold">
                    {leaderboard[0].player_name}
                  </Typography>
                  <Typography variant="h3" gradient="orange">
                    {leaderboard[0].score}
                  </Typography>
                </div>
              )}

              {/* 3rd Place */}
              {leaderboard[2] && (
                <div className="text-center space-y-2">
                  <div className="text-4xl" style={{ color: getPodiumColor(3) }}>
                    {getPodiumIcon(3)}
                  </div>
                  <Typography variant="h4" color={getPodiumColor(3)}>
                    #3
                  </Typography>
                  <Typography variant="body" className="font-bold">
                    {leaderboard[2].player_name}
                  </Typography>
                  <Typography variant="h5" color={colors.primary.pink[400]}>
                    {leaderboard[2].score}
                  </Typography>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* My Result */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard
              variant={myRank === 1 ? 'orange' : 'purple'}
              size="lg"
            >
              <div className="text-center space-y-4">
                <Typography variant="h3" gradient={myRank === 1 ? 'orange-pink' : 'purple-pink'}>
                  You finished {myRank === 1 ? '1st' : myRank === 2 ? '2nd' : myRank === 3 ? '3rd' : `${myRank}th`}!
                </Typography>

                {myRank === 1 && canClaim && !claimed && (
                  <div className="space-y-4 pt-4">
                    <div
                      className="p-4 rounded-lg flex items-center justify-center gap-3"
                      style={{
                        background: `${colors.primary.orange[500]}20`,
                        border: `1px solid ${colors.primary.orange[400]}40`
                      }}
                    >
                      <FaCoins className="text-3xl" style={{ color: colors.primary.orange[400] }} />
                      <div className="text-left">
                        <Typography variant="body-sm" color={colors.text.muted}>
                          Your Reward
                        </Typography>
                        <Typography variant="h4" gradient="orange">
                          {/* Reward amount will be shown from session */}
                          SOL Reward Available!
                        </Typography>
                      </div>
                    </div>

                    {claimError && (
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          background: `${colors.state.error}20`,
                          border: `1px solid ${colors.state.error}40`
                        }}
                      >
                        <Typography variant="body-sm" color={colors.state.error}>
                          {claimError}
                        </Typography>
                      </div>
                    )}

                    <NeonButton
                      onClick={handleClaimReward}
                      loading={verifying || claiming}
                      disabled={!connected}
                      neonColor="orange"
                      size="lg"
                      fullWidth
                      leftIcon={<FaTrophy />}
                    >
                      Claim Your Reward
                    </NeonButton>
                  </div>
                )}

                {claimed && (
                  <div
                    className="p-6 rounded-lg text-center"
                    style={{
                      background: `${colors.state.success}20`,
                      border: `1px solid ${colors.state.success}40`
                    }}
                  >
                    <Typography variant="h4" color={colors.state.success}>
                      ✅ Reward Claimed Successfully!
                    </Typography>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="purple" size="lg">
            <Typography variant="h3" gradient="purple-pink" className="mb-6">
              Full Leaderboard
            </Typography>
            <div className="space-y-2">
              {leaderboard.map((participant, index) => (
                <div
                  key={participant.id}
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{
                    background: participant.id === participantId
                      ? `${colors.primary.purple[500]}30`
                      : `${colors.background.secondary}40`,
                    border: participant.id === participantId
                      ? `2px solid ${colors.primary.purple[400]}`
                      : `1px solid ${colors.background.secondary}`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <Typography variant="h4" color={getPodiumColor(index + 1)} className="w-8">
                      #{index + 1}
                    </Typography>
                    <Typography variant="body-lg" className="font-bold">
                      {participant.player_name}
                    </Typography>
                  </div>
                  <Typography variant="h5" color={colors.primary.purple[400]}>
                    {participant.score}
                  </Typography>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <NeonButton
            onClick={() => router.push('/play')}
            variant="secondary"
            neonColor="purple"
          >
            Play More Quizzes
          </NeonButton>
          <NeonButton
            onClick={() => router.push('/')}
            variant="ghost"
            neonColor="purple"
          >
            Back to Home
          </NeonButton>
        </div>
      </div>
    </PageTemplate>
  );
}
