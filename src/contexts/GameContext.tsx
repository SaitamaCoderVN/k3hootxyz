'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supabase types removed - using simplified local types
interface GameSession {
  id: string;
  quizId: string;
  status: 'waiting' | 'active' | 'finished';
  players: string[];
  currentQuestion: number;
  startTime?: Date;
  endTime?: Date;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

interface PlayerAnswer {
  id: string;
  sessionId: string;
  playerId: string;
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  responseTime: number;
  timestamp: Date;
}

interface GameScore {
  id: string;
  sessionId: string;
  playerId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  averageResponseTime: number;
  rank: number;
}

interface GameContextType {
  currentSession: GameSession | null;
  currentQuestion: Question | null;
  playerAnswers: PlayerAnswer[];
  scores: GameScore[];
  joinGame: (quizId: string) => Promise<void>;
  submitAnswer: (questionId: string, answer: number) => Promise<void>;
  leaveGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswer[]>([]);
  const [scores, setScores] = useState<GameScore[]>([]);

  // Supabase subscriptions removed - using local state management
  useEffect(() => {
    // Local state management logic here
  }, []);

  const joinGame = async (quizId: string) => {
    try {
      // Create mock session - Supabase integration removed
      const mockSession: GameSession = {
        id: `session_${Date.now()}`,
        quizId,
        status: 'waiting',
        players: ['player1'],
        currentQuestion: 0
      };
      setCurrentSession(mockSession);
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  const submitAnswer = async (questionId: string, answer: number) => {
    try {
      // Mock answer submission - Supabase integration removed
      const mockAnswer: PlayerAnswer = {
        id: `answer_${Date.now()}`,
        sessionId: currentSession?.id || '',
        playerId: 'player1',
        questionId,
        selectedAnswer: answer,
        isCorrect: Math.random() > 0.5, // Random for demo
        responseTime: Math.random() * 1000,
        timestamp: new Date()
      };
      setPlayerAnswers(prev => [...prev, mockAnswer]);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const leaveGame = () => {
    setCurrentSession(null);
    setCurrentQuestion(null);
    setPlayerAnswers([]);
    setScores([]);
  };

  const value: GameContextType = {
    currentSession,
    currentQuestion,
    playerAnswers,
    scores,
    joinGame,
    submitAnswer,
    leaveGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 