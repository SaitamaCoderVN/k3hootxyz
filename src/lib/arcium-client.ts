/**
 * Arcium Encryption Client for K3Hoot
 * Handles encryption/decryption of quiz answers using Arcium MPC
 */

import {
  RescueCipher,
  getMXEPublicKey,
  x25519,
  getComputationAccAddress,
  awaitComputationFinalization,
  getArciumProgAddress,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getClusterAccAddress,
} from "@arcium-hq/client";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import IDL from "../idl/k_3_hoot_program_arcium.json";
import { K3HootProgramArcium } from "../types/k_3_hoot_program_arcium";

// Hardcoded devnet MXE public key (fallback)
const HARDCODED_MXE_PUBKEY = new Uint8Array([
  103, 26, 85, 250, 179, 159, 17, 117, 1, 133, 226, 111, 196, 140, 140, 118,
  104, 193, 98, 208, 81, 170, 3, 69, 124, 138, 230, 86, 134, 144, 141, 144
]);

export interface EncryptionContext {
  cipher: RescueCipher;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  mxePublicKey: Uint8Array;
  sharedSecret: Uint8Array;
}

export interface EncryptedAnswer {
  ciphertext: number[];      // [u8; 32] padded
  publicKey: number[];      // [u8; 32] padded
  nonce: BN;                 // u128
  nonceBytes: Uint8Array;    // Original 16 bytes
}

export interface ValidationResult {
  isCorrect: boolean;
  txSignature: string;
  computationOffset: BN;
  callbackTxSignature?: string;
}

/**
 * Arcium Client for K3Hoot Quiz
 */
export class ArciumK3HootClient {
  private program: Program<K3HootProgramArcium>;
  private connection: Connection;
  private provider: anchor.AnchorProvider;
  private programId: PublicKey;

