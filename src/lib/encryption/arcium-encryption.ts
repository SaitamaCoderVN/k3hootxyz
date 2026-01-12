/**
 * Arcium Encryption Utilities for K3Hoot Quiz
 * 
 * This module provides helper functions for encrypting/decrypting quiz data
 * using Arcium's RescueCipher with x25519 key exchange.
 */

import { RescueCipher, x25519, getMXEPublicKey, deserializeLE } from "@arcium-hq/client";
import { randomBytes } from "crypto";
import { BN } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

/**
 * Hardcoded devnet MXE x25519 public key as fallback
 * Extracted from devnet MXE account HxgVGPskCXj7U6PQsxUHdrk69TWECGW53LVdcxQkp77N
 */
const HARDCODED_MXE_PUBKEY = new Uint8Array([
  103, 26, 85, 250, 179, 159, 17, 117, 1, 133, 226, 111, 196, 140, 140, 118,
  104, 193, 98, 208, 81, 170, 3, 69, 124, 138, 230, 86, 134, 144, 141, 144
]);

/**
 * Encryption context containing keys and cipher
 */
export interface EncryptionContext {
  cipher: RescueCipher;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  mxePublicKey: Uint8Array;
  sharedSecret: Uint8Array;
}

/**
 * Encrypted data ready for Solana program
 */
export interface EncryptedData {
  ciphertext: number[];      // Padded to 32 bytes
  publicKey: number[];       // Padded to 32 bytes  
  nonce: BN;                 // As u128
  nonceBytes: Uint8Array;    // Original 16-byte nonce
}

/**
 * Fetches MXE public key from chain with retry logic
 */
