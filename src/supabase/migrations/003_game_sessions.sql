-- Game Sessions table for multiplayer quiz games
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_set_id UUID REFERENCES quiz_sets(id) ON DELETE CASCADE,
  host_wallet TEXT NOT NULL,
  pin TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  max_players INTEGER DEFAULT 50,
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'playing', 'finished'))
);

-- Game Participants table
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  wallet_address TEXT,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_answer_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(session_id, player_name)
);

-- Game Answers table to track individual answers
CREATE TABLE game_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES game_participants(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken_ms INTEGER,
  UNIQUE(participant_id, question_index)
);

-- Indexes
CREATE INDEX idx_game_sessions_pin ON game_sessions(pin);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_participants_session ON game_participants(session_id);
CREATE INDEX idx_game_answers_session ON game_answers(session_id);
CREATE INDEX idx_game_answers_participant ON game_answers(participant_id);

-- Enable realtime for game tables
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE game_answers;
