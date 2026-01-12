'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { useSimpleQuiz } from '@/hooks/useSimpleQuiz';
import { QuizSetCreationData, QuestionCreationData } from '@/types/quiz';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations';
import { FaRocket, FaPlus, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { Typography, NeonButton, GlassCard, colors, Input, spacing } from '@/design-system';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

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
    <PageTemplate
      title="Create Quiz Set"
      subtitle="Design your quiz with multiple questions and custom rewards!"
      containerClassName="pb-16"
    >
      <div className="max-w-4xl mx-auto pt-8">
        {!connected && (
          <ScrollReveal type="scaleIn" delay={0.2} amount={40}>
            <div className="mb-12 text-center">
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
                <Typography variant="h3" gradient="purple-pink" className="mb-4">Connect Your Wallet</Typography>
                <Typography variant="body-lg" color={`${colors.primary.purple[300]}dd`} className="mb-8 leading-relaxed">
                  Connect your Solana wallet to create quizzes
                </Typography>
                <div className="flex justify-center">
                  <WalletMultiButton 
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary.purple[500]}, ${colors.primary.pink[500]})`,
                      color: colors.text.primary,
                      fontWeight: 700,
                      padding: '1rem 2rem',
                      borderRadius: '0.75rem',
                      transition: 'all 200ms',
                      boxShadow: `0 4px 20px ${colors.primary.purple[400]}40`,
                    }}
                  />
                </div>
              </GlassCard>
            </div>
          </ScrollReveal>
        )}

        {successMessage && (
          <ScrollReveal type="scaleIn" delay={0.1} amount={40}>
            <div className="mb-8 text-center">
              <GlassCard variant="orange" size="lg" hover={false} className="text-center">
                <div 
                  className="flex justify-center mb-6 p-6 rounded-2xl mx-auto w-fit"
                  style={{
                    background: `linear-gradient(135deg, ${colors.state.success}20, ${colors.state.success}10)`,
                    border: `1px solid ${colors.state.success}30`,
                  }}
                >
                  <FaCheckCircle style={{ fontSize: '4rem', color: colors.state.success, filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))' }} />
                </div>
                <Typography variant="h3" gradient="orange" className="mb-2">Quiz Created Successfully!</Typography>
                <Typography variant="body-lg" color={`${colors.primary.purple[300]}dd`}>Redirecting to quiz list...</Typography>
              </GlassCard>
            </div>
          </ScrollReveal>
        )}

        {error && (
          <ScrollReveal type="scaleIn" delay={0.1} amount={40}>
            <div className="mb-8 text-center">
              <GlassCard variant="default" size="lg" hover={false}>
                <Typography variant="h4" color={colors.state.error} className="mb-4">{error}</Typography>
                <NeonButton
                  variant="secondary"
                  neonColor="orange"
                  size="md"
                  onClick={clearError}
                >
                  Dismiss
                </NeonButton>
              </GlassCard>
            </div>
          </ScrollReveal>
        )}

        {connected && (
          <ScrollReveal type="fadeInUp" delay={0.3} amount={50}>
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard variant="purple" size="xl" hover={false}>
                <div className="mb-8 pb-8" style={{ borderBottom: `1px solid ${colors.semantic.border}60` }}>
                  <Typography variant="h4" gradient="purple-pink" className="mb-4">
                    Quiz Name
                  </Typography>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="e.g., Solana Basics Quiz"
                    className="w-full px-6 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                    disabled={creating}
                    style={{ 
                      fontFamily: 'var(--font-space)',
                      background: `${colors.background.glass}dd`,
                      border: `2px solid ${colors.primary.purple[400]}40`,
                      color: colors.text.primary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = `${colors.primary.purple[400]}80`;
                      e.target.style.boxShadow = `0 0 20px ${colors.primary.purple[400]}30`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${colors.primary.purple[400]}40`;
                      e.target.style.boxShadow = 'none';
                    }}
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
                        <GlassCard variant="default" size="lg" hover={true} className="mb-6">
                          <div className="flex items-center justify-between mb-6">
                            <Typography variant="h4" gradient="pink" className="mb-0">
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

                          <div className="mb-6">
                            <Typography variant="body-lg" color={`${colors.primary.purple[200]}dd`} className="mb-3 font-medium">
                              Question Text
                            </Typography>
                            <textarea
                              value={question.questionText}
                              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                              placeholder="Enter your question here..."
                              className="w-full px-6 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none resize-none transition-all duration-300"
                              rows={3}
                              disabled={creating}
                              style={{ 
                                fontFamily: 'var(--font-space)',
                                background: `${colors.background.glass}dd`,
                                border: `2px solid ${colors.primary.purple[400]}40`,
                                color: colors.text.primary,
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = `${colors.primary.purple[400]}80`;
                                e.target.style.boxShadow = `0 0 20px ${colors.primary.purple[400]}30`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = `${colors.primary.purple[400]}40`;
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </div>

                          <div className="mb-6">
                            <Typography variant="body-lg" color={`${colors.primary.purple[200]}dd`} className="mb-4 font-medium">
                              Answer Options
                            </Typography>
                            <div className="space-y-3">
                              {['A', 'B', 'C', 'D'].map((letter, cIndex) => {
                                const optionColors = {
                                  A: colors.primary.orange,
                                  B: colors.primary.purple,
                                  C: colors.primary.pink,
                                  D: colors.primary.purple,
                                };
                                const color = optionColors[letter as keyof typeof optionColors];
                                return (
                                  <div key={letter} className="flex items-center gap-3">
                                    <div 
                                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-base transition-all duration-300"
                                      style={{ 
                                        background: `linear-gradient(135deg, ${color[500]}40, ${color[400]}20)`,
                                        border: `1px solid ${color[400]}60`,
                                        color: color[300],
                                        boxShadow: `0 2px 10px ${color[400]}20`,
                                      }}
                                    >
                                      {letter}
                                    </div>
                                    <input
                                      type="text"
                                      value={question.choices[cIndex]}
                                      onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                                      placeholder={`Option ${letter}`}
                                      className="flex-1 px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                      disabled={creating}
                                      style={{ 
                                        fontFamily: 'var(--font-space)',
                                        background: `${colors.background.glass}dd`,
                                        border: `2px solid ${color[400]}40`,
                                        color: colors.text.primary,
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.borderColor = `${color[400]}80`;
                                        e.target.style.boxShadow = `0 0 15px ${color[400]}30`;
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.borderColor = `${color[400]}40`;
                                        e.target.style.boxShadow = 'none';
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Typography variant="body-lg" color={`${colors.primary.purple[200]}dd`} className="mb-3 font-medium">
                                Correct Answer
                              </Typography>
                              <select
                                value={question.correctAnswer}
                                onChange={(e) => updateCorrectAnswer(qIndex, e.target.value as "A" | "B" | "C" | "D")}
                                className="w-full px-6 py-4 rounded-xl text-white focus:outline-none transition-all duration-300"
                                disabled={creating}
                                style={{ 
                                  fontFamily: 'var(--font-space)',
                                  background: `${colors.background.glass}dd`,
                                  border: `2px solid ${colors.primary.purple[400]}40`,
                                  color: colors.text.primary,
                                  fontSize: '1rem',
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = `${colors.primary.purple[400]}80`;
                                  e.target.style.boxShadow = `0 0 20px ${colors.primary.purple[400]}30`;
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = `${colors.primary.purple[400]}40`;
                                  e.target.style.boxShadow = 'none';
                                }}
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                            <div>
                              <Typography variant="body-lg" color={`${colors.primary.purple[200]}dd`} className="mb-3 font-medium">
                                Reward (SOL)
                              </Typography>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={question.rewardAmount}
                                onChange={(e) => updateRewardAmount(qIndex, parseFloat(e.target.value) || 0.01)}
                                className="w-full px-6 py-4 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
                                disabled={creating}
                                placeholder="0.1"
                                style={{ 
                                  fontFamily: 'var(--font-space)',
                                  background: `${colors.background.glass}dd`,
                                  border: `2px solid ${colors.primary.orange[400]}40`,
                                  color: colors.text.primary,
                                  fontSize: '1rem',
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = `${colors.primary.orange[400]}80`;
                                  e.target.style.boxShadow = `0 0 20px ${colors.primary.orange[400]}30`;
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = `${colors.primary.orange[400]}40`;
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <GlassCard variant="orange" size="md" hover={false} className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Typography variant="h4" gradient="orange" className="mb-0">
                      Total Reward Pool
                    </Typography>
                    <Typography variant="display-sm" gradient="orange">
                      {getTotalReward().toFixed(2)} SOL
                    </Typography>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}cc`}>
                      {questions.length} question{questions.length > 1 ? 's' : ''}
                    </Typography>
                    <span style={{ color: `${colors.semantic.border}60` }}>•</span>
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}cc`}>
                      Avg {(getTotalReward() / questions.length).toFixed(2)} SOL/question
                    </Typography>
                  </div>
                </GlassCard>

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
          </ScrollReveal>
        )}
      </div>
    </PageTemplate>
  );
}