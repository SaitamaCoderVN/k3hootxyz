/**
 * Server-Side Solana Client for K3HOOT
 *
 * This client is designed to be used in Next.js API routes (server-side only).
 * It handles blockchain operations without requiring a browser wallet.
 *
 * NOTE: For production, you'll need to:
 * 1. Set up a server keypair with SOL for gas fees
 * 2. Or implement transaction building for client-side signing
 */

import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN, Idl } from '@coral-xyz/anchor';
import IDL from '@/idl/k_3_hoot_program_arcium.json';

// Program ID from your deployment
const PROGRAM_ID = new PublicKey('24MqGK5Ei8aKG6fCK8Ym36cHy1UvYD3zicRHWaEpekz4');

// RPC endpoints
const RPC_ENDPOINTS = {
  devnet: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
  mainnet: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com'
};

/**
 * Server-side Solana client for blockchain operations
 */
export class ServerSolanaClient {
  private connection: Connection;
  private program: Program | null = null;
  private network: 'devnet' | 'mainnet';

  constructor(network: 'devnet' | 'mainnet' = 'devnet') {
    this.network = network;
    this.connection = new Connection(
      RPC_ENDPOINTS[network],
      {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      }
    );
  }

  /**
   * Initialize program with a wallet (for server-side operations)
   * NOTE: In production, use a server keypair with SOL for gas fees
   */
  private initializeProgram(wallet: Wallet) {
    const provider = new AnchorProvider(
      this.connection,
      wallet,
      {
        commitment: 'confirmed',
        preflightCommitment: 'processed',
        skipPreflight: false
      }
    );

    this.program = new Program(
      IDL as unknown as Idl,
      provider
    );
  }

  /**
   * Derive QuizSet PDA
   */
  deriveQuizSetPda(authority: PublicKey, uniqueId: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('quiz_set'),
        authority.toBuffer(),
        Buffer.from([uniqueId])
      ],
      PROGRAM_ID
    );
  }

  /**
   * Derive Vault PDA (holds SOL rewards)
   */
  deriveVaultPda(quizSetPda: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), quizSetPda.toBuffer()],
      PROGRAM_ID
    );
  }

  /**
   * Derive QuestionBlock PDA
   */
  deriveQuestionBlockPda(quizSetPda: PublicKey, questionIndex: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('question_block'),
        quizSetPda.toBuffer(),
        Buffer.from([questionIndex + 1]) // 1-based on-chain
      ],
      PROGRAM_ID
    );
  }

  /**
   * Derive PlayerAnswer PDA
   */
  derivePlayerAnswerPda(quizSetPda: PublicKey, playerPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('player_answer'),
        quizSetPda.toBuffer(),
        playerPubkey.toBuffer()
      ],
      PROGRAM_ID
    );
  }

  /**
   * Build unsigned transaction for answer validation
   * Returns serialized transaction that client can sign and submit
   *
   * @param params Validation parameters
   * @returns Base64 encoded transaction (for client-side signing)
   */
  async buildValidateAnswerTransaction(params: {
    quizSetId: string;
    questionIndex: number;
    playerWallet: string;
    encryptedUserAnswer: Uint8Array;
    userPubkey: Uint8Array;
    userNonce: bigint;
  }): Promise<{
    transaction: string; // Base64 encoded
    message: string;
  }> {
    try {
      // Convert string addresses to PublicKeys
      const quizSetPda = new PublicKey(params.quizSetId);
      const playerPubkey = new PublicKey(params.playerWallet);

      // Derive PDAs
      const [questionBlockPda] = this.deriveQuestionBlockPda(quizSetPda, params.questionIndex);
      const [playerAnswerPda] = this.derivePlayerAnswerPda(quizSetPda, playerPubkey);

      // TODO: Get Arcium accounts
      // const compDefOffset = getCompDefAccOffset("validate_answer");
      // const compDefPda = getCompDefAccAddress(PROGRAM_ID, compDefOffset);
      // etc.

      console.log('[ServerSolanaClient] Building validate_answer transaction');
      console.log('  Quiz Set:', quizSetPda.toString());
      console.log('  Question Block:', questionBlockPda.toString());
      console.log('  Player Answer:', playerAnswerPda.toString());
      console.log('  Player:', playerPubkey.toString());

      // For now, return a placeholder
      // In production, build actual transaction with program.methods.validateAnswerOnchain()

      return {
        transaction: '', // Base64 encoded transaction
        message: 'Transaction building not yet fully implemented. Requires Arcium MPC integration.'
      };

    } catch (error) {
      console.error('[ServerSolanaClient] Error building transaction:', error);
      throw error;
    }
  }

  /**
   * Wait for Arcium MPC computation result
   *
   * @param txSignature Transaction signature of the validation tx
   * @param timeoutMs Maximum time to wait (default 30s)
   * @returns Boolean indicating if answer is correct
   */
  async waitForMPCResult(txSignature: string, timeoutMs: number = 30000): Promise<boolean> {
    console.log('[ServerSolanaClient] Waiting for MPC result:', txSignature);

    const startTime = Date.now();

    // Poll for transaction confirmation and parse result
    while (Date.now() - startTime < timeoutMs) {
      try {
        // Get transaction details
        const tx = await this.connection.getTransaction(txSignature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });

        if (tx) {
          console.log('[ServerSolanaClient] Transaction confirmed');

          // TODO: Parse Arcium MPC result from transaction logs
          // The result should be in the logs or account data updates

          // For now, return false (not implemented)
          console.warn('[ServerSolanaClient] MPC result parsing not yet implemented');
          return false;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error('[ServerSolanaClient] Error polling for result:', error);
        // Continue polling
      }
    }

    throw new Error('MPC computation timeout');
  }

  /**
   * Get QuizSet account data from blockchain
   */
  async getQuizSet(quizSetId: string): Promise<any> {
    try {
      const quizSetPda = new PublicKey(quizSetId);

      // Fetch account data
      const accountInfo = await this.connection.getAccountInfo(quizSetPda);

      if (!accountInfo) {
        throw new Error('QuizSet account not found');
      }

      // TODO: Deserialize account data using Anchor
      // For now, return raw data
      return {
        publicKey: quizSetPda.toString(),
        data: accountInfo.data,
        owner: accountInfo.owner.toString(),
        lamports: accountInfo.lamports
      };

    } catch (error) {
      console.error('[ServerSolanaClient] Error fetching QuizSet:', error);
      throw error;
    }
  }

  /**
   * Check if QuizSet has winner set
   */
  async hasWinner(quizSetId: string): Promise<{ hasWinner: boolean; winner?: string }> {
    try {
      const quizSet = await this.getQuizSet(quizSetId);

      // TODO: Parse winner from account data
      // For now, return false
      return { hasWinner: false };

    } catch (error) {
      console.error('[ServerSolanaClient] Error checking winner:', error);
      return { hasWinner: false };
    }
  }

  /**
   * Get vault balance (SOL reward pool)
   */
  async getVaultBalance(quizSetId: string): Promise<number> {
    try {
      const quizSetPda = new PublicKey(quizSetId);
      const [vaultPda] = this.deriveVaultPda(quizSetPda);

      const balance = await this.connection.getBalance(vaultPda);
      return balance / 1_000_000_000; // Convert lamports to SOL

    } catch (error) {
      console.error('[ServerSolanaClient] Error getting vault balance:', error);
      return 0;
    }
  }

  /**
   * Verify transaction exists and is confirmed
   */
  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status?.value?.confirmationStatus === 'confirmed' ||
             status?.value?.confirmationStatus === 'finalized';
    } catch (error) {
      console.error('[ServerSolanaClient] Error verifying transaction:', error);
      return false;
    }
  }
}

