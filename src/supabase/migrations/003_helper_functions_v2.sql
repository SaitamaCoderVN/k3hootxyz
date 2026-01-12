-- =====================================================
-- MIGRATION 003: Helper Functions and Views
-- =====================================================
-- Creates utility functions and views for game management

-- Game Leaderboard View for realtime updates
CREATE OR REPLACE VIEW game_leaderboard AS
SELECT 
  gp.id,
  gp.session_id,
  gp.player_name,
  gp.wallet_address,
  gp.score,
  gp.correct_answers,
  gp.total_correct_onchain,
  gp.joined_at,
  gp.last_answer_at,
  ROW_NUMBER() OVER (
    PARTITION BY gp.session_id 
    ORDER BY gp.score DESC, gp.last_answer_at ASC
  ) as rank,
  COUNT(*) OVER (PARTITION BY gp.session_id) as total_players
FROM game_participants gp
WHERE gp.session_id IN (
  SELECT id FROM game_sessions WHERE status IN ('playing', 'finished')
);

-- Function to get current leaderboard for a session
CREATE OR REPLACE FUNCTION get_session_leaderboard(session_uuid UUID)
RETURNS TABLE (
  player_name TEXT,
  wallet_address TEXT,
  score INTEGER,
  correct_answers INTEGER,
  total_correct_onchain INTEGER,
  rank BIGINT,
  joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gp.player_name,
    gp.wallet_address,
    gp.score,
    gp.correct_answers,
    gp.total_correct_onchain,
    ROW_NUMBER() OVER (ORDER BY gp.score DESC, gp.last_answer_at ASC) as rank,
    gp.joined_at
  FROM game_participants gp
  WHERE gp.session_id = session_uuid
  ORDER BY gp.score DESC, gp.last_answer_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if player can claim reward
CREATE OR REPLACE FUNCTION check_reward_eligibility(session_uuid UUID, player_wallet TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
BEGIN
  -- Get session info
  SELECT * INTO session_record
  FROM game_sessions
  WHERE id = session_uuid AND status = 'finished';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if player is winner
  IF session_record.winner_wallet != player_wallet THEN
    RETURN false;
  END IF;
  
  -- Check if reward already claimed
  IF session_record.reward_claimed THEN
    RETURN false;
  END IF;
  
  -- Get participant info
  SELECT * INTO participant_record
  FROM game_participants
  WHERE session_id = session_uuid AND wallet_address = player_wallet;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if all answers validated on-chain
  IF participant_record.total_correct_onchain < session_record.current_question_index THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for leaderboard updates
CREATE OR REPLACE FUNCTION update_leaderboard_rank()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger will be handled by view, but we can add logic here if needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for realtime leaderboard updates
DROP TRIGGER IF EXISTS trigger_update_leaderboard ON game_participants;
CREATE TRIGGER trigger_update_leaderboard
  AFTER UPDATE OF score, correct_answers, total_correct_onchain ON game_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard_rank();

-- Comments
COMMENT ON VIEW game_leaderboard IS 'Realtime leaderboard view for active game sessions';
COMMENT ON FUNCTION get_session_leaderboard IS 'Get current leaderboard for a game session';
COMMENT ON FUNCTION check_reward_eligibility IS 'Check if a player is eligible to claim SOL reward';
