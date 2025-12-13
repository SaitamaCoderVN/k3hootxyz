'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import { SimpleQuizCard } from '@/components/SimpleQuizCard';
import { useSimpleQuiz } from '@/hooks/useSimpleQuiz';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { FaRocket, FaGamepad, FaTrophy, FaSync } from 'react-icons/fa';
import { Typography, NeonButton, GlassCard, StatCard, colors } from '@/design-system';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function PlayPage() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  
  const {
    quizzes,
    availableQuizzes,
    completedQuizzes,
    loading,
    error,
    isConnected,
    totalQuizzes,
    availableCount,
    completedCount,
    fetchQuizzes
  } = useSimpleQuiz();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageWrapper minHeight="screen" className="bg-black text-white overflow-hidden">
      <SpaceBackground />
      <Stars />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Typography variant="display-lg" gradient="purple-pink" className="mb-4">
            Play Quizzes
          </Typography>
          <Typography variant="body-xl" color={colors.text.secondary} className="max-w-2xl mx-auto">
            Answer questions correctly to win SOL rewards!
          </Typography>
        </motion.div>

        {!connected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-12 text-center"
          >
            <GlassCard variant="purple" size="md" hover={false}>
              <FaRocket className="text-6xl mx-auto mb-4" style={{ color: colors.primary.purple[400] }} />
              <Typography variant="h3" className="mb-4">
                Connect Your Wallet
              </Typography>
              <Typography variant="body" color={colors.text.secondary} className="mb-6">
                Connect your Solana wallet to play quizzes and claim rewards
              </Typography>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-bold !px-8 !py-4 !rounded-xl hover:!from-cyan-600 hover:!to-purple-600 !transition-all" />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={<FaGamepad />}
                value={totalQuizzes.toString()}
                label="Total Quizzes"
                variant="orange"
              />
              <StatCard
                icon={<FaGamepad />}
                value={availableCount.toString()}
                label="Available"
                variant="purple"
              />
              <StatCard
                icon={<FaTrophy />}
                value={completedCount.toString()}
                label="Completed"
                variant="pink"
              />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <GlassCard variant="default" hover={false} className="text-center">
              <Typography variant="body" color={colors.state.error} className="mb-4">
                {error}
              </Typography>
              <NeonButton
                variant="secondary"
                neonColor="orange"
                size="md"
                leftIcon={<FaSync />}
                onClick={fetchQuizzes}
              >
                Retry
              </NeonButton>
            </GlassCard>
          </motion.div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: colors.primary.purple[400] }}></div>
            <Typography variant="body" color={colors.text.secondary}>
              Loading quizzes...
            </Typography>
          </div>
        )}

        {connected && !loading && (
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <Typography variant="h2" gradient="purple" className="mb-6">
                Available Quizzes ({availableCount})
              </Typography>
              
              {availableQuizzes.length === 0 ? (
                <GlassCard variant="default" hover={false} className="text-center py-12">
                  <FaGamepad className="text-5xl mx-auto mb-4" style={{ color: colors.text.muted }} />
                  <Typography variant="body-lg" color={colors.text.secondary} className="mb-2">
                    No available quizzes yet
                  </Typography>
                  <Typography variant="body-sm" color={colors.text.muted}>
                    Check back later or create your own!
                  </Typography>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableQuizzes.map((quiz) => (
                    <SimpleQuizCard
                      key={quiz.quizId}
                      quizId={quiz.quizId}
                      question={quiz.question}
                      rewardAmount={quiz.rewardAmount}
                      winner={quiz.winner}
                      isClaimed={quiz.isClaimed}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Typography variant="h2" gradient="pink" className="mb-6">
                Completed Quizzes ({completedCount})
              </Typography>
              
              {completedQuizzes.length === 0 ? (
                <GlassCard variant="default" hover={false} className="text-center py-12">
                  <FaTrophy className="text-5xl mx-auto mb-4" style={{ color: colors.text.muted }} />
                  <Typography variant="body-lg" color={colors.text.secondary}>
                    No completed quizzes yet
                  </Typography>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedQuizzes.map((quiz) => (
                    <SimpleQuizCard
                      key={quiz.quizId}
                      quizId={quiz.quizId}
                      question={quiz.question}
                      rewardAmount={quiz.rewardAmount}
                      winner={quiz.winner}
                      isClaimed={quiz.isClaimed}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </PageWrapper>
  );
}