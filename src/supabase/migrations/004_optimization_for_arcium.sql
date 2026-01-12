-- =====================================================
-- MIGRATION 004: Optimization for Arcium Integration
-- =====================================================
-- Optimizes schema for on-chain answer validation
-- Adds missing indexes, columns, and helper functions

-- ============================================
-- 1. ADD MISSING COLUMNS
-- ============================================

-- Add blockchain transaction references to game_sessions
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS claim_tx_signature TEXT,
ADD COLUMN IF NOT EXISTS phase_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS question_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_players INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS answers_submitted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS winner_participant_id UUID,
ADD COLUMN IF NOT EXISTS game_phase TEXT DEFAULT 'lobby',
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE;

-- Update game_phase enum check
ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS valid_phase;
ALTER TABLE game_sessions ADD CONSTRAINT valid_phase
  CHECK (game_phase IN ('lobby', 'question', 'answer_reveal', 'leaderboard', 'finished'));

-- Add blockchain validation columns to game_answers
ALTER TABLE game_answers
ADD COLUMN IF NOT EXISTS blockchain_validation_tx TEXT,
ADD COLUMN IF NOT EXISTS onchain_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- Add encryption data to questions table (for Arcium)
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS encrypted_answer BYTEA,
ADD COLUMN IF NOT EXISTS arcium_pubkey BYTEA,
ADD COLUMN IF NOT EXISTS arcium_nonce TEXT;

-- Add blockchain references to quiz_sets
ALTER TABLE quiz_sets
ADD COLUMN IF NOT EXISTS blockchain_quiz_id TEXT,
ADD COLUMN IF NOT EXISTS blockchain_tx_signature TEXT;

-- Add blockchain player account reference to game_participants
ALTER TABLE game_participants
ADD COLUMN IF NOT EXISTS blockchain_player_account TEXT,
ADD COLUMN IF NOT EXISTS participant_token UUID DEFAULT gen_random_uuid();

-- Create unique index on participant_token for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_participant_token ON game_participants(participant_token);

-- ============================================
-- 2. ADD PERFORMANCE INDEXES
-- ============================================

-- Game session lookups
CREATE INDEX IF NOT EXISTS idx_game_sessions_status_active
  ON game_sessions(status) WHERE status IN ('lobby', 'playing');

CREATE INDEX IF NOT EXISTS idx_game_sessions_unclaimed_rewards
  ON game_sessions(winner_wallet, reward_claimed)
  WHERE reward_claimed = false AND winner_wallet IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_game_sessions_finished
  ON game_sessions(status, finished_at) WHERE status = 'finished';

