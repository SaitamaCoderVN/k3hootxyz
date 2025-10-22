-- Topics table
CREATE TABLE topics (
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

-- Quiz Sets table
CREATE TABLE quiz_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id),
  name TEXT NOT NULL,
  authority TEXT NOT NULL, -- wallet address
  question_count INTEGER NOT NULL,
  reward_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  winner TEXT, -- wallet address of winner
  is_reward_claimed BOOLEAN DEFAULT false,
  correct_answers_count INTEGER DEFAULT 0
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_set_id UUID REFERENCES quiz_sets(id),
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  choices JSONB NOT NULL, -- ["A", "B", "C", "D"]
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_set_id, question_index)
);

-- Quiz History table
CREATE TABLE quiz_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  quiz_set_id UUID REFERENCES quiz_sets(id),
  topic_id UUID REFERENCES topics(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  reward_claimed NUMERIC DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Encrypted result from Arcium
  encrypted_result_hash TEXT,
  arcium_tx_signature TEXT
);

-- User Scores table (for leaderboard)
CREATE TABLE user_scores (
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
CREATE INDEX idx_quiz_sets_topic ON quiz_sets(topic_id);
CREATE INDEX idx_questions_quiz_set ON questions(quiz_set_id);
CREATE INDEX idx_quiz_history_user ON quiz_history(user_wallet);
CREATE INDEX idx_quiz_history_quiz_set ON quiz_history(quiz_set_id);
CREATE INDEX idx_user_scores_wallet ON user_scores(user_wallet);
CREATE INDEX idx_user_scores_topic ON user_scores(topic_id);