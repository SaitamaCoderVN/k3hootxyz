'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaPlus, FaTrash, FaRocket, FaQuestionCircle } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

const EMPTY_QUESTION: QuizQuestion = {
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  timeLimit: 30,
};

export default function CreateQuizPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('0.1');
  const [questions, setQuestions] = useState<QuizQuestion[]>([{ ...EMPTY_QUESTION }]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addQuestion = () => {
    if (questions.length >= 20) {
      setError('Maximum 20 questions allowed per quiz');
      return;
    }
    setQuestions([...questions, { ...EMPTY_QUESTION }]);
    setError(null);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      setError('Quiz must have at least 1 question');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    setError(null);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const validateQuiz = (): string | null => {
    if (!title.trim()) return 'Quiz title is required';
    if (questions.length < 3) return 'Quiz must have at least 3 questions';
    if (questions.length > 20) return 'Quiz cannot have more than 20 questions';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1}: Question text is required`;

      const filledOptions = q.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) return `Question ${i + 1}: At least 2 options required`;

      if (!q.options[q.correctAnswer]?.trim()) return `Question ${i + 1}: Correct answer cannot be empty`;

      if (q.timeLimit < 5 || q.timeLimit > 120) return `Question ${i + 1}: Time limit must be between 5-120 seconds`;
    }

    const reward = parseFloat(rewardAmount);
    if (isNaN(reward) || reward < 0) return 'Invalid reward amount';

    return null;
  };

  const handleCreate = async () => {
    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    const validationError = validateQuiz();
    if (validationError) {
      setError(validationError);
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/quiz/create-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerWallet: publicKey.toString(),
          title,
          description,
          rewardAmount: parseFloat(rewardAmount),
          questions: questions.map(q => ({
            question: q.question,
            options: q.options.filter(opt => opt.trim()),
            correctAnswer: q.correctAnswer,
            timeLimit: q.timeLimit,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.quizSetId) {
        router.push(`/play?created=${data.quizSetId}`);
      } else {
        setError(data.error || 'Failed to create quiz set');
      }
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Network error - please try again');
    } finally {
      setCreating(false);
    }
  };

  if (!mounted) return null;

  if (!connected) {
    return (
      <PageTemplate
        title="Create Quiz Set"
        subtitle="Connect your wallet to create a quiz"
      >
        <div className="flex justify-center pt-8">
          <WalletMultiButton />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Create Quiz Set"
      subtitle="Build your multi-question quiz game"
    >
      <div className="max-w-4xl mx-auto pt-8 pb-24 space-y-6">
        {/* Quiz Info Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="purple" size="lg">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: `${colors.primary.purple[500]}20`,
                    border: `1px solid ${colors.primary.purple[400]}40`,
                  }}
                >
                  <FaQuestionCircle style={{ color: colors.primary.purple[400] }} size={24} />
                </div>
                <Typography variant="h3" color={colors.text.primary}>
                  Quiz Information
                </Typography>
              </div>

              <div>
                <label className="block mb-2">
                  <Typography variant="body" color={colors.text.secondary}>
                    Quiz Title *
                  </Typography>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Solana Blockchain Basics"
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: `${colors.background.secondary}80`,
                    border: `2px solid ${colors.primary.purple[500]}40`,
                    color: colors.text.primary,
                  }}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block mb-2">
                  <Typography variant="body" color={colors.text.secondary}>
                    Description (Optional)
                  </Typography>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your quiz..."
                  className="w-full px-4 py-3 rounded-lg resize-none"
                  style={{
                    background: `${colors.background.secondary}80`,
                    border: `2px solid ${colors.primary.purple[500]}40`,
                    color: colors.text.primary,
                  }}
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block mb-2">
                  <Typography variant="body" color={colors.text.secondary}>
                    Reward Amount (SOL)
                  </Typography>
                </label>
                <input
                  type="number"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="0.1"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    background: `${colors.background.secondary}80`,
                    border: `2px solid ${colors.primary.orange[500]}40`,
                    color: colors.text.primary,
                  }}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="h3" gradient="purple-pink">
              Questions ({questions.length}/20)
            </Typography>
            <NeonButton
              onClick={addQuestion}
              disabled={questions.length >= 20}
              neonColor="purple"
              size="sm"
              leftIcon={<FaPlus />}
            >
              Add Question
            </NeonButton>
          </div>

          <AnimatePresence>
            {questions.map((q, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: qIndex * 0.05 }}
              >
                <GlassCard variant="orange" size="lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Typography variant="h4" color={colors.text.primary}>
                        Question {qIndex + 1}
                      </Typography>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            background: `${colors.state.error}20`,
                            color: colors.state.error,
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2">
                        <Typography variant="body-sm" color={colors.text.secondary}>
                          Question Text *
                        </Typography>
                      </label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter your question..."
                        className="w-full px-4 py-3 rounded-lg"
                        style={{
                          background: `${colors.background.secondary}80`,
                          border: `2px solid ${colors.primary.orange[500]}40`,
                          color: colors.text.primary,
                        }}
                        maxLength={200}
                      />
                    </div>

                    <div>
                      <Typography variant="body-sm" color={colors.text.secondary} className="mb-2">
                        Answer Options *
                      </Typography>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === optIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                              className="w-4 h-4"
                              style={{ accentColor: colors.primary.purple[400] }}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              className="flex-1 px-3 py-2 rounded-lg"
                              style={{
                                background: `${colors.background.secondary}80`,
                                border: `2px solid ${q.correctAnswer === optIndex ? colors.primary.purple[400] : colors.primary.orange[500]}40`,
                                color: colors.text.primary,
                              }}
                              maxLength={100}
                            />
                          </div>
                        ))}
                      </div>
                      <Typography variant="body-sm" color={colors.text.muted} className="mt-1">
                        Select the radio button for the correct answer
                      </Typography>
                    </div>

                    <div>
                      <label className="block mb-2">
                        <Typography variant="body-sm" color={colors.text.secondary}>
                          Time Limit (seconds)
                        </Typography>
                      </label>
                      <input
                        type="number"
                        value={q.timeLimit}
                        onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value) || 30)}
                        min="5"
                        max="120"
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          background: `${colors.background.secondary}80`,
                          border: `2px solid ${colors.primary.orange[500]}40`,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg text-center"
            style={{
              background: `${colors.state.error}20`,
              border: `1px solid ${colors.state.error}40`,
            }}
          >
            <Typography variant="body" color={colors.state.error}>
              {error}
            </Typography>
          </motion.div>
        )}

        {/* Create Button */}
        <div className="sticky bottom-6 z-10">
          <GlassCard variant="purple" size="sm">
            <NeonButton
              onClick={handleCreate}
              loading={creating}
              disabled={questions.length < 3}
              neonColor="purple"
              size="lg"
              fullWidth
              leftIcon={<FaRocket />}
            >
              {questions.length < 3
                ? `Add ${3 - questions.length} More Question${3 - questions.length > 1 ? 's' : ''} (Min 3)`
                : `Create Quiz Set (${questions.length} Questions)`
              }
            </NeonButton>
          </GlassCard>
        </div>
      </div>
    </PageTemplate>
  );
}
