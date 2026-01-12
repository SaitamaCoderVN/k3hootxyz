/**
 * Arcium Encryption Service for Server-Side (API Routes)
 *
 * This service provides simplified encryption functions that work in Node.js
 * environment without requiring wallet connection. Used in Next.js API routes
 * for encrypting quiz answers on creation and validating answers on submission.
 */

import { RescueCipher, x25519 } from "@arcium-hq/client";
import { randomBytes } from "crypto";
import { BN } from "@coral-xyz/anchor";

/**
 * Hardcoded devnet MXE x25519 public key
 * This is the public key of the Arcium MPC cluster on Solana Devnet
 */
const HARDCODED_MXE_PUBKEY = new Uint8Array([
  103, 26, 85, 250, 179, 159, 17, 117, 1, 133, 226, 111, 196, 140, 140, 118,
  104, 193, 98, 208, 81, 170, 3, 69, 124, 138, 230, 86, 134, 144, 141, 144
]);

/**
 * Encryption result with all necessary data for blockchain
 */
export interface EncryptionResult {
  encrypted: Uint8Array;       // 32-byte encrypted data
  pubkey: Uint8Array;          // 32-byte x25519 public key
  nonce: bigint;               // u128 nonce
  nonceBytes: Uint8Array;      // Original 16-byte nonce
}

/**
 * Arcium Encryption Service (Server-Side)
 */
export class ArciumEncryptionService {
  private mxePublicKey: Uint8Array;

  constructor() {
    // Use hardcoded MXE pubkey for server-side operations
    this.mxePublicKey = HARDCODED_MXE_PUBKEY;
  }

  /**
   * Pad data to exactly 32 bytes
   */
  private padTo32Bytes(data: Uint8Array | number[]): Uint8Array {
    const padded = new Uint8Array(32);
    const input = data instanceof Uint8Array ? data : new Uint8Array(data);
    padded.set(input.slice(0, 32));
    return padded;
  }

  /**
   * Convert 16-byte nonce to u128 BigInt
   */
  private nonceToU128(nonce: Uint8Array): bigint {
    let value = BigInt(0);
    for (let i = 0; i < nonce.length; i++) {
      value = (value * BigInt(256)) + BigInt(nonce[i]);
    }
    return value;
  }

  /**
   * Flatten and pad ciphertext from RescueCipher
   */
  private processCiphertext(ciphertext: bigint[] | bigint[][]): Uint8Array {
    let bytes: Uint8Array;

    if (Array.isArray(ciphertext) && ciphertext.length > 0) {
      if (Array.isArray(ciphertext[0])) {
        // Nested array: flatten
        const flat = (ciphertext as bigint[][]).flatMap(arr => arr);
        bytes = new Uint8Array(flat.map(n => Number(n & BigInt(0xFF))));
      } else {
        // Single array of BigInts
        bytes = new Uint8Array((ciphertext as bigint[]).map(n => Number(n & BigInt(0xFF))));
      }
    } else {
      bytes = new Uint8Array(32);
    }

    return this.padTo32Bytes(bytes);
  }

  /**
   * Encrypt a quiz answer (0-3 for A/B/C/D)
   *
   * This method encrypts the correct answer for a quiz question using Arcium MPC.
   * The encrypted answer is stored on-chain and can only be validated (not decrypted)
   * by the Arcium network, ensuring fair play.
   *
   * @param answerIndex - Correct answer index (0=A, 1=B, 2=C, 3=D)
   * @returns Encryption result with all data needed for blockchain storage
   *
   * @example
   * ```typescript
   * const service = new ArciumEncryptionService();
   * const result = service.encryptAnswer(2); // Encrypt answer "C"
   *
   * // Store in database
   * await supabase.from('questions').insert({
   *   quiz_set_id: quizId,
   *   question_index: 0,
   *   encrypted_answer: result.encrypted,
   *   arcium_pubkey: result.pubkey,
   *   arcium_nonce: result.nonce.toString()
   * });
   * ```
   */
  encryptAnswer(answerIndex: number): EncryptionResult {
    // Validate input
    if (answerIndex < 0 || answerIndex > 3) {
      throw new Error(`Invalid answer index: ${answerIndex}. Must be 0-3 (A-D)`);
    }

    // Generate x25519 keypair
    const privateKey = x25519.utils.randomSecretKey();
    const publicKey = x25519.getPublicKey(privateKey);

    // Derive shared secret with MXE cluster
    const sharedSecret = x25519.getSharedSecret(privateKey, this.mxePublicKey);

    // Initialize cipher
    const cipher = new RescueCipher(sharedSecret);

    // Prepare plaintext: single BigInt value
    const plaintext = [BigInt(answerIndex)];

    // Generate random nonce
    const nonceBytes = randomBytes(16);

    // Encrypt
    const ciphertext = cipher.encrypt(plaintext, nonceBytes);

    // Process ciphertext to 32 bytes
    const encrypted = this.processCiphertext(ciphertext);
    const pubkey = this.padTo32Bytes(publicKey);
    const nonce = this.nonceToU128(nonceBytes);

    console.log(`[Arcium] Encrypted answer ${answerIndex} (${String.fromCharCode(65 + answerIndex)})`);
    console.log(`[Arcium] Ciphertext: ${Buffer.from(encrypted).toString('hex').slice(0, 32)}...`);
    console.log(`[Arcium] Pubkey: ${Buffer.from(pubkey).toString('hex').slice(0, 32)}...`);
    console.log(`[Arcium] Nonce: ${nonce}`);

    return {
      encrypted,
      pubkey,
      nonce,
      nonceBytes
    };
  }

