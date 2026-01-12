-- =====================================================
-- MIGRATION 001: Initial Schema (UPDATED)
-- =====================================================
-- Creates base tables with correct column names from the start
-- This replaces the old 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  owner TEXT NOT NULL, -- wallet address
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  total_quizzes INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  min_reward_amount NUMERIC DEFAULT 0,
  min_question_count INTEGER DEFAULT 1
);

-- Quiz Sets table (with correct column names)
CREATE TABLE IF NOT EXISTS quiz_sets (
  id TEXT PRIMARY KEY, -- TEXT for Solana compatibility (e.g., quiz_abc123...)
  topic_id UUID REFERENCES topics(id),
  title TEXT NOT NULL, -- renamed from 'name'
  owner_wallet TEXT NOT NULL, -- renamed from 'authority'
  total_questions INTEGER NOT NULL, -- renamed from 'question_count'
  description TEXT, -- new column
  reward_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  winner TEXT, -- wallet address of winner
  is_reward_claimed BOOLEAN DEFAULT false,
  correct_answers_count INTEGER DEFAULT 0
);

-- Questions table (with correct column names)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_set_id TEXT REFERENCES quiz_sets(id) ON DELETE CASCADE, -- TEXT to match quiz_sets.id
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- renamed from 'choices'
  correct_answer INTEGER NOT NULL, -- index of correct answer (0-3)
  time_limit INTEGER DEFAULT 30, -- new column
  reward_amount NUMERIC DEFAULT 0.1, -- per-question reward
  blockchain_quiz_id BIGINT, -- Solana blockchain reference
  winner TEXT, -- per-question winner
  is_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_set_id, question_index)
);

-- Quiz History table
CREATE TABLE IF NOT EXISTS quiz_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  quiz_set_id TEXT REFERENCES quiz_sets(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  reward_claimed NUMERIC DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  encrypted_result_hash TEXT,
  arcium_tx_signature TEXT
);

-- User Scores table (for leaderboard)
CREATE TABLE IF NOT EXISTS user_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  topic_id UUID REFERENCES topics(id),
  total_score INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_rewards NUMERIC DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_wallet, topic_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_sets_topic ON quiz_sets(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_owner ON quiz_sets(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_set ON questions(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_questions_blockchain_quiz_id ON questions(blockchain_quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_user ON quiz_history(user_wallet);
CREATE INDEX IF NOT EXISTS idx_quiz_history_quiz_set ON quiz_history(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_user_scores_wallet ON user_scores(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_scores_topic ON user_scores(topic_id);

-- Comments
COMMENT ON COLUMN quiz_sets.id IS 'TEXT format for Solana PDA compatibility (e.g., quiz_abc123...)';
COMMENT ON COLUMN questions.options IS 'JSONB array of answer options';
COMMENT ON COLUMN questions.correct_answer IS 'Index of correct answer (0-based)';
