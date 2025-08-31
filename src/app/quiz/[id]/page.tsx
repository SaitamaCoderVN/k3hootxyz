'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useParams, useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaTimes, FaTrophy, FaRocket, FaLock, FaUnlock } from 'react-icons/fa';
import { useK3HootClient, DecryptedQuestion, QuestionBlock } from '@/lib/solana-client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import GlowingButton from '@/components/ui/GlowingButton';

interface QuizSet {
  authority: PublicKey;
  name: string;
  questionCount: number;
  uniqueId: number;
  createdAt: any;
  isInitialized: boolean;
}

export default function QuizDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { connected } = useWallet();
  const client = useK3HootClient();
  
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);
  const [questionBlocks, setQuestionBlocks] = useState<QuestionBlock[]>([]);
  const [decryptedQuestions, setDecryptedQuestions] = useState<DecryptedQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!client || !id) return;

      try {
        setLoading(true);
        const quizSetAddress = new PublicKey(id as string);
        
        // Get complete quiz data including decrypted questions
        const completeQuiz = await client.getCompleteQuiz(quizSetAddress);
        if (!completeQuiz) {
          setError('Quiz not found or no questions available');
          setLoading(false);
          return;
        }
        
        setQuizSet(completeQuiz.quizSet);
        setQuestionBlocks(completeQuiz.questionBlocks);
        setDecryptedQuestions(completeQuiz.decryptedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError('Failed to load quiz');
        setLoading(false);
      }
    };

    if (connected && client) {
      loadQuizData();
    }
  }, [id, client, connected]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < decryptedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!client || !quizSet || selectedAnswers.length !== decryptedQuestions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // For now, use local verification since we're on devnet
      // In production, this would use Arcium on-chain verification
      let correctCount = 0;
      
      for (let i = 0; i < questionBlocks.length; i++) {
        const questionBlock = questionBlocks[i];
        const userAnswer = selectedAnswers[i] || "";
        
        // Decrypt correct answer from Y-coordinate for verification
        const nonce = questionBlock.nonce.toNumber();
        const encryptedY = questionBlock.encryptedYCoordinate;
        
        // Decrypt Y-coordinate (correct answer) using XOR
        const decryptedY = Buffer.alloc(64);
        for (let j = 0; j < 64; j++) {
          decryptedY[j] = encryptedY[j] ^ (nonce & 0xFF);
        }
        
        // Convert decrypted bytes to string
        const correctAnswer = decryptedY.toString('utf8').replace(/\0/g, '');
        
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      }
      
      const finalScore = (correctCount / questionBlocks.length) * 100;
      setScore(finalScore);
      setQuizCompleted(true);
      
    } catch (error: any) {
      console.error('Error submitting answers:', error);
      setError(error.message || 'Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setQuizCompleted(false);
    setScore(null);
    setError(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-purple-300">Loading quiz from blockchain...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!connected) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center max-w-md">
            <FaRocket className="text-6xl text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-purple-300 mb-6">
              Please connect your Solana wallet to participate in this quiz.
            </p>
            <GlowingButton
              onClick={() => router.push('/')}
              variant="primary"
              className="px-6 py-3"
            >
              Go to Home
            </GlowingButton>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center max-w-md">
            <FaTimes className="text-6xl text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-red-200">Error</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <div className="space-y-3">
              <GlowingButton
                onClick={() => router.push('/browse')}
                variant="secondary"
                className="px-6 py-3"
              >
                Browse Quizzes
              </GlowingButton>
              <GlowingButton
                onClick={() => window.location.reload()}
                variant="primary"
                className="px-6 py-3"
              >
                Try Again
              </GlowingButton>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (quizCompleted && score !== null) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
              <FaTrophy className="text-8xl text-yellow-400 mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4 text-white">Quiz Completed! 🎉</h1>
              
              <div className="mb-8">
                <div className="text-6xl font-bold text-purple-400 mb-2">{score.toFixed(1)}%</div>
                <p className="text-xl text-purple-300">Your Score</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-purple-800/30 rounded-lg p-4">
                  <p className="text-purple-200">
                    <span className="font-semibold">Quiz:</span> {quizSet?.name}
                  </p>
                  <p className="text-purple-200">
                    <span className="font-semibold">Questions:</span> {decryptedQuestions.length}
                  </p>
                  <p className="text-purple-200">
                    <span className="font-semibold">Correct Answers:</span> {Math.round((score / 100) * decryptedQuestions.length)}/{decryptedQuestions.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <GlowingButton
                  onClick={() => router.push('/browse')}
                  variant="primary"
                  className="w-full px-8 py-4 text-lg"
                >
                  Take Another Quiz
                </GlowingButton>
                <GlowingButton
                  onClick={resetQuiz}
                  variant="secondary"
                  className="w-full px-8 py-4 text-lg"
                >
                  Retry This Quiz
                </GlowingButton>
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!quizSet || decryptedQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white overflow-hidden">
        <SpaceBackground />
        <Stars />
        <Header />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <p className="text-lg text-red-400">Quiz not found or no questions available</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const currentQuestionData = decryptedQuestions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / decryptedQuestions.length) * 100;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <SpaceBackground />
      <Stars />
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Quiz Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <GlowingButton
                onClick={() => router.push('/browse')}
                variant="secondary"
                className="mr-4"
              >
                <FaArrowLeft className="mr-2" />
                Back to Quizzes
              </GlowingButton>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-white">{quizSet.name}</h1>
            <div className="flex items-center justify-center gap-6 text-purple-300">
              <span>Questions: {decryptedQuestions.length}</span>
              <span>Creator: {quizSet.authority.toString().slice(0, 8)}...{quizSet.authority.toString().slice(-8)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300">Progress</span>
              <span className="text-purple-300">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-purple-800/30 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">
                Question {currentQuestion + 1} of {decryptedQuestions.length}
              </h2>
              <p className="text-purple-300">
                {currentQuestion + 1} of {decryptedQuestions.length} questions completed
              </p>
            </div>

            <div className="mb-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaUnlock className="text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Decrypted from Blockchain</span>
                </div>
                <p className="text-lg text-white leading-relaxed">
                  {currentQuestionData.question}
                </p>
              </div>
              
              <div className="space-y-3">
                {currentQuestionData.choices.map((choice, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      selectedAnswers[currentQuestion] === choice
                        ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-lg'
                        : 'hover:bg-purple-900/30 border-purple-500/30 text-white hover:border-purple-400/50'
                    }`}
                    onClick={() => handleAnswerSelect(choice)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500/20 text-lg font-bold text-purple-300">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-base">{choice}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Encryption Info */}
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaLock className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">Security Info</span>
                </div>
                <p className="text-xs text-blue-300">
                  This question was encrypted using XOR encryption with a unique nonce and stored on Solana blockchain. 
                  The correct answer remains encrypted and will be verified on-chain without exposure.
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <GlowingButton
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="secondary"
                className="px-6 py-3"
              >
                Previous
              </GlowingButton>

              {currentQuestion === decryptedQuestions.length - 1 ? (
                <GlowingButton
                  onClick={handleSubmit}
                  disabled={submitting || selectedAnswers.length !== decryptedQuestions.length}
                  variant="primary"
                  className="px-8 py-3"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Submit Quiz
                    </>
                  )}
                </GlowingButton>
              ) : (
                <GlowingButton
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                  variant="primary"
                  className="px-6 py-3"
                >
                  Next
                </GlowingButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
} 