/**
 * Singleton instance for server-side operations
 */
let serverSolanaClient: ServerSolanaClient | null = null;

export function getServerSolanaClient(network: 'devnet' | 'mainnet' = 'devnet'): ServerSolanaClient {
  if (!serverSolanaClient) {
    serverSolanaClient = new ServerSolanaClient(network);
  }
  return serverSolanaClient;
}

/**
 * Helper: Build claim reward transaction for client signing
 *
 * This is the recommended approach: Server builds the transaction,
 * client signs it with their wallet, then submits it.
 */
export async function buildClaimRewardTransaction(params: {
  quizSetId: string;
  winnerWallet: string;
}): Promise<{
  transaction: string; // Base64 encoded
  message: string;
}> {
  const client = getServerSolanaClient();

  try {
    const quizSetPda = new PublicKey(params.quizSetId);
    const winnerPubkey = new PublicKey(params.winnerWallet);
    const [vaultPda] = client.deriveVaultPda(quizSetPda);

    console.log('[buildClaimRewardTransaction]');
    console.log('  Quiz Set:', quizSetPda.toString());
    console.log('  Vault:', vaultPda.toString());
    console.log('  Winner:', winnerPubkey.toString());

    // TODO: Build actual transaction using Anchor
    // const tx = await program.methods
    //   .claimReward()
    //   .accounts({
    //     quizSet: quizSetPda,
    //     vault: vaultPda,
    //     claimer: winnerPubkey,
    //     systemProgram: SystemProgram.programId
    //   })
    //   .transaction();
    //
    // return {
    //   transaction: tx.serialize({ requireAllSignatures: false }).toString('base64'),
    //   message: 'Sign this transaction to claim your reward'
    // };

    return {
      transaction: '',
      message: 'Claim reward transaction building not yet fully implemented. Use SimpleK3HootClient.claimReward() on client-side instead.'
    };

  } catch (error) {
    console.error('[buildClaimRewardTransaction] Error:', error);
    throw error;
  }
}

/**
 * Example usage in API route:
 *
 * ```typescript
 * import { getServerSolanaClient } from '@/lib/solana/server-solana-client';
 *
 * export async function POST(req: Request) {
 *   const { quizSetId, playerWallet } = await req.json();
 *
 *   const client = getServerSolanaClient('devnet');
 *
 *   // Check vault balance
 *   const balance = await client.getVaultBalance(quizSetId);
 *   console.log('Vault has', balance, 'SOL');
 *
 *   // Build transaction for client to sign
 *   const { transaction } = await buildClaimRewardTransaction({
 *     quizSetId,
 *     winnerWallet: playerWallet
 *   });
 *
 *   return Response.json({ transaction });
 * }
 * ```
 */
