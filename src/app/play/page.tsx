'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations';
import { FaRocket, FaGamepad, FaTrophy, FaPlus, FaUsers } from 'react-icons/fa';
import { Typography, NeonButton, GlassCard, StatCard, colors } from '@/design-system';
import { supabase } from '@/lib/supabase-client';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  {
    ssr: false,
    loading: () => null,
  }
);

interface QuizSet {
  id: string;
  owner_wallet: string;
  title: string;
  description: string | null;
  reward_amount: number;
  total_questions: number;
  created_at: string;
}

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [myQuizSets, setMyQuizSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      fetchQuizSets();
    }
  }, [connected, publicKey]);

  const fetchQuizSets = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all active quiz sets
      const { data: allQuizSets, error: allError } = await supabase
        .from('quiz_sets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (allError) throw allError;

      // Fetch user's quiz sets
      const { data: userQuizSets, error: userError } = await supabase
        .from('quiz_sets')
        .select('*')
        .eq('owner_wallet', publicKey.toString())
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      setQuizSets(allQuizSets || []);
      setMyQuizSets(userQuizSets || []);
    } catch (err: any) {
      console.error('Error fetching quiz sets:', err);
      setError(err.message || 'Failed to load quiz sets');
    } finally {
      setLoading(false);
    }
  };

  const handleHostQuiz = (quizSetId: string) => {
    router.push(`/multiplayer/host?quizId=${quizSetId}`);
  };

  const displayedQuizSets = activeTab === 'all' ? quizSets : myQuizSets;
  const isOwner = (quizSet: QuizSet) => quizSet.owner_wallet === publicKey?.toString();

  if (!mounted) return null;

  return (
    <PageTemplate
      title="Quiz Sets"
      subtitle="Play or host multi-question quiz games"
      containerClassName="pb-24"
    >
      <div className="pt-8 max-w-7xl mx-auto">
        {!connected && (
          <ScrollReveal type="scaleIn" delay={0.2} amount={40}>
            <div className="max-w-md mx-auto mb-12 text-center">
              <GlassCard variant="purple" size="lg" hover={true} className="text-center">
                <div
                  className="flex justify-center mb-6 p-6 rounded-2xl mx-auto w-fit"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.purple[500]}20, ${colors.primary.pink[500]}10)`,
                    border: `1px solid ${colors.primary.purple[400]}30`,
                    boxShadow: `0 0 40px ${colors.primary.purple[400]}20`,
                  }}
                >
                  <FaRocket style={{ fontSize: '4rem', color: colors.primary.purple[400], filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))' }} />
                </div>
                <Typography variant="h3" gradient="purple-pink" className="mb-4">
                  Connect Your Wallet
                </Typography>
                <Typography variant="body-lg" color={`${colors.primary.purple[300]}dd`} className="mb-8 leading-relaxed">
                  Connect your Solana wallet to play quizzes and claim rewards
                </Typography>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </GlassCard>
            </div>
          </ScrollReveal>
        )}

        {connected && (
          <>
            {/* Quick Action Buttons */}
            <ScrollReveal type="fadeInUp" delay={0.1} amount={50}>
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <NeonButton
                  onClick={() => router.push('/create-quiz')}
                  neonColor="purple"
                  size="lg"
                  fullWidth
                  leftIcon={<FaPlus />}
                >
                  Create Quiz Set
                </NeonButton>
                <NeonButton
                  onClick={() => router.push('/multiplayer/join')}
                  neonColor="orange"
                  size="lg"
                  fullWidth
                  leftIcon={<FaUsers />}
                >
                  Join Multiplayer
                </NeonButton>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal type="fadeInUp" delay={0.2} amount={50}>
              <div className="mb-12">
                <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StaggerItem type="scaleIn" delay={0.1}>
                    <StatCard
                      icon={<FaGamepad />}
                      value={quizSets.length.toString()}
                      label="Total Quiz Sets"
                      variant="orange"
                    />
                  </StaggerItem>
                  <StaggerItem type="scaleIn" delay={0.2}>
                    <StatCard
                      icon={<FaTrophy />}
                      value={myQuizSets.length.toString()}
                      label="My Quiz Sets"
                      variant="purple"
                    />
                  </StaggerItem>
                  <StaggerItem type="scaleIn" delay={0.3}>
                    <StatCard
                      icon={<FaGamepad />}
                      value={quizSets.reduce((sum, q) => sum + q.total_questions, 0).toString()}
                      label="Total Questions"
                      variant="pink"
                    />
                  </StaggerItem>
                </StaggerContainer>
              </div>
            </ScrollReveal>

            {/* Tabs */}
            <div className="mb-6 flex gap-4">
              <button
                onClick={() => setActiveTab('all')}
                className="px-6 py-3 rounded-lg transition-all"
                style={{
                  background: activeTab === 'all' ? `${colors.primary.purple[500]}40` : 'transparent',
                  border: `2px solid ${activeTab === 'all' ? colors.primary.purple[400] : colors.primary.purple[500]}40`,
                  color: activeTab === 'all' ? colors.text.primary : colors.text.muted,
                }}
              >
                <Typography variant="body" color={activeTab === 'all' ? colors.text.primary : colors.text.muted}>
                  All Quiz Sets ({quizSets.length})
                </Typography>
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                className="px-6 py-3 rounded-lg transition-all"
                style={{
                  background: activeTab === 'mine' ? `${colors.primary.orange[500]}40` : 'transparent',
                  border: `2px solid ${activeTab === 'mine' ? colors.primary.orange[400] : colors.primary.orange[500]}40`,
                  color: activeTab === 'mine' ? colors.text.primary : colors.text.muted,
                }}
              >
                <Typography variant="body" color={activeTab === 'mine' ? colors.text.primary : colors.text.muted}>
                  My Quiz Sets ({myQuizSets.length})
                </Typography>
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div
                  className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
                  style={{ borderColor: colors.primary.purple[400] }}
                />
                <Typography variant="body" color={colors.text.secondary}>
                  Loading quiz sets...
                </Typography>
              </div>
            )}

            {/* Error State */}
            {error && (
              <GlassCard variant="default" size="lg" className="text-center">
                <Typography variant="body" color={colors.state.error}>
                  {error}
                </Typography>
              </GlassCard>
            )}

            {/* Quiz Sets Grid */}
            {!loading && !error && (
              <ScrollReveal type="fadeInUp" delay={0.3} amount={50}>
                {displayedQuizSets.length === 0 ? (
                  <GlassCard variant="purple" hover={false} size="lg" className="text-center py-16">
                    <div
                      className="flex justify-center mb-6 p-6 rounded-2xl mx-auto w-fit"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.purple[500]}20, ${colors.primary.pink[500]}10)`,
                        border: `1px solid ${colors.primary.purple[400]}30`,
                      }}
                    >
                      <FaGamepad style={{ fontSize: '4rem', color: colors.primary.purple[400] }} />
                    </div>
                    <Typography variant="h4" gradient="purple" className="mb-4">
                      {activeTab === 'mine' ? 'No quiz sets created yet' : 'No quiz sets available'}
                    </Typography>
                    <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`} className="mb-6">
                      {activeTab === 'mine' ? 'Create your first quiz set to get started!' : 'Check back later for new quiz sets'}
                    </Typography>
                    {activeTab === 'mine' && (
                      <NeonButton
                        onClick={() => router.push('/create-quiz')}
                        neonColor="purple"
                        size="lg"
                        leftIcon={<FaPlus />}
                      >
                        Create Quiz Set
                      </NeonButton>
                    )}
                  </GlassCard>
                ) : (
                  <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedQuizSets.map((quizSet, index) => (
                      <StaggerItem key={quizSet.id} type="scaleIn" delay={index * 0.05}>
                        <GlassCard variant={isOwner(quizSet) ? 'orange' : 'purple'} size="lg" hover={true}>
                          <div className="space-y-4">
                            <div>
                              <Typography variant="h4" color={colors.text.primary}>
                                {quizSet.title}
                              </Typography>
                              {quizSet.description && (
                                <Typography variant="body-sm" color={colors.text.muted} className="mt-1">
                                  {quizSet.description}
                                </Typography>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Typography variant="body-sm" color={colors.text.muted}>
                                  Questions
                                </Typography>
                                <Typography variant="h4" color={colors.text.primary}>
                                  {quizSet.total_questions}
                                </Typography>
                              </div>
                              <div className="text-right">
                                <Typography variant="body-sm" color={colors.text.muted}>
                                  Reward
                                </Typography>
                                <Typography variant="h4" gradient="orange">
                                  {quizSet.reward_amount.toFixed(2)} SOL
                                </Typography>
                              </div>
                            </div>

                            {isOwner(quizSet) ? (
                              <NeonButton
                                onClick={() => handleHostQuiz(quizSet.id)}
                                neonColor="orange"
                                size="md"
                                fullWidth
                                leftIcon={<FaUsers />}
                              >
                                Host Game
                              </NeonButton>
                            ) : (
                              <div className="text-center py-2">
                                <Typography variant="body-sm" color={colors.text.muted}>
                                  Created by {quizSet.owner_wallet.slice(0, 4)}...{quizSet.owner_wallet.slice(-4)}
                                </Typography>
                              </div>
                            )}
                          </div>
                        </GlassCard>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </ScrollReveal>
            )}
          </>
        )}
      </div>
    </PageTemplate>
  );
}