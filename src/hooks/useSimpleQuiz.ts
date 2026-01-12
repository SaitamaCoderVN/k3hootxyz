import { useState, useEffect, useCallback } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { SimpleK3HootClient, useSimpleK3HootClient } from '@/lib/simple-solana-client';
import { SimpleQuiz, QuizCreationData, QuizSetCreationData, QuizResult, LeaderboardEntry } from '@/types/quiz';

/**
 * Main hook for simple quiz functionality
 * Manages quiz state, submission, and reward claiming
 */
export function useSimpleQuiz() {
  const wallet = useAnchorWallet();
  const client = useSimpleK3HootClient(wallet, 'devnet');
  
  const [quizzes, setQuizzes] = useState<SimpleQuiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<SimpleQuiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);

  /**
   * Fetch all quizzes from blockchain
   */
  const fetchQuizzes = useCallback(async () => {
    if (!client) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const allQuizzes = await client.getAllQuizzes();
      setQuizzes(allQuizzes);
      console.log(`✅ Fetched ${allQuizzes.length} quizzes`);
    } catch (err: any) {
      console.error('❌ Error fetching quizzes:', err);
      setError(err.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  }, [client]);

  /**
   * Fetch single quiz by ID (NEW: uses string PDA)
   */
  const fetchQuizById = useCallback(async (
    quizSetId: string,
    questionIndex: number = 0
  ) => {
    if (!client) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const quiz = await client.getQuizById(quizSetId, questionIndex);
      setCurrentQuiz(quiz);
      return quiz;
    } catch (err: any) {
      console.error('❌ Error fetching quiz:', err);
      setError(err.message || 'Failed to fetch quiz');
      return null;
    } finally {
      setLoading(false);
    }
  }, [client]);

  /**
   * Create new quiz (admin function) - LEGACY single question
   * @deprecated Use createQuizSet instead
   */
  const createQuiz = useCallback(async (data: QuizCreationData): Promise<boolean> => {
    if (!client) {
      setError('Wallet not connected');
      return false;
    }

    setCreating(true);
    setError(null);
    
    try {
      console.log('🚀 Creating quiz...');
      const result = await client.createQuiz(data);
      console.log('✅ Quiz created successfully!');
      console.log('📍 Quiz ID:', result.quizId);
      console.log('📍 TX Signature:', result.signature);
      
      // DON'T auto-refresh to avoid multiple requests
      // User can manually refresh or navigate to /play page
      
      return true;
    } catch (err: any) {
      console.error('❌ Error creating quiz:', err);
      setError(err.message || 'Failed to create quiz');
      return false;
    } finally {
      setCreating(false);
    }
  }, [client]);

  /**
   * Create new quiz set with multiple questions
   */
  const createQuizSet = useCallback(async (data: QuizSetCreationData): Promise<boolean> => {
    if (!client) {
      setError('Wallet not connected');
      return false;
    }

    setCreating(true);
    setError(null);
    
    try {
      console.log('🚀 Creating quiz set with', data.questions.length, 'questions...');
      const result = await client.createQuizSet(data);
      console.log('✅ Quiz set created successfully!');
      console.log('📍 Quiz Set ID:', result.quizSetId);
      console.log('📍 Question IDs:', result.questionIds);
      console.log('📍 Total Reward:', result.totalReward, 'SOL');
      
      // DON'T auto-refresh to avoid multiple requests
      // User will be redirected to /play page
      
      return true;
    } catch (err: any) {
      console.error('❌ Error creating quiz set:', err);
      setError(err.message || 'Failed to create quiz set');
      return false;
    } finally {
      setCreating(false);
    }
  }, [client]);

  /**
   * Submit answer to quiz (NEW: uses QuizSet architecture)
   * TEMPORARY: Mock validation until Arcium MPC integration is complete
   */
  const submitAnswer = useCallback(async (
    quizSetId: string,
    answer: "A" | "B" | "C" | "D",
    questionIndex: number = 0
  ): Promise<QuizResult | null> => {
    if (!client) {
      setError('Wallet not connected');
      return null;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('🎯 Submitting answer to quiz...');
      const result = await client.submitAnswer(quizSetId, questionIndex, answer);
      console.log('✅ Answer validated (mock)!');

      // DON'T auto-refresh quiz - result already contains winner info
      // User will see result immediately from returned data

      return result;
    } catch (err: any) {
      console.error('❌ Error submitting answer:', err);
      setError(err.message || 'Failed to submit answer');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [client]);

  /**
   * Claim reward (winner only) - NEW: uses string quizSetId
   */
  const claimReward = useCallback(async (quizSetId: string): Promise<{
    success: boolean;
    amount: number;
  }> => {
    if (!client) {
      setError('Wallet not connected');
      return { success: false, amount: 0 };
    }

    setClaiming(true);
    setError(null);

    try {
      const result = await client.claimReward(quizSetId);
      console.log('✅ Reward claimed:', result);

      // Refresh quiz list
      await fetchQuizzes();

      return {
        success: result.success,
        amount: result.amountClaimed
      };
    } catch (err: any) {
      console.error('❌ Error claiming reward:', err);
      setError(err.message || 'Failed to claim reward');
      return { success: false, amount: 0 };
    } finally {
      setClaiming(false);
    }
  }, [client, fetchQuizzes]);

  /**
   * Get available quizzes (no winner yet)
   */
  const getAvailableQuizzes = useCallback((): SimpleQuiz[] => {
    return quizzes.filter(q => q.winner === null);
  }, [quizzes]);

  /**
   * Get completed quizzes (has winner)
   */
  const getCompletedQuizzes = useCallback((): SimpleQuiz[] => {
    return quizzes.filter(q => q.winner !== null);
  }, [quizzes]);

  /**
   * Check if current user is winner of a quiz
   */
  const isUserWinner = useCallback((quiz: SimpleQuiz): boolean => {
    if (!wallet || !quiz.winner) return false;
    return quiz.winner.equals(wallet.publicKey);
  }, [wallet]);

  /**
   * Get leaderboard
   */
  const getLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    if (!client) return [];
    
    try {
      return await client.getLeaderboard();
    } catch (err) {
      console.error('❌ Error fetching leaderboard:', err);
      return [];
    }
  }, [client]);

  /**
   * Initial fetch ONLY when wallet connects (not on every render)
   */
  useEffect(() => {
    if (client && wallet) {
      console.log('🔄 Wallet connected, fetching quizzes once...');
      fetchQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey?.toString()]); // Only trigger when wallet changes

  return {
    // Data
    quizzes,
    currentQuiz,
    availableQuizzes: getAvailableQuizzes(),
    completedQuizzes: getCompletedQuizzes(),
    
    // State
    loading,
    error,
    creating,
    submitting,
    claiming,
    isConnected: !!wallet,
    
    // Actions
    fetchQuizzes,
    fetchQuizById,
    createQuiz, // @deprecated - use createQuizSet
    createQuizSet, // NEW: Support multiple questions
    submitAnswer,
    claimReward,
    isUserWinner,
    getLeaderboard,
    setCurrentQuiz,
    clearError: () => setError(null),
    
    // Stats
    totalQuizzes: quizzes.length,
    availableCount: getAvailableQuizzes().length,
    completedCount: getCompletedQuizzes().length,
  };
}

