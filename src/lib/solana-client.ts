import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { K3HootProgramArcium } from "../types/k_3_hoot_program_arcium";
import { PublicKey, Keypair, SystemProgram, Connection, Commitment } from "@solana/web3.js";
import { randomBytes } from 'crypto';
import { BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { AnchorProvider } from '@coral-xyz/anchor';
import IDL from '../idl/k_3_hoot_program_arcium.json';

// RPC Endpoints from environment
export const SOLANA_RPC = {
  devnet: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
  mainnet: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
};

export interface QuestionData {
  question: string;
  choices: string[];
  correctAnswer: string;
}

export interface QuizCreationData {
  topicName: string;
  name: string;
  questionCount: number;
  questions: QuestionData[];
  rewardAmount: number; // in SOL
}

export interface EncryptedQuizData {
  encryptedXCoordinate: number[];
  encryptedYCoordinate: number[];
  arciumPubkey: number[];
  nonce: BN;
}

export interface QuizSet {
  authority: PublicKey;
  topic: PublicKey;
  name: string;
  questionCount: number;
  uniqueId: number;
  createdAt: BN;
  isInitialized: boolean;
  rewardAmount: BN;
  isRewardClaimed: boolean;
  winner: PublicKey | null;
  correctAnswersCount: number;
  publicKey?: PublicKey; // Optional for when it's included from getAllQuizSets
}

export interface QuestionBlock {
  questionIndex: number;
  encryptedXCoordinate: number[];
  encryptedYCoordinate: number[];
  arciumPubkey: number[];
  nonce: BN;
  questionBlockPda?: PublicKey;
  quizSet?: PublicKey;
}

export interface DecryptedQuestion {
  question: string;
  choices: string[];
  questionIndex: number;
  correctAnswer: string;
}

export interface Topic {
  owner: PublicKey;
  name: string;
  createdAt: BN;
  totalQuizzes: number;
  totalParticipants: number;
  isActive: boolean;
  minRewardAmount: BN;
  minQuestionCount: number;
}

export interface TopicWithStats {
  name: string;
  isActive: boolean;
  totalQuizzes: number;
  totalParticipants: number;
  minRewardAmount: number; // in SOL
  minQuestionCount: number;
  owner: string; // PublicKey as string
  createdAt: Date;
  // Additional stats for UI
  claimedCount?: number;
  unclaimedCount?: number;
}

export class SecureQuizEncryptor {
  private program: Program<K3HootProgramArcium>;
  private connection: Connection;
  private authority?: Keypair; // Optional Keypair for server-side usage

  constructor(program: Program<K3HootProgramArcium>, connection: Connection, authority?: Keypair) {
    this.program = program;
    this.connection = connection;
    this.authority = authority;
  }

  // Helper method to get the public key from wallet or authority
  private getAuthorityPublicKey(): PublicKey {
    if (this.authority) {
      return this.authority.publicKey;
    }
    return this.program.provider.publicKey!;
  }

  // Helper method to get signers array
  private getSigners(): Keypair[] {
    return this.authority ? [this.authority] : [];
  }

  // Add this method to SecureQuizEncryptor class
  get programId(): PublicKey {
    return this.program.programId;
  }

  // Create a new topic
  async createTopic(name: string): Promise<string> {
    // Derive topic PDA
    const [topicPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("topic"), Buffer.from(name)],
      this.program.programId
    );

    try {
      const tx = await this.program.methods
        .createTopic(name)
        .accountsPartial({
          topic: topicPda,
          owner: this.getAuthorityPublicKey(),
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      await this.connection.confirmTransaction(tx, "confirmed");
      
      return topicPda.toString();
    } catch (error: any) {
      console.error(`❌ Failed to create topic:`, error);
      throw error;
    }
  }

  // Transfer topic ownership
  async transferTopicOwnership(topicName: string, newOwner: PublicKey): Promise<void> {
    const [topicPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("topic"), Buffer.from(topicName)],
      this.program.programId
    );

    try {
      const tx = await this.program.methods
        .transferTopicOwnership(newOwner)
        .accountsPartial({
          topic: topicPda,
          owner: this.getAuthorityPublicKey(),
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      await this.connection.confirmTransaction(tx, "confirmed");
      
    } catch (error: any) {
      console.error(`❌ Failed to transfer ownership:`, error);
      throw error;
    }
  }

  // Toggle topic status (active/inactive)
  async toggleTopicStatus(topicName: string, isActive: boolean): Promise<void> {
    const [topicPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("topic"), Buffer.from(topicName)],
      this.program.programId
    );

    try {
      const tx = await this.program.methods
        .toggleTopicStatus(isActive)
        .accountsPartial({
          topic: topicPda,
          owner: this.getAuthorityPublicKey(),
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      await this.connection.confirmTransaction(tx, "confirmed");
      
    } catch (error: any) {
      console.error(`❌ Failed to toggle topic status:`, error);
      throw error;
    }
  }

  // Get topic by name - cleaned up version
  async getTopicByName(name: string): Promise<any> {
    const [topicPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("topic"), Buffer.from(name)],
      this.program.programId
    );

    try {
      const topic = await this.program.account.topic.fetch(topicPda);
      return { account: topic, publicKey: topicPda };
    } catch (error) {
      console.error(`❌ Error fetching topic "${name}":`, error);
      throw error;
    }
  }

  // Demo workflow function - simplified
  async runTopicDemo(): Promise<void> {
    try {
      // Check existing topics first
      const existingTopics = await this.getAllTopics();
      
      if (existingTopics.length > 0) {
        return;
      }
      
      // Create sample topics if none exist
      const topics = ['Mathematics', 'Science', 'History'];
      
      for (const topicName of topics) {
        try {
          await this.createTopic(topicName);
        } catch (error: any) {
          if (!error.message?.includes('already in use')) {
            console.error(`❌ Failed to create topic "${topicName}":`, error);
          }
        }
      }
      
    } catch (error) {
      console.error("❌ Topic management demo failed:", error);
      throw error;
    }
  }

  // List all topics - cleaned up version
  async getAllTopics(): Promise<Topic[]> {
    try {
      // Try using .all() first
      const allTopics = await this.program.account.topic.all();
      
      return allTopics.map(topic => ({
        ...topic.account,
        publicKey: topic.publicKey
      }));
      
    } catch (error: any) {
      console.warn("⚠️ .all() method failed, trying fallback with getProgramAccounts:", error.message);
      
      // Fallback to getProgramAccounts
      try {
        const topicAccounts = await this.connection.getProgramAccounts(
          this.program.programId,
          {
            filters: [{ dataSize: 120 }],
          }
        );

        const validTopics = [];
        
        for (const accountInfo of topicAccounts) {
          try {
            const topicAccount = await this.program.account.topic.fetch(accountInfo.pubkey);
            
            if (topicAccount && topicAccount.name && typeof topicAccount.name === 'string') {
              validTopics.push({
                ...topicAccount,
                publicKey: accountInfo.pubkey
              });
            }
          } catch (decodeError) {
            continue;
          }
        }
        
        return validTopics;
        
      } catch (fallbackError) {
        console.error("❌ Both .all() and getProgramAccounts failed:", fallbackError);
        return [];
      }
    }
  }

  // Helper method to count quizzes for topic - simplified
  async countQuizzesForTopic(topicName: string): Promise<number> {
    try {
      const [topicPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("topic"), Buffer.from(topicName)],
        this.program.programId
      );

      const allQuizSets = await this.getAllQuizSets();
      
      let count = 0;
      for (const quizSet of allQuizSets) {
        try {
          const quizSetPubkey = typeof quizSet === 'object' && 'publicKey' in quizSet 
            ? (quizSet as any).publicKey 
            : null;
          
          if (quizSetPubkey) {
            const quizSetAccount = await this.program.account.quizSet.fetch(quizSetPubkey);
            if (quizSetAccount.topic.toString() === topicPda.toString()) {
              count++;
            }
          }
        } catch (err) {
          continue;
        }
      }
      
      return count;
    } catch (error) {
      console.warn(`Failed to count quizzes for topic ${topicName}:`, error);
      return 0;
    }
  }

  // Update topic stats - simplified
  async updateTopicStats(topicName: string): Promise<void> {
    try {
      const [topicPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("topic"), Buffer.from(topicName)],
        this.program.programId
      );
      
      // Topic stats update logic here if needed
    } catch (error) {
      console.warn(`Failed to update topic stats:`, error);
    }
  }

  // Check if quiz set exists
  async checkQuizSetExists(authority: PublicKey): Promise<{ exists: boolean; address?: string }> {
    const [quizSetPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("quiz_set"),
        authority.toBuffer()
      ],
      this.program.programId
    );

    try {
      const accountInfo = await this.connection.getAccountInfo(quizSetPda);
      return { exists: accountInfo !== null, address: quizSetPda.toString() };
    } catch (error) {
      return { exists: false };
    }
  }

  // Create quiz set - cleaned up
  async createQuizSet(topicName: string, name: string, questionCount: number, rewardAmount: number): Promise<string> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const uniqueName = `${name}_${timestamp}_${randomSuffix}`;
    
    const uniqueId = Math.floor(Math.random() * 256);
    
    const [quizSetPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("quiz_set"),
        this.getAuthorityPublicKey().toBuffer(),
        Buffer.from([uniqueId])
      ],
      this.program.programId
    );

    const [topicPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("topic"), Buffer.from(topicName)],
      this.program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        quizSetPda.toBuffer()
      ],
      this.program.programId
    );
    
    try {
      const instruction = this.program.methods
        .createQuizSet(uniqueName, questionCount, uniqueId, new BN(rewardAmount * 1_000_000_000))
        .accountsPartial({
          quizSet: quizSetPda,
          topic: topicPda,
          vault: vaultPda,
          authority: this.getAuthorityPublicKey(),
          systemProgram: SystemProgram.programId,
        });

      const signers = this.getSigners();
      if (signers.length > 0) {
        instruction.signers(signers);
      }

      const tx = await instruction.rpc({ commitment: "confirmed" });
      
      await this.connection.confirmTransaction(tx, "confirmed");
      
      await this.updateTopicStats(topicName);
      
      return quizSetPda.toString();
    } catch (error: any) {
      console.error(`❌ Failed to create quiz set:`, error);
      
      if (error.message?.includes('User rejected') || error.message?.includes('canceled')) {
        throw new Error('Transaction was canceled by user');
      }
      
      throw error;
    }
  }

  // Simplified: Directly encrypt question data on-chain with XOR
  private async encryptQuestionDataOnchain(questionData: QuestionData, nonce: BN): Promise<Uint8Array> {
    // Combine question + choices into single data block (max 64 bytes)
    const combinedText = `${questionData.question}|${questionData.choices.join('|')}`;
    const textBytes = Buffer.from(combinedText, 'utf8');
    
    // Pad or truncate to exactly 64 bytes
    const paddedData = Buffer.alloc(64, 0);
    const copyLength = Math.min(textBytes.length, 64);
    textBytes.copy(paddedData, 0, 0, copyLength);
    
    // XOR encryption with nonce (64 bytes)
    const encrypted = Buffer.alloc(64);
    const nonceValue = nonce.toNumber();
    
    for (let i = 0; i < 64; i++) {
      encrypted[i] = paddedData[i] ^ (nonceValue & 0xFF);
    }
    
    return new Uint8Array(encrypted);
  }

  // Encrypt correct answer separately with XOR (64 bytes)
  private encryptCorrectAnswer(answer: string, nonce: BN): Uint8Array {
    const answerBytes = Buffer.from(answer, 'utf8');
    const encrypted = Buffer.alloc(64, 0);
    
    // Pad answer to 64 bytes
    const copyLength = Math.min(answerBytes.length, 64);
    answerBytes.copy(encrypted, 0, 0, copyLength);
    
    // XOR encryption with nonce
    const nonceValue = nonce.toNumber();
    for (let i = 0; i < 64; i++) {
      encrypted[i] = encrypted[i] ^ (nonceValue & 0xFF);
    }
    
    return new Uint8Array(encrypted);
  }

  // Add encrypted question - updated to match reference code
  async addEncryptedQuestion(
    quizSetPda: string,
    questionIndex: number,
    questionData: QuestionData
  ): Promise<void> {
    // Create question block PDA with correct seeds as program
    const [questionBlockPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("question_block"),
        new PublicKey(quizSetPda).toBuffer(),
        Buffer.from([questionIndex])
      ],
      this.program.programId
    );

    // Encrypt data with unique nonce
    const uniqueNonce = new BN(Date.now() + questionIndex + Math.floor(Math.random() * 100));
    
    // Encrypt question data directly on-chain
    const encryptedX = await this.encryptQuestionDataOnchain(questionData, uniqueNonce);
    const encryptedY = this.encryptCorrectAnswer(questionData.correctAnswer, uniqueNonce);
    const arciumPubkey = randomBytes(32);

    // Add to blockchain
    try {
      const instruction = this.program.methods
        .addEncryptedQuestionBlock(
          questionIndex,
          Array.from(encryptedX),
          Array.from(encryptedY),
          Array.from(arciumPubkey),
          uniqueNonce
        )
        .accountsPartial({
          questionBlock: questionBlockPda,
          quizSet: new PublicKey(quizSetPda),
          authority: this.getAuthorityPublicKey(),
          systemProgram: SystemProgram.programId,
        });

      // Add signers if using Keypair  
      const signers = this.getSigners();
      if (signers.length > 0) {
        instruction.signers(signers);
      }

      const tx = await instruction.rpc({ commitment: "confirmed" });
      
    } catch (error: any) {
      console.error(`❌ Failed to add question ${questionIndex}:`, error);
      throw error;
    }
  }

  // Cập nhật createCompleteQuiz method để sử dụng ít transaction hơn
  async createCompleteQuiz(
    topicName: string,
    baseName: string, 
    questions: QuestionData[],
    rewardAmount: number
  ): Promise<{ quizSetPda: string; questionBlocks: any[]; transactions: string[] }> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const uniqueName = `${baseName}_${timestamp}_${randomSuffix}`;
    
    const transactions: string[] = [];
    
    // Step 1: Create quiz set
    const quizSetPda = await this.createQuizSet(topicName, baseName, questions.length, rewardAmount);
    
    // Step 2: Add ALL questions in BATCHED transactions (reduce signing)
    
    const questionBlocks = [];
    
    // Process questions in batches to reduce transaction count
    const BATCH_SIZE = 3; // Process 3 questions per transaction
    for (let batchStart = 0; batchStart < questions.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, questions.length);
      const batch = questions.slice(batchStart, batchEnd);
      
      // Create instructions for this batch
      const instructions = [];
      
      for (let i = 0; i < batch.length; i++) {
        const questionIndex = batchStart + i + 1;
        const questionData = batch[i];
        
        // Create question block PDA
        const [questionBlockPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("question_block"),
            new PublicKey(quizSetPda).toBuffer(),
            Buffer.from([questionIndex])
          ],
          this.program.programId
        );

        // Encrypt data with unique nonce
        const uniqueNonce = new BN(Date.now() + questionIndex + Math.floor(Math.random() * 100));
        const encryptedX = await this.encryptQuestionDataOnchain(questionData, uniqueNonce);
        const encryptedY = this.encryptCorrectAnswer(questionData.correctAnswer, uniqueNonce);
        const arciumPubkey = randomBytes(32);

        // Create instruction for this question
        const instruction = this.program.methods
          .addEncryptedQuestionBlock(
            questionIndex,
            Array.from(encryptedX),
            Array.from(encryptedY),
            Array.from(arciumPubkey),
            uniqueNonce
          )
          .accountsPartial({
            questionBlock: questionBlockPda,
            quizSet: new PublicKey(quizSetPda),
            authority: this.getAuthorityPublicKey(),
            systemProgram: SystemProgram.programId,
          });

        // Add signers if using Keypair
        const signers = this.getSigners();
        if (signers.length > 0) {
          instruction.signers(signers);
        }

        instructions.push(instruction);
        
        questionBlocks.push({
          questionIndex,
          question: questionData.question,
          choices: questionData.choices,
          correctAnswer: questionData.correctAnswer
        });
      }
      
      // Execute all instructions in this batch as a single transaction
      if (instructions.length === 1) {
        // Single instruction - execute directly
        const tx = await instructions[0].rpc({ commitment: "confirmed" });
        transactions.push(tx);
      } else if (instructions.length > 1) {
        // Multiple instructions - combine into one transaction
        try {
          // For multiple instructions, we need to build and send transaction manually
          
          // Execute them one by one for now (simpler approach)
          for (let j = 0; j < instructions.length; j++) {
            const tx = await instructions[j].rpc({ commitment: "confirmed" });
            transactions.push(tx);
          }
        } catch (batchError) {
          console.error(`❌ Batch failed:`, batchError);
          throw batchError;
        }
      }
    }

    return { quizSetPda, questionBlocks, transactions };
  }

  /**
   * Get all quiz sets - cleaned up
   */
  async getAllQuizSets(): Promise<QuizSet[]> {
    try {
      const allQuizSets = await this.program.account.quizSet.all();
      
      return allQuizSets.map(set => ({
        ...set.account,
        publicKey: set.publicKey
      }));
      
    } catch (error: any) {
      console.warn("⚠️ .all() method failed for quiz sets, trying fallback:", error.message);
      
      try {
        const quizSetAccounts = await this.connection.getProgramAccounts(
          this.program.programId,
          {
            filters: [{ dataSize: 230 }],
          }
        );

        const validQuizSets = [];
        
        for (const accountInfo of quizSetAccounts) {
          try {
            const quizSet = await this.program.account.quizSet.fetch(accountInfo.pubkey);
            
            if (quizSet && quizSet.name && typeof quizSet.name === 'string') {
              validQuizSets.push({
                ...quizSet,
                publicKey: accountInfo.pubkey,
                uniqueId: quizSet.uniqueId || 0
              });
            }
          } catch (decodeError) {
            continue;
          }
        }
        
        return validQuizSets;
        
      } catch (fallbackError) {
        console.error('❌ Both .all() and getProgramAccounts failed for quiz sets:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Get quiz set by address
   */
  async getQuizSet(quizSetAddress: PublicKey): Promise<QuizSet | null> {
    try {
      const quizSet = await this.program.account.quizSet.fetch(quizSetAddress);
      return {
        ...quizSet,
        uniqueId: quizSet.uniqueId || 0
      };
    } catch (error) {
      console.error('Error fetching quiz set:', error);
      return null;
    }
  }

  /**
   * Get all question blocks for a quiz set - optimized version
   */
  async getQuestionBlocks(quizSetAddress: PublicKey): Promise<QuestionBlock[]> {
    try {
      const quizSet = await this.program.account.quizSet.fetch(quizSetAddress);
      
      const questionBlocks: QuestionBlock[] = [];
      
      for (let i = 1; i <= quizSet.questionCount; i++) {
        const [questionPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("question_block"), 
            quizSetAddress.toBuffer(), 
            Buffer.from([i])
          ],
          this.program.programId
        );
        
        try {
          const questionBlock = await this.program.account.questionBlock.fetch(questionPda);
          questionBlocks.push({
            ...questionBlock,
            questionBlockPda: questionPda,
            questionIndex: i,
            quizSet: quizSetAddress
          });
          
        } catch (error) {
          continue;
        }
      }
      
      return questionBlocks;
      
    } catch (error) {
      console.error('Error fetching question blocks:', error);
      throw error;
    }
  }

  /**
   * Decrypt question data from encrypted blocks - based on reference code
   */
  private decryptQuestionFromEncryptedData(questionBlock: QuestionBlock): DecryptedQuestion {
    const nonce = questionBlock.nonce.toNumber();
    const questionIndex = questionBlock.questionIndex;
    
    // Decrypt X-coordinate (question + choices) - 64 bytes
    const encryptedX = questionBlock.encryptedXCoordinate;
    const decryptedX = new Uint8Array(64);
    
    for (let i = 0; i < 64; i++) {
      decryptedX[i] = encryptedX[i] ^ (nonce & 0xFF);
    }
    
    // Convert decrypted bytes to string
    const decryptedText = new TextDecoder().decode(decryptedX).replace(/\0/g, '');
    
    // Parse question data from decrypted string
    const questionData = this.parseQuestionFromDecryptedString(decryptedText, questionIndex);
    
    return {
      question: questionData.question,
      choices: questionData.choices,
      questionIndex: questionIndex,
      correctAnswer: "" // Will be verified on-chain without decryption
    };
  }

  /**
   * Parse question data from decrypted string - based on reference code
   */
  private parseQuestionFromDecryptedString(decryptedString: string, questionIndex: number): any {
    // Try parsing JSON first
    try {
      const questionData = JSON.parse(decryptedString);
      return {
        question: questionData.question,
        choices: questionData.choices,
        correctAnswer: questionData.correctAnswer
      };
    } catch (parseError) {
      // Try pipe-separated format (question|choice1|choice2|choice3|choice4)
      try {
        const parts = decryptedString.split('|');
        if (parts.length >= 5) {
          const question = parts[0];
          const choices = parts.slice(1, 5);
          
          return {
            question: question,
            choices: choices,
            correctAnswer: ""
          };
        }
      } catch (parseError) {
        // If all parsing fails, show raw data for debugging
        console.warn(`Failed to parse question data for question ${questionIndex}: Raw data: ${decryptedString}`);
        return {
          question: `Question ${questionIndex} (Raw Data)`,
          choices: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: ""
        };
      }
    }
  }

  /**
   * Process questions from encrypted data - optimized version
   */
  async processQuizQuestions(questionBlocks: QuestionBlock[]): Promise<DecryptedQuestion[]> {
    
    const decryptedQuestions: DecryptedQuestion[] = [];
    const failedQuestions: any[] = [];
    
    for (const block of questionBlocks) {
      
      try {
        const decryptedQuestion = this.decryptQuestionFromEncryptedData(block);
        decryptedQuestions.push(decryptedQuestion);
        
      } catch (error: any) {
        console.warn(`Failed to decrypt question ${block.questionIndex}: ${error.message || error}`);
        
        failedQuestions.push({
          questionIndex: block.questionIndex,
          error: error.message || 'Unknown error',
          block: block
        });
      }
    }
    
    // Report results
    console.warn(`Decryption Results: Successful: ${decryptedQuestions.length}/${questionBlocks.length}, Failed: ${failedQuestions.length}/${questionBlocks.length}`);
    
    if (failedQuestions.length > 0) {
      console.warn(`\n⚠️ Failed Questions:`);
      failedQuestions.forEach(fq => {
        console.warn(`   Question ${fq.questionIndex}: ${fq.error}`);
      });
    }
    
    return decryptedQuestions;
  }

  /**
   * Get complete quiz data (quiz set + decrypted questions)
   */
  async getCompleteQuiz(quizSetAddress: PublicKey): Promise<{
    quizSet: QuizSet;
    questionBlocks: QuestionBlock[];
    decryptedQuestions: DecryptedQuestion[];
  } | null> {
    try {
      const quizSet = await this.getQuizSet(quizSetAddress);
      if (!quizSet) return null;
      
      const questionBlocks = await this.getQuestionBlocks(quizSetAddress);
      const decryptedQuestions = await this.processQuizQuestions(questionBlocks);
      
      return {
        quizSet,
        questionBlocks,
        decryptedQuestions
      };
    } catch (error) {
      console.error('Error getting complete quiz:', error);
      return null;
    }
  }

  /**
   * Verify answer on-chain using XOR decryption (for devnet testing)
   */
  async verifyAnswerOnchain(questionBlock: QuestionBlock, userAnswer: string): Promise<boolean> {
    try {
      // For testing on devnet, use local decryption
      
      // Decrypt correct answer from Y-coordinate using the same nonce
      const nonce = questionBlock.nonce.toNumber();
      const encryptedY = questionBlock.encryptedYCoordinate;
      
      // Decrypt Y-coordinate (correct answer) using XOR
      const decryptedY = Buffer.alloc(64);
      for (let i = 0; i < 64; i++) {
        decryptedY[i] = encryptedY[i] ^ (nonce & 0xFF);
      }
      
      // Convert decrypted bytes to string
      const correctAnswer = decryptedY.toString('utf8').replace(/\0/g, '');
      
      // Compare with user answer
      const isCorrect = userAnswer === correctAnswer;
      
      return isCorrect;
      
    } catch (error: any) {
      console.warn(`Verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Submit quiz answers and get score
   */
  async submitQuizAnswers(
    quizSet: PublicKey,
    answers: number[],
    nonce: BN
  ): Promise<{ score: number; totalQuestions: number; txSignature: string }> {
    try {
      // Mock score calculation for now
      const score = Math.floor(Math.random() * 100);
      const totalQuestions = answers.length;

      return {
        score,
        totalQuestions,
        txSignature: "mock_signature",
      };
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      throw error;
    }
  }

  /**
   * Set winner for the quiz (devnet testing)
   */
  async setWinnerForDevnet(quizSetPda: string, correctAnswersCount: number): Promise<boolean> {
    try {
      // Check if winner is already set
      const quizSetAccount = await this.program.account.quizSet.fetch(new PublicKey(quizSetPda));
      
      if (quizSetAccount.winner) {
        console.warn(`Winner already set: ${quizSetAccount.winner.toString()}`);
        console.warn(`Skipping winner setting - proceeding to reward claiming`);
        return true;
      }
      
      // Only set winner if not already set
      const instruction = this.program.methods
        .setWinnerForUser(
          this.getAuthorityPublicKey(),
          correctAnswersCount
        )
        .accountsPartial({
          quizSet: new PublicKey(quizSetPda),
          setter: this.getAuthorityPublicKey(),
          systemProgram: SystemProgram.programId,
        });

      const signers = this.getSigners();
      if (signers.length > 0) {
        instruction.signers(signers);
      }

      const tx = await instruction.rpc({ commitment: "confirmed" });

      await this.connection.confirmTransaction(tx, "confirmed");
      
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to set winner:`, error);
      return false;
    }
  }

  /**
   * Find quiz sets for a specific topic - using .all() like reference files with fallback
   */
  async findQuizSetsForTopic(topicName: string): Promise<any[]> {
    try {
      const [topicPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("topic"), Buffer.from(topicName)],
        this.program.programId
      );

      try {
        const allQuizSets = await this.program.account.quizSet.all();
        
        const validQuizSets = [];
        
        for (const quizSetInfo of allQuizSets) {
          try {
            if (quizSetInfo.account.topic.toString() === topicPda.toString()) {
              validQuizSets.push({
                publicKey: quizSetInfo.publicKey,
                account: quizSetInfo.account
              });
            }
          } catch (filterError) {
            continue;
          }
        }
        
        return validQuizSets;
        
      } catch (allError: any) {
        console.warn("⚠️ .all() method failed for quiz sets, using fallback:", allError.message);
        
        const allQuizSets = await this.getAllQuizSets();
        
        const validQuizSets = [];
        
        for (const quizSet of allQuizSets) {
          try {
            if (quizSet.topic.toString() === topicPda.toString()) {
              if (quizSet.publicKey) {
                validQuizSets.push({
                  publicKey: quizSet.publicKey,
                  account: {
                    ...quizSet,
                    publicKey: undefined
                  }
                });
              }
            }
          } catch (filterError) {
            continue;
          }
        }
        
        return validQuizSets;
      }
      
    } catch (error) {
      console.error("❌ Error finding quiz sets for topic:", error);
      return [];
    }
  }

  /**
   * Record quiz completion (mock implementation for now)
   */
  async recordQuizCompletion(
    quizSetPda: string, 
    isWinner: boolean, 
    score: number, 
    totalQuestions: number,
    rewardAmount: number
  ): Promise<boolean> {
    console.warn(`Recording quiz completion...`);
    console.warn(`   Quiz Set: ${quizSetPda}`);
    console.warn(`   Is Winner: ${isWinner}`);
    console.warn(`   Score: ${score}/${totalQuestions}`);
    console.warn(`   Reward: ${rewardAmount / 1_000_000_000} SOL`);

    // For now, just log the completion - you can implement actual on-chain recording later
    console.warn(`✅ Quiz completion recorded (mock)`);
    return true;
  }

  // Cập nhật claimReward để optimize transaction
  async claimReward(quizSetPda: string): Promise<{ success: boolean; txSignature?: string; error?: string }> {
    try {
      const quizSetPubkey = new PublicKey(quizSetPda);
      
      // Check account state first
      const quizSetAccount = await this.program.account.quizSet.fetch(quizSetPubkey);
      
      // Derive vault PDA
      const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("vault"),
          quizSetPubkey.toBuffer()
        ],
        this.program.programId
      );
      
      if (quizSetAccount.isRewardClaimed) {
        return { success: false, error: 'Reward already claimed' };
      }
      
      // If no winner set, set winner and claim in sequence (but minimize transactions)
      if (!quizSetAccount.winner) {
        
        // Set winner first
        const setWinnerInstruction = this.program.methods
          .setWinnerForUser(
            this.getAuthorityPublicKey(),
            quizSetAccount.questionCount // Assume perfect score
          )
          .accountsPartial({
            quizSet: quizSetPubkey,
            setter: this.getAuthorityPublicKey(),
            systemProgram: SystemProgram.programId,
          });

        const signers = this.getSigners();
        if (signers.length > 0) {
          setWinnerInstruction.signers(signers);
        }

        const setWinnerTx = await setWinnerInstruction.rpc({ commitment: "confirmed" });
      }
      
      // Claim reward
      const instruction = this.program.methods
        .claimReward()
        .accountsPartial({
          quizSet: quizSetPubkey,
          vault: vaultPda,
          claimer: this.getAuthorityPublicKey(),
          systemProgram: SystemProgram.programId,
        });

      const signers = this.getSigners();
      if (signers.length > 0) {
        instruction.signers(signers);
      }

      const tx = await instruction.rpc({ commitment: "confirmed" });

      await this.connection.confirmTransaction(tx, "confirmed");
      
      return { success: true, txSignature: tx };
    } catch (error: any) {
      console.error(`❌ Failed to claim reward:`, error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
}

// Hook for using the K3Hoot client
export function useK3HootClient(network: 'devnet' | 'mainnet' = 'devnet') {
  const wallet = useAnchorWallet();
  
  if (!wallet) return null;
  
  const client = useMemo(() => {
    try {
      const rpcEndpoint = network === 'devnet' 
        ? SOLANA_RPC.devnet
        : SOLANA_RPC[network];
        
      const connection = new Connection(rpcEndpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      });
      
      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });
      
      const program = new Program(IDL as any, provider) as Program<K3HootProgramArcium>;
      
      return new SecureQuizEncryptor(program, connection);
    } catch (error) {
      console.error('Failed to initialize SecureQuizEncryptor:', error);
      return null;
    }
  }, [wallet, network]);
  
  return client;
}

// Export function for server-side usage with Keypair
export function createK3HootClientWithKeypair(
  authority: Keypair, 
  network: 'devnet' | 'mainnet' = 'devnet'
): SecureQuizEncryptor {
  const connection = new Connection(SOLANA_RPC[network], 'confirmed');
  const wallet = new anchor.Wallet(authority);
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  const program = new Program(IDL as any, provider) as Program<K3HootProgramArcium>;
  
  return new SecureQuizEncryptor(program, connection, authority);
}