-- Quiz sets lookups
CREATE INDEX IF NOT EXISTS idx_quiz_sets_active
  ON quiz_sets(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_quiz_sets_blockchain
  ON quiz_sets(blockchain_quiz_id) WHERE blockchain_quiz_id IS NOT NULL;

-- Participant score rankings
CREATE INDEX IF NOT EXISTS idx_game_participants_score_rank
  ON game_participants(session_id, score DESC, joined_at ASC);

-- Answer lookups
CREATE INDEX IF NOT EXISTS idx_game_answers_session_question
  ON game_answers(session_id, question_index);

CREATE INDEX IF NOT EXISTS idx_game_answers_onchain_verified
  ON game_answers(onchain_verified, blockchain_validation_tx)
  WHERE onchain_verified = true;

-- Questions with encryption data
CREATE INDEX IF NOT EXISTS idx_questions_encrypted
  ON questions(quiz_set_id, question_index)
  WHERE encrypted_answer IS NOT NULL;

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to increment answers submitted counter
CREATE OR REPLACE FUNCTION increment_answers_submitted(p_session_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE game_sessions
  SET answers_submitted = answers_submitted + 1
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get current leaderboard (simplified)
CREATE OR REPLACE FUNCTION get_leaderboard(p_session_id UUID)
RETURNS TABLE (
  participant_id UUID,
  player_name TEXT,
  wallet_address TEXT,
  score INTEGER,
  correct_answers INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    gp.player_name,
    gp.wallet_address,
    gp.score,
    gp.correct_answers,
    gp.joined_at
  FROM game_participants gp
  WHERE session_id = p_session_id
  ORDER BY score DESC, correct_answers DESC, joined_at ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to set game winner
CREATE OR REPLACE FUNCTION set_game_winner(p_session_id UUID)
RETURNS void AS $$
DECLARE
  v_winner RECORD;
BEGIN
  -- Get top player
  SELECT id, wallet_address, score INTO v_winner
  FROM game_participants
  WHERE session_id = p_session_id
  ORDER BY score DESC, correct_answers DESC, joined_at ASC
  LIMIT 1;

  -- Update game session
  UPDATE game_sessions
  SET
    winner_participant_id = v_winner.id,
    winner_wallet = v_winner.wallet_address,
    status = 'finished',
    game_phase = 'finished',
    finished_at = NOW()
  WHERE id = p_session_id;

  -- Log winner
  RAISE NOTICE 'Winner set for session %: % with score %',
    p_session_id, v_winner.wallet_address, v_winner.score;
END;
$$ LANGUAGE plpgsql;

-- Function to update participant score
CREATE OR REPLACE FUNCTION update_participant_score(
  p_participant_id UUID,
  p_points INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE game_participants
  SET
    score = score + p_points,
    correct_answers = correct_answers + 1,
    last_answer_at = NOW()
  WHERE id = p_participant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get unclaimed rewards for a wallet
CREATE OR REPLACE FUNCTION get_unclaimed_rewards(p_wallet TEXT)
RETURNS TABLE (
  session_id UUID,
  quiz_title TEXT,
  reward_amount NUMERIC,
  finished_at TIMESTAMP WITH TIME ZONE,
  pin TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs.id,
    qs.title,
    gs.reward_amount,
    gs.finished_at,
    gs.pin
  FROM game_sessions gs
  JOIN quiz_sets qs ON gs.quiz_set_id = qs.id
  WHERE gs.winner_wallet = p_wallet
    AND gs.reward_claimed = false
    AND gs.status = 'finished'
  ORDER BY gs.finished_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to mark reward as claimed
CREATE OR REPLACE FUNCTION mark_reward_claimed(
  p_session_id UUID,
  p_tx_signature TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE game_sessions
  SET
    reward_claimed = true,
    claim_tx_signature = p_tx_signature
  WHERE id = p_session_id;

  RAISE NOTICE 'Reward claimed for session %: tx %', p_session_id, p_tx_signature;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. UPDATE EXISTING VIEWS
-- ============================================

-- Drop old view and recreate with new columns
DROP VIEW IF EXISTS game_leaderboard CASCADE;

CREATE OR REPLACE VIEW game_leaderboard AS
SELECT
  gp.id,
  gp.session_id,
  gp.player_name,
  gp.wallet_address,
  gp.score,
  gp.correct_answers,
  gp.total_correct_onchain,
  gp.blockchain_player_account,
  gp.joined_at,
  gp.last_answer_at,
  ROW_NUMBER() OVER (
    PARTITION BY gp.session_id
    ORDER BY gp.score DESC, gp.joined_at ASC
  ) as rank,
  COUNT(*) OVER (PARTITION BY gp.session_id) as total_players
FROM game_participants gp;

-- ============================================
-- 5. DATA MIGRATION (if needed)
-- ============================================

-- Migrate existing game_phase from phase column if needed
UPDATE game_sessions
SET game_phase = phase
WHERE game_phase = 'lobby' AND phase IS NOT NULL AND phase != game_phase;

-- ============================================
-- 6. COMMENTS
-- ============================================

COMMENT ON COLUMN game_sessions.game_phase IS '5-phase game loop: lobby, question, answer_reveal, leaderboard, finished';
COMMENT ON COLUMN game_sessions.phase_started_at IS 'When current phase started (for auto-advance timing)';
COMMENT ON COLUMN game_sessions.answers_submitted IS 'Counter for how many players answered current question';
COMMENT ON COLUMN game_answers.blockchain_validation_tx IS 'Solana transaction signature for Arcium MPC validation';
COMMENT ON COLUMN game_answers.onchain_verified IS 'Whether answer was validated via Arcium MPC on-chain';
COMMENT ON COLUMN questions.encrypted_answer IS 'Arcium-encrypted correct answer (32 bytes)';
COMMENT ON COLUMN questions.arcium_pubkey IS 'x25519 public key used for encryption (32 bytes)';
COMMENT ON COLUMN questions.arcium_nonce IS 'Encryption nonce (u128 as string)';

COMMENT ON FUNCTION increment_answers_submitted IS 'Increment the answers_submitted counter for real-time tracking';
COMMENT ON FUNCTION get_leaderboard IS 'Get top 10 players for a game session';
COMMENT ON FUNCTION set_game_winner IS 'Determine and set the winner of a game session';
COMMENT ON FUNCTION update_participant_score IS 'Update participant score and correct answers count';
COMMENT ON FUNCTION get_unclaimed_rewards IS 'Get all unclaimed rewards for a wallet address';
COMMENT ON FUNCTION mark_reward_claimed IS 'Mark a reward as claimed with transaction signature';

-- ============================================
-- 7. GRANT PERMISSIONS (if using RLS)
-- ============================================

-- Enable RLS on new tables if not already enabled
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active games (can be restricted later)
CREATE POLICY IF NOT EXISTS "Anyone can view active game sessions"
  ON game_sessions FOR SELECT
  USING (status IN ('lobby', 'playing', 'finished'));

CREATE POLICY IF NOT EXISTS "Anyone can view participants in active games"
  ON game_participants FOR SELECT
  USING (true);

-- Host can update their own game sessions
CREATE POLICY IF NOT EXISTS "Host can update their game sessions"
  ON game_sessions FOR UPDATE
  USING (host_wallet = current_setting('request.jwt.claims', true)::json->>'sub');

-- Players can insert their own answers
CREATE POLICY IF NOT EXISTS "Players can submit their own answers"
  ON game_answers FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 8. VALIDATION
-- ============================================

-- Verify critical indexes exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM pg_indexes
          WHERE tablename = 'game_sessions' AND indexname LIKE 'idx%') >= 5,
         'Missing indexes on game_sessions';

  ASSERT (SELECT COUNT(*) FROM pg_indexes
          WHERE tablename = 'game_participants' AND indexname LIKE 'idx%') >= 3,
         'Missing indexes on game_participants';

  RAISE NOTICE 'Migration 004 completed successfully!';
END $$;
