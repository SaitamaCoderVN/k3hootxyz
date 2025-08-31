'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import GlowingButton from '@/components/ui/GlowingButton';
import { 
  FaGamepad, 
  FaExclamationTriangle, 
  FaTrophy, 
  FaClock, 
  FaCoins,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaRocket,
  FaArrowLeft,
  FaList,
  FaBook
} from 'react-icons/fa';
import { usePlayFlow, QuizAnswer } from '@/hooks/usePlayFlow';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { PlayLoading } from '@/components/ui/FullPageLoading';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function PlayPage() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Thêm initialLoading
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const {
    playState,
    selectedTopic,
    availableQuizzes,
    completedQuizzes,
    currentQuiz,
    quizResult,
    loading,
    error,
    activeTopics,
    totalTopics,
    availableQuizzesCount,
    completedQuizzesCount,
    selectTopic,
    startQuiz,
    submitQuizAnswers,
    backToTopics,
    backToQuizzes,
    playAgain,
    claimReward,
    claiming,
    claimResult
  } = usePlayFlow();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initialLoading với loading state từ usePlayFlow
  useEffect(() => {
    if (!loading) {
      // Khi loading hoàn thành, đợi thêm 1 giây để user thấy loading screen
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setInitialLoading(true);
    }
  }, [loading]);

  // Timer for questions
  useEffect(() => {
    if (playState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (playState === 'playing' && timeLeft === 0) {
      handleAnswerSubmit('');
    }
  }, [playState, timeLeft]);

  const handleStartQuiz = async (quizSetPda: string) => {
    const success = await startQuiz(quizSetPda);
    if (success) {
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setTimeLeft(30);
      setSelectedAnswer('');
    }
  };

  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuiz) return;

    const currentQuestion = currentQuiz.decryptedQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const newAnswer: QuizAnswer = {
      questionIndex: currentQuestion.questionIndex,
      userAnswer: answer || selectedAnswer
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < currentQuiz.decryptedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(30);
      setSelectedAnswer('');
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: QuizAnswer[]) => {
    await submitQuizAnswers(finalAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 5) return 'text-red-400';
    if (timeLeft <= 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  const handleClaimReward = async (quizSetPda: string) => {
    setIsClaimingReward(true);
    setClaimSuccess(null);
    setClaimError(null);
    
    console.log(`💰 Starting reward claim process...`);
    console.log(`✨ Single transaction - only one signature required!`);
    
    try {
      const result = await claimReward(quizSetPda);
      
      if (result.success) {
        setClaimSuccess(`Reward claimed successfully! TX: ${result.txSignature}`);
      } else {
        setClaimError(result.error || 'Failed to claim reward');
      }
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim reward');
    } finally {
      setIsClaimingReward(false);
    }
  };

  if (!mounted) return null;

  // Thay đổi từ BlockchainLoadingIndicator thành PlayLoading
  if (loading) {
    return <PlayLoading />;
  }

  return (
    <PageWrapper minHeight="screen" className="bg-black text-white overflow-hidden">
      <SpaceBackground />
      <Stars />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Xóa loading state cũ */}
        <AnimatePresence mode="wait">
            {/* Topic Selection */}
            {playState === 'topics' && (
              <motion.div
                key="topics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-6">
                  <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
                    Select Topic
                  </h1>
                  <p className="text-lg text-purple-300 max-w-2xl mx-auto">
                    Choose a topic to explore available quizzes and start playing!
                  </p>
                </div>

                {/* Wallet Connection */}
                {!connected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-8 text-center"
                  >
                    <FaRocket className="text-4xl text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                    <p className="text-purple-300 mb-4">
                      Connect your Solana wallet to play quizzes and earn rewards
                    </p>
                    <div className="flex justify-center">
                      <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !text-white !font-bold !px-6 !py-3 !rounded-lg hover:!from-purple-600 hover:!to-pink-600" />
                    </div>
                  </motion.div>
                )}

                {/* Stats */}
                {connected && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/20 mb-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold gradient-text">{totalTopics}</p>
                        <p className="text-purple-300 text-sm">Available Topics</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold gradient-text">
                          {activeTopics.reduce((acc, topic) => acc + topic.totalQuizzes, 0)}
                        </p>
                        <p className="text-purple-300 text-sm">Total Quizzes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold gradient-text">
                          {activeTopics.reduce((acc, topic) => acc + topic.totalParticipants, 0)}
                        </p>
                        <p className="text-purple-300 text-sm">Total Players</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Topics Grid - Debug version */}
                {connected && (
                  <div>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-500/20 rounded text-xs">
                        <span className="text-yellow-300">Dev:</span> {totalTopics} topics, {activeTopics?.length || 0} active
                        {error && <span className="text-red-300 ml-2">Error: {error}</span>}
                      </div>
                    )}
                    
                    {error ? (
                      <div className="text-center py-8 text-red-300">
                        <FaExclamationTriangle className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>Error: {error}</p>
                      </div>
                    ) : activeTopics.length === 0 ? (
                      <div className="text-center py-8 text-purple-300">
                        <FaBook className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>No topics available. Create topics first!</p>
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeTopics.map((topic, index) => (
                          <motion.div
                            key={topic.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-900/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer"
                            onClick={() => selectTopic(topic)}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-white">{topic.name}</h3>
                              <span className="px-3 py-1 bg-green-600 text-green-100 rounded-full text-sm">
                                Active
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                              <div className="flex items-center">
                                <FaGamepad className="mr-2" />
                                {topic.totalQuizzes} Quizzes
                              </div>
                              <div className="flex items-center">
                                <FaTrophy className="mr-2" />
                                {topic.totalParticipants} Players
                              </div>
                              <div className="flex items-center">
                                <FaCoins className="mr-2" />
                                {topic.minRewardAmount} SOL min
                              </div>
                              <div className="flex items-center">
                                <FaList className="mr-2" />
                                {topic.minQuestionCount}+ questions
                              </div>
                            </div>

                            <GlowingButton
                              variant="primary"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectTopic(topic);
                              }}
                            >
                              <FaPlay className="inline mr-2" />
                              Explore Quizzes
                            </GlowingButton>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Quiz Selection for Selected Topic */}
            {playState === 'quizzes' && selectedTopic && (
              <motion.div
                key="quizzes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto"
              >
                <div className="flex items-center mb-8">
                  <button
                    onClick={backToTopics}
                    className="mr-4 p-2 text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <FaArrowLeft className="text-xl" />
                  </button>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                      {selectedTopic.name}
                    </h1>
                    <p className="text-lg text-purple-300">
                      Choose a quiz to start playing and earn rewards!
                    </p>
                  </div>
                </div>

                {/* Topic Stats */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-8"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold gradient-text">{availableQuizzesCount}</p>
                      <p className="text-purple-300 text-sm">Available</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">{completedQuizzesCount}</p>
                      <p className="text-purple-300 text-sm">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">
                        {availableQuizzes.reduce((acc, quiz) => acc + quiz.account.rewardAmount.toNumber() / 1_000_000_000, 0).toFixed(3)}
                      </p>
                      <p className="text-purple-300 text-sm">Total SOL</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">{selectedTopic.totalParticipants}</p>
                      <p className="text-purple-300 text-sm">Players</p>
                    </div>
                  </div>
                </motion.div>

                {/* Quiz Lists */}
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Available Quizzes */}
                  <div className="bg-green-900/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
                    <h3 className="text-2xl font-bold text-green-300 mb-6">Available Quizzes</h3>
                    
                    {availableQuizzes.length === 0 ? (
                      <div className="text-center py-8 text-green-300">
                        <FaGamepad className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>No available quizzes for this topic.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {availableQuizzes.map((quiz, index) => (
                          <motion.div
                            key={quiz.publicKey}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-green-900/30 border border-green-500/30 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{quiz.account.name}</h4>
                              <span className="px-2 py-1 bg-green-600 text-green-100 rounded text-xs">
                                Available
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-4">
                              <div className="flex items-center">
                                <FaGamepad className="mr-1" />
                                {quiz.decryptedQuestions.length} Questions
                              </div>
                              <div className="flex items-center">
                                <FaCoins className="mr-1" />
                                {quiz.account.rewardAmount.toNumber() / 1_000_000_000} SOL
                              </div>
                            </div>
                            <GlowingButton
                              variant="primary"
                              onClick={() => handleStartQuiz(quiz.publicKey)}
                              className="w-full"
                            >
                              <FaPlay className="inline mr-2" />
                              Start Quiz
                            </GlowingButton>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completed Quizzes */}
                  <div className="bg-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
                    <h3 className="text-2xl font-bold text-blue-300 mb-6">Completed Quizzes</h3>
                    
                    {completedQuizzes.length === 0 ? (
                      <div className="text-center py-8 text-blue-300">
                        <FaTrophy className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>No completed quizzes yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {completedQuizzes.map((quiz, index) => (
                          <motion.div
                            key={quiz.publicKey}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{quiz.account.name}</h4>
                              <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded text-xs">
                                Completed
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                              <div className="flex items-center">
                                <FaTrophy className="mr-1" />
                                {quiz.account.winner ? '🏆 Won' : '❌ Lost'}
                              </div>
                              <div className="flex items-center">
                                <FaCoins className="mr-1" />
                                {quiz.account.rewardAmount.toNumber() / 1_000_000_000} SOL
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Playing Quiz */}
            {playState === 'playing' && currentQuiz && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                {/* Quiz Header */}
                <div className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{currentQuiz.account.name}</h2>
                      <p className="text-purple-300">{selectedTopic?.name}</p>
                    </div>
                    <button
                      onClick={backToQuizzes}
                      className="px-4 py-2 bg-red-600/20 border border-red-500/20 rounded text-red-300 hover:text-red-200"
                    >
                      End Quiz
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-purple-300 text-sm">Question</p>
                      <p className="text-xl font-bold">
                        {currentQuestionIndex + 1} / {currentQuiz.decryptedQuestions.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Time Left</p>
                      <p className={`text-xl font-bold ${getTimeColor()}`}>
                        <FaClock className="inline mr-1" />
                        {formatTime(timeLeft)}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Reward</p>
                      <p className="text-xl font-bold">
                        <FaCoins className="inline mr-1" />
                        {currentQuiz.account.rewardAmount.toNumber() / 1_000_000_000} SOL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Question */}
                {currentQuiz.decryptedQuestions[currentQuestionIndex] && (
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20"
                  >
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
                      {currentQuiz.decryptedQuestions[currentQuestionIndex].question}
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {currentQuiz.decryptedQuestions[currentQuestionIndex].choices.map((choice, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedAnswer(choice)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            selectedAnswer === choice
                              ? 'bg-purple-600 border-purple-400 text-white'
                              : 'bg-purple-900/30 border-purple-500/20 text-purple-200 hover:border-purple-500/40'
                          }`}
                        >
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                          {choice}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex justify-center mt-6">
                      <GlowingButton
                        variant="primary"
                        onClick={() => handleAnswerSubmit(selectedAnswer)}
                        disabled={!selectedAnswer}
                        className="px-8 py-3"
                      >
                        {currentQuestionIndex < currentQuiz.decryptedQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </GlowingButton>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Quiz Results */}
            {playState === 'results' && quizResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                {/* Results Header */}
                <div className={`text-center mb-8 p-8 rounded-2xl border ${
                  quizResult.isWinner 
                    ? 'bg-green-900/20 border-green-500/20' 
                    : 'bg-orange-900/20 border-orange-500/20'
                }`}>
                  <div className="text-6xl mb-4">
                    {quizResult.isWinner ? '🏆' : '📊'}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                    {quizResult.isWinner ? 'Congratulations!' : 'Quiz Completed!'}
                  </h2>
                  <p className="text-lg text-purple-300 mb-2">
                    {quizResult.topicName} - {quizResult.quizSetName}
                  </p>
                  <p className="text-lg text-purple-300">
                    {quizResult.isWinner 
                      ? 'Perfect score! You can claim your SOL reward!' 
                      : `You scored ${quizResult.score}% - Keep practicing!`
                    }
                  </p>
                </div>

                {/* Score Summary */}
                <div className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quiz Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold gradient-text">{quizResult.correctAnswers}</p>
                      <p className="text-purple-300 text-sm">Correct</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">{quizResult.totalQuestions - quizResult.correctAnswers}</p>
                      <p className="text-purple-300 text-sm">Incorrect</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">{quizResult.score}%</p>
                      <p className="text-purple-300 text-sm">Score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">
                        {quizResult.isWinner ? '🏆' : '📊'}
                      </p>
                      <p className="text-purple-300 text-sm">Result</p>
                    </div>
                  </div>
                </div>

                {/* Answer Review */}
                <div className="bg-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20 mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Answer Review</h3>
                  <div className="space-y-3">
                    {quizResult.answers.map((answer, index) => (
                      <div
                        key={answer.questionIndex}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          answer.isCorrect
                            ? 'bg-green-900/30 border-green-500/30'
                            : 'bg-red-900/30 border-red-500/30'
                        }`}
                      >
                        <span className="text-white">
                          Question {answer.questionIndex}: {answer.userAnswer || 'No answer'}
                        </span>
                        {answer.isCorrect ? (
                          <FaCheckCircle className="text-green-400" />
                        ) : (
                          <FaTimesCircle className="text-red-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Claim Success Message */}
                {claimSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-900/20 border border-green-500/20 rounded-2xl p-6 mb-6"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <h3 className="text-xl font-bold text-green-300 mb-2">Reward Claimed!</h3>
                      <p className="text-green-200 text-sm break-all">{claimSuccess}</p>
                      <p className="text-green-300 text-xs mt-2">✨ Optimized with single transaction</p>
                    </div>
                  </motion.div>
                )}

                {/* Claim Error Message */}
                {(claimError || (claimResult && !claimResult.success)) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-900/20 border border-red-500/20 rounded-2xl p-6 mb-6"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">❌</div>
                      <h3 className="text-xl font-bold text-red-300 mb-2">Claim Failed</h3>
                      <p className="text-red-200 text-sm">{claimError || claimResult?.error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <GlowingButton
                    variant="secondary"
                    onClick={backToQuizzes}
                    className="px-8 py-3"
                  >
                    <FaArrowLeft className="inline mr-2" />
                    Back to {selectedTopic?.name}
                  </GlowingButton>
                  
                  <GlowingButton
                    variant="primary"
                    onClick={playAgain}
                    className="px-8 py-3"
                  >
                    <FaPlay className="inline mr-2" />
                    Play Another Quiz
                  </GlowingButton>
                  
                  {quizResult.isWinner && !claimSuccess && (
                    <GlowingButton
                      variant="secondary"
                      onClick={() => handleClaimReward(quizResult.quizSetPda)}
                      disabled={isClaimingReward || claiming}
                      className="px-8 py-3"
                    >
                      {isClaimingReward || claiming ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          Claiming (Single Transaction)...
                        </>
                      ) : (
                        <>
                          <FaTrophy className="inline mr-2" />
                          Claim Reward
                        </>
                      )}
                    </GlowingButton>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      <Footer />
    </PageWrapper>
  );
} 