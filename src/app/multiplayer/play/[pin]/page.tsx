'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, GlassCard, colors } from '@/design-system';
import { FaClock, FaTrophy, FaCheck } from 'react-icons/fa';
import { supabase } from '@/lib/supabase-client';
import { KahootAnswerButton } from '@/components/KahootAnswerButton';
import type { GameSession, GamePhase, Question } from '@/types/multiplayer';

export default function MultiplayerPlayPageV2() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const pin = params?.pin as string;
  const urlParticipantId = searchParams?.get('participantId');

  const [mounted, setMounted] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(urlParticipantId);
  const [session, setSession] = useState<GameSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [myScore, setMyScore] = useState(0);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; points: number } | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch session & questions
  useEffect(() => {
    if (!pin) return;

    const fetchData = async () => {
      let activeParticipantId = urlParticipantId;

      // Try reconnection first if we don't have a participantId in URL
      if (!activeParticipantId) {
        const participantToken = localStorage.getItem(`participant_token_${pin}`);
        const storedParticipantId = localStorage.getItem(`participant_id_${pin}`);

        if (participantToken && storedParticipantId) {
          setReconnecting(true);
          try {
            const reconnectRes = await fetch('/api/game/reconnect-player', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ participantToken, pin })
            });

            const reconnectData = await reconnectRes.json();
            if (reconnectData.canReconnect) {
              activeParticipantId = reconnectData.participant.id;
              setParticipantId(activeParticipantId);
              setSession(reconnectData.session as GameSession);
              setMyScore(reconnectData.participant.score || 0);

              // Update URL with participant ID
              router.replace(`/multiplayer/play/${pin}?participantId=${activeParticipantId}`, { scroll: false });

              // Get questions
              const { data: questionsData } = await supabase
                .from('questions')
                .select('*')
                .eq('quiz_set_id', reconnectData.session.quiz_set_id)
                .order('question_index', { ascending: true });

              if (questionsData) {
                setQuestions(questionsData);
                if (reconnectData.session.current_question_index !== null) {
                  setCurrentQuestion(questionsData[reconnectData.session.current_question_index]);
                }
              }

              setReconnecting(false);
              return; // Reconnection successful
            }
          } catch (err) {
            console.error('Reconnection failed:', err);
            setReconnecting(false);
          }
        }

        // If no reconnection possible, redirect to join page
        if (!activeParticipantId) {
          router.push(`/multiplayer/join`);
          return;
        }
      } else {
        setParticipantId(activeParticipantId);
      }

      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('pin', pin)
        .single();

      if (sessionData) {
        setSession(sessionData as GameSession);

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

      // Get my current score
      if (activeParticipantId) {
        const { data: participant } = await supabase
          .from('game_participants')
          .select('score, answers')
          .eq('id', activeParticipantId)
          .single();

        if (participant) {
          setMyScore(participant.score);
          // Check if already answered current question
          const currentIndex = sessionData?.current_question_index || 0;
          const hasAnsweredCurrent = participant.answers?.some(
            (a: any) => a.questionIndex === currentIndex
          );
          setHasAnswered(hasAnsweredCurrent || false);
        }
      }
    };

    fetchData();

    // Subscribe to real-time session updates
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
          const updated = payload.new as GameSession;
          setSession(updated);

          // Handle phase changes
          if (updated.game_phase === 'question') {
            // New question started
            if (updated.current_question_index !== null) {
              const nextQ = questions[updated.current_question_index];
              setCurrentQuestion(nextQ);
              setSelectedAnswer(null);
              setHasAnswered(false);
              setTimeLeft(20);
              setQuestionStartTime(Date.now());
              setLastResult(null);
            }
          } else if (updated.game_phase === 'finished') {
            // Redirect to results
            router.push(`/multiplayer/results/${pin}?participantId=${participantId}`);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [pin, participantId, router, questions, urlParticipantId]);

  // Timer countdown (only during question phase)
  useEffect(() => {
    if (session?.game_phase !== 'question' || timeLeft <= 0 || hasAnswered) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, hasAnswered, session?.game_phase]);

  const handleLeaveRoom = async () => {
    if (!participantId || !session?.id) return;

    setLeaving(true);

    try {
      const res = await fetch('/api/game/leave-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          sessionId: session.id
        })
      });

      if (res.ok) {
        // Clear localStorage
        localStorage.removeItem(`participant_token_${pin}`);
        localStorage.removeItem(`participant_id_${pin}`);

        // Redirect to join page
        router.push('/multiplayer/join');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      setLeaving(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !participantId || hasAnswered) return;

    setHasAnswered(true);

    try {
      const res = await fetch('/api/game/submit-answer', {
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

      const data = await res.json();

      if (data.isCorrect !== undefined) {
        setLastResult({
          isCorrect: data.isCorrect,
          points: data.pointsEarned || 0,
        });
        setMyScore((prev) => prev + (data.pointsEarned || 0));
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!mounted) return null;

  if (reconnecting) {
    return (
      <PageTemplate title="Reconnecting..." subtitle="Restoring your game session">
        <div className="flex flex-col items-center justify-center pt-12 space-y-4">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-4"
            style={{ borderColor: colors.primary.purple[400] }}
          />
          <Typography variant="body" color={colors.text.secondary}>
            Please wait while we restore your progress...
          </Typography>
        </div>
      </PageTemplate>
    );
  }

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

  const phase = session.game_phase as GamePhase;

  // LOBBY PHASE
  if (phase === 'lobby') {
    return (
      <PageTemplate title={`Game PIN: ${pin}`} subtitle="Waiting for host to start">
        <div className="max-w-md mx-auto pt-8 pb-24 space-y-6">
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
              <div className="pt-4">
                <Typography variant="body-sm" color={colors.text.muted}>
                  Your current score: {myScore}
                </Typography>
              </div>
            </div>
          </GlassCard>

          {/* Leave Room Button */}
          <div className="flex justify-center">
            <button
              onClick={handleLeaveRoom}
              disabled={leaving}
              className="px-6 py-3 rounded-lg transition-all"
              style={{
                background: leaving ? `${colors.text.muted}40` : `${colors.state.error}20`,
                border: `2px solid ${leaving ? colors.text.muted : colors.state.error}`,
                color: leaving ? colors.text.muted : colors.state.error,
                cursor: leaving ? 'not-allowed' : 'pointer',
                opacity: leaving ? 0.5 : 1
              }}
            >
              <Typography variant="body" color={leaving ? colors.text.muted : colors.state.error}>
                {leaving ? 'Leaving...' : 'Leave Room'}
              </Typography>
            </button>
          </div>
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

  const currentIndex = (session.current_question_index ?? 0) + 1;

  return (
    <PageTemplate
      title={`Question ${currentIndex}/${questions.length}`}
      subtitle={`PIN: ${pin} | Score: ${myScore}`}
    >
      <div className="max-w-4xl mx-auto pt-8 pb-24 space-y-6">
        {/* Timer (only show during question phase) */}
        {phase === 'question' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center"
          >
            <div
              className="px-8 py-4 rounded-2xl flex items-center gap-3"
              style={{
                background: `${colors.primary.orange[500]}30`,
                border: `2px solid ${colors.primary.orange[400]}`,
              }}
            >
              <FaClock className="text-3xl" style={{ color: colors.primary.orange[400] }} />
              <Typography variant="display-sm" color={colors.primary.orange[400]}>
                {timeLeft}
              </Typography>
            </div>
          </motion.div>
        )}

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard variant="purple" size="xl">
              <Typography variant="h2" className="text-center leading-relaxed mb-8">
                {currentQuestion.question_text}
              </Typography>

              {/* Answer buttons (Kahoot style) */}
              <div className="space-y-4">
                {currentQuestion.choices.map((choice, index) => {
                  const letter = ['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D';
                  const showAnswer = phase === 'answer_reveal' || phase === 'leaderboard';

                  return (
                    <KahootAnswerButton
                      key={index}
                      letter={letter}
                      text={choice}
                      selected={selectedAnswer === letter}
                      onClick={() => !hasAnswered && phase === 'question' && setSelectedAnswer(letter)}
                      disabled={hasAnswered || phase !== 'question'}
                      correctAnswer={showAnswer ? currentQuestion.correct_answer : undefined}
                      showIncorrect={showAnswer}
                    />
                  );
                })}
              </div>

              {/* Submit button (only during question phase) */}
              {phase === 'question' && !hasAnswered && (
                <motion.button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  whileHover={selectedAnswer ? { scale: 1.02 } : {}}
                  whileTap={selectedAnswer ? { scale: 0.98 } : {}}
                  className="mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all"
                  style={{
                    background: selectedAnswer
                      ? `linear-gradient(135deg, ${colors.primary.purple[500]}, ${colors.primary.pink[500]})`
                      : colors.background.secondary,
                    color: selectedAnswer ? colors.text.primary : colors.text.muted,
                    opacity: selectedAnswer ? 1 : 0.5,
                    cursor: selectedAnswer ? 'pointer' : 'not-allowed',
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <FaCheck />
                    Submit Answer
                  </span>
                </motion.button>
              )}

              {/* Waiting message after answer */}
              {hasAnswered && phase === 'question' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center"
                >
                  <Typography variant="body-lg" color={colors.text.muted}>
                    ⏳ Waiting for other players...
                  </Typography>
                </motion.div>
              )}

              {/* Answer result */}
              {lastResult && phase === 'answer_reveal' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-6 rounded-xl text-center"
                  style={{
                    background: lastResult.isCorrect
                      ? `${colors.state.success}20`
                      : `${colors.state.error}20`,
                    border: `2px solid ${lastResult.isCorrect ? colors.state.success : colors.state.error}`,
                  }}
                >
                  <div className="text-6xl mb-4">
                    {lastResult.isCorrect ? '🎉' : '😔'}
                  </div>
                  <Typography
                    variant="h3"
                    color={lastResult.isCorrect ? colors.state.success : colors.state.error}
                  >
                    {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
                  </Typography>
                  {lastResult.isCorrect && (
                    <Typography variant="h4" color={colors.primary.orange[400]} className="mt-2">
                      +{lastResult.points} points
                    </Typography>
                  )}
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Phase indicator */}
        <div className="text-center">
          <Typography variant="body-sm" color={colors.text.muted}>
            {phase === 'question' && 'Answer now!'}
            {phase === 'answer_reveal' && 'Revealing answer...'}
            {phase === 'leaderboard' && 'Check the leaderboard!'}
          </Typography>
        </div>
      </div>
    </PageTemplate>
  );
}
