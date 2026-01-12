'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaClock, FaTrophy } from 'react-icons/fa';
import { supabase } from '@/lib/supabase-client';
import { AnswerButton } from '@/components/AnswerButton';

interface Question {
  id: string;
  question_text: string;
  choices: string[];
  correct_answer: string;
  question_index: number;
}

interface Participant {
  id: string;
  player_name: string;
  score: number;
}

export default function MultiplayerPlayPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const pin = params?.pin as string;
  const participantId = searchParams?.get('participantId');

  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch session & questions
  useEffect(() => {
    if (!pin) return;

    const fetchData = async () => {
      // Get session
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('pin', pin)
        .single();

      if (sessionData) {
        setSession(sessionData);

        // Get questions
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_set_id', sessionData.quiz_set_id)
          .order('question_index', { ascending: true });

        if (questionsData) {
          setQuestions(questionsData);
          if (sessionData.current_question_index !== null) {
            setCurrentQuestion(questionsData[sessionData.current_question_index]);
          }
        }
      }
    };

    fetchData();

    // Subscribe to session changes
    const channel = supabase
      .channel(`game-${pin}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `pin=eq.${pin}`
        },
        (payload) => {
          const updated = payload.new as any;
          setSession(updated);

          if (updated.status === 'finished') {
            router.push(`/multiplayer/results/${pin}?participantId=${participantId}`);
          } else if (updated.current_question_index !== null) {
            const nextQ = questions[updated.current_question_index];
            setCurrentQuestion(nextQ);
            setSelectedAnswer(null);
            setHasAnswered(false);
            setTimeLeft(20);
            setQuestionStartTime(Date.now());
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [pin, participantId, router, questions]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || hasAnswered || session?.status !== 'playing') return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, hasAnswered, session?.status]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !participantId || hasAnswered) return;

    setHasAnswered(true);

    try {
      await fetch('/api/game/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          questionIndex: currentQuestion.question_index,
          answer: selectedAnswer,
          answeredAt: Date.now(),
          correctAnswer: currentQuestion.correct_answer,
          questionStartTime,
        }),
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!mounted) return null;

  if (!session) {
    return (
      <PageTemplate title="Loading..." subtitle="Please wait">
        <div className="flex justify-center pt-12">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-4"
            style={{ borderColor: colors.primary.purple[400] }}
          />
        </div>
      </PageTemplate>
    );
  }

  if (session.status === 'lobby') {
    return (
      <PageTemplate title={`Game PIN: ${pin}`} subtitle="Waiting for host to start">
        <div className="max-w-md mx-auto pt-8">
          <GlassCard variant="purple" size="lg">
            <div className="text-center space-y-6">
              <div className="animate-pulse">
                <Typography variant="h2" gradient="purple-pink">
                  Get Ready!
                </Typography>
              </div>
              <Typography variant="body-lg" color={colors.text.secondary}>
                The game will start soon...
              </Typography>
            </div>
          </GlassCard>
        </div>
      </PageTemplate>
    );
  }

  if (!currentQuestion) {
    return (
      <PageTemplate title="Loading Question..." subtitle="Please wait">
        <div className="flex justify-center pt-12">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-4"
            style={{ borderColor: colors.primary.purple[400] }}
          />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Question ${(session.current_question_index || 0) + 1} of ${questions.length}`}
      subtitle={`Game PIN: ${pin}`}
    >
      <div className="max-w-3xl mx-auto pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div
            className="px-6 py-3 rounded-lg flex items-center gap-2"
            style={{
              background: `${colors.primary.orange[500]}20`,
              border: `1px solid ${colors.primary.orange[400]}40`
            }}
          >
            <FaClock style={{ color: colors.primary.orange[400] }} />
            <Typography variant="h4" color={colors.primary.orange[400]}>
              {timeLeft}s
            </Typography>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard variant="purple" size="lg">
              <div className="space-y-6">
                <Typography variant="h3" className="text-center leading-relaxed">
                  {currentQuestion.question_text}
                </Typography>

                <div className="space-y-3">
                  {currentQuestion.choices.map((choice, index) => (
                    <AnswerButton
                      key={index}
                      letter={["A", "B", "C", "D"][index] as "A" | "B" | "C" | "D"}
                      text={choice}
                      selected={selectedAnswer === ["A", "B", "C", "D"][index]}
                      onClick={() =>
                        !hasAnswered && setSelectedAnswer(["A", "B", "C", "D"][index] as "A" | "B" | "C" | "D")
                      }
                      disabled={hasAnswered}
                    />
                  ))}
                </div>

                <NeonButton
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer || hasAnswered}
                  loading={hasAnswered}
                  neonColor="purple"
                  size="lg"
                  fullWidth
                >
                  {hasAnswered ? 'Answer Submitted!' : 'Submit Answer'}
                </NeonButton>

                {hasAnswered && (
                  <Typography variant="body" color={colors.text.muted} className="text-center">
                    Waiting for next question...
                  </Typography>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTemplate>
  );
}
