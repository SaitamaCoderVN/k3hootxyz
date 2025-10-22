'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import { useSimpleQuiz } from '@/hooks/useSimpleQuiz';
import { QuizSetCreationData, QuestionCreationData } from '@/types/quiz';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { FaRocket, FaPlus, FaCheckCircle, FaTrash, FaMinus } from 'react-icons/fa';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

// Default single question template
const defaultQuestion: QuestionCreationData = {
  questionText: '',
  choices: ['', '', '', ''],
  correctAnswer: 'A',
  rewardAmount: 0.1
};

export default function CreatePage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { creating, error, createQuizSet, clearError } = useSimpleQuiz();

  const [quizName, setQuizName] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionCreationData[]>([
    { ...defaultQuestion }
  ]);

  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add new question
  const addQuestion = () => {
    setQuestions([...questions, { ...defaultQuestion }]);
  };

  // Remove question (minimum 1 question required)
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  // Update question text
  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  // Update question choice
  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].choices[choiceIndex] = value;
    setQuestions(updated);
  };

  // Update correct answer
  const updateCorrectAnswer = (index: number, answer: "A" | "B" | "C" | "D") => {
    const updated = [...questions];
    updated[index].correctAnswer = answer;
    setQuestions(updated);
  };

  // Update reward amount
  const updateRewardAmount = (index: number, amount: number) => {
    const updated = [...questions];
    updated[index].rewardAmount = amount;
    setQuestions(updated);
  };

  // Calculate total reward
  const getTotalReward = () => {
    return questions.reduce((sum, q) => sum + q.rewardAmount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(false);

    // Validation
    if (!quizName.trim()) {
      alert('Please enter a quiz name');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.questionText.trim()) {
        alert(`Question ${i + 1}: Please enter a question`);
        return;
      }

      if (q.choices.some(c => !c.trim())) {
        alert(`Question ${i + 1}: Please fill in all 4 options`);
        return;
      }

      if (q.rewardAmount <= 0) {
        alert(`Question ${i + 1}: Reward amount must be greater than 0`);
        return;
      }
    }

    // Create quiz set
    const quizSetData: QuizSetCreationData = {
      name: quizName,
      questions: questions
    };

    const success = await createQuizSet(quizSetData);
    
    if (success) {
      setSuccessMessage(true);
      // Reset form
      setQuizName('');
      setQuestions([{ ...defaultQuestion }]);

      // Redirect to play page after 2 seconds
      setTimeout(() => {
        router.push('/play');
      }, 2000);
    }
  };

  if (!mounted) return null;

  return (
    <PageWrapper minHeight="screen" className="bg-black text-white overflow-hidden">
      <SpaceBackground />
      <Stars />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Quiz Set
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Design your quiz with multiple questions and custom rewards!
            </p>
          </div>

          {/* Wallet Connection */}
          {!connected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border-2 border-cyan-500/30 mb-8 text-center"
            >
              <FaRocket className="text-6xl text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-6">
                Connect your Solana wallet to create quizzes
              </p>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-bold !px-8 !py-4 !rounded-xl" />
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border-2 border-green-500 rounded-xl p-6 mb-8 text-center"
            >
              <FaCheckCircle className="text-5xl text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">Quiz Created Successfully!</h3>
              <p className="text-green-300">Redirecting to quiz list...</p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border-2 border-red-500 rounded-xl p-6 mb-8 text-center"
            >
              <p className="text-red-300">{error}</p>
              <button
                onClick={clearError}
                className="mt-4 text-red-400 hover:text-red-300 underline"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* Create Form */}
          {connected && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30"
            >
              {/* Quiz Name */}
              <div className="mb-8 pb-6 border-b border-gray-700">
                <label className="block text-xl font-bold mb-3 text-cyan-400">
                  Quiz Name
                </label>
                <input
                  type="text"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                  placeholder="e.g., Solana Basics Quiz"
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  disabled={creating}
                />
              </div>

              {/* Questions */}
              <div className="space-y-6 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-cyan-400">
                    Questions ({questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    disabled={creating}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus /> Add Question
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {questions.map((question, qIndex) => (
                    <motion.div
                      key={qIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 relative"
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-purple-400">
                          Question {qIndex + 1}
                        </h4>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            disabled={creating}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaTrash className="text-sm" /> Remove
                          </button>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2 text-gray-300">
                          Question Text
                        </label>
                        <textarea
                          value={question.questionText}
                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                          placeholder="Enter your question here..."
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
                          rows={2}
                          disabled={creating}
                        />
                      </div>

                      {/* Options */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2 text-gray-300">
                          Answer Options
                        </label>
                        <div className="space-y-2">
                          {['A', 'B', 'C', 'D'].map((letter, cIndex) => (
                            <div key={letter} className="flex items-center gap-2">
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-cyan-500/20 rounded font-bold text-cyan-400 text-sm">
                                {letter}
                              </div>
                              <input
                                type="text"
                                value={question.choices[cIndex]}
                                onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                                placeholder={`Option ${letter}`}
                                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none text-sm"
                                disabled={creating}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Answer & Reward */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Correct Answer
                          </label>
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => updateCorrectAnswer(qIndex, e.target.value as "A" | "B" | "C" | "D")}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none text-sm"
                            disabled={creating}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Reward (SOL)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={question.rewardAmount}
                            onChange={(e) => updateRewardAmount(qIndex, parseFloat(e.target.value) || 0.01)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none text-sm"
                            disabled={creating}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Total Reward Summary */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Reward Pool:</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {getTotalReward().toFixed(2)} SOL
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {questions.length} question{questions.length > 1 ? 's' : ''} • 
                  Average {(getTotalReward() / questions.length).toFixed(2)} SOL per question
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg
                  transition-all duration-300
                  ${creating
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg hover:shadow-cyan-500/50'
                  }
                `}
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Quiz Set...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaPlus />
                    Create Quiz Set
                  </span>
                )}
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>

      <Footer />
    </PageWrapper>
  );
}
