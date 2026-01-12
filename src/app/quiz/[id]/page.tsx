'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTrophy, FaRocket } from 'react-icons/fa';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AnswerButton } from '@/components/AnswerButton';
import { ClaimButton } from '@/components/ClaimButton';
import { useSimpleQuiz } from '@/hooks/useSimpleQuiz';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { colors } from '@/design-system';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

const WebGLBackground = dynamic(() => import('@/components/animations/WebGLBackground'), {
  ssr: false,
  loading: () => null,
});

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
  loading: () => null,
});

const CursorTrail = dynamic(() => import('@/components/interactive/CursorTrail').then(mod => ({ default: mod.CursorTrail })), {
  ssr: false,
  loading: () => null,
});

export default function QuizPlayPage() {
  const { id } = useParams();
  const router = useRouter();
  const { connected } = useWallet();
  
  const {
    currentQuiz,
    loading,
    error,
    submitting,
    claiming,
    fetchQuizById,
    submitAnswer,
    claimReward,
    isUserWinner,
    clearError
  } = useSimpleQuiz();

  const [mounted, setMounted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [quizResult, setQuizResult] = useState<{ isWinner: boolean; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch quiz ONCE when page loads
  useEffect(() => {
    if (connected && id) {
      const quizSetId = id as string; // Now a string PDA, not a number
      console.log('📥 Loading quiz set:', quizSetId);
      fetchQuizById(quizSetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, connected]); // Only trigger when id or connected changes, NOT fetchQuizById

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuiz) return;

    const result = await submitAnswer(currentQuiz.quizId, selectedAnswer);
    
    if (result) {
      setQuizResult({
        isWinner: result.isWinner,
        message: result.isWinner 
          ? '🎉 Congratulations! You answered correctly!' 
          : '❌ Sorry, that\'s not correct. Try another quiz!'
      });
    }
  };

  const handleClaimReward = async () => {
    if (!currentQuiz) return;
    
    const result = await claimReward(currentQuiz.quizId);
    
    if (result.success) {
      // Redirect back to quiz list after claiming
      router.push('/play');
    }
  };

  if (!mounted) return null;

  if (!connected) {
    return (
      <PageWrapper minHeight="screen" className="text-white overflow-hidden" style={{ backgroundColor: colors.background.primary }}>
        <WebGLBackground />
        <CursorTrail />
        <PixelEffect />
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-cyan-500/30"
          >
            <FaRocket className="text-6xl text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 mb-6">
              Please connect your Solana wallet to play quizzes
            </p>
            <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-bold !px-8 !py-4 !rounded-xl" />
          </motion.div>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  if (loading) {
    return (
      <PageWrapper minHeight="screen" className="text-white overflow-hidden" style={{ backgroundColor: colors.background.primary }}>
        <WebGLBackground />
        <CursorTrail />
        <PixelEffect />
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mb-4"></div>
          <p className="text-xl text-gray-300">Loading quiz...</p>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  if (error || !currentQuiz) {
    return (
      <PageWrapper minHeight="screen" className="text-white overflow-hidden" style={{ backgroundColor: colors.background.primary }}>
        <WebGLBackground />
        <CursorTrail />
        <PixelEffect />
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-red-300">Error</h2>
            <p className="text-red-200 mb-6">{error || 'Quiz not found'}</p>
            <button
              onClick={() => router.push('/play')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              <FaArrowLeft className="inline mr-2" />
              Back to Quizzes
            </button>
          </motion.div>
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  const isWinner = isUserWinner(currentQuiz);
  const hasAnswered = quizResult !== null;

  return (
    <PageWrapper minHeight="screen" className="text-white overflow-hidden" style={{ backgroundColor: colors.background.primary }}>
      <WebGLBackground />
      <CursorTrail />
      <PixelEffect />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/play')}
              className="mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Quizzes</span>
            </button>

            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{currentQuiz.question.slice(0, 50)}{currentQuiz.question.length > 50 ? '...' : ''}</h1>
                  <p className="text-gray-400 font-mono text-xs">
                    {currentQuiz.quizId.slice(0, 4)}...{currentQuiz.quizId.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400">{currentQuiz.rewardAmount} SOL</div>
                  <div className="text-sm text-gray-400">Reward</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Complete - Winner */}
          {isWinner && !hasAnswered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-500/50 text-center"
            >
              <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">You Already Won This Quiz!</h2>
              <p className="text-xl text-gray-300 mb-6">
                {currentQuiz.isClaimed 
                  ? 'You have already claimed your reward!' 
                  : 'Claim your reward now!'}
              </p>
              
              {!currentQuiz.isClaimed && (
                <ClaimButton
                  rewardAmount={currentQuiz.rewardAmount}
                  onClaim={handleClaimReward}
                  isClaimed={currentQuiz.isClaimed}
                />
              )}

              <button
                onClick={() => router.push('/play')}
                className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Browse more quizzes →
              </button>
            </motion.div>
          )}

          {/* Quiz has winner (not current user) */}
          {currentQuiz.winner && !isWinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Quiz Already Completed</h2>
              <p className="text-gray-300 mb-2">This quiz has already been won by:</p>
              <p className="text-cyan-400 font-mono mb-6">
                {currentQuiz.winner.toString().slice(0, 8)}...{currentQuiz.winner.toString().slice(-8)}
              </p>
              <button
                onClick={() => router.push('/play')}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
              >
                Try Another Quiz
              </button>
            </motion.div>
          )}

          {/* Play Quiz */}
          {!currentQuiz.winner && !hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30"
            >
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white leading-relaxed">
                  {currentQuiz.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-4 mb-8">
                {currentQuiz.options.map((option, index) => (
                  <AnswerButton
                    key={index}
                    letter={["A", "B", "C", "D"][index] as "A" | "B" | "C" | "D"}
                    text={option}
                    selected={selectedAnswer === ["A", "B", "C", "D"][index]}
                    onClick={() => setSelectedAnswer(["A", "B", "C", "D"][index] as "A" | "B" | "C" | "D")}
                    disabled={submitting}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer || submitting}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg
                  transition-all duration-300
                  ${!selectedAnswer || submitting
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg hover:shadow-cyan-500/50'
                  }
                `}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Answer'
                )}
              </button>
            </motion.div>
          )}

          {/* Result Display */}
          {quizResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-8 rounded-2xl p-8 border-2 text-center ${
                quizResult.isWinner
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-red-500/20 border-red-500'
              }`}
            >
              <div className="text-6xl mb-4">{quizResult.isWinner ? '🎉' : '😔'}</div>
              <h3 className="text-3xl font-bold mb-4">{quizResult.message}</h3>
              
              {quizResult.isWinner ? (
                <div className="space-y-4">
                  <p className="text-xl text-green-300 mb-6">
                    You won {currentQuiz.rewardAmount} SOL!
                  </p>
                  <ClaimButton
                    rewardAmount={currentQuiz.rewardAmount}
                    onClaim={handleClaimReward}
                    isClaimed={currentQuiz.isClaimed}
                  />
                </div>
              ) : (
                <button
                  onClick={() => router.push('/play')}
                  className="mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
                >
                  Try Another Quiz
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </PageWrapper>
  );
}
