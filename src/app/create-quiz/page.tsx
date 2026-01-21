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

  return (
    <PageTemplate
      title="Protocol Designer"
      subtitle="Architect New Verification Sequences"
    >
      <div className="max-w-5xl mx-auto pt-12 pb-32 px-4 space-y-12">
        {!connected ? (
          <div className="max-w-2xl mx-auto border-4 border-black p-12 bg-white text-center">
            <Typography variant="h3" className="font-black uppercase mb-6">
              Authentication Required
            </Typography>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <>
            {/* Header Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="border-4 border-black p-8 bg-white">
                  <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mb-6">
                    Project Manifest
                  </Typography>
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-2 font-black uppercase text-[10px] tracking-widest">Protocol Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="ENTER PROTOCOL NAME"
                        className="w-full bg-bone border-2 border-black p-4 font-black uppercase tracking-tight focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all outline-none"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-black uppercase text-[10px] tracking-widest">Protocol Brief (Optional)</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="DEFINE SCOPE OF VERIFICATION"
                        className="w-full bg-bone border-2 border-black p-4 font-black uppercase tracking-tight focus:bg-white focus:shadow-[4px_4px_0px_#000000] transition-all outline-none resize-none"
                        rows={3}
                        maxLength={300}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="border-4 border-black p-8 bg-black text-white">
                  <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-50 mb-6 text-white">
                    Liquidity Allocation
                  </Typography>
                  <div>
                    <label className="block mb-2 font-black uppercase text-[10px] tracking-widest opacity-60">Reward Pool (SOL)</label>
                    <input
                      type="number"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      placeholder="0.1"
                      step="0.01"
                      min="0"
                      className="w-full bg-white/5 border-2 border-white/20 p-4 font-black text-white focus:border-white focus:bg-white/10 outline-none transition-all"
                    />
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <Typography variant="body-xs" className="font-bold opacity-40 leading-relaxed uppercase">
                      Assets will be locked in the protocol vault until successful verification.
                    </Typography>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating || questions.length < 3}
                  className={`
                    w-full py-6 font-black uppercase tracking-[0.3em] transition-all
                    ${questions.length < 3 ? 'bg-bone border-4 border-black/10 text-black/20 cursor-not-allowed' : 'bg-black text-white hover:scale-[1.02] active:scale-95 shadow-[8px_8px_0px_#00000020]'}
                  `}
                >
                  {creating ? 'DEPLOYING...' : 'INITIATE DEPLOY'}
                </button>
              </div>
            </div>

            {/* Questions Management */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b-4 border-black pb-6">
                <div>
                  <Typography variant="h3" className="font-black uppercase leading-none">
                    Sequence Nodes
                  </Typography>
                  <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mt-2">
                    {questions.length} / 20 Loaded
                  </Typography>
                </div>
                <button
                  onClick={addQuestion}
                  disabled={questions.length >= 20}
                  className="px-6 py-3 border-4 border-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-3"
                >
                  <FaPlus size={12} /> Add Node
                </button>
              </div>

              <div className="space-y-8">
                <AnimatePresence>
                  {questions.map((q, qIndex) => (
                    <motion.div
                      key={qIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border-4 border-black p-8 bg-white hover:shadow-[12px_12px_0px_#00000005] transition-all"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-xl">
                            {qIndex + 1}
                          </div>
                          <Typography variant="h4" className="font-black uppercase">
                            Sequence Unit
                          </Typography>
                        </div>
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="p-3 border-2 border-black/10 text-black/20 hover:border-red-600 hover:text-red-600 transition-all"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div>
                            <label className="block mb-2 font-black uppercase text-[10px] tracking-widest">Question Payload *</label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              placeholder="DEFINE ENQUIRY"
                              className="w-full bg-bone border-2 border-black p-4 font-black uppercase focus:bg-white outline-none"
                              maxLength={200}
                            />
                          </div>
                          <div>
                            <label className="block mb-2 font-black uppercase text-[10px] tracking-widest">Verification Window (Seconds)</label>
                            <input
                              type="number"
                              value={q.timeLimit}
                              onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value) || 30)}
                              min="5"
                              max="120"
                              className="w-full bg-bone border-2 border-black p-4 font-black focus:bg-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <label className="block mb-2 font-black uppercase text-[10px] tracking-widest">Correct Input Branch *</label>
                          <div className="grid grid-cols-1 gap-3">
                            {q.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className={`flex items-center gap-4 p-2 border-2 transition-all ${q.correctAnswer === optIndex ? 'border-black bg-black/5' : 'border-black/5'}`}
                              >
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={q.correctAnswer === optIndex}
                                  onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                                  className="w-5 h-5 accent-black ml-2"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                  placeholder={`BRANCH ${String.fromCharCode(65 + optIndex)}`}
                                  className="flex-1 bg-transparent p-2 font-black uppercase outline-none"
                                  maxLength={100}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Global Error Context */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 border-4 border-red-600 font-black uppercase tracking-widest shadow-2xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </PageTemplate>
  );
}
