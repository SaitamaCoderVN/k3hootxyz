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
    if (questions.length >= 20) return;
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
      alert('Please enter a protocol name');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one node');
      return;
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
      title="Protocol Designer"
      subtitle="Architect New Verification Sequences"
    >
      <div className="max-w-5xl mx-auto pt-12 pb-32 px-4 space-y-12">
        {!connected && (
          <div className="max-w-2xl mx-auto border-4 border-black p-12 bg-white text-center">
            <Typography variant="h3" className="font-black uppercase mb-6">
              Authentication Required
            </Typography>
            <Typography variant="body" className="font-black uppercase tracking-widest opacity-40 mb-10 block">
              Connect wallet to access designer tools
            </Typography>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        )}

        {successMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bone/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="border-8 border-black p-16 bg-white text-center shadow-[24px_24px_0px_#00000020]"
            >
              <FaCheckCircle className="text-6xl mx-auto mb-8" />
              <Typography variant="h2" className="font-black uppercase mb-4">Deployment Successful</Typography>
              <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40">Syncing with Mainnet...</Typography>
            </motion.div>
          </div>
        )}

        {error && (
          <div className="border-4 border-black p-6 bg-black text-white flex justify-between items-center">
            <Typography variant="body" className="font-black uppercase">{error}</Typography>
            <button onClick={clearError} className="px-4 py-2 border border-white/20 hover:bg-white/10 font-black uppercase text-xs">Dismiss</button>
          </div>
        )}

        {connected && (
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* Global Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="border-4 border-black p-10 bg-white">
                  <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mb-8">Manifest Configuration</Typography>
                  <label className="block mb-3 font-black uppercase text-[10px] tracking-widest">Protocol Title *</label>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="ENTER PROTOCOL NAME"
                    className="w-full bg-bone border-2 border-black p-5 font-black uppercase tracking-tight focus:bg-white focus:shadow-[8px_8px_0px_#00000005] transition-all outline-none"
                    disabled={creating}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="border-4 border-black p-10 bg-black text-white shadow-[12px_12px_0px_#00000010]">
                  <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mb-8 text-white">Consolidated Returns</Typography>
                  <div className="flex justify-between items-end">
                    <Typography variant="display-sm" className="font-black text-white leading-none">{getTotalReward().toFixed(2)}</Typography>
                    <Typography variant="h4" className="font-black text-white opacity-40">SOL</Typography>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 flex justify-between">
                    <Typography variant="body-xs" className="font-black uppercase opacity-40 text-white leading-none">{questions.length} Nodes</Typography>
                    <Typography variant="body-xs" className="font-black uppercase opacity-40 text-white leading-none">Locked</Typography>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className={`
                    w-full py-8 font-black uppercase tracking-[0.4em] transition-all border-4
                    ${creating ? 'bg-bone text-black/20 border-black/5' : 'bg-black text-white border-black hover:scale-105 active:scale-95 shadow-[12px_12px_0px_#00000020]'}
                  `}
                >
                  {creating ? 'Simulating...' : 'Execute Deploy'}
                </button>
              </div>
            </div>

            {/* Questions Nodes */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b-4 border-black pb-8">
                <Typography variant="h3" className="font-black uppercase">Sequence Data</Typography>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={creating || questions.length >= 20}
                  className="px-8 py-4 border-4 border-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-4"
                >
                  <FaPlus /> Add Node
                </button>
              </div>

              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {questions.map((question, qIndex) => (
                    <motion.div
                      key={qIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="border-4 border-black p-10 bg-white relative hover:shadow-[16px_16px_0px_#00000005] transition-all"
                    >
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-2xl">
                            {qIndex + 1}
                          </div>
                          <Typography variant="h4" className="font-black uppercase tracking-tight">Data Unit</Typography>
                        </div>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            disabled={creating}
                            className="p-4 border-2 border-black/10 text-black/20 hover:border-red-600 hover:text-red-600 transition-all font-black uppercase text-xs"
                          >
                            Purge
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-8">
                          <div>
                            <label className="block mb-3 font-black uppercase text-[10px] tracking-widest">Enquiry Payload *</label>
                            <textarea
                              value={question.questionText}
                              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                              placeholder="DEFINE NODE PROBLEM"
                              className="w-full bg-bone border-2 border-black p-5 font-black uppercase tracking-tight focus:bg-white outline-none resize-none"
                              rows={3}
                              disabled={creating}
                            />
                          </div>
                          <div>
                            <label className="block mb-3 font-black uppercase text-[10px] tracking-widest">Allocation (SOL)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={question.rewardAmount}
                              onChange={(e) => updateRewardAmount(qIndex, parseFloat(e.target.value) || 0.01)}
                              className="w-full bg-bone border-2 border-black p-5 font-black focus:bg-white outline-none"
                              disabled={creating}
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <label className="block mb-3 font-black uppercase text-[10px] tracking-widest">Verification Branches *</label>
                          <div className="space-y-4">
                            {['A', 'B', 'C', 'D'].map((letter, cIndex) => (
                              <div key={letter} className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => updateCorrectAnswer(qIndex, letter as "A" | "B" | "C" | "D")}
                                  className={`w-12 h-12 border-2 flex items-center justify-center font-black transition-all ${question.correctAnswer === letter ? 'bg-black text-white border-black' : 'border-black/10 text-black/40 hover:border-black'}`}
                                >
                                  {letter}
                                </button>
                                <input
                                  type="text"
                                  value={question.choices[cIndex]}
                                  onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                                  placeholder={`BRANCH ${letter} CONTENT`}
                                  className="flex-1 bg-bone border-2 border-black p-4 font-black uppercase text-sm focus:bg-white outline-none"
                                  disabled={creating}
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
          </form>
        )}
      </div>
    </PageTemplate>
  );
}