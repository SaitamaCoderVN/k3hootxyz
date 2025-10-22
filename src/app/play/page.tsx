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
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Play Quizzes
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Answer questions correctly to win SOL rewards!
          </p>
        </motion.div>

        {/* Wallet Connection */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-cyan-500/30 mb-12 text-center"
          >
            <FaRocket className="text-6xl text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
            <p className="text-gray-300 mb-6">
              Connect your Solana wallet to play quizzes and claim rewards
            </p>
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-bold !px-8 !py-4 !rounded-xl hover:!from-cyan-600 hover:!to-purple-600 !transition-all" />
            </div>
          </motion.div>
        )}

        {/* Stats Dashboard */}
        {connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Quizzes */}
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <FaGamepad className="text-3xl text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{totalQuizzes}</p>
                    <p className="text-cyan-300">Total Quizzes</p>
                  </div>
                </div>
              </div>

              {/* Available */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <FaGamepad className="text-3xl text-green-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{availableCount}</p>
                    <p className="text-green-300">Available</p>
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <FaTrophy className="text-3xl text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{completedCount}</p>
                    <p className="text-purple-300">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center"
          >
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchQuizzes}
              className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <FaSync className="inline mr-2" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-gray-300">Loading quizzes...</p>
          </div>
        )}

        {/* Quiz Lists */}
        {connected && !loading && (
          <div className="max-w-6xl mx-auto">
            {/* Available Quizzes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold mb-6 text-cyan-400">
                Available Quizzes ({availableCount})
              </h2>
              
              {availableQuizzes.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                  <FaGamepad className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No available quizzes yet</p>
                  <p className="text-gray-500 mt-2">Check back later or create your own!</p>
                </div>
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

            {/* Completed Quizzes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-purple-400">
                Completed Quizzes ({completedCount})
              </h2>
              
              {completedQuizzes.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                  <FaTrophy className="text-5xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No completed quizzes yet</p>
                </div>
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