  constructor(
    wallet: anchor.Wallet,
    connection: Connection,
    programId: PublicKey
  ) {
    this.connection = connection;
    this.programId = programId;
    
    this.provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: "confirmed" }
    );
    
    this.program = new Program(
      IDL as any,
      this.provider
    );
  }

  /**
   * Get MXE public key with retry logic
   */
  async getMXEPublicKeyWithRetry(maxRetries = 3): Promise<Uint8Array> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mxePublicKey = await getMXEPublicKey(this.provider, this.programId);
        if (mxePublicKey) {
          return mxePublicKey;
        }
      } catch (error) {
        if (attempt === maxRetries) {
          console.warn("Using hardcoded MXE public key (devnet fallback)");
          return HARDCODED_MXE_PUBKEY;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    return HARDCODED_MXE_PUBKEY;
  }

  /**
   * Create encryption context
   */
  async createEncryptionContext(): Promise<EncryptionContext> {
    const mxePublicKey = await this.getMXEPublicKeyWithRetry();
    const privateKey = x25519.utils.randomSecretKey();
    const publicKey = x25519.getPublicKey(privateKey);
    const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    return {
      cipher,
      publicKey,
      privateKey,
      mxePublicKey,
      sharedSecret,
    };
  }

  /**
   * Pad data to 32 bytes
   */
  padTo32Bytes(data: any): number[] {
    const padded = new Uint8Array(32);
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0])) {
        const flat = (data as number[][]).flatMap(arr => arr);
        padded.set(new Uint8Array(flat).slice(0, 32));
      } else {
        padded.set(new Uint8Array(data as number[]).slice(0, 32));
      }
    } else {
      padded.set(new Uint8Array(data).slice(0, 32));
    }
    return Array.from(padded);
  }

  /**
   * Convert nonce to u128 BN
   */
  nonceToU128(nonce: Uint8Array): BN {
    // Convert 16-byte nonce to BigInt then BN (browser-compatible)
    let value = BigInt(0);
    for (let i = 0; i < nonce.length; i++) {
      value = value * BigInt(256) + BigInt(nonce[i]);
    }
    return new BN(value.toString());
  }

  /**
   * Generate random bytes (browser-compatible)
   */
  private generateRandomBytes(length: number): Uint8Array {
    if (typeof window !== 'undefined' && window.crypto) {
      // Browser: use Web Crypto API
      return window.crypto.getRandomValues(new Uint8Array(length));
    } else {
      // Node.js: use crypto module (for server-side)
      const crypto = require('crypto');
      return crypto.randomBytes(length);
    }
  }

  /**
   * Encrypt quiz answer (A=0, B=1, C=2, D=3)
   */
  encryptAnswer(ctx: EncryptionContext, answerIndex: number): EncryptedAnswer {
    if (answerIndex < 0 || answerIndex > 3) {
      throw new Error(`Invalid answer: ${answerIndex}. Must be 0-3 (A-D)`);
    }

    const plaintext = [BigInt(answerIndex)];
    const nonceBytes = this.generateRandomBytes(16);
    const ciphertext = ctx.cipher.encrypt(plaintext, nonceBytes);

    return {
      ciphertext: this.padTo32Bytes(ciphertext),
      publicKey: this.padTo32Bytes(ctx.publicKey),
      nonce: this.nonceToU128(nonceBytes),
      nonceBytes,
    };
  }

  /**
   * Validate answer on-chain using Arcium MPC
   */
  async validateAnswerOnchain(
    ctx: EncryptionContext,
    quizSetPda: PublicKey,
    questionBlockPda: PublicKey,
    questionIndex: number,
    encryptedAnswer: EncryptedAnswer,
    payer: Keypair
  ): Promise<ValidationResult> {
    // Generate unique computation offset
    const computationOffset = new BN(this.generateRandomBytes(8));
    
    // Get Arcium accounts
    const clusterOffset = 1078779259; // Devnet cluster
    const clusterAccount = getClusterAccAddress(clusterOffset);
    const mxeAccount = getMXEAccAddress(this.programId);
    const mempoolAccount = getMempoolAccAddress(this.programId);
    const executingPool = getExecutingPoolAccAddress(this.programId);
    const computationAccount = getComputationAccAddress(this.programId, computationOffset);
    const compDefOffset = getCompDefAccOffset("validate_answer");
    const compDefAccount = getCompDefAccAddress(this.programId, Buffer.from(compDefOffset).readUInt32LE());

    // Submit validation transaction
    const txSignature = await this.program.methods
      .validateAnswerOnchain(
        computationOffset,
        encryptedAnswer.ciphertext as any,
        encryptedAnswer.publicKey as any,
        encryptedAnswer.nonce,
        questionIndex
      )
      .accounts({
        payer: payer.publicKey,
        questionBlock: questionBlockPda,
        quizSet: quizSetPda,
        computationAccount,
        clusterAccount,
        mxeAccount,
        mempoolAccount,
        executingPool,
        compDefAccount,
      })
      .signers([payer])
      .rpc({ commitment: "confirmed" });

    console.log("✅ Validation queued:", txSignature);

    // Wait for MPC computation to finalize
    const callbackTxSignature = await awaitComputationFinalization(
      this.provider,
      computationOffset,
      this.programId,
      "confirmed"
    );

    console.log("✅ Computation finalized:", callbackTxSignature);

    // Fetch result from blockchain
    // Note: The result is in the callback, but we need to parse it
    // For now, we'll return the signatures and let the frontend handle it

    return {
      isCorrect: false, // Will be updated by callback handler
      txSignature,
      computationOffset,
      callbackTxSignature,
    };
  }

  /**
   * Get player answer account PDA
   */
  getPlayerAnswerPda(quizSetPda: PublicKey, playerPubkey: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("player_answer"),
        quizSetPda.toBuffer(),
        playerPubkey.toBuffer(),
      ],
      this.programId
    );
    return pda;
  }

  /**
   * Update player score on-chain
   */
  async updatePlayerScore(
    quizSetPda: PublicKey,
    playerPubkey: PublicKey,
    questionIndex: number,
    isCorrect: boolean,
    updater: Keypair
  ): Promise<string> {
    const playerAnswerPda = this.getPlayerAnswerPda(quizSetPda, playerPubkey);

    const txSignature = await this.program.methods
      .updatePlayerScore(questionIndex, isCorrect)
      .accounts({
        quizSet: quizSetPda,
        playerAnswer: playerAnswerPda,
        player: playerPubkey,
        updater: updater.publicKey,
      })
      .signers([updater])
      .rpc({ commitment: "confirmed" });

    return txSignature;
  }

  /**
   * Claim reward (winner only)
   */
  async claimReward(
    quizSetPda: PublicKey,
    claimer: Keypair
  ): Promise<string> {
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), quizSetPda.toBuffer()],
      this.programId
    );

    const txSignature = await this.program.methods
      .claimReward()
      .accounts({
        quizSet: quizSetPda,
        vault: vaultPda,
        claimer: claimer.publicKey,
      })
      .signers([claimer])
      .rpc({ commitment: "confirmed" });

    return txSignature;
  }
}

/**
 * Helper: Convert answer letter to index
 */
export function letterToAnswerIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
}

/**
 * Helper: Convert answer index to letter
 */
export function answerIndexToLetter(index: number): string {
  return String.fromCharCode(65 + index); // 0=A, 1=B, 2=C, 3=D
}

