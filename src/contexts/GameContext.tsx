'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GameSession, Question, PlayerAnswer, GameScore } from '@/lib/supabase';

interface GameContextType {
  session: GameSession | null;
  currentQuestion: Question | null;
  players: GameScore[];
  answers: PlayerAnswer[];
  isHost: boolean;
  joinGame: (sessionId: string) => Promise<void>;
  startGame: () => Promise<void>;
  submitAnswer: (answer: number) => Promise<void>;
  nextQuestion: () => Promise<void>;
  endGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [players, setPlayers] = useState<GameScore[]>([]);
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!session?.id) return;

    // Subscribe to game session changes
    const sessionSub = supabase
      .from(`game_sessions:id=eq.${session.id}`)
      .on('*', (payload: any) => {
        setSession(payload.new as GameSession);
      })
      .subscribe();

    // Subscribe to player scores
    const scoresSub = supabase
      .from(`game_scores:session_id=eq.${session.id}`)
      .on('*', (payload: any) => {
        setPlayers((current) => {
          const updated = [...current];
          const index = updated.findIndex((p) => p.id === payload.new.id);
          if (index >= 0) {
            updated[index] = payload.new as GameScore;
          } else {
            updated.push(payload.new as GameScore);
          }
          return updated;
        });
      })
      .subscribe();

    // Subscribe to player answers
    const answersSub = supabase
      .from(`player_answers:session_id=eq.${session.id}`)
      .on('*', (payload: any) => {
        setAnswers((current) => [...current, payload.new as PlayerAnswer]);
      })
      .subscribe();

    return () => {
      sessionSub.unsubscribe();
      scoresSub.unsubscribe();
      answersSub.unsubscribe();
    };
  }, [session?.id]);

  const joinGame = async (sessionId: string) => {
    const { data: gameSession } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (gameSession) {
      setSession(gameSession);
      router.push(`/game/${sessionId}`);
    }
  };

  const startGame = async () => {
    if (!session?.id || !isHost) return;

    await supabase
      .from('game_sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', session.id);
  };

  const submitAnswer = async (answer: number) => {
    if (!session?.id || !currentQuestion) return;

    const startTime = new Date(session.started_at || '');
    const responseTime = (new Date().getTime() - startTime.getTime()) / 1000;

    await supabase.from('player_answers').insert({
      session_id: session.id,
      question_id: currentQuestion.id,
      selected_option: answer,
      response_time: responseTime,
    });
  };

  const nextQuestion = async () => {
    if (!session?.id || !isHost) return;

    const { data: nextQ } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', session.quiz_id)
      .eq('order', session.current_question + 1)
      .single();

    if (nextQ) {
      setCurrentQuestion(nextQ);
      await supabase
        .from('game_sessions')
        .update({ current_question: session.current_question + 1 })
        .eq('id', session.id);
    } else {
      await endGame();
    }
  };

  const endGame = async () => {
    if (!session?.id || !isHost) return;

    await supabase
      .from('game_sessions')
      .update({ 
        status: 'finished',
        ended_at: new Date().toISOString()
      })
      .eq('id', session.id);

    router.push(`/game/${session.id}/results`);
  };

  return (
    <GameContext.Provider
      value={{
        session,
        currentQuestion,
        players,
        answers,
        isHost,
        joinGame,
        startGame,
        submitAnswer,
        nextQuestion,
        endGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 