import { useState, useEffect } from 'react';
import { useK3HootClient, QuizSet, QuestionBlock, DecryptedQuestion } from '@/lib/solana-client';
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
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  isWinner: boolean;
  answers: QuizAnswer[];
  completedAt: Date;
}

export function useQuizSets() {
  const [quizSets, setQuizSets] = useState<QuizSetWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizSetWithQuestions | null>(null);
  const [playingQuiz, setPlayingQuiz] = useState(false);
  
  const client = useK3HootClient();

  // Fetch all available quiz sets
  const fetchQuizSets = async () => {
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const allQuizSets = await client.getAllQuizSets();
      
      // Transform and filter quiz sets
      const processedQuizSets: QuizSetWithQuestions[] = [];
      
      for (const quizSet of allQuizSets) {
        try {
          // Convert string address to PublicKey
          let quizSetPubkey: PublicKey;
          if (typeof quizSet === 'object' && 'publicKey' in quizSet) {
            quizSetPubkey = (quizSet as any).publicKey;
          } else {
            // If we only have the account data, we need to find a way to get the public key
            // For now, skip sets where we don't have the public key
            continue;
          }

          const questionBlocks = await client.getQuestionBlocks(quizSetPubkey);
          const decryptedQuestions = await client.processQuizQuestions(questionBlocks);
          
          const canPlay = !quizSet.winner && questionBlocks.length > 0 && decryptedQuestions.length > 0;
          const isCompleted = !!quizSet.winner;
          
          processedQuizSets.push({
            publicKey: quizSetPubkey.toString(),
            account: quizSet,
            questionBlocks,
            decryptedQuestions,
            canPlay,
            isCompleted
          });
          
        } catch (err) {
          console.warn(`⚠️ Error processing quiz set:`, err);
          // Continue with other quiz sets
        }
      }
      
      setQuizSets(processedQuizSets);
      
    } catch (err: any) {
      console.error('❌ Error fetching quiz sets:', err);
      setError(err.message || 'Failed to fetch quiz sets');
    } finally {
      setLoading(false);
    }
  };

  // Start a quiz
  const startQuiz = async (quizSetPda: string): Promise<QuizSetWithQuestions | null> => {
    const quiz = quizSets.find(q => q.publicKey === quizSetPda);
    if (!quiz || !quiz.canPlay) {
      setError('Quiz not available for play');
      return null;
    }
    
    setCurrentQuiz(quiz);
    setPlayingQuiz(true);
    setError(null);
    
    return quiz;
  };

  // Submit quiz answers and get results
  const submitQuizAnswers = async (
    quizSetPda: string,
    answers: QuizAnswer[]
  ): Promise<QuizResult | null> => {
    if (!client || !currentQuiz) {
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
        quizSetPda,
        quizSetName: currentQuiz.account.name,
        totalQuestions: answers.length,
        correctAnswers: correctCount,
        score,
        isWinner,
        answers: results,
        completedAt: new Date()
      };
      
      // Reset current quiz
      setCurrentQuiz(null);
      setPlayingQuiz(false);
      
      // Refresh quiz sets to update completion status
      await fetchQuizSets();
      
      return result;
      
    } catch (err: any) {
      console.error('❌ Error submitting quiz answers:', err);
      setError(err.message || 'Failed to submit answers');
      return null;
    }
  };

  // Mock answer verification for development
  const mockVerifyAnswer = async (questionBlock: QuestionBlock, userAnswer: string): Promise<boolean> => {
    // This is a placeholder - in production this would use blockchain verification
    // For now, we'll decrypt the correct answer locally for testing
    try {
      if (!questionBlock.nonce) return false;
      
      const nonce = questionBlock.nonce.toNumber();
      const encryptedY = questionBlock.encryptedYCoordinate;
      
      // XOR decryption
      const decryptedY = new Uint8Array(64);
      for (let i = 0; i < 64; i++) {
        decryptedY[i] = encryptedY[i] ^ (nonce & 0xFF);
      }
      
      const correctAnswer = new TextDecoder().decode(decryptedY).replace(/\0/g, '');
      return userAnswer === correctAnswer;
      
    } catch (err) {
      console.warn('Mock verification failed:', err);
      return false;
    }
  };

  // End current quiz
  const endQuiz = () => {
    setCurrentQuiz(null);
    setPlayingQuiz(false);
    setError(null);
  };

  // Get available quizzes (not completed)
  const getAvailableQuizzes = (): QuizSetWithQuestions[] => {
    return quizSets.filter(quiz => quiz.canPlay);
  };

  // Get completed quizzes
  const getCompletedQuizzes = (): QuizSetWithQuestions[] => {
    return quizSets.filter(quiz => quiz.isCompleted);
  };

  // Initial fetch on client ready
  useEffect(() => {
    if (client) {
      fetchQuizSets();
    }
  }, [client]);

  return {
    // Data
    quizSets,
    availableQuizzes: getAvailableQuizzes(),
    completedQuizzes: getCompletedQuizzes(),
    currentQuiz,
    
    // State
    loading,
    error,
    playingQuiz,
    
    // Actions
    fetchQuizSets,
    startQuiz,
    submitQuizAnswers,
    endQuiz,
    
    // Stats
    totalQuizzes: quizSets.length,
    availableCount: getAvailableQuizzes().length,
    completedCount: getCompletedQuizzes().length,
  };
}
