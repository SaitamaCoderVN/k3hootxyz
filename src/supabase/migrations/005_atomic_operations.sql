-- =====================================================
-- MIGRATION 005: Atomic Operations for Race Condition Prevention
-- =====================================================
-- Adds atomic SQL functions to prevent race conditions in concurrent operations
-- Created: 2026-01-12

-- ============================================
-- 1. DECREMENT TOTAL PLAYERS (for leave-session)
-- ============================================

CREATE OR REPLACE FUNCTION decrement_total_players(p_session_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $
BEGIN
  UPDATE game_sessions
  SET total_players = GREATEST(0, total_players - 1)
  WHERE id = p_session_id;
END;
$;

COMMENT ON FUNCTION decrement_total_players IS 'Atomically decrement total_players count, preventing race conditions when players leave';

-- ============================================
-- 2. ATOMIC SCORE UPDATE (for answer submission)
-- ============================================

CREATE OR REPLACE FUNCTION atomic_update_score(
  p_participant_id UUID,
  p_points_to_add INTEGER,
  p_increment_correct BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(new_score INTEGER, new_correct_answers INTEGER)
LANGUAGE plpgsql
AS $
DECLARE
  v_new_score INTEGER;
  v_new_correct INTEGER;
BEGIN
  -- Atomic update with row-level locking
  UPDATE game_participants
  SET
    score = score + p_points_to_add,
    correct_answers = CASE
      WHEN p_increment_correct THEN correct_answers + 1
      ELSE correct_answers
    END
  WHERE id = p_participant_id
  RETURNING score, correct_answers INTO v_new_score, v_new_correct;

  -- Return updated values
  RETURN QUERY SELECT v_new_score, v_new_correct;
END;
$;

COMMENT ON FUNCTION atomic_update_score IS 'Atomically update participant score and correct answer count';

-- ============================================
-- 3. INCREMENT TOTAL PLAYERS (for join-session)
-- ============================================

CREATE OR REPLACE FUNCTION increment_total_players(p_session_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE game_sessions
  SET total_players = total_players + 1
  WHERE id = p_session_id
  RETURNING total_players INTO v_new_total;

  RETURN v_new_total;
END;
$;

COMMENT ON FUNCTION increment_total_players IS 'Atomically increment total_players count when players join';

-- ============================================
-- 4. ATOMIC ANSWERS SUBMITTED INCREMENT
-- ============================================
-- Note: This function already exists from migration 004
-- but we ensure it's idempotent here

CREATE OR REPLACE FUNCTION increment_answers_submitted(p_session_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $
BEGIN
  UPDATE game_sessions
  SET answers_submitted = answers_submitted + 1
  WHERE id = p_session_id;
END;
$;

-- ============================================
-- 5. RESET ANSWERS SUBMITTED (for new question)
-- ============================================

CREATE OR REPLACE FUNCTION reset_answers_submitted(p_session_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $
BEGIN
  UPDATE game_sessions
  SET answers_submitted = 0
  WHERE id = p_session_id;
END;
$;

COMMENT ON FUNCTION reset_answers_submitted IS 'Reset answers counter when moving to next question';

-- ============================================
-- 6. ATOMIC GAME PHASE TRANSITION
-- ============================================

CREATE OR REPLACE FUNCTION advance_game_phase(
  p_session_id UUID,
  p_new_phase TEXT,
  p_new_question_index INTEGER DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  previous_phase TEXT,
  new_phase TEXT,
  current_question INTEGER
)
LANGUAGE plpgsql
AS $
DECLARE
  v_prev_phase TEXT;
  v_new_question INTEGER;
BEGIN
  -- Get current phase and update atomically
  UPDATE game_sessions
  SET
    game_phase = p_new_phase,
    phase_started_at = NOW(),
    current_question_index = COALESCE(p_new_question_index, current_question_index)
  WHERE id = p_session_id
  RETURNING game_phase, current_question_index
  INTO v_prev_phase, v_new_question;

  -- Return result
  RETURN QUERY SELECT
    TRUE as success,
    v_prev_phase as previous_phase,
    p_new_phase as new_phase,
    v_new_question as current_question;
END;
$;

COMMENT ON FUNCTION advance_game_phase IS 'Atomically transition game to new phase with optional question index update';

-- ============================================
-- 7. CHECK AND JOIN SESSION (prevents race in join)
-- ============================================

CREATE OR REPLACE FUNCTION can_join_session(
  p_pin TEXT,
  p_max_players INTEGER DEFAULT 50
)
RETURNS TABLE(
  can_join BOOLEAN,
  session_id UUID,
  current_players INTEGER,
  reason TEXT
)
LANGUAGE plpgsql
AS $
DECLARE
  v_session RECORD;
BEGIN
  -- Get session with FOR UPDATE lock
  SELECT * INTO v_session
  FROM game_sessions
  WHERE pin = p_pin
    AND status = 'lobby'
  FOR UPDATE;

  -- Session not found
  IF v_session IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 0, 'Session not found or not in lobby';
    RETURN;
  END IF;

  -- Check if full
  IF v_session.total_players >= p_max_players THEN
    RETURN QUERY SELECT FALSE, v_session.id, v_session.total_players, 'Session is full';
    RETURN;
  END IF;

  -- Can join
  RETURN QUERY SELECT TRUE, v_session.id, v_session.total_players, 'OK';
END;
$;

COMMENT ON FUNCTION can_join_session IS 'Check if player can join session with row-level locking to prevent overfilling';

-- ============================================
-- 8. GRANT EXECUTE PERMISSIONS
-- ============================================

-- Grant execute on all functions to authenticated users
GRANT EXECUTE ON FUNCTION decrement_total_players TO authenticated;
GRANT EXECUTE ON FUNCTION atomic_update_score TO authenticated;
GRANT EXECUTE ON FUNCTION increment_total_players TO authenticated;
GRANT EXECUTE ON FUNCTION increment_answers_submitted TO authenticated;
GRANT EXECUTE ON FUNCTION reset_answers_submitted TO authenticated;
GRANT EXECUTE ON FUNCTION advance_game_phase TO authenticated;
GRANT EXECUTE ON FUNCTION can_join_session TO authenticated;

-- Also grant to anon role for public access (game sessions are public)
GRANT EXECUTE ON FUNCTION decrement_total_players TO anon;
GRANT EXECUTE ON FUNCTION atomic_update_score TO anon;
GRANT EXECUTE ON FUNCTION increment_total_players TO anon;
GRANT EXECUTE ON FUNCTION increment_answers_submitted TO anon;
GRANT EXECUTE ON FUNCTION reset_answers_submitted TO anon;
GRANT EXECUTE ON FUNCTION advance_game_phase TO anon;
GRANT EXECUTE ON FUNCTION can_join_session TO anon;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Log migration completion
DO $
BEGIN
  RAISE NOTICE 'Migration 005: Atomic operations functions created successfully';
END;
$;
