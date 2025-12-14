'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, NeonButton, GlassCard } from '@/design-system';
import { FaClock, FaTrophy } from 'react-icons/fa';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { supabase } from '@/lib/supabase-client';
import type { GameSession, Question } from '@/types/quiz';

const QUESTION_TIME_SECONDS = 20;
const ANSWER_COLORS = {
  A: '#f97316',
  B: '#a855f7',
  C: '#ec4899',
  D: '#3b82f6',
};

export default function GamePlayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'player';
  const isHost = role === 'host';

  const [session, setSession] = useState<GameSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameData();
    subscribeToUpdates();
  }, [resolvedParams.sessionId]);

  useEffect(() => {
    if (!session || questions.length === 0) return;

    const questionIndex = session.currentQuestionIndex ?? 0;
    console.log('[GAME] useEffect triggered - index:', questionIndex, 'total:', questions.length, 'session:', session);
    
    // Check if game should end - should only end when index is BEYOND the last question
    if (questionIndex > questions.length - 1) {
      console.log('[GAME] No more questions, ending game');
      router.push(`/game/results/${resolvedParams.sessionId}?role=${role}`);
      return;
    }

    // Load current question
    const question = questions[questionIndex];
    console.log('[GAME] Loading question:', question);
    setCurrentQuestion(question);
    setTimeLeft(QUESTION_TIME_SECONDS);
    setHasAnswered(false);
    setSelectedAnswer(null);
  }, [session?.currentQuestionIndex, questions, router, resolvedParams.sessionId, role]);

  useEffect(() => {
    if (!currentQuestion || hasAnswered || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, hasAnswered, timeLeft]);

  const loadGameData = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', resolvedParams.sessionId)
        .single();

      if (sessionError) throw sessionError;
      
      // Map snake_case to camelCase
      const mappedSession = {
        ...sessionData,
        currentQuestionIndex: sessionData.current_question_index ?? 0,
      };
      
      // Fetch questions separately
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_set_id', sessionData.quiz_set_id)
        .order('question_index', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      // Map database columns to Question type
      const mappedQuestions = (questionsData || []).map((q: any) => ({
        id: q.id,
        text: q.question_text,
        options: q.choices || [],
        correctAnswer: q.correct_answer,
      }));
      
      console.log('[GAME] Loaded:', mappedQuestions.length, 'questions, current index:', mappedSession.currentQuestionIndex);
      
      // Set state in one batch to avoid multiple re-renders
      setQuestions(mappedQuestions);
      setSession(mappedSession as any);
    } catch (error) {
      console.error('Failed to load game:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`game_session_${resolvedParams.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${resolvedParams.sessionId}`,
        },
        (payload: any) => {
          if (payload.new) {
            // Map snake_case to camelCase
            const mappedSession = {
              ...payload.new,
              currentQuestionIndex: payload.new.current_question_index ?? 0,
            };
            setSession(mappedSession as any);
            
            if (payload.new.status === 'finished') {
              router.push(`/game/results/${resolvedParams.sessionId}?role=${role}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAnswerSelect = async (answer: string) => {
    if (hasAnswered || !currentQuestion) return;

    setSelectedAnswer(answer);
    setHasAnswered(true);

    const participantId = localStorage.getItem('participantId');
    if (!participantId) return;

    try {
      await fetch('/api/game/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          sessionId: resolvedParams.sessionId,
          questionIndex: session?.currentQuestionIndex,
          answer,
          timeToAnswer: QUESTION_TIME_SECONDS - timeLeft,
        }),
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNextQuestion = async () => {
    if (!session || !isHost) return;

    const nextIndex = session.currentQuestionIndex + 1;
    
    if (nextIndex > questions.length - 1) {
      // Game finished
      console.log('[GAME] Finishing game, next index:', nextIndex, 'total questions:', questions.length);
      await fetch('/api/game/update-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: resolvedParams.sessionId,
          status: 'finished',
          endedAt: new Date().toISOString(),
        }),
      });
      return;
    }

    // Move to next question
    console.log('[GAME] Moving to next question:', nextIndex);
    await fetch('/api/game/update-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: resolvedParams.sessionId,
        currentQuestionIndex: nextIndex,
      }),
    });
  };

  if (loading) {
    return (
      <PageWrapper minHeight="screen">
        <div className="flex items-center justify-center min-h-screen">
          <Typography variant="h3">Loading game...</Typography>
        </div>
      </PageWrapper>
    );
  }

  if (!currentQuestion) {
    return (
      <PageWrapper minHeight="screen">
        <div className="flex items-center justify-center min-h-screen">
          <Typography variant="h3">Game ending...</Typography>
        </div>
      </PageWrapper>
    );
  }

  const progressPercent = ((timeLeft / QUESTION_TIME_SECONDS) * 100);

  return (
    <PageWrapper minHeight="screen" className="bg-gradient-to-b from-black via-purple-950/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <FaTrophy className="text-orange-400 text-2xl" />
              <Typography variant="h5">
                Question {(session?.currentQuestionIndex || 0) + 1} of {questions.length}
              </Typography>
            </div>

            <div className="flex items-center gap-3">
              <FaClock className="text-orange-400 text-xl" />
              <Typography variant="h4" gradient={timeLeft <= 5 ? 'orange' : 'purple'}>
                {timeLeft}s
              </Typography>
            </div>
          </div>

          {/* Timer Bar */}
          <div className="h-2 bg-black/50 rounded-full mb-12 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-purple-500"
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Question */}
          {isHost && (
            <GlassCard variant="purple" size="xl" className="mb-8">
              <Typography variant="display-xs" className="text-center">
                {currentQuestion.text}
              </Typography>
            </GlassCard>
          )}

          {!isHost && (
            <GlassCard variant="purple" size="xl" className="mb-8">
              <Typography variant="h4" className="text-center text-purple-300">
                Select your answer below
              </Typography>
            </GlassCard>
          )}

          {/* Answers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {['A', 'B', 'C', 'D'].map((letter, index) => {
                const option = currentQuestion.options[index];
                if (!option) return null;

                const isSelected = selectedAnswer === letter;
                const isCorrect = hasAnswered && letter === currentQuestion.correctAnswer;
                const isWrong = hasAnswered && isSelected && letter !== currentQuestion.correctAnswer;

                return (
                  <motion.div
                    key={letter}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !hasAnswered && handleAnswerSelect(letter)}
                    className={`cursor-pointer ${hasAnswered ? 'pointer-events-none' : ''}`}
                  >
                    <div
                      className="p-8 rounded-2xl border-4 transition-all relative overflow-hidden"
                      style={{
                        backgroundColor: isSelected ? `${ANSWER_COLORS[letter as keyof typeof ANSWER_COLORS]}40` : '#ffffff08',
                        borderColor: isCorrect 
                          ? '#22c55e' 
                          : isWrong 
                          ? '#ef4444' 
                          : isSelected 
                          ? ANSWER_COLORS[letter as keyof typeof ANSWER_COLORS]
                          : '#ffffff20',
                        transform: isSelected && !hasAnswered ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isCorrect 
                          ? '0 0 30px rgba(34, 197, 94, 0.5)' 
                          : isSelected 
                          ? `0 0 30px ${ANSWER_COLORS[letter as keyof typeof ANSWER_COLORS]}80` 
                          : 'none',
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl"
                          style={{
                            backgroundColor: ANSWER_COLORS[letter as keyof typeof ANSWER_COLORS],
                          }}
                        >
                          {letter}
                        </div>
                        <Typography variant="h5" className="flex-1">
                          {option}
                        </Typography>
                      </div>

                      {isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 text-green-400 text-3xl"
                        >
                          ✓
                        </motion.div>
                      )}

                      {isWrong && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 text-red-400 text-3xl"
                        >
                          ✗
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Host Controls */}
          {isHost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <NeonButton
                size="xl"
                neonColor="orange"
                onClick={handleNextQuestion}
                disabled={timeLeft > 0}
              >
                Next Question
              </NeonButton>
            </motion.div>
          )}

          {!isHost && hasAnswered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <Typography variant="body" color="#a78bfa99">
                Waiting for next question...
              </Typography>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}