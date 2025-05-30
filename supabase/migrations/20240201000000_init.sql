-- Create tables
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    username text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

CREATE TABLE public.quizzes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    creator_id uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);

CREATE TABLE public.questions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
    content text NOT NULL,
    options text[] NOT NULL,
    correct_option integer NOT NULL,
    time_limit integer DEFAULT 20 NOT NULL,
    order_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT options_length CHECK (array_length(options, 1) = 4),
    CONSTRAINT correct_option_range CHECK (correct_option >= 0 AND correct_option < 4)
);

CREATE TABLE public.game_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id uuid REFERENCES public.quizzes(id),
    host_id uuid REFERENCES public.profiles(id),
    status text DEFAULT 'waiting'::text NOT NULL,
    current_question integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT status_values CHECK (status IN ('waiting', 'active', 'finished'))
);

CREATE TABLE public.player_answers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    question_id uuid REFERENCES public.questions(id),
    player_id uuid REFERENCES public.profiles(id),
    selected_option integer NOT NULL,
    is_correct boolean NOT NULL,
    response_time numeric NOT NULL,
    score integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.game_scores (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    player_id uuid REFERENCES public.profiles(id),
    score integer DEFAULT 0 NOT NULL,
    correct_answers integer DEFAULT 0 NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX questions_quiz_id_idx ON public.questions(quiz_id);
CREATE INDEX game_sessions_quiz_id_idx ON public.game_sessions(quiz_id);
CREATE INDEX player_answers_session_id_idx ON public.player_answers(session_id);
CREATE INDEX player_answers_player_id_idx ON public.player_answers(player_id);
CREATE INDEX game_scores_session_id_idx ON public.game_scores(session_id);
CREATE INDEX game_scores_player_id_idx ON public.game_scores(player_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Quizzes are viewable by everyone"
    ON public.quizzes FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can create quizzes"
    ON public.quizzes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Quiz creators can update their quizzes"
    ON public.quizzes FOR UPDATE
    USING (creator_id = auth.uid());

CREATE POLICY "Questions are viewable by everyone"
    ON public.questions FOR SELECT
    USING (true);

CREATE POLICY "Quiz creators can manage questions"
    ON public.questions FOR ALL
    USING (quiz_id IN (
        SELECT id FROM public.quizzes WHERE creator_id = auth.uid()
    ));

CREATE POLICY "Game sessions are viewable by everyone"
    ON public.game_sessions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create game sessions"
    ON public.game_sessions FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Game hosts can update their sessions"
    ON public.game_sessions FOR UPDATE
    USING (host_id = auth.uid());

CREATE POLICY "Player answers are viewable by everyone"
    ON public.player_answers FOR SELECT
    USING (true);

CREATE POLICY "Players can submit their own answers"
    ON public.player_answers FOR INSERT
    WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Game scores are viewable by everyone"
    ON public.game_scores FOR SELECT
    USING (true);

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', 'player_' || substr(new.id::text, 1, 8))
    );
    RETURN new;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 