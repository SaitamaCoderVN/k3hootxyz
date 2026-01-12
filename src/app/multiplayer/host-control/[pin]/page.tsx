'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaClock, FaUsers, FaArrowRight, FaTrophy, FaCheck } from 'react-icons/fa';
import { supabase } from '@/lib/supabase-client';
import type { GameSession, GamePhase, Question } from '@/types/multiplayer';
import { GAME_TIMING, ANSWER_COLORS } from '@/types/multiplayer';

export default function HostControlPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;

  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<GameSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [advancing, setAdvancing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch session & questions
  useEffect(() => {
    if (!pin) return;

    const fetchData = async () => {
      // Try reconnection first if host token exists
      const hostToken = localStorage.getItem(`host_token_${pin}`);
      if (hostToken) {
        try {
          const reconnectRes = await fetch('/api/game/reconnect-host', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostToken, pin })
          });

          const reconnectData = await reconnectRes.json();
          if (reconnectData.canReconnect) {
            setSession(reconnectData.session as GameSession);
            setParticipants(reconnectData.participants || []);

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
            return; // Reconnection successful
          }
        } catch (err) {
          console.error('Reconnection failed:', err);
        }
      }

      // Fallback: Get session normally
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('pin', pin)
        .single();

      if (sessionData) {
        setSession(sessionData as GameSession);

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

        // Get participants count
        const { data: participantsData } = await supabase
          .from('game_participants')
          .select('*')
          .eq('session_id', sessionData.id);

        if (participantsData) {
          setParticipants(participantsData);
        }
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`host-${pin}`)
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

          if (updated.current_question_index !== null) {
            const nextQ = questions[updated.current_question_index];
            setCurrentQuestion(nextQ);
          }

          // Reset timer when new question starts
          if (updated.game_phase === 'question') {
            setTimeLeft(20);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
        },
        () => {
          // Refresh participants count when any change happens
          // This ensures we catch INSERT, UPDATE, and DELETE events reliably
          if (session?.id) {
            supabase
              .from('game_participants')
              .select('*')
              .eq('session_id', session.id)
              .then(({ data }) => {
                if (data) setParticipants(data);
              });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [pin, session?.id, questions]);

  // Timer countdown
  useEffect(() => {
    if (session?.game_phase !== 'question' || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, session?.game_phase]);

  const handleAdvancePhase = async (targetPhase?: GamePhase) => {
    if (!session) return;

    setAdvancing(true);
    try {
      await fetch('/api/game/advance-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          targetPhase,
        }),
      });
    } catch (error) {
      console.error('Error advancing phase:', error);
    } finally {
      setAdvancing(false);
    }
  };

  const getPhaseButton = () => {
    if (!session) return null;

    const phase = session.game_phase;

    switch (phase) {
      case 'lobby':
        return (
          <NeonButton
            onClick={() => handleAdvancePhase('question')}
            loading={advancing}
            neonColor="orange"
            size="lg"
            fullWidth
            leftIcon={<FaArrowRight />}
          >
            Start Game
          </NeonButton>
        );

      case 'question':
        return (
          <NeonButton
            onClick={() => handleAdvancePhase('answer_reveal')}
            loading={advancing}
            neonColor="purple"
            size="lg"
            fullWidth
            leftIcon={<FaCheck />}
          >
            Show Answer ({timeLeft}s)
          </NeonButton>
        );

      case 'answer_reveal':
        return (
          <NeonButton
            onClick={() => handleAdvancePhase('leaderboard')}
            loading={advancing}
            neonColor="orange"
            size="lg"
            fullWidth
            leftIcon={<FaTrophy />}
          >
            Show Leaderboard
          </NeonButton>
        );

      case 'leaderboard':
        const isLastQuestion = (session.current_question_index ?? 0) >= questions.length - 1;
        return (
          <NeonButton
            onClick={() => handleAdvancePhase()}
            loading={advancing}
            neonColor={isLastQuestion ? 'purple' : 'orange'}
            size="lg"
            fullWidth
            leftIcon={isLastQuestion ? <FaTrophy /> : <FaArrowRight />}
          >
            {isLastQuestion ? 'Show Final Results' : 'Next Question'}
          </NeonButton>
        );

      case 'finished':
        return (
          <NeonButton
            onClick={() => router.push('/play')}
            variant="secondary"
            neonColor="purple"
            size="lg"
            fullWidth
          >
            Back to Play
          </NeonButton>
        );
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

  const answersSubmitted = session.answers_submitted ?? 0;
  const totalPlayers = participants.length;
  const currentIndex = (session.current_question_index ?? 0) + 1;

  return (
    <PageTemplate
      title={`Host Control - PIN: ${pin}`}
      subtitle={`Question ${currentIndex}/${questions.length}`}
    >
      <div className="max-w-6xl mx-auto pt-8 pb-24 space-y-6">
        {/* Status Bar */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard variant="purple" size="sm">
            <div className="text-center">
              <FaUsers className="text-3xl mx-auto mb-2" style={{ color: colors.primary.purple[400] }} />
              <Typography variant="h4" color={colors.primary.purple[400]}>
                {totalPlayers}
              </Typography>
              <Typography variant="body-sm" color={colors.text.muted}>
                Players
              </Typography>
            </div>
          </GlassCard>

          <GlassCard variant="orange" size="sm">
            <div className="text-center">
              <FaClock className="text-3xl mx-auto mb-2" style={{ color: colors.primary.orange[400] }} />
              <Typography variant="h4" color={colors.primary.orange[400]}>
                {session.game_phase === 'question' ? `${timeLeft}s` : '-'}
              </Typography>
              <Typography variant="body-sm" color={colors.text.muted}>
                Time Left
              </Typography>
            </div>
          </GlassCard>

          <GlassCard variant="pink" size="sm">
            <div className="text-center">
              <FaCheck className="text-3xl mx-auto mb-2" style={{ color: colors.primary.pink[400] }} />
              <Typography variant="h4" color={colors.primary.pink[400]}>
                {answersSubmitted}/{totalPlayers}
              </Typography>
              <Typography variant="body-sm" color={colors.text.muted}>
                Answered
              </Typography>
            </div>
          </GlassCard>
        </div>

        {/* Current Question */}
        {currentQuestion && session.game_phase !== 'lobby' && session.game_phase !== 'finished' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard variant="purple" size="xl">
                <div className="space-y-6">
                  <Typography variant="h2" className="text-center leading-relaxed">
                    {currentQuestion.question_text}
                  </Typography>

                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.choices.map((choice, index) => {
                      const letter = ['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D';
                      const answerColor = ANSWER_COLORS[letter];
                      const isCorrect = currentQuestion.correct_answer === letter;
                      const showAnswer = session.game_phase === 'answer_reveal' || session.game_phase === 'leaderboard';

                      return (
                        <div
                          key={index}
                          className="p-4 rounded-lg relative"
                          style={{
                            backgroundColor: answerColor.bg,
                            border: showAnswer && isCorrect ? '4px solid #4CAF50' : 'none',
                          }}
                        >
                          {showAnswer && isCorrect && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-2">
                              <span className="text-xl">✓</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold" style={{ color: answerColor.text }}>
                              {letter}
                            </span>
                            <p className="text-base font-bold" style={{ color: answerColor.text }}>
                              {choice}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Phase Control */}
        <div className="max-w-md mx-auto">
          {getPhaseButton()}
        </div>

        {/* Phase Indicator */}
        <div className="text-center">
          <Typography variant="body-sm" color={colors.text.muted}>
            Current Phase:{' '}
            <span style={{ color: colors.primary.purple[400] }} className="font-bold">
              {session.game_phase.toUpperCase()}
            </span>
          </Typography>
        </div>
      </div>
    </PageTemplate>
  );
}
