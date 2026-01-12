-- =====================================================
-- MIGRATION 002: Game Sessions for Multiplayer
-- =====================================================
-- Creates tables for multiplayer quiz games

-- Game Sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_set_id TEXT REFERENCES quiz_sets(id) ON DELETE CASCADE,
  host_wallet TEXT NOT NULL,
  host_token UUID DEFAULT uuid_generate_v4(), -- for host reconnection
  pin TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'lobby', -- lobby, waiting, playing, finished
  phase TEXT DEFAULT 'lobby', -- lobby, question, answer, results
  current_question_index INTEGER DEFAULT 0,
  blockchain_quiz_set_id TEXT, -- Links to Solana QuizSet PDA
  reward_amount NUMERIC DEFAULT 0, -- SOL reward pool
  winner_wallet TEXT, -- Winner's wallet address
  reward_claimed BOOLEAN DEFAULT false,
  arcium_initialized BOOLEAN DEFAULT false, -- Whether Arcium comp_def is initialized
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  max_players INTEGER DEFAULT 50,
  CONSTRAINT valid_status CHECK (status IN ('lobby', 'waiting', 'playing', 'finished'))
);

-- Game Participants table
CREATE TABLE IF NOT EXISTS game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  wallet_address TEXT,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0, -- Off-chain tracking
  total_correct_onchain INTEGER DEFAULT 0, -- Validated by Arcium
  can_claim_reward BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_answer_at TIMESTAMP WITH TIME ZONE,
  blockchain_validations JSONB DEFAULT '[]'::jsonb, -- Array of validation records
  UNIQUE(session_id, player_name)
);

-- Game Answers table to track individual answers
CREATE TABLE IF NOT EXISTS game_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES game_participants(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_answer INTEGER NOT NULL, -- index of selected answer
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken_ms INTEGER,
  UNIQUE(participant_id, question_index)
);

-- Arcium Validations table to track MPC computations
CREATE TABLE IF NOT EXISTS arcium_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES game_participants(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  computation_offset BIGINT NOT NULL, -- Arcium computation offset
  tx_signature TEXT NOT NULL, -- Solana transaction signature
  encrypted_user_answer BYTEA, -- Encrypted answer (32 bytes)
  encrypted_correct_answer BYTEA, -- Encrypted correct answer (32 bytes)
  arcium_pubkey BYTEA, -- x25519 public key
  nonce BIGINT, -- Encryption nonce (u128)
  is_correct BOOLEAN, -- Result from Arcium MPC
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  callback_tx_signature TEXT, -- Arcium callback transaction
  UNIQUE(session_id, participant_id, question_index)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_pin ON game_sessions(pin);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_host_token ON game_sessions(host_token);
CREATE INDEX IF NOT EXISTS idx_game_sessions_quiz_set ON game_sessions(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_blockchain ON game_sessions(blockchain_quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_session ON game_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_wallet ON game_participants(wallet_address);
CREATE INDEX IF NOT EXISTS idx_game_answers_session ON game_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_participant ON game_answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_arcium_validations_session ON arcium_validations(session_id);
CREATE INDEX IF NOT EXISTS idx_arcium_validations_participant ON arcium_validations(participant_id);
CREATE INDEX IF NOT EXISTS idx_arcium_validations_computation ON arcium_validations(computation_offset);

-- Enable realtime for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arcium_validations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;

-- Comments
COMMENT ON TABLE game_sessions IS 'Multiplayer game sessions with Kahoot-style gameplay';
COMMENT ON TABLE game_participants IS 'Players in each game session';
COMMENT ON TABLE game_answers IS 'Individual answers submitted by players';
COMMENT ON TABLE arcium_validations IS 'Tracks Arcium MPC validations for each player answer';
