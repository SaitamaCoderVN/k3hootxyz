'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, GlassCard, colors } from '@/design-system';

import { supabase } from '@/lib/supabase-client';
import { KahootAnswerButton } from '@/components/KahootAnswerButton';
import type { GameSession, GamePhase, Question } from '@/types/multiplayer';

const TerminalFooter = ({ phase, participantId }: { phase: string, participantId: string | null }) => (
  <div className="fixed bottom-0 left-0 right-0 py-4 sm:py-6 px-4 sm:px-12 border-t-4 border-black bg-white flex flex-col sm:flex-row justify-between items-center z-50 gap-4 sm:gap-0">
    <div className="flex items-center gap-4 sm:gap-8 overflow-hidden w-full sm:w-auto">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40">Live</Typography>
      </div>
      <Typography variant="body-xs" className="font-black uppercase tracking-widest truncate">Operator: {participantId?.slice(0, 8)}</Typography>
    </div>
    <Typography variant="body-xs" className="font-black uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
      Phase: <span className="text-red-500">{phase.replace('_', ' ')}</span>
    </Typography>
  </div>
);

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
      <PageTemplate title="Channel Sync" subtitle="Restoring Secure Connection">
        <div className="flex flex-col items-center justify-center pt-24 space-y-8">
          <div className="w-20 h-20 border-8 border-black border-t-transparent animate-spin" />
          <Typography variant="body" className="font-black uppercase tracking-[0.3em] animate-pulse">
            Syncing Ledger State...
          </Typography>
        </div>
      </PageTemplate>
    );
  }

  if (!session) {
    return (
      <PageTemplate title="Initialising" subtitle="Booting Session Parameters">
        <div className="flex justify-center pt-24">
          <div className="w-12 h-12 border-4 border-black border-dashed animate-spin" />
        </div>
      </PageTemplate>
    );
  }

  const phase = session.game_phase as GamePhase;

  // LOBBY PHASE
  if (phase === 'lobby') {
    return (
      <PageTemplate title={`Node: ${pin}`} subtitle="Awaiting Host Authorization">
        <div className="max-w-xl mx-auto pt-12 pb-32 px-4 space-y-12">
          <div className="border-8 border-black p-12 bg-white text-center shadow-[24px_24px_0px_#00000010]">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-black text-white font-black text-xs tracking-widest uppercase mb-4">
                Linked
              </div>
              <Typography variant="display-sm" className="font-black uppercase leading-tight">
                Stand By
              </Typography>
              <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 leading-relaxed flex items-center justify-center gap-2 flex-wrap">
                Verification sequence will initiate upon host command. Current Score: <span className="text-black break-all">{myScore}</span>
              </Typography>
            </div>
          </div>

          {/* Leave Room Button */}
          <div className="flex justify-center">
            <button
              onClick={handleLeaveRoom}
              disabled={leaving}
              className={`
                px-10 py-4 border-4 font-black uppercase tracking-widest transition-all
                ${leaving ? 'border-black/10 text-black/20' : 'border-black hover:bg-black hover:text-white'}
              `}
            >
              {leaving ? 'Severing...' : 'Sever Connection'}
            </button>
          </div>
        </div>
        <TerminalFooter phase={phase} participantId={participantId} />
      </PageTemplate>
    );
  }

  if (!currentQuestion) {
    return (
      <PageTemplate title="Fetching Data" subtitle="Loading Verification Unit">
        <div className="flex justify-center pt-24">
          <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin" />
        </div>
      </PageTemplate>
    );
  }

  const currentIndex = (session.current_question_index ?? 0) + 1;

  return (
    <PageTemplate
      title={`Inquiry ${currentIndex}/${questions.length}`}
      subtitle={`Session: ${pin} | Score: ${myScore}`}
    >
      <div className="max-w-5xl mx-auto pt-12 pb-40 px-4 space-y-12">
        {/* Timer Container */}
        {phase === 'question' && (
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`
                px-10 py-5 border-8 border-black bg-white flex items-center gap-6 shadow-[12px_12px_0px_#00000005]
                ${timeLeft <= 5 ? 'animate-pulse border-red-600 outline outline-4 outline-red-600' : ''}
              `}
            >
              <div className={`w-3 h-3 bg-black ${timeLeft <= 5 ? 'bg-red-600' : ''}`} />
              <Typography variant="display-sm" className={`font-black leading-none ${timeLeft <= 5 ? 'text-red-600' : ''}`}>
                {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </Typography>
            </motion.div>
          </div>
        )}

        {/* Question Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="border-8 border-black p-12 bg-white relative">
              <div className="absolute -top-6 left-12 px-4 py-2 bg-black text-white font-black text-[10px] tracking-[0.3em] uppercase">
                Enquiry
              </div>
              <Typography variant="h2" className="text-center font-black uppercase leading-tight tracking-tight">
                {currentQuestion.question_text}
              </Typography>
            </div>

            {/* Answer Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Interaction Layer */}
            <div className="flex flex-col items-center pt-8">
              {phase === 'question' && !hasAnswered && (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className={`
                    px-20 py-6 font-black uppercase tracking-[0.5em] transition-all border-8
                    ${selectedAnswer ? 'bg-black border-black text-white hover:scale-105 active:scale-95 shadow-[12px_12px_0px_#00000020]' : 'border-black/5 text-black/10 cursor-not-allowed'}
                  `}
                >
                  Confirm Execution
                </button>
              )}

              {hasAnswered && phase === 'question' && (
                <div className="flex items-center gap-4 px-12 py-6 border-4 border-black/10 animate-pulse">
                  <div className="w-3 h-3 bg-black/20" />
                  <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-20">
                    Inquiry Session Active
                    Awaiting Network Finality...
                  </Typography>
                </div>
              )}

              {/* Phase specific feedback */}
              {lastResult && phase === 'answer_reveal' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`
                    w-full max-w-2xl p-10 border-8 text-center
                    ${lastResult.isCorrect ? 'border-black bg-white' : 'border-black/20 bg-bone'}
                  `}
                >
                  <Typography
                    variant="h2"
                    className={`font-black uppercase mb-4 ${lastResult.isCorrect ? 'text-black' : 'opacity-20'}`}
                  >
                    {lastResult.isCorrect ? 'SUCCESS' : 'FAILED'}
                  </Typography>
                  <Typography variant="body-xs" className="font-black uppercase tracking-[0.3em] opacity-40">
                    {lastResult.isCorrect ? `Verification Node Secured: +${lastResult.points} PT` : 'Credential Mismatch Detected'}
                  </Typography>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Global Terminal Footer */}
        <TerminalFooter phase={phase} participantId={participantId} />
      </div>
    </PageTemplate>
  );
}
