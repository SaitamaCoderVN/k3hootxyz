'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTrophy, FaRocket, FaGamepad, FaCoins, FaClock, FaArrowLeft } from 'react-icons/fa';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import GlowingButton from '@/components/ui/GlowingButton';
import { LoadingContainer, PageWrapper } from '@/components/layout/MinHeightContainer';
import { BlockchainLoadingIndicator } from '@/components/ui/LoadingStates';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

interface QuizResult {
  quizId: string;
  title: string;
  score: number;
  totalQuestions: number;
  reward: number;
  timestamp: number;
}

export default function Results() {
  const { connected } = useWallet();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // TODO: Fetch results from smart contract
    const fetchResults = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Temporary mock data
        const mockResults: QuizResult[] = [
          {
            quizId: '1',
            title: 'Solana Fundamentals',
            score: 8,
            totalQuestions: 10,
            reward: 0.1,
            timestamp: Date.now() - 86400000
          },
          {
            quizId: '2',
            title: 'Web3 Development',
            score: 6,
            totalQuestions: 8,
            reward: 0.05,
            timestamp: Date.now() - 172800000
          },
          {
            quizId: '3',
            title: 'Blockchain Security',
            score: 9,
            totalQuestions: 10,
            reward: 0.15,
            timestamp: Date.now() - 259200000
          }
        ];
        setResults(mockResults);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setLoading(false);
      }
    };

    if (connected && mounted) {
      fetchResults();
    } else if (mounted) {
      setLoading(false);
    }
  }, [connected, mounted]);

  if (!mounted) return null;

  if (!connected) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <LoadingContainer>
          <div className="text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaRocket className="text-6xl text-purple-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-purple-300 mb-6">
                Please connect your Solana wallet to view your quiz results and rewards.
              </p>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !text-white !font-bold !px-6 !py-3 !rounded-lg hover:!from-purple-600 hover:!to-pink-600" />
              </div>
            </motion.div>
          </div>
        </LoadingContainer>
        <Footer />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <LoadingContainer>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                📊 Loading Results
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                Fetching your quiz results and rewards from blockchain...
              </p>
              <BlockchainLoadingIndicator 
                message="Loading your achievements..."
                showProgress={false}
              />
            </motion.div>
          </div>
        </LoadingContainer>
        <Footer />
      </main>
    );
  }

  const totalRewards = results.reduce((sum, result) => sum + result.reward, 0);
  const totalQuizzes = results.length;
  const averageScore = results.length > 0 
    ? results.reduce((sum, result) => sum + (result.score / result.totalQuestions), 0) / results.length * 100
    : 0;

  return (
    <PageWrapper minHeight="screen" className="bg-black text-white overflow-hidden">
      <SpaceBackground />
      <Stars />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Link href="/play">
                <GlowingButton variant="secondary" className="mr-4">
                  <FaArrowLeft className="mr-2" />
                  Back to Play
                </GlowingButton>
              </Link>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              📊 Your Quiz Results
            </h1>
            <p className="text-lg text-purple-300 max-w-2xl mx-auto">
              Track your progress and celebrate your achievements on the blockchain
            </p>
          </div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">{totalQuizzes}</div>
                <div className="text-purple-300">Quizzes Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">{totalRewards.toFixed(3)} SOL</div>
                <div className="text-purple-300">Total Rewards Earned</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{averageScore.toFixed(1)}%</div>
                <div className="text-purple-300">Average Score</div>
              </div>
            </div>
          </motion.div>

          {/* Results List */}
          {results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center py-12"
            >
              <FaGamepad className="text-6xl text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">No Quiz Results Yet</h3>
              <p className="text-purple-300 mb-6">
                Start playing quizzes to see your results and earn rewards!
              </p>
              <Link href="/play">
                <GlowingButton variant="primary" className="px-8 py-4">
                  <FaGamepad className="mr-2" />
                  Start Playing
                </GlowingButton>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {results.map((result, index) => (
                <motion.div
                  key={result.quizId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="mb-4 md:mb-0">
                      <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                        <FaTrophy className="text-yellow-400 mr-2" />
                        {result.title}
                      </h2>
                      <div className="flex items-center text-purple-300 text-sm">
                        <FaClock className="mr-2" />
                        Completed on: {new Date(result.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-2xl font-bold text-green-400 mb-1">
                        <FaCoins className="mr-2" />
                        {result.reward} SOL
                      </div>
                      <div className="text-purple-300">
                        Score: {result.score}/{result.totalQuestions}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-purple-300 text-sm">Progress</span>
                      <span className="text-purple-300 text-sm">
                        {Math.round((result.score / result.totalQuestions) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-800/30 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.score / result.totalQuestions) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/quiz/${result.quizId}`} className="flex-1">
                      <GlowingButton variant="secondary" className="w-full">
                        <FaGamepad className="mr-2" />
                        Take Quiz Again
                      </GlowingButton>
                    </Link>
                    <GlowingButton variant="primary" className="flex-1">
                      <FaTrophy className="mr-2" />
                      View Details
                    </GlowingButton>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-12"
            >
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
                <h3 className="text-2xl font-bold mb-4">Ready for More Challenges?</h3>
                <p className="text-purple-300 mb-6">
                  Keep learning and earning with our extensive quiz collection!
                </p>
                <Link href="/play">
                  <GlowingButton variant="primary" className="px-8 py-4">
                    <FaRocket className="mr-2" />
                    Find More Quizzes
                  </GlowingButton>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Footer />
    </PageWrapper>
  );
} 