-- Migration: Quiz Sets Refactor
-- Add support for per-question rewards and blockchain linking

-- Step 1: Add new columns to questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS reward_amount NUMERIC DEFAULT 0.1,
  ADD COLUMN IF NOT EXISTS blockchain_quiz_id BIGINT,
  ADD COLUMN IF NOT EXISTS winner TEXT,
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT false;

-- Step 2: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_questions_blockchain_quiz_id ON questions(blockchain_quiz_id);

-- Note: This migration adds support for:
-- 1. Per-question rewards (reward_amount column in questions)
-- 2. Blockchain linking (blockchain_quiz_id stores timestamp ID from Solana)
-- 3. Per-question winners (winner, is_claimed columns in questions)
-- 
-- quiz_sets table already has reward_amount column from 001_initial_schema.sql
-- which stores the total reward for the entire quiz set.

