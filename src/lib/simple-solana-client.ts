import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { K3HootProgramArcium } from "../types/k_3_hoot_program_arcium";
import {
  PublicKey,
  SystemProgram,
  Connection,
  LAMPORTS_PER_SOL,
  Commitment
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { AnchorWallet } from '@solana/wallet-adapter-react';
import IDL from '../idl/k_3_hoot_program_arcium.json';
import { SimpleQuiz, QuizCreationData, QuizSetCreationData, QuestionCreationData, QuizResult, LeaderboardEntry } from '../types/quiz';
import { supabase } from './supabase-client';

// Program ID from documentation
const PROGRAM_ID = new PublicKey("6noZrDWRwRnMx2cszs5P2wdpYpVwYCdQL5Ps6gFhD5T5");

// RPC Endpoints
export const SOLANA_RPC = {
  devnet: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
  mainnet: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
};

/**
 * Simplified K3Hoot Client for simple quiz game
 * Supports: Create quiz, Submit answer (A/B/C/D), Claim reward
 */
export class SimpleK3HootClient {
  private program: Program;
  private connection: Connection;
  private provider: AnchorProvider;
  private wallet: AnchorWallet;

  constructor(wallet: AnchorWallet, network: 'devnet' | 'mainnet' = 'devnet') {
    this.wallet = wallet;
    this.connection = new Connection(
      network === 'devnet' ? SOLANA_RPC.devnet : SOLANA_RPC.mainnet,
      'confirmed' as Commitment
    );
    
    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    // Create program instance with IDL
    this.program = new Program(
      IDL as Idl,
      this.provider
    );
  }

  /**
   * Derive Answer Account PDA
   */
  private deriveAnswerPda(quizId: number, questionId: number, topicId: number): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("answer"),
        new BN(quizId).toArrayLike(Buffer, 'le', 8),
        new BN(questionId).toArrayLike(Buffer, 'le', 8),
        new BN(topicId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );
    return pda;
  }

  /**
   * Derive Reward Pool PDA
   */
  private deriveRewardPoolPda(quizId: number): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reward_pool"),
        new BN(quizId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );
    return pda;
  }

  /**
   * Encode answer as bytes (A=65, B=66, C=67, D=68)
   */
  private encodeAnswer(answer: "A" | "B" | "C" | "D"): number[] {
    const encoded = new Uint8Array(64).fill(0);
    encoded[0] = answer.charCodeAt(0);
    return Array.from(encoded);
  }

  /**
   * Create a new quiz
   * Admin function to create quiz with reward pool
   */
  async createQuiz(data: QuizCreationData): Promise<{
    quizId: number;
    questionId: number;
    topicId: number;
    answerPda: PublicKey;
    rewardPoolPda: PublicKey;
    signature: string;
  }> {
    // Generate IDs
    const quizId = Date.now();
    const questionId = 1;
    const topicId = 100; // Default topic ID
    
    // Derive PDAs
    const answerPda = this.deriveAnswerPda(quizId, questionId, topicId);
    const rewardPoolPda = this.deriveRewardPoolPda(quizId);
    
    // Encode correct answer
    const encodedAnswer = this.encodeAnswer(data.correctAnswer);
    
    console.log('🚀 Creating quiz on-chain...');
    console.log('📝 Question:', data.question);
    console.log('📋 Options:', data.options);
    console.log('✅ Correct Answer:', data.correctAnswer);
    console.log('💰 Reward:', data.rewardAmount, 'SOL');
    
    try {
      // Step 1: Create answer account ON-CHAIN
      console.log('⏳ Step 1: Creating answer account...');
      const createAnswerTx = await this.program.methods
        .createAnswerAccount(
          new BN(quizId),
          new BN(questionId),
          new BN(topicId),
          encodedAnswer,
          new BN(Date.now())
        )
        .accountsPartial({
          answerAccount: answerPda,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('✅ Answer account created! TX:', createAnswerTx);
      
      // Step 2: Create reward pool ON-CHAIN
      console.log('⏳ Step 2: Creating reward pool...');
      const rewardLamports = data.rewardAmount * LAMPORTS_PER_SOL;
      const createRewardTx = await this.program.methods
        .createRewardPool(new BN(quizId), new BN(rewardLamports))
        .accountsPartial({
          rewardPool: rewardPoolPda,
          funder: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('✅ Reward pool created! TX:', createRewardTx);
      
      // Step 3: Store question metadata in Supabase
      console.log('⏳ Step 3: Storing quiz metadata to Supabase...');
      
      try {
        // Insert into questions table
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_set_id: quizId.toString(), // Use quizId as quiz_set_id
            question_index: questionId,
            question_text: data.question,
            choices: data.options, // JSONB array
            correct_answer: data.correctAnswer,
          })
          .select()
          .single();
        
        if (questionError) {
          console.error('❌ Supabase error:', questionError);
          throw questionError;
        }
        
        console.log('✅ Quiz metadata stored in Supabase!', questionData);
      } catch (supabaseError) {
        console.error('⚠️ Failed to save to Supabase, falling back to localStorage:', supabaseError);
        
        // Fallback to localStorage
        const quizMetadata = {
          quizId,
          question: data.question,
          options: data.options,
          correctAnswer: data.correctAnswer,
          rewardAmount: data.rewardAmount,
          creator: this.wallet.publicKey.toString(),
          createdAt: new Date().toISOString(),
        };
        
        const existingQuizzes = JSON.parse(localStorage.getItem('quizMetadata') || '[]');
        existingQuizzes.push(quizMetadata);
        localStorage.setItem('quizMetadata', JSON.stringify(existingQuizzes));
        console.log('✅ Quiz metadata stored in localStorage (fallback)');
      }
      
      console.log('🎉 Quiz created successfully!');
      console.log('📍 Answer PDA:', answerPda.toString());
      console.log('📍 Reward Pool PDA:', rewardPoolPda.toString());
      
      return {
        quizId,
        questionId,
        topicId,
        answerPda,
        rewardPoolPda,
        signature: createRewardTx
      };
    } catch (error) {
      console.error('❌ Error creating quiz:', error);
      throw error;
    }
  }

  /**
   * Create a new quiz set with multiple questions
   * NEW: Supports custom quiz name and multiple questions with individual rewards
   */
  async createQuizSet(data: QuizSetCreationData): Promise<{
    quizSetId: string;
    questionIds: string[];
    totalReward: number;
    signatures: string[];
  }> {
    console.log('🚀 Creating quiz set:', data.name);
    console.log('📝 Questions:', data.questions.length);
    
    try {
      // Step 1: Create quiz_set in Supabase
      console.log('⏳ Step 1: Creating quiz set in database...');
      
      const totalReward = data.questions.reduce((sum, q) => sum + q.rewardAmount, 0);
      
      const { data: quizSetData, error: quizSetError } = await supabase
        .from('quiz_sets')
        .insert({
          name: data.name,
          authority: this.wallet.publicKey.toString(),
          question_count: data.questions.length,
          reward_amount: totalReward, // Column name in DB is reward_amount, not total_reward
          is_active: true
        })
        .select()
        .single();
      
      if (quizSetError || !quizSetData) {
        console.error('❌ Supabase Error Details:', {
          message: quizSetError?.message,
          details: quizSetError?.details,
          hint: quizSetError?.hint,
          code: quizSetError?.code
        });
        
        // Check if it's a schema issue
        if (quizSetError?.message?.includes('column') || quizSetError?.code === '42703') {
          console.warn('⚠️ Database migration not applied! Columns missing.');
          console.warn('⚠️ Please run migration: src/supabase/migrations/002_quiz_sets_refactor.sql');
          throw new Error('Database migration required. Please apply 002_quiz_sets_refactor.sql first.');
        }
        
        throw new Error(`Failed to create quiz set: ${quizSetError?.message || 'Unknown error'}`);
      }
      
      const quizSetId = quizSetData.id;
      console.log('✅ Quiz set created! ID:', quizSetId);
      
      // Step 2: Create each question
      const questionIds: string[] = [];
      const signatures: string[] = [];
      
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        const questionIndex = i + 1;
        
        console.log(`\n📝 Creating Question ${questionIndex}/${data.questions.length}...`);
        console.log('   Text:', question.questionText);
        console.log('   Reward:', question.rewardAmount, 'SOL');
        
        // Generate blockchain quiz ID (timestamp-based)
        const blockchainQuizId = Date.now() + i; // Ensure unique IDs
        const topicId = 100; // Default topic
        
        // Derive PDAs
        const answerPda = this.deriveAnswerPda(blockchainQuizId, questionIndex, topicId);
        const rewardPoolPda = this.deriveRewardPoolPda(blockchainQuizId);
        
        // Encode correct answer
        const encodedAnswer = this.encodeAnswer(question.correctAnswer);
        
        // Step 2a: Create answer account ON-CHAIN
        console.log('   ⏳ Creating answer account on-chain...');
        const createAnswerTx = await this.program.methods
          .createAnswerAccount(
            new BN(blockchainQuizId),
            new BN(questionIndex),
            new BN(topicId),
            encodedAnswer,
            new BN(Date.now())
          )
          .accountsPartial({
            answerAccount: answerPda,
            authority: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        console.log('   ✅ Answer account created! TX:', createAnswerTx);
        signatures.push(createAnswerTx);
        
        // Step 2b: Create reward pool ON-CHAIN
        console.log('   ⏳ Creating reward pool on-chain...');
        const rewardLamports = question.rewardAmount * LAMPORTS_PER_SOL;
        const createRewardTx = await this.program.methods
          .createRewardPool(new BN(blockchainQuizId), new BN(rewardLamports))
          .accountsPartial({
            rewardPool: rewardPoolPda,
            funder: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        console.log('   ✅ Reward pool created! TX:', createRewardTx);
        signatures.push(createRewardTx);
        
        // Step 2c: Insert question into Supabase
        console.log('   ⏳ Saving question to database...');
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_set_id: quizSetId,
            question_index: i, // 0-based index
            question_text: question.questionText,
            choices: question.choices,
            correct_answer: question.correctAnswer,
            reward_amount: question.rewardAmount,
            blockchain_quiz_id: blockchainQuizId,
          })
          .select()
          .single();
        
        if (questionError || !questionData) {
          console.error('   ❌ Failed to save question:', questionError);
          throw new Error(`Failed to save question ${questionIndex} to database`);
        }
        
        questionIds.push(questionData.id);
        console.log('   ✅ Question saved! ID:', questionData.id);
      }
      
      console.log('\n🎉 Quiz set created successfully!');
      console.log('📋 Summary:');
      console.log('   • Quiz Set ID:', quizSetId);
      console.log('   • Questions:', questionIds.length);
      console.log('   • Total Reward:', totalReward, 'SOL');
      console.log('   • Transactions:', signatures.length);
      
      return {
        quizSetId,
        questionIds,
        totalReward,
        signatures
      };
    } catch (error) {
      console.error('❌ Error creating quiz set:', error);
      throw error;
    }
  }

  /**
   * Submit answer to a quiz
   * User function to answer A/B/C/D
   */
  async submitAnswer(
    quizId: number,
    questionId: number,
    topicId: number,
    userAnswer: "A" | "B" | "C" | "D"
  ): Promise<QuizResult> {
    const answerPda = this.deriveAnswerPda(quizId, questionId, topicId);
    const rewardPoolPda = this.deriveRewardPoolPda(quizId);
    
    console.log('🎯 Submitting answer...');
    console.log('📝 Quiz ID:', quizId);
    console.log('✍️ Your Answer:', userAnswer);
    console.log('📍 Answer PDA:', answerPda.toString());
    console.log('📍 Reward Pool PDA:', rewardPoolPda.toString());
    
    try {
      // Submit answer to blockchain
      console.log('⏳ Calling submitAnswerMock on-chain...');
      const signature = await this.program.methods
        .submitAnswerMock(userAnswer)
        .accountsPartial({
          answerAccount: answerPda,
          rewardPool: rewardPoolPda,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('✅ Answer submitted! TX:', signature);
      
      // Fetch reward pool to check if winner
      console.log('🔍 Checking if you won...');
      const pool: any = await (this.program.account as any).rewardPool.fetch(rewardPoolPda);
      const isWinner = pool.winner ? pool.winner.equals(this.wallet.publicKey) : false;
      
      console.log('🏆 Result:', isWinner ? 'YOU WON! 🎉' : 'Wrong answer 😔');
      console.log('💰 Reward Amount:', pool.rewardAmount.toNumber() / LAMPORTS_PER_SOL, 'SOL');
      
      return {
        questionId: quizId.toString(), // Convert to string for UUID compatibility
        quizSetId: quizId.toString(), // Use quizId as quizSetId for backward compatibility
        questionIndex: questionId - 1, // Convert to 0-based index
        userAnswer: { letter: userAnswer, isCorrect: isWinner },
        isWinner,
        rewardAmount: pool.rewardAmount.toNumber() / LAMPORTS_PER_SOL,
        signature
      };
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Claim reward (only winner can call)
   */
  async claimReward(quizId: number): Promise<{
    success: boolean;
    amountClaimed: number;
    signature: string;
  }> {
    const rewardPoolPda = this.deriveRewardPoolPda(quizId);
    
    try {
      // Get balance before
      const balanceBefore = await this.connection.getBalance(this.wallet.publicKey);
      
      // Claim reward
      const signature = await this.program.methods
        .claimReward()
        .accountsPartial({
          rewardPool: rewardPoolPda,
          claimer: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('✅ Reward claimed:', signature);
      
      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      // Get balance after
      const balanceAfter = await this.connection.getBalance(this.wallet.publicKey);
      const amountClaimed = (balanceAfter - balanceBefore) / LAMPORTS_PER_SOL;
      
      return {
        success: true,
        amountClaimed,
        signature
      };
    } catch (error) {
      console.error('❌ Error claiming reward:', error);
      throw error;
    }
  }

  /**
   * Get quiz by ID
   * Fetches from blockchain and merges with Supabase metadata
   */
  async getQuizById(quizId: number, questionId: number = 1, topicId: number = 100): Promise<SimpleQuiz | null> {
    const answerPda = this.deriveAnswerPda(quizId, questionId, topicId);
    const rewardPoolPda = this.deriveRewardPoolPda(quizId);
    
    try {
      const [answerAccount, rewardPool] = await Promise.all([
        (this.program.account as any).answerAccount.fetchNullable(answerPda),
        (this.program.account as any).rewardPool.fetchNullable(rewardPoolPda)
      ]);
      
      if (!answerAccount || !rewardPool) {
        console.error('❌ Quiz not found on blockchain');
        return null;
      }
      
      // Load metadata from Supabase using blockchain_quiz_id
      let question = `Quiz #${quizId}`;
      let options = ["Option A", "Option B", "Option C", "Option D"];
      
      try {
        console.log('🔍 Loading quiz from Supabase, blockchain_quiz_id:', quizId);
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('blockchain_quiz_id', quizId) // Use blockchain_quiz_id instead of quiz_set_id
          .single();
        
        if (questionError) {
          console.warn('⚠️ Supabase error, trying localStorage fallback:', questionError);
          // Fallback to localStorage
          const quizMetadata: any[] = JSON.parse(localStorage.getItem('quizMetadata') || '[]');
          const metadata: any = quizMetadata.find((m: any) => m.quizId === quizId);
          if (metadata) {
            question = metadata.question;
            options = metadata.options;
            console.log('✅ Loaded from localStorage (fallback)');
          }
        } else if (questionData) {
          question = questionData.question_text;
          options = questionData.choices as string[];
          console.log('✅ Loaded from Supabase:', { question, options });
        }
      } catch (supabaseError) {
        console.error('⚠️ Supabase fetch failed, using localStorage:', supabaseError);
        // Fallback to localStorage
        const quizMetadata: any[] = JSON.parse(localStorage.getItem('quizMetadata') || '[]');
        const metadata: any = quizMetadata.find((m: any) => m.quizId === quizId);
        if (metadata) {
          question = metadata.question;
          options = metadata.options;
        }
      }
      
      console.log('📊 Quiz loaded:', {
        quizId,
        question,
        optionsCount: options.length,
        winner: rewardPool.winner?.toString(),
        isClaimed: rewardPool.isClaimed
      });
      
      return {
        quizId,
        questionId,
        topicId,
        question,
        options,
        rewardAmount: rewardPool.rewardAmount.toNumber() / LAMPORTS_PER_SOL,
        winner: rewardPool.winner || null,
        isClaimed: rewardPool.isClaimed,
        answerAccountPda: answerPda,
        rewardPoolPda,
        createdAt: new Date(answerAccount.createdAt.toNumber())
      };
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      return null;
    }
  }

  /**
   * Get all quizzes
   * Fetches all reward pools from blockchain and merges with Supabase metadata
   */
  async getAllQuizzes(): Promise<SimpleQuiz[]> {
    try {
      // Fetch reward pools from blockchain
      const rewardPools: any[] = await (this.program.account as any).rewardPool.all();
      
      // Get quiz metadata from Supabase
      let metadataMap = new Map();
      
      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*');
        
        if (questionsError) {
          console.warn('⚠️ Failed to load from Supabase, using localStorage:', questionsError);
          // Fallback to localStorage
          const quizMetadata: any[] = JSON.parse(localStorage.getItem('quizMetadata') || '[]');
          metadataMap = new Map(quizMetadata.map((m: any) => [m.quizId, m]));
        } else if (questionsData) {
          // Create map: blockchain_quiz_id -> question data
          // blockchain_quiz_id is the timestamp ID used on-chain
          metadataMap = new Map(
            questionsData
              .filter((q: any) => q.blockchain_quiz_id) // Only include questions with blockchain_quiz_id
              .map((q: any) => [
                parseInt(q.blockchain_quiz_id), // Use blockchain_quiz_id as key
                {
                  question: q.question_text,
                  options: q.choices,
                  correctAnswer: q.correct_answer
                }
              ])
          );
          console.log(`✅ Loaded ${questionsData.length} quizzes from Supabase`);
          console.log(`📊 Mapped ${metadataMap.size} quizzes by blockchain_quiz_id`);
        }
      } catch (supabaseError) {
        console.error('⚠️ Supabase error, using localStorage:', supabaseError);
        // Fallback to localStorage
        const quizMetadata: any[] = JSON.parse(localStorage.getItem('quizMetadata') || '[]');
        metadataMap = new Map(quizMetadata.map((m: any) => [m.quizId, m]));
      }
      
      const quizzes = await Promise.all(
        rewardPools.map(async (pool: any) => {
          const quizId = pool.account.quizId.toNumber();
          const questionId = pool.account.questionId.toNumber();
          const topicId = pool.account.topicId.toNumber();
          
          const answerPda = this.deriveAnswerPda(quizId, questionId, topicId);
          
          // Get metadata for this quiz
          const metadata: any = metadataMap.get(quizId);
          
          try {
            const answerAccount: any = await (this.program.account as any).answerAccount.fetchNullable(answerPda);
            
            return {
              quizId,
              questionId,
              topicId,
              question: metadata?.question || `Quiz #${quizId}`,
              options: metadata?.options || ["Option A", "Option B", "Option C", "Option D"],
              rewardAmount: pool.account.rewardAmount.toNumber() / LAMPORTS_PER_SOL,
              winner: pool.account.winner || null,
              isClaimed: pool.account.isClaimed,
              answerAccountPda: answerPda,
              rewardPoolPda: pool.publicKey,
              createdAt: answerAccount ? new Date(answerAccount.createdAt.toNumber()) : new Date()
            } as SimpleQuiz;
          } catch {
            return null;
          }
        })
      );
      
      return quizzes.filter((q: any): q is SimpleQuiz => q !== null);
    } catch (error) {
      console.error('❌ Error fetching all quizzes:', error);
      return [];
    }
  }

  /**
   * Get leaderboard (all winners)
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const quizzes = await this.getAllQuizzes();
      
      return quizzes
        .filter(q => q.winner !== null)
        .map(q => ({
          quizSetId: q.quizId.toString(), // Convert to string for UUID compatibility
          quizSetName: q.question,
          questionIndex: q.questionId - 1, // Convert to 0-based index
          questionText: q.question,
          winner: q.winner!.toString(), // Convert PublicKey to string
          winnerDisplay: `${q.winner!.toString().slice(0, 4)}...${q.winner!.toString().slice(-4)}`,
          rewardAmount: q.rewardAmount,
          isClaimed: q.isClaimed,
          claimedAt: q.isClaimed ? q.createdAt : undefined
        }));
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      return [];
    }
  }

  /**
   * Close answer account (cleanup)
   */
  async closeAnswerAccount(quizId: number, questionId: number, topicId: number): Promise<string> {
    const answerPda = this.deriveAnswerPda(quizId, questionId, topicId);
    
    const signature = await this.program.methods
      .closeAnswerAccount(
        new BN(quizId),
        new BN(questionId),
        new BN(topicId)
      )
      .accountsPartial({
        answerAccount: answerPda,
        authority: this.wallet.publicKey,
      })
      .rpc();
    
    return signature;
  }

  /**
   * Close reward pool (cleanup)
   */
  async closeRewardPool(quizId: number): Promise<string> {
    const rewardPoolPda = this.deriveRewardPoolPda(quizId);
    
    const signature = await this.program.methods
      .closeRewardPool(new BN(quizId))
      .accountsPartial({
        rewardPool: rewardPoolPda,
        authority: this.wallet.publicKey,
      })
      .rpc();
    
    return signature;
  }
}

/**
 * Hook to create client instance
 */
export function useSimpleK3HootClient(
  wallet: AnchorWallet | undefined,
  network: 'devnet' | 'mainnet' = 'devnet'
): SimpleK3HootClient | null {
  if (!wallet) return null;
  return new SimpleK3HootClient(wallet, network);
}

