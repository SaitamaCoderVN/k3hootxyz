import { useState, useEffect } from 'react';
import { useK3HootClient, QuizSet, QuestionBlock, DecryptedQuestion } from '@/lib/solana-client';
import { useTopics } from '@/hooks/useTopics';
import { TopicWithStats } from '@/lib/solana-client';
import { PublicKey } from '@solana/web3.js';

export interface QuizSetWithQuestions {
  publicKey: string;
  account: QuizSet;
  questionBlocks: QuestionBlock[];
  decryptedQuestions: DecryptedQuestion[];
  canPlay: boolean;
  isCompleted: boolean;
}

export interface QuizAnswer {
  questionIndex: number;
  userAnswer: string;
  isCorrect?: boolean;
}

export interface QuizResult {
  quizSetPda: string;
  quizSetName: string;
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  isWinner: boolean;
  answers: QuizAnswer[];
  completedAt: Date;
}

type PlayState = 'topics' | 'quizzes' | 'playing' | 'results';

export function usePlayFlow() {
  const [playState, setPlayState] = useState<PlayState>('topics');
  const [selectedTopic, setSelectedTopic] = useState<TopicWithStats | null>(null);
  const [topicQuizSets, setTopicQuizSets] = useState<QuizSetWithQuestions[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizSetWithQuestions | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ success: boolean; txSignature?: string; error?: string } | null>(null);

  const client = useK3HootClient();
  const { topics, activeTopics, loading: topicsLoading, error: topicsError } = useTopics();

  // Fetch quiz sets for a specific topic
  const fetchQuizSetsForTopic = async (topic: TopicWithStats) => {
    if (!client) {
      setError('Client not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use the new method that mirrors the TypeScript script
      const quizSetsData = await client.findQuizSetsForTopic(topic.name);
      
      // Transform quiz sets data
      const topicQuizSets: QuizSetWithQuestions[] = [];
      
      for (const quizSetData of quizSetsData) {
        try {
          const quizSetPubkey = quizSetData.publicKey;
          const quizSetAccount = quizSetData.account;
          
          // Get question blocks and decrypt questions
          const questionBlocks = await client.getQuestionBlocks(quizSetPubkey);
          const decryptedQuestions = await client.processQuizQuestions(questionBlocks);
          
          const canPlay = !quizSetAccount.winner && questionBlocks.length > 0 && decryptedQuestions.length > 0;
          const isCompleted = !!quizSetAccount.winner;
          
          topicQuizSets.push({
            publicKey: quizSetPubkey.toString(),
            account: quizSetAccount,
            questionBlocks,
            decryptedQuestions,
            canPlay,
            isCompleted
          });
          
        } catch (err) {
          console.warn(`⚠️ Error processing quiz set:`, err);
        }
      }
      
      setTopicQuizSets(topicQuizSets);
      
    } catch (err: any) {
      console.error('❌ Error fetching quiz sets for topic:', err);
      setError(err.message || 'Failed to fetch quiz sets');
    } finally {
      setLoading(false);
    }
  };

  // Select a topic and load its quiz sets
  const selectTopic = async (topic: TopicWithStats) => {
    setSelectedTopic(topic);
    setPlayState('quizzes');
    await fetchQuizSetsForTopic(topic);
  };

  // Start a quiz
  const startQuiz = async (quizSetPda: string): Promise<boolean> => {
    const quiz = topicQuizSets.find(q => q.publicKey === quizSetPda);
    if (!quiz || !quiz.canPlay) {
      setError('Quiz not available for play');
      return false;
    }
    
    setCurrentQuiz(quiz);
    setPlayState('playing');
    setError(null);
    
    return true;
  };

  // Submit quiz answers and get results
  const submitQuizAnswers = async (answers: QuizAnswer[]): Promise<QuizResult | null> => {
    if (!client || !currentQuiz || !selectedTopic) {
      setError('No active quiz session');
      return null;
    }

    try {
      setError(null);
      
      // Verify answers using the client
      const results = [];
      let correctCount = 0;
      
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        const questionBlock = currentQuiz.questionBlocks.find(
          q => q.questionIndex === answer.questionIndex
        );
        
        if (questionBlock) {
          // Use the real verification method from client
          const isCorrect = await client.verifyAnswerOnchain(questionBlock, answer.userAnswer);
          
          if (isCorrect) {
            correctCount++;
          }
          
          results.push({
            ...answer,
            isCorrect
          });
        } else {
          results.push({
            ...answer,
            isCorrect: false
          });
        }
      }
      
      const score = Math.round((correctCount / answers.length) * 100);
      const isWinner = correctCount === answers.length;
      
      const result: QuizResult = {
        quizSetPda: currentQuiz.publicKey,
        quizSetName: currentQuiz.account.name,
        topicName: selectedTopic.name,
        totalQuestions: answers.length,
        correctAnswers: correctCount,
        score,
        isWinner,
        answers: results,
        completedAt: new Date()
      };
      
      setQuizResult(result);
      setPlayState('results');
      
      // Refresh quiz sets to update completion status
      await fetchQuizSetsForTopic(selectedTopic);
      
      return result;
      
    } catch (err: any) {
      console.error('❌ Error submitting quiz answers:', err);
      setError(err.message || 'Failed to submit answers');
      return null;
    }
  };

  // Claim reward for completed quiz
  const claimReward = async (quizSetPda: string): Promise<{ success: boolean; txSignature?: string; error?: string }> => {
    if (!client) {
      return { success: false, error: 'Client not available' };
    }

    try {
      setClaiming(true);
      setError(null);
      
      // First, set winner if not already set
      const quiz = topicQuizSets.find(q => q.publicKey === quizSetPda);
      if (!quiz) {
        return { success: false, error: 'Quiz not found' };
      }

      // Check if winner is already set
      const quizSetAccount = await client.getQuizSet(new PublicKey(quizSetPda));
      if (!quizSetAccount) {
        return { success: false, error: 'Quiz set not found' };
      }

      // Set winner if not already set
      if (!quizSetAccount.winner) {
        const winnerSet = await client.setWinnerForDevnet(
          quizSetPda,
          quiz.decryptedQuestions.length // Assume all correct for perfect score
        );

        if (!winnerSet) {
          return { success: false, error: 'Failed to set winner status' };
        }
      }

      // Claim the reward
      const result = await client.claimReward(quizSetPda);
      setClaimResult(result);

      if (result.success) {
        // Record the completion
        await client.recordQuizCompletion(
          quizSetPda,
          true, // is winner
          quiz.decryptedQuestions.length, // correct answers
          quiz.decryptedQuestions.length, // total questions
          quizSetAccount.rewardAmount.toNumber()
        );

        // Refresh quiz sets to update claim status
        if (selectedTopic) {
          await fetchQuizSetsForTopic(selectedTopic);
        }
      }

      return result;
      
    } catch (err: any) {
      console.error('❌ Error claiming reward:', err);
      const errorResult = { success: false, error: err.message || 'Failed to claim reward' };
      setClaimResult(errorResult);
      return errorResult;
    } finally {
      setClaiming(false);
    }
  };

  // Navigation functions
  const backToTopics = () => {
    setPlayState('topics');
    setSelectedTopic(null);
    setTopicQuizSets([]);
    setCurrentQuiz(null);
    setQuizResult(null);
    setError(null);
  };

  const backToQuizzes = () => {
    setPlayState('quizzes');
    setCurrentQuiz(null);
    setQuizResult(null);
    setError(null);
  };

  const playAgain = () => {
    setPlayState('quizzes');
    setCurrentQuiz(null);
    setQuizResult(null);
    setError(null);
  };

  // Get available and completed quiz counts for current topic
  const getAvailableQuizzes = (): QuizSetWithQuestions[] => {
    return topicQuizSets.filter(quiz => quiz.canPlay);
  };

  const getCompletedQuizzes = (): QuizSetWithQuestions[] => {
    return topicQuizSets.filter(quiz => quiz.isCompleted);
  };

  return {
    // State
    playState,
    selectedTopic,
    topicQuizSets,
    availableQuizzes: getAvailableQuizzes(),
    completedQuizzes: getCompletedQuizzes(),
    currentQuiz,
    quizResult,
    loading: loading || topicsLoading,
    error: error || topicsError,
    claiming,
    claimResult,

    // Data
    topics,
    activeTopics,

    // Actions
    selectTopic,
    startQuiz,
    submitQuizAnswers,
    backToTopics,
    backToQuizzes,
    playAgain,
    claimReward,

    // Stats
    totalTopics: activeTopics.length,
    availableQuizzesCount: getAvailableQuizzes().length,
    completedQuizzesCount: getCompletedQuizzes().length,
  };
}