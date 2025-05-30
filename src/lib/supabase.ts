import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database
export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  created_at: string;
  is_active: boolean;
}

export interface Question {
  id: string;
  quiz_id: string;
  content: string;
  options: string[];
  correct_option: number;
  time_limit: number;
  order: number;
}

export interface GameSession {
  id: string;
  quiz_id: string;
  host_id: string;
  status: 'waiting' | 'active' | 'finished';
  current_question: number;
  started_at?: string;
  ended_at?: string;
}

export interface PlayerAnswer {
  id: string;
  session_id: string;
  question_id: string;
  player_id: string;
  selected_option: number;
  is_correct: boolean;
  response_time: number;
}

export interface GameScore {
  id: string;
  session_id: string;
  player_id: string;
  score: number;
  correct_answers: number;
  streak: number;
} 