  /**
   * Encrypt a user's submitted answer for on-chain validation
   *
   * This method encrypts the player's answer using the same MXE public key
   * that was used to encrypt the correct answer. The Arcium MPC network
   * can then decrypt both ciphertexts using its private key and compare them.
   *
   * CRITICAL: Both question and user answers MUST use the same MXE public key
   * for shared secret derivation, otherwise the MPC network cannot compare them.
   *
   * @param answerIndex - Player's answer (0-3)
   * @returns Encryption result for blockchain validation
   *
   * @example
   * ```typescript
   * const service = new ArciumEncryptionService();
   *
   * // Encrypt user's answer (no need for question pubkey)
   * const userResult = service.encryptUserAnswer(selectedAnswer);
   *
   * // Send to blockchain for validation
   * const tx = await solana.validateAnswerOnchain({
   *   encryptedUserAnswer: userResult.encrypted,
   *   userPubkey: userResult.pubkey,
   *   userNonce: userResult.nonce,
   *   // ...
   * });
   * ```
   */
  encryptUserAnswer(answerIndex: number): EncryptionResult {
    // Validate input
    if (answerIndex < 0 || answerIndex > 3) {
      throw new Error(`Invalid answer index: ${answerIndex}. Must be 0-3 (A-D)`);
    }

    // Generate user's own keypair
    const userPrivateKey = x25519.utils.randomSecretKey();
    const userPublicKey = x25519.getPublicKey(userPrivateKey);

    // CRITICAL FIX: Derive shared secret using user's private key and MXE public key
    // This MUST match the encryption scheme used in encryptAnswer()
    const sharedSecret = x25519.getSharedSecret(userPrivateKey, this.mxePublicKey);

    // Initialize cipher
    const cipher = new RescueCipher(sharedSecret);

    // Encrypt user's answer
    const plaintext = [BigInt(answerIndex)];
    const nonceBytes = randomBytes(16);
    const ciphertext = cipher.encrypt(plaintext, nonceBytes);

    const encrypted = this.processCiphertext(ciphertext);
    const pubkey = this.padTo32Bytes(userPublicKey);
    const nonce = this.nonceToU128(nonceBytes);

    console.log(`[Arcium] Encrypted user answer ${answerIndex} (${String.fromCharCode(65 + answerIndex)})`);
    console.log(`[Arcium] User ciphertext: ${Buffer.from(encrypted).toString('hex').slice(0, 32)}...`);
    console.log(`[Arcium] User pubkey: ${Buffer.from(pubkey).toString('hex').slice(0, 32)}...`);
    console.log(`[Arcium] User nonce: ${nonce}`);

    return {
      encrypted,
      pubkey,
      nonce,
      nonceBytes
    };
  }

