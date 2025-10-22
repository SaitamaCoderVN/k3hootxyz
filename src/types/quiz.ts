import { PublicKey } from "@solana/web3.js";

// ============================================================================
// Quiz Set (Collection of questions)
// ============================================================================

export interface QuizSet {
  id: string; // UUID from database
  name: string; // Quiz title/name (e.g., "Solana Basics Quiz")
  topicId?: string; // Optional topic
  authority: string; // Creator wallet address
  questionCount: number; // Number of questions in this quiz
  totalReward: number; // Total SOL for all questions
  createdAt: Date;
  isActive: boolean;
  winner?: string; // Winner wallet address (if all questions answered)
  isRewardClaimed: boolean;
  questions?: QuizQuestion[]; // Array of questions in this quiz
}

// ============================================================================
// Individual Question within a Quiz Set
// ============================================================================

export interface QuizQuestion {
  id: string; // UUID from database
  quizSetId: string; // Links to parent quiz
  questionIndex: number; // Order in quiz (0, 1, 2...)
  questionText: string; // "What is Solana?"
  choices: string[]; // ["Option A", "Option B", "Option C", "Option D"]
  correctAnswer: "A" | "B" | "C" | "D";
  rewardAmount: number; // SOL reward for this specific question
  blockchainQuizId?: number; // Timestamp ID on blockchain (for linking)
  winner?: string; // Winner for this question
  isClaimed: boolean;
  createdAt: Date;
  
  // Blockchain data (loaded when playing)
  answerAccountPda?: PublicKey;
  rewardPoolPda?: PublicKey;
}

// ============================================================================
// Creation Data
// ============================================================================

export interface QuizSetCreationData {
  name: string; // Quiz name/title
  questions: QuestionCreationData[];
}

export interface QuestionCreationData {
  questionText: string;
  choices: string[]; // Must be exactly 4 options
  correctAnswer: "A" | "B" | "C" | "D";
  rewardAmount: number; // in SOL
}

// ============================================================================
// Answer & Results
// ============================================================================

export interface QuizAnswer {
  letter: "A" | "B" | "C" | "D";
  isCorrect?: boolean;
}

export interface QuizResult {
  questionId: string;
  quizSetId: string;
  questionIndex: number;
  userAnswer: QuizAnswer;
  isWinner: boolean;
  rewardAmount: number;
  signature?: string;
}

// ============================================================================
// Leaderboard
// ============================================================================

export interface LeaderboardEntry {
  quizSetId: string;
  quizSetName: string;
  questionIndex: number;
  questionText: string;
  winner: string; // PublicKey as string
  winnerDisplay: string; // Shortened address
  rewardAmount: number; // in SOL
  isClaimed: boolean;
  claimedAt?: Date;
}

// ============================================================================
// Backward Compatibility (OLD interfaces - will be deprecated)
// ============================================================================

/** @deprecated Use QuizSet instead */
export interface SimpleQuiz {
  quizId: number;
  questionId: number;
  topicId: number;
  question: string;
  options: string[];
  rewardAmount: number;
  winner: PublicKey | null;
  isClaimed: boolean;
  answerAccountPda: PublicKey;
  rewardPoolPda: PublicKey;
  createdAt: Date;
}

/** @deprecated Use QuizSetCreationData instead */
export interface QuizCreationData {
  question: string;
  options: [string, string, string, string];
  correctAnswer: "A" | "B" | "C" | "D";
  rewardAmount: number;
}
