// Multiplayer game types for Kahoot-like experience

export type GamePhase =
  | 'lobby'           // Players joining, waiting to start
  | 'question'        // Showing question, players answering
  | 'answer_reveal'   // Show correct answer (3s)
  | 'leaderboard'     // Show standings after each question
  | 'finished';       // Final results

export interface GameSession {
  id: string;
  pin: string;
  quiz_set_id: string;
  blockchain_quiz_set_id: string | null;
  host_wallet: string;
  status: 'lobby' | 'playing' | 'finished'; // Legacy field
  game_phase: GamePhase;
  current_question_index: number | null;
  phase_started_at: string;
  question_started_at: string | null;
  total_players: number;
  answers_submitted: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface GameParticipant {
  id: string;
  session_id: string;
  player_name: string;
  wallet_address: string | null;
  score: number;
  answers: ParticipantAnswer[];
  joined_at: string;
  last_seen_at: string;
}

export interface ParticipantAnswer {
  questionIndex: number;
  answer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  answeredAt: number;
  pointsEarned: number;
}

export interface Question {
  id: string;
  quiz_set_id: string;
  question_index: number;
  question_text: string;
  choices: string[];
  correct_answer: 'A' | 'B' | 'C' | 'D';
}

// Kahoot-style answer colors
export const ANSWER_COLORS = {
  A: {
    bg: '#E21B3C',      // Kahoot red
    hover: '#C41731',
    text: '#FFFFFF',
    name: 'Red Triangle'
  },
  B: {
    bg: '#1368CE',      // Kahoot blue
    hover: '#0F5AB8',
    text: '#FFFFFF',
    name: 'Blue Diamond'
  },
  C: {
    bg: '#D89E00',      // Kahoot yellow
    hover: '#C08E00',
    text: '#FFFFFF',
    name: 'Yellow Circle'
  },
  D: {
    bg: '#26890C',      // Kahoot green
    hover: '#1F7309',
    text: '#FFFFFF',
    name: 'Green Square'
  }
} as const;

// Game timing constants (in milliseconds)
export const GAME_TIMING = {
  QUESTION_DURATION: 20000,      // 20 seconds per question
  ANSWER_REVEAL_DURATION: 3000,  // 3 seconds to show correct answer
  LEADERBOARD_DURATION: 5000,    // 5 seconds to show leaderboard (host controlled)
} as const;

// Scoring system (Kahoot-style: base points + time bonus)
export const SCORING = {
  BASE_POINTS: 1000,              // Base points for correct answer
  TIME_BONUS_MAX: 500,            // Max bonus for answering fast
  STREAK_MULTIPLIER: 1.2,         // Bonus for answer streak (optional)
} as const;