  /**
   * Batch encrypt multiple questions
   *
   * Efficiently encrypts all questions in a quiz set. Used during quiz creation.
   *
   * @param answers - Array of correct answer indices
   * @returns Array of encryption results
   *
   * @example
   * ```typescript
   * const service = new ArciumEncryptionService();
   *
   * const questions = [
   *   { correct_answer: 0 }, // A
   *   { correct_answer: 2 }, // C
   *   { correct_answer: 1 }, // B
   * ];
   *
   * const encryptedAnswers = service.batchEncryptAnswers(
   *   questions.map(q => q.correct_answer)
   * );
   *
   * // Store all encrypted answers
   * for (let i = 0; i < encryptedAnswers.length; i++) {
   *   await supabase.from('questions').insert({
   *     quiz_set_id: quizId,
   *     question_index: i,
   *     encrypted_answer: encryptedAnswers[i].encrypted,
   *     arcium_pubkey: encryptedAnswers[i].pubkey,
   *     arcium_nonce: encryptedAnswers[i].nonce.toString()
   *   });
   * }
   * ```
   */
  batchEncryptAnswers(answers: number[]): EncryptionResult[] {
    console.log(`[Arcium] Batch encrypting ${answers.length} answers`);
    return answers.map((answer, index) => {
      const result = this.encryptAnswer(answer);
      console.log(`[Arcium] Question ${index + 1}/${answers.length} encrypted`);
      return result;
    });
  }

  /**
   * Convert answer letter (A/B/C/D) to index (0-3)
   */
  static letterToIndex(letter: string): number {
    return letter.toUpperCase().charCodeAt(0) - 65;
  }

  /**
   * Convert answer index (0-3) to letter (A/B/C/D)
   */
  static indexToLetter(index: number): string {
    if (index < 0 || index > 3) {
      throw new Error(`Invalid index: ${index}`);
    }
    return String.fromCharCode(65 + index);
  }

  /**
   * Convert encryption result to format for Supabase storage
   */
  static toStorageFormat(result: EncryptionResult): {
    encrypted_answer: Buffer;
    arcium_pubkey: Buffer;
    arcium_nonce: string;
  } {
    return {
      encrypted_answer: Buffer.from(result.encrypted),
      arcium_pubkey: Buffer.from(result.pubkey),
      arcium_nonce: result.nonce.toString()
    };
  }

  /**
   * Convert encryption result to format for Solana program
   */
  static toSolanaFormat(result: EncryptionResult): {
    encrypted: number[];
    pubkey: number[];
    nonce: BN;
  } {
    return {
      encrypted: Array.from(result.encrypted),
      pubkey: Array.from(result.pubkey),
      nonce: new BN(result.nonce.toString())
    };
  }
}

/**
 * Singleton instance for easy import
 */
export const arciumService = new ArciumEncryptionService();

/**
 * Example usage:
 *
 * ```typescript
 * // In API route: /api/quiz/create-set/route.ts
 * import { arciumService } from '@/lib/encryption/arcium-service';
 *
 * export async function POST(req: Request) {
 *   const { questions } = await req.json();
 *
 *   // Encrypt all answers
 *   const encryptedQuestions = questions.map((q: any, index: number) => {
 *     const encrypted = arciumService.encryptAnswer(q.correct_answer);
 *
 *     return {
 *       question_index: index,
 *       question_text: q.text,
 *       options: q.options,
 *       correct_answer: q.correct_answer, // Still save for server validation fallback
 *       ...ArciumEncryptionService.toStorageFormat(encrypted)
 *     };
 *   });
 *
 *   // Save to database
 *   await supabase.from('questions').insert(encryptedQuestions);
 * }
 * ```
 *
 * ```typescript
 * // In API route: /api/game/submit-answer/route.ts
 * import { arciumService } from '@/lib/encryption/arcium-service';
 *
 * export async function POST(req: Request) {
 *   const { selected_answer, question_index } = await req.json();
 *
 *   // Get question encryption data
 *   const question = await supabase
 *     .from('questions')
 *     .select('encrypted_answer, arcium_pubkey, arcium_nonce')
 *     .single();
 *
 *   // Encrypt user answer
 *   const userEncrypted = arciumService.encryptUserAnswer(
 *     selected_answer,
 *     question.arcium_pubkey
 *   );
 *
 *   // Validate on-chain via Arcium MPC
 *   const tx = await solana.validateAnswerOnchain({
 *     encryptedUserAnswer: userEncrypted.encrypted,
 *     encryptedCorrectAnswer: question.encrypted_answer,
 *     // ...
 *   });
 *
 *   // Wait for MPC result
 *   const isCorrect = await waitForMPCResult(tx);
 *
 *   return Response.json({ isCorrect });
 * }
 * ```
 */