export async function getMXEPublicKeyWithRetry(
  provider: anchor.AnchorProvider,
  programId: PublicKey,
  maxRetries: number = 3,
  retryDelayMs: number = 500
): Promise<Uint8Array> {
  // Try to fetch from chain
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (mxePublicKey) {
        console.log("✅ Fetched MXE public key from chain");
        return mxePublicKey;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        console.log("⚠️  Using hardcoded MXE public key (devnet fallback)");
        return HARDCODED_MXE_PUBKEY;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return HARDCODED_MXE_PUBKEY;
}

/**
 * Creates an encryption context with x25519 key exchange
 * 
 * @param provider - Anchor provider for RPC calls
 * @param programId - Your Solana program ID
 * @returns Encryption context with cipher and keys
 * 
 * @example
 * ```ts
 * const ctx = await createEncryptionContext(provider, program.programId);
 * const encrypted = encryptQuizAnswer(ctx, 2); // Answer: C
 * ```
 */
export async function createEncryptionContext(
  provider: anchor.AnchorProvider,
  programId: PublicKey
): Promise<EncryptionContext> {
  // Step 1: Get MXE cluster's public key
  const mxePublicKey = await getMXEPublicKeyWithRetry(provider, programId);
  
  // Step 2: Generate random x25519 keypair
  const privateKey = x25519.utils.randomSecretKey();
  const publicKey = x25519.getPublicKey(privateKey);
  
  // Step 3: Derive shared secret using ECDH
  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
  
  // Step 4: Initialize RescueCipher with shared secret
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
 * Pads data to exactly 32 bytes (required by Solana program)
 * 
 * @param data - Input data (array or Uint8Array)
 * @returns Array of 32 bytes
 */
export function padTo32Bytes(data: any): number[] {
  const padded = new Uint8Array(32);
  
  if (Array.isArray(data)) {
    // Handle nested arrays (e.g., ciphertext)
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
 * Converts 16-byte nonce to u128 BigNum for Solana
 * 
 * @param nonce - 16-byte nonce
 * @returns BN representing u128
 */
export function nonceToU128(nonce: Uint8Array): BN {
  return new BN(deserializeLE(nonce).toString());
}

/**
 * Encrypts a quiz answer (0-3 for A/B/C/D)
 * 
 * @param ctx - Encryption context from createEncryptionContext
 * @param answer - Answer index (0=A, 1=B, 2=C, 3=D)
 * @returns Encrypted data ready for Solana program
 * 
 * @example
 * ```ts
 * const ctx = await createEncryptionContext(provider, program.programId);
 * 
 * // Encrypt answer "B" (index 1)
 * const encrypted = encryptQuizAnswer(ctx, 1);
 * 
 * // Use in Solana transaction
 * await program.methods
 *   .addEncryptedQuestionBlock(
 *     questionIndex,
 *     encrypted.ciphertext,
 *     encrypted.publicKey,
 *     encrypted.nonce
 *   )
 *   .rpc();
 * ```
 */
export function encryptQuizAnswer(
  ctx: EncryptionContext,
  answer: number
): EncryptedData {
  // Validate answer is in range 0-3
  if (answer < 0 || answer > 3) {
    throw new Error(`Invalid answer: ${answer}. Must be 0-3 (A-D)`);
  }
  
  // Convert to BigInt array (required by RescueCipher)
  const plaintext = [BigInt(answer)];
  
  // Generate random nonce
  const nonceBytes = randomBytes(16);
  
  // Encrypt with RescueCipher
  const ciphertext = ctx.cipher.encrypt(plaintext, nonceBytes);
  
  return {
    ciphertext: padTo32Bytes(ciphertext),
    publicKey: padTo32Bytes(ctx.publicKey),
    nonce: nonceToU128(nonceBytes),
    nonceBytes,
  };
}

/**
 * Encrypts multiple values (generic encryption)
 * 
 * @param ctx - Encryption context
 * @param values - Array of numbers to encrypt
 * @returns Encrypted data
 * 
 * @example
 * ```ts
 * // Encrypt two u8 values
 * const encrypted = encryptValues(ctx, [42, 101]);
 * ```
 */
export function encryptValues(
  ctx: EncryptionContext,
  values: number[]
): EncryptedData {
  const plaintext = values.map(v => BigInt(v));
  const nonceBytes = randomBytes(16);
  const ciphertext = ctx.cipher.encrypt(plaintext, nonceBytes);
  
  return {
    ciphertext: padTo32Bytes(ciphertext),
    publicKey: padTo32Bytes(ctx.publicKey),
    nonce: nonceToU128(nonceBytes),
    nonceBytes,
  };
}

/**
 * Decrypts ciphertext back to plaintext
 * 
 * @param ctx - Encryption context (must use same keys)
 * @param ciphertext - Encrypted data (32 bytes)
 * @param nonce - Nonce used for encryption
 * @returns Decrypted values as BigInt array
 * 
 * @example
 * ```ts
 * const plaintext = decryptValues(ctx, encrypted.ciphertext, encrypted.nonceBytes);
 * console.log("Answer:", Number(plaintext[0])); // Convert BigInt to number
 * ```
 */
export function decryptValues(
  ctx: EncryptionContext,
  ciphertext: number[],
  nonce: Uint8Array
): bigint[] {
  return ctx.cipher.decrypt(ciphertext, nonce);
}

/**
 * Helper to convert answer index to letter
 */
export function answerToLetter(answer: number): string {
  return String.fromCharCode(65 + answer); // A=0, B=1, C=2, D=3
}

/**
 * Helper to convert letter to answer index
 */
export function letterToAnswer(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

/**
 * Complete example of encrypting a quiz question
 */
export async function encryptQuizQuestion(
  provider: anchor.AnchorProvider,
  programId: PublicKey,
  correctAnswerIndex: number
): Promise<{ encrypted: EncryptedData; context: EncryptionContext }> {
  // Create encryption context
  const context = await createEncryptionContext(provider, programId);
  
  // Encrypt the correct answer
  const encrypted = encryptQuizAnswer(context, correctAnswerIndex);
  
  console.log(`🔐 Encrypted answer: ${answerToLetter(correctAnswerIndex)}`);
  console.log(`   Ciphertext: ${Buffer.from(encrypted.ciphertext).toString('hex').slice(0, 32)}...`);
  console.log(`   Public Key: ${Buffer.from(encrypted.publicKey).toString('hex').slice(0, 32)}...`);
  console.log(`   Nonce: ${encrypted.nonce.toString()}`);
  
  return { encrypted, context };
}

