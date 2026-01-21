'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { Clock, Users, ArrowRight, Trophy, Check } from 'lucide-react';
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


  if (!mounted) return null;

  if (!session) {
    return (
      <PageTemplate title="Channel Sync" subtitle="Restoring Secure Link">
        <div className="flex justify-center pt-24">
          <div className="w-12 h-12 border-4 border-black border-dashed animate-spin" />
        </div>
      </PageTemplate>
    );
  }

  const answersSubmitted = session.answers_submitted ?? 0;
  const totalPlayers = participants.length;
  const currentIndex = (session.current_question_index ?? 0) + 1;

  const getPhaseButton = () => {
    if (!session) return null;

    const phase = session.game_phase;

    switch (phase) {
      case 'lobby':
        return (
          <button
            onClick={() => handleAdvancePhase('question')}
            disabled={advancing}
            className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.4em] hover:scale-[1.02] shadow-[12px_12px_0px_#00000020] transition-all"
          >
            {advancing ? 'STARTING...' : 'INITIALISE SEQUENCE'}
          </button>
        );

      case 'question':
        return (
          <button
            onClick={() => handleAdvancePhase('answer_reveal')}
            disabled={advancing}
            className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.4em] hover:scale-[1.02] shadow-[12px_12px_0px_#00000020] transition-all border-4 border-white/20"
          >
            {advancing ? 'PROCESSING...' : `CLOSE WINDOW (${timeLeft}s)`}
          </button>
        );

      case 'answer_reveal':
        return (
          <button
            onClick={() => handleAdvancePhase('leaderboard')}
            disabled={advancing}
            className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.4em] hover:scale-[1.02] shadow-[12px_12px_0px_#00000020] transition-all"
          >
            {advancing ? 'SYNCING...' : 'REVEAL STANDINGS'}
          </button>
        );

      case 'leaderboard':
        const isLastQuestion = (session.current_question_index ?? 0) >= questions.length - 1;
        return (
          <button
            onClick={() => handleAdvancePhase()}
            disabled={advancing}
            className="w-full py-6 bg-black text-white font-black uppercase tracking-[0.4em] hover:scale-[1.02] shadow-[12px_12px_0px_#00000020] transition-all"
          >
            {advancing ? 'LOADING...' : isLastQuestion ? 'FINAL ANALYSIS' : 'NEXT SEQUENCE'}
          </button>
        );

      case 'finished':
        return (
          <button
            onClick={() => router.push('/play')}
            className="w-full py-6 border-4 border-black font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-[12px_12px_0px_#00000010]"
          >
            TERMINATE SESSION
          </button>
        );
    }
  };

  return (
    <PageTemplate
      title="Host Console"
      subtitle={`Arena: ${pin} | Unit ${currentIndex}/${questions.length}`}
    >
      <div className="max-w-6xl mx-auto pt-12 pb-40 px-4 space-y-12">
        {/* Status Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-4 border-black p-6 sm:p-8 bg-white shadow-[8px_8px_0px_#00000005]">
            <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mb-4">Operatives</Typography>
            <div className="flex items-center gap-4">
              <Users className="opacity-10" size={24} />
              <Typography variant="h3" className="font-black">{totalPlayers}</Typography>
            </div>
          </div>

          <div className="border-4 border-black p-6 sm:p-8 bg-white shadow-[8px_8px_0px_#00000005]">
            <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mb-4">Sync Window</Typography>
            <div className="flex items-center gap-4">
              <Clock className="opacity-10" size={24} />
              <Typography variant="h3" className="font-black">
                {session.game_phase === 'question' ? `${timeLeft}s` : '---'}
              </Typography>
            </div>
          </div>

          <div className="border-4 border-black p-6 sm:p-8 bg-black text-white shadow-[8px_8px_0px_#00000010]">
            <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mb-4 text-white">Responses</Typography>
            <div className="flex items-center gap-4">
              <Check className="opacity-20 text-white" size={24} />
              <Typography variant="h3" className="font-black text-white">{answersSubmitted}/{totalPlayers}</Typography>
            </div>
          </div>
        </div>

        {/* Current Data Plane */}
        {currentQuestion && session.game_phase !== 'lobby' && session.game_phase !== 'finished' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="border-8 border-black p-12 bg-white relative">
                <div className="absolute -top-6 left-12 px-4 py-2 bg-black text-white font-black text-[10px] tracking-[0.3em] uppercase">
                  Active Enquiry
                </div>
                <Typography variant="h2" className="text-center font-black uppercase leading-tight tracking-tight">
                  {currentQuestion.question_text}
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentQuestion.choices.map((choice, index) => {
                  const letter = ['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D';
                  const isCorrect = currentQuestion.correct_answer === letter;
                  const showAnswer = session.game_phase === 'answer_reveal' || session.game_phase === 'leaderboard';

                  return (
                    <div
                      key={index}
                      className={`
                        p-6 border-4 flex items-center justify-between transition-all
                        ${showAnswer && isCorrect ? 'border-black bg-black text-white' : 'border-black/5 bg-bone text-black/40'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 border-2 flex items-center justify-center font-black ${showAnswer && isCorrect ? 'border-white/20' : 'border-black/10'}`}>
                          {letter}
                        </div>
                        <Typography variant="body" className="font-black uppercase tracking-tight">
                          {choice}
                        </Typography>
                      </div>
                      {showAnswer && isCorrect && (
                        <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Command Interface */}
        <div className="max-w-xl mx-auto pt-12 space-y-8">
          <div className="border-t-4 border-black pt-8 text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-20 mb-4">
            Command Override
          </div>
          {getPhaseButton()}
          
          <div className="text-center pt-8">
            <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40">
              Protocol State: <span className="opacity-100 text-black underline underline-offset-4">{session.game_phase.replace('_', ' ')}</span>
            </Typography>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
