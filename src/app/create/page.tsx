'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSimpleQuiz } from '@/hooks/useSimpleQuiz';
import { QuizSetCreationData, QuestionCreationData } from '@/types/quiz';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { FaRocket, FaPlus, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { Typography, NeonButton, GlassCard, colors, Input, spacing } from '@/design-system';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

const WebGLBackground = dynamic(() => import('@/components/animations/WebGLBackground').then(mod => mod.WebGLBackground), {
  ssr: false,
});

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

  const addQuestion = () => {
    setQuestions([...questions, { ...defaultQuestion }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].choices[choiceIndex] = value;
    setQuestions(updated);
  };

  const updateCorrectAnswer = (index: number, answer: "A" | "B" | "C" | "D") => {
    const updated = [...questions];
    updated[index].correctAnswer = answer;
    setQuestions(updated);
  };

  const updateRewardAmount = (index: number, amount: number) => {
    const updated = [...questions];
    updated[index].rewardAmount = amount;
    setQuestions(updated);
  };

  const getTotalReward = () => {
    return questions.reduce((sum, q) => sum + q.rewardAmount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(false);

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

    const quizSetData: QuizSetCreationData = {
      name: quizName,
      questions: questions
    };

    const success = await createQuizSet(quizSetData);
    
    if (success) {
      setSuccessMessage(true);
      setQuizName('');
      setQuestions([{ ...defaultQuestion }]);

      setTimeout(() => {
        router.push('/play');
      }, 2000);
    }
  };

  if (!mounted) return null;

  return (
    <PageWrapper minHeight="screen" className="bg-black text-white overflow-hidden">
      <WebGLBackground />
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <Typography variant="display-lg" gradient="purple-pink" className="mb-4">
              Create Quiz Set
            </Typography>
            <Typography variant="body-xl" color={colors.text.secondary} className="max-w-2xl mx-auto">
              Design your quiz with multiple questions and custom rewards!
            </Typography>
          </div>

          {!connected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 text-center"
            >
              <GlassCard variant="purple" size="md" hover={false}>
                <FaRocket className="text-6xl mx-auto mb-4" style={{ color: colors.primary.purple[400] }} />
                <Typography variant="h3" className="mb-4">Connect Your Wallet</Typography>
                <Typography variant="body" color={colors.text.secondary} className="mb-6">
                  Connect your Solana wallet to create quizzes
                </Typography>
                <div className="flex justify-center">
                  <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-purple-500 !text-white !font-bold !px-8 !py-4 !rounded-xl" />
                </div>
              </GlassCard>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <GlassCard variant="default" hover={false}>
                <FaCheckCircle className="text-5xl mx-auto mb-4" style={{ color: colors.state.success }} />
                <Typography variant="h3" color={colors.state.success} className="mb-2">Quiz Created Successfully!</Typography>
                <Typography variant="body" color={colors.state.success}>Redirecting to quiz list...</Typography>
              </GlassCard>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <GlassCard variant="default" hover={false}>
                <Typography variant="body" color={colors.state.error} className="mb-4">{error}</Typography>
                <NeonButton
                  variant="ghost"
                  neonColor="orange"
                  size="sm"
                  onClick={clearError}
                >
                  Dismiss
                </NeonButton>
              </GlassCard>
            </motion.div>
          )}

          {connected && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard variant="purple" size="lg" hover={false}>
                <div className="mb-8 pb-6" style={{ borderBottom: `1px solid ${colors.semantic.border}` }}>
                  <Typography variant="h4" gradient="purple" className="mb-3">
                    Quiz Name
                  </Typography>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="e.g., Solana Basics Quiz"
                    className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                    disabled={creating}
                    style={{ fontFamily: 'var(--font-space)' }}
                  />
                </div>

                <div className="space-y-6 mb-6">
                  <div className="flex items-center justify-between">
                    <Typography variant="h4" gradient="purple">
                      Questions ({questions.length})
                    </Typography>
                    <NeonButton
                      type="button"
                      onClick={addQuestion}
                      disabled={creating}
                      variant="secondary"
                      neonColor="purple"
                      size="sm"
                      leftIcon={<FaPlus />}
                    >
                      Add Question
                    </NeonButton>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {questions.map((question, qIndex) => (
                      <motion.div
                        key={qIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <GlassCard variant="default" size="md" hover={false}>
                          <div className="flex items-center justify-between mb-4">
                            <Typography variant="h5" gradient="pink">
                              Question {qIndex + 1}
                            </Typography>
                            {questions.length > 1 && (
                              <NeonButton
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                disabled={creating}
                                variant="ghost"
                                neonColor="pink"
                                size="sm"
                                leftIcon={<FaTrash className="text-sm" />}
                              >
                                Remove
                              </NeonButton>
                            )}
                          </div>

                          <div className="mb-4">
                            <Typography variant="body-sm" color={colors.text.secondary} className="mb-2">
                              Question Text
                            </Typography>
                            <textarea
                              value={question.questionText}
                              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                              placeholder="Enter your question here..."
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
                              rows={2}
                              disabled={creating}
                              style={{ fontFamily: 'var(--font-space)' }}
                            />
                          </div>

                          <div className="mb-4">
                            <Typography variant="body-sm" color={colors.text.secondary} className="mb-2">
                              Answer Options
                            </Typography>
                            <div className="space-y-2">
                              {['A', 'B', 'C', 'D'].map((letter, cIndex) => (
                                <div key={letter} className="flex items-center gap-2">
                                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                                       style={{ background: `${colors.primary.purple[500]}33`, color: colors.primary.purple[400] }}>
                                    {letter}
                                  </div>
                                  <input
                                    type="text"
                                    value={question.choices[cIndex]}
                                    onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                                    placeholder={`Option ${letter}`}
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none text-sm"
                                    disabled={creating}
                                    style={{ fontFamily: 'var(--font-space)' }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Typography variant="body-sm" color={colors.text.secondary} className="mb-2">
                                Correct Answer
                              </Typography>
                              <select
                                value={question.correctAnswer}
                                onChange={(e) => updateCorrectAnswer(qIndex, e.target.value as "A" | "B" | "C" | "D")}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none text-sm"
                                disabled={creating}
                                style={{ fontFamily: 'var(--font-space)' }}
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                            <div>
                              <Typography variant="body-sm" color={colors.text.secondary} className="mb-2">
                                Reward (SOL)
                              </Typography>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={question.rewardAmount}
                                onChange={(e) => updateRewardAmount(qIndex, parseFloat(e.target.value) || 0.01)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none text-sm"
                                disabled={creating}
                                style={{ fontFamily: 'var(--font-space)' }}
                              />
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="rounded-xl p-4 mb-6" style={{ background: `${colors.primary.purple[500]}20`, border: `1px solid ${colors.primary.purple[500]}30` }}>
                  <div className="flex items-center justify-between">
                    <Typography variant="body" color={colors.text.secondary}>Total Reward Pool:</Typography>
                    <Typography variant="h3" gradient="purple">
                      {getTotalReward().toFixed(2)} SOL
                    </Typography>
                  </div>
                  <Typography variant="body-xs" color={colors.text.muted} className="mt-2">
                    {questions.length} question{questions.length > 1 ? 's' : ''} • 
                    Average {(getTotalReward() / questions.length).toFixed(2)} SOL per question
                  </Typography>
                </div>

                <NeonButton
                  type="submit"
                  disabled={creating}
                  variant="primary"
                  neonColor="purple"
                  size="xl"
                  fullWidth
                  loading={creating}
                  leftIcon={!creating ? <FaPlus /> : undefined}
                >
                  {creating ? 'Creating Quiz Set...' : 'Create Quiz Set'}
                </NeonButton>
              </GlassCard>
            </motion.form>
          )}
        </motion.div>
      </div>

      <Footer />
    </PageWrapper>
  );
}