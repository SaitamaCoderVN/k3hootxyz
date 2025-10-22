import { supabase, Topic, QuizSet, Question, QuizHistory } from './supabase-client';

export class QuizService {
  // Topics
  async getAllTopics(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createTopic(name: string, owner: string): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert({ name, owner })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTopic(topicId: string, updates: Partial<Topic>): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', topicId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Quiz Sets
  async getAllQuizSets(topicId?: string): Promise<QuizSet[]> {
    let query = supabase
      .from('quiz_sets')
      .select('*')
      .eq('is_active', true);
    
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createQuizSet(quizSet: Omit<QuizSet, 'id' | 'created_at'>): Promise<QuizSet> {
    const { data, error } = await supabase
      .from('quiz_sets')
      .insert(quizSet)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getQuizSet(quizSetId: string): Promise<QuizSet | null> {
    const { data, error } = await supabase
      .from('quiz_sets')
      .select('*')
      .eq('id', quizSetId)
      .single();
    
    if (error) {
      console.error('Error fetching quiz set:', error);
      return null;
    }
    return data;
  }

  // NEW: Get quiz set with all questions
  async getQuizSetWithQuestions(quizSetId: string): Promise<QuizSet | null> {
    const { data: quizSet, error: quizError } = await supabase
      .from('quiz_sets')
      .select('*')
      .eq('id', quizSetId)
      .single();
    
    if (quizError || !quizSet) {
      console.error('Error fetching quiz set:', quizError);
      return null;
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_set_id', quizSetId)
      .order('question_index');
    
    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return null;
    }

    return {
      ...quizSet,
      questions: questions || []
    };
  }

  // NEW: Get all active quiz sets
  async getAllActiveQuizSets(): Promise<QuizSet[]> {
    const { data, error } = await supabase
      .from('quiz_sets')
      .select('*, questions(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quiz sets:', error);
      return [];
    }

    return data || [];
  }

  async getQuizSetsByTopic(topicId: string): Promise<QuizSet[]> {
    const { data, error } = await supabase
      .from('quiz_sets')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Questions
  async getQuestions(quizSetId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_set_id', quizSetId)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  }

  async createQuestion(question: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async createQuestions(questions: Omit<Question, 'id' | 'created_at'>[]): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select();
    
    if (error) throw error;
    return data || [];
  }

  // Quiz History
  async createQuizHistory(history: Omit<QuizHistory, 'id' | 'created_at'>): Promise<QuizHistory> {
    const { data, error } = await supabase
      .from('quiz_history')
      .insert(history)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getQuizHistory(quizSetId: string, userWallet: string): Promise<QuizHistory | null> {
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('quiz_set_id', quizSetId)
      .eq('user_wallet', userWallet)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  async recordQuizCompletion(
    userWallet: string,
    quizSetId: string,
    topicId: string,
    score: number,
    totalQuestions: number,
    correctAnswers: number,
    isWinner: boolean,
    encryptedResultHash?: string,
    arciumTxSignature?: string
  ): Promise<QuizHistory> {
    const { data, error } = await supabase
      .from('quiz_history')
      .insert({
        user_wallet: userWallet,
        quiz_set_id: quizSetId,
        topic_id: topicId,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        is_winner: isWinner,
        encrypted_result_hash: encryptedResultHash,
        arcium_tx_signature: arciumTxSignature
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // User Scores
  async upsertUserScore(score: {
    user_wallet: string;
    topic_id: string;
    total_score: number;
    quizzes_completed: number;
    total_rewards: number;
  }): Promise<void> {
    // Get existing score
    const { data: existing } = await supabase
      .from('user_scores')
      .select('*')
      .eq('user_wallet', score.user_wallet)
      .eq('topic_id', score.topic_id)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('user_scores')
        .update({
          total_score: existing.total_score + score.total_score,
          quizzes_completed: existing.quizzes_completed + score.quizzes_completed,
          total_rewards: existing.total_rewards + score.total_rewards,
          updated_at: new Date().toISOString()
        })
        .eq('user_wallet', score.user_wallet)
        .eq('topic_id', score.topic_id);
      
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('user_scores')
        .insert(score);
      
      if (error) throw error;
    }
  }

  async getUserScoresByTopic(topicId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_scores')
      .select('*')
      .eq('topic_id', topicId)
      .order('total_score', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Leaderboard
  async getLeaderboard(topicId?: string, limit: number = 10) {
    let query = supabase
      .from('user_scores')
      .select('*');
    
    if (topicId) {
      query = query.eq('topic_id', topicId);
    }
    
    const { data, error } = await query
      .order('total_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
}

export const quizService = new QuizService();
