import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your .env file'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Database types
export interface Topic {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  is_active: boolean;
  total_quizzes: number;
  total_participants: number;
  min_reward_amount: number;
  min_question_count: number;
}

export interface QuizSet {
  id: string;
  topic_id: string;
  name: string;
  description?: string;
  creator: string;
  questions_count: number;
  reward_amount: number;
  created_at: string;
  is_active: boolean;
  winner: string | null;
  is_reward_claimed: boolean;
  correct_answers_count: number;
}

export interface Question {
  id: string;
  quiz_set_id: string;
  order_index: number;
  question_text: string;
  choices: string[];
  correct_answer: string;
  created_at: string;
}

export interface QuizHistory {
  id: string;
  user_wallet: string;
  quiz_set_id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  is_winner: boolean;
  reward_claimed: number;
  completed_at: string;
  encrypted_result_hash: string | null;
  arcium_tx_signature: string | null;
}

export interface UserScore {
  id: string;
  user_wallet: string;
  topic_id: string;
  total_score: number;
  quizzes_completed: number;
  total_rewards: number;
  created_at: string;
  updated_at: string;
}
