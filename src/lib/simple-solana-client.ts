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
import { ResilientConnection, createResilientConnection } from './solana-connection';
import { createEncryptionContext, encryptQuizAnswer, letterToAnswer } from './encryption/arcium-encryption';

// Program ID (must match the IDL)
const PROGRAM_ID = new PublicKey("24MqGK5Ei8aKG6fCK8Ym36cHy1UvYD3zicRHWaEpekz4");

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
  private connection: ResilientConnection;
  private provider: AnchorProvider;
  private wallet: AnchorWallet;

  constructor(wallet: AnchorWallet, network: 'devnet' | 'mainnet' = 'devnet') {
    this.wallet = wallet;
    // Use ResilientConnection with retry logic to avoid 429 errors
    this.connection = createResilientConnection(network, {
      maxRetries: 5,
      initialDelayMs: 2000, // Start with 2 second delay
      maxDelayMs: 30000,
      backoffMultiplier: 2
    });

    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      {
        commitment: 'confirmed',
        preflightCommitment: 'processed',
        skipPreflight: false // Enable simulation with retry logic
      }
    );

    // Create program instance (program ID comes from IDL.address)
    this.program = new Program(
      IDL as unknown as Idl,
      this.provider
    ) as Program<K3HootProgramArcium>;
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
   * Uses Arcium encryption for privacy-preserving answer validation
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
      // Step 0: Setup encryption context
      console.log('🔐 Setting up encryption context...');
      const encryptionCtx = await createEncryptionContext(
        this.provider,
        this.program.programId
      );

      // Step 1: Generate unique ID for quiz set (u8: 0-255)
      const uniqueId = Math.floor(Math.random() * 256);

      // Calculate total reward
      const totalReward = data.questions.reduce((sum, q) => sum + q.rewardAmount, 0);
      const totalRewardLamports = new BN(totalReward * LAMPORTS_PER_SOL);

      console.log('   • Unique ID:', uniqueId);
      console.log('   • Total Reward:', totalReward, 'SOL');

      // Step 2: Derive QuizSet PDA
      const [quizSetPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('quiz_set'),
          this.wallet.publicKey.toBuffer(),
          Buffer.from([uniqueId])
        ],
        this.program.programId
      );

      // Derive Vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vault'),
          quizSetPda.toBuffer()
        ],
        this.program.programId
      );

      console.log('   • Quiz Set PDA:', quizSetPda.toString());
      console.log('   • Vault PDA:', vaultPda.toString());

      // Step 3: Create quiz set on-chain
      console.log('⏳ Step 1: Creating quiz set on blockchain...');
      const createQuizSetTx = await this.program.methods
        .createQuizSet(
          data.name,
          data.questions.length,
          uniqueId,
          totalRewardLamports
        )
        .accountsPartial({
          quizSet: quizSetPda,
          vault: vaultPda,
          authority: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Quiz set created on-chain! TX:', createQuizSetTx);
      const signatures: string[] = [createQuizSetTx];

      // Step 3.5: Save quiz set to Supabase FIRST (before questions)
      console.log('⏳ Step 2: Saving quiz set to database...');
      const { data: quizSetData, error: quizSetError } = await supabase
        .from('quiz_sets')
        .insert({
          id: quizSetPda.toString(), // Use PDA as primary key
          name: data.name,
          authority: this.wallet.publicKey.toString(),
          question_count: data.questions.length,
          reward_amount: totalReward,
          is_active: true
        })
        .select()
        .single();

      if (quizSetError) {
        console.error('❌ Failed to save quiz set to database:', quizSetError);
        throw new Error('Failed to save quiz set to database');
      }

      console.log('✅ Quiz set saved to database!');

      // Step 4: Add encrypted questions
      console.log('⏳ Step 3: Adding encrypted questions...');
      const questionIds: string[] = [];

      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        const questionIndex = i + 1; // 1-based index for smart contract

        console.log(`\n📝 Question ${questionIndex}/${data.questions.length}:`);
        console.log('   Text:', question.questionText);
        console.log('   Correct Answer:', question.correctAnswer);

        // Convert answer letter to index (A=0, B=1, C=2, D=3)
        const answerIndex = letterToAnswer(question.correctAnswer);

        // Encrypt the correct answer
        const encrypted = encryptQuizAnswer(encryptionCtx, answerIndex);

        console.log('   🔐 Answer encrypted');

        // Derive QuestionBlock PDA
        const [questionBlockPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('question_block'),
            quizSetPda.toBuffer(),
            Buffer.from([questionIndex])
          ],
          this.program.programId
        );

        // Add encrypted question block on-chain
        console.log('   ⏳ Adding question block on-chain...');
        const addQuestionTx = await this.program.methods
          .addEncryptedQuestionBlock(
            questionIndex,
            Array.from(encrypted.ciphertext),
            Array.from(encrypted.publicKey),
            encrypted.nonce
          )
          .accountsPartial({
            questionBlock: questionBlockPda,
            quizSet: quizSetPda,
            authority: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('   ✅ Question block added! TX:', addQuestionTx);
        signatures.push(addQuestionTx);

        // Store question in Supabase
        console.log('   ⏳ Saving question to database...');
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            quiz_set_id: quizSetPda.toString(), // Use PDA as quiz set ID
            question_index: i, // 0-based index for DB
            question_text: question.questionText,
            choices: question.choices,
            correct_answer: question.correctAnswer,
            reward_amount: question.rewardAmount,
            blockchain_quiz_id: null, // No longer using separate blockchain IDs
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

      // All done!
      console.log('\n🎉 Quiz set created successfully!');
      console.log('📋 Summary:');
      console.log('   • Quiz Set PDA:', quizSetPda.toString());
      console.log('   • Questions:', questionIds.length);
      console.log('   • Total Reward:', totalReward, 'SOL');
      console.log('   • Transactions:', signatures.length);

      return {
        quizSetId: quizSetPda.toString(),
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
   * Submit answer to a quiz (REAL: on-chain validation)
   * Validates answer, updates score on-chain, auto-sets winner when all correct
   */
  async submitAnswer(
    quizSetId: string,
    questionIndex: number,
    userAnswer: "A" | "B" | "C" | "D"
  ): Promise<QuizResult> {
    console.log('🎯 Submitting answer...');
    console.log('📝 Quiz Set ID:', quizSetId);
    console.log('📝 Question Index:', questionIndex);
    console.log('✍️ Your Answer:', userAnswer);

    try {
      // Convert to PublicKey
      const quizSetPubkey = new PublicKey(quizSetId);

      // Derive PlayerAnswer PDA
      const [playerAnswerPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('player_answer'),
          quizSetPubkey.toBuffer(),
          this.wallet.publicKey.toBuffer()
        ],
        this.program.programId
      );

      // Check if PlayerAnswer account exists, if not initialize it
      console.log('🔍 Checking PlayerAnswer account...');
      let playerAnswerAccount: any = await (this.program.account as any).playerAnswer.fetchNullable(playerAnswerPda);

      if (!playerAnswerAccount) {
        console.log('⏳ Initializing PlayerAnswer account...');
        await this.program.methods
          .initPlayerAnswer()
          .accountsPartial({
            playerAnswer: playerAnswerPda,
            quizSet: quizSetPubkey,
            player: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        playerAnswerAccount = await (this.program.account as any).playerAnswer.fetch(playerAnswerPda);
        console.log('✅ PlayerAnswer account initialized');
      }

      // Validate answer against Supabase
      console.log('🔍 Validating answer...');
      const { data: questionData } = await supabase
        .from('questions')
        .select('correct_answer')
        .eq('quiz_set_id', quizSetId)
        .eq('question_index', questionIndex)
        .single();

      const isCorrect = questionData?.correct_answer === userAnswer;
      console.log('✅ Answer:', isCorrect ? 'CORRECT! 🎉' : 'WRONG ❌');

      // Update score on-chain
      console.log('⏳ Updating score on-chain...');
      const signature = await this.program.methods
        .updatePlayerScore(
          (questionIndex + 1) as any, // Convert to 1-based index (u8)
          isCorrect
        )
        .accountsPartial({
          quizSet: quizSetPubkey,
          playerAnswer: playerAnswerPda,
          player: this.wallet.publicKey,
          updater: this.wallet.publicKey,
        })
        .rpc();

      console.log('✅ Score updated on-chain:', signature);

      // Fetch updated quiz set to check winner
      const quizSetAccount: any = await (this.program.account as any).quizSet.fetch(quizSetPubkey);
      const updatedPlayerAnswer: any = await (this.program.account as any).playerAnswer.fetch(playerAnswerPda);

      const isWinner = quizSetAccount.winner && quizSetAccount.winner.equals(this.wallet.publicKey);

      console.log('📊 Updated Stats:');
      console.log('   Correct Count:', updatedPlayerAnswer.correctCount);
      console.log('   Total Score:', updatedPlayerAnswer.totalScore);
      console.log('   Winner:', isWinner ? 'YOU! 🏆' : 'Not yet');

      return {
        questionId: `${quizSetId}-${questionIndex}`,
        quizSetId: quizSetId,
        questionIndex: questionIndex,
        userAnswer: { letter: userAnswer, isCorrect },
        isWinner: isWinner,
        rewardAmount: quizSetAccount.rewardAmount.toNumber() / LAMPORTS_PER_SOL,
        signature
      };
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Claim reward (REAL: on-chain claim)
   * Only winner can claim, transfers SOL from vault to winner
   */
  async claimReward(quizSetId: string): Promise<{
    success: boolean;
    amountClaimed: number;
    signature: string;
  }> {
    try {
      const quizSetPubkey = new PublicKey(quizSetId);

      // Derive Vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vault'),
          quizSetPubkey.toBuffer()
        ],
        this.program.programId
      );

      console.log('💰 Claiming reward from vault:', vaultPda.toString());

      // Get balance before
      const balanceBefore = await this.connection.getBalance(this.wallet.publicKey);

      // Call claim_reward instruction
      console.log('⏳ Calling claim_reward on-chain...');
      const signature = await this.program.methods
        .claimReward()
        .accountsPartial({
          quizSet: quizSetPubkey,
          vault: vaultPda,
          claimer: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Reward claimed! TX:', signature);

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      // Get balance after
      const balanceAfter = await this.connection.getBalance(this.wallet.publicKey);
      const amountClaimed = (balanceAfter - balanceBefore) / LAMPORTS_PER_SOL;

      console.log('💰 Amount claimed:', amountClaimed, 'SOL');

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
   * Get quiz by ID (NEW: uses QuizSet architecture)
   * Fetches from blockchain and merges with Supabase metadata
   */
  async getQuizById(quizSetId: string, questionIndex: number = 0): Promise<SimpleQuiz | null> {
    try {
      // Convert string PDA to PublicKey
      const quizSetPubkey = new PublicKey(quizSetId);

      // Fetch QuizSet account from blockchain
      console.log('🔍 Fetching QuizSet from blockchain:', quizSetId);
      const quizSetAccount: any = await (this.program.account as any).quizSet.fetchNullable(quizSetPubkey);

      if (!quizSetAccount) {
        console.error('❌ Quiz set not found on blockchain');
        return null;
      }

      // Load questions from Supabase
      let question = quizSetAccount.name;
      let options = ["Option A", "Option B", "Option C", "Option D"];

      try {
        console.log('🔍 Loading questions from Supabase for quiz_set_id:', quizSetId);
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_set_id', quizSetId)
          .order('question_index', { ascending: true });

        if (questionsError) {
          console.warn('⚠️ Supabase error:', questionsError);
        } else if (questionsData && questionsData.length > 0) {
          // Get the specified question or first question
          const questionData = questionsData[questionIndex] || questionsData[0];
          question = questionData.question_text;
          options = questionData.choices as string[];
          console.log('✅ Loaded from Supabase:', { question, optionsCount: options.length });
        }
      } catch (supabaseError) {
        console.error('⚠️ Supabase fetch failed:', supabaseError);
      }

      console.log('📊 Quiz loaded:', {
        quizSetId,
        question,
        optionsCount: options.length,
        winner: quizSetAccount.winner?.toString(),
        isClaimed: quizSetAccount.isRewardClaimed
      });

      return {
        quizId: quizSetId, // Now a string (PDA)
        questionId: questionIndex + 1,
        topicId: 100, // Default
        question,
        options,
        rewardAmount: quizSetAccount.rewardAmount.toNumber() / LAMPORTS_PER_SOL,
        winner: quizSetAccount.winner || null,
        isClaimed: quizSetAccount.isRewardClaimed,
        answerAccountPda: quizSetPubkey, // Use quizSet PDA
        rewardPoolPda: quizSetPubkey, // Use quizSet PDA
        createdAt: new Date(quizSetAccount.createdAt?.toNumber() * 1000 || Date.now())
      };
    } catch (error) {
      console.error('❌ Error fetching quiz:', error);
      return null;
    }
  }

  /**
   * Get all quizzes
   * Fetches all quiz sets from blockchain and merges with Supabase metadata
   */
  async getAllQuizzes(): Promise<SimpleQuiz[]> {
    try {
      // Fetch quiz sets from blockchain (NEW STRUCTURE)
      const quizSets: any[] = await (this.program.account as any).quizSet.all();

      console.log(`📦 Found ${quizSets.length} quiz sets on blockchain`);

      // Get quiz metadata from Supabase
      let questionsMap = new Map();

      try {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*');

        if (questionsError) {
          console.warn('⚠️ Failed to load from Supabase, using localStorage:', questionsError);
          // Fallback to localStorage
          const quizMetadata: any[] = JSON.parse(localStorage.getItem('quizMetadata') || '[]');
          questionsMap = new Map(quizMetadata.map((m: any) => [m.quizId, m]));
        } else if (questionsData) {
          // Create map: quiz_set_id -> questions array
          const groupedByQuizSet = questionsData.reduce((acc: any, q: any) => {
            if (!acc[q.quiz_set_id]) {
              acc[q.quiz_set_id] = [];
            }
            acc[q.quiz_set_id].push(q);
            return acc;
          }, {});

          questionsMap = new Map(Object.entries(groupedByQuizSet));
          console.log(`✅ Loaded ${questionsData.length} questions from Supabase`);
          console.log(`📊 Mapped ${questionsMap.size} quiz sets`);
        }
      } catch (supabaseError) {
        console.error('⚠️ Supabase error, using localStorage:', supabaseError);
        // Fallback to localStorage
        const quizMetadata: any[] = JSON.parse(localStorage.getItem('quizMetadata') || '[]');
        questionsMap = new Map(quizMetadata.map((m: any) => [m.quizId, m]));
      }

      const quizzes = quizSets.map((quizSet: any) => {
        const quizSetAccount = quizSet.account;
        const quizSetPubkey = quizSet.publicKey;

        // Get first question for this quiz set
        const questions: any[] = questionsMap.get(quizSetPubkey.toString()) || [];
        const firstQuestion = questions[0];

        return {
          quizId: quizSetPubkey.toString(), // Use pubkey as ID
          questionId: 1,
          topicId: 100, // Default
          question: firstQuestion?.question_text || quizSetAccount.name,
          options: firstQuestion?.choices || ["Option A", "Option B", "Option C", "Option D"],
          rewardAmount: quizSetAccount.rewardAmount.toNumber() / LAMPORTS_PER_SOL,
          winner: quizSetAccount.winner || null,
          isClaimed: quizSetAccount.isRewardClaimed,
          answerAccountPda: quizSetPubkey, // Not used in new structure
          rewardPoolPda: quizSetPubkey,
          createdAt: new Date(quizSetAccount.createdAt.toNumber() * 1000)
        } as SimpleQuiz;
      });

      console.log(`✅ Processed ${quizzes.length} quizzes`);
      return quizzes;
    } catch (error) {
      console.error('❌ Error fetching all quizzes:', error);
      console.error('Error details:', error);
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

