/**
 * Wallet Signature Verification for Solana
 *
 * Provides utilities to verify wallet ownership using ed25519 signatures.
 * This prevents users from impersonating other wallet addresses.
 *
 * SECURITY CRITICAL: Always verify signatures before performing sensitive operations
 * like claiming rewards, submitting answers, or creating games.
 */

import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Message that the user must sign to prove wallet ownership
 * Include timestamp to prevent replay attacks
 */
export interface SignatureMessage {
  message: string;
  timestamp: number;
}

/**
 * Create a message for the user to sign
 *
 * @param action - Action description (e.g., "join_game", "claim_reward")
 * @param additionalData - Optional additional data to include
 * @returns Message string to sign
 *
 * @example
 * ```typescript
 * const message = createSignatureMessage('join_game', {
 *   pin: '123456',
 *   playerName: 'Alice'
 * });
 * // Returns: "K3HOOT\nAction: join_game\nTimestamp: 1704931200000\nPin: 123456\nPlayerName: Alice"
 * ```
 */
export function createSignatureMessage(
  action: string,
  additionalData?: Record<string, any>
): string {
  const timestamp = Date.now();
  const parts = [
    'K3HOOT Authentication',
    `Action: ${action}`,
    `Timestamp: ${timestamp}`,
  ];

  if (additionalData) {
    for (const [key, value] of Object.entries(additionalData)) {
      parts.push(`${key}: ${value}`);
    }
  }

  return parts.join('\n');
}

/**
 * Verify a Solana wallet signature
 *
 * @param message - Original message that was signed
 * @param signature - Base58-encoded signature from wallet
 * @param publicKey - Public key (wallet address) as string or PublicKey
 * @returns true if signature is valid
 *
 * @example
 * ```typescript
 * const message = 'K3HOOT\nAction: claim_reward';
 * const signature = await wallet.signMessage(message);
 * const isValid = verifyWalletSignature(
 *   message,
 *   bs58.encode(signature),
 *   wallet.publicKey.toString()
 * );
 * ```
 */
export function verifyWalletSignature(
  message: string,
  signature: string,
  publicKey: string | PublicKey
): boolean {
  try {
    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);

    // Decode signature from base58
    const signatureBytes = bs58.decode(signature);

    // Convert public key to bytes
    const publicKeyObj = typeof publicKey === 'string'
      ? new PublicKey(publicKey)
      : publicKey;
    const publicKeyBytes = publicKeyObj.toBytes();

    // Verify signature using ed25519
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    return isValid;
  } catch (error) {
    console.error('[Wallet Verification] Error verifying signature:', error);
    return false;
  }
}

/**
 * Verify signature with timestamp validation
 * Rejects signatures older than maxAgeMs
 *
 * @param message - Message containing timestamp
 * @param signature - Base58-encoded signature
 * @param publicKey - Wallet public key
 * @param maxAgeMs - Maximum age of signature in milliseconds (default: 5 minutes)
 * @returns Object with validation result and error message
 *
 * @example
 * ```typescript
 * const result = verifyWithTimestamp(message, signature, walletAddress);
 * if (!result.valid) {
 *   return NextResponse.json({ error: result.error }, { status: 401 });
 * }
 * ```
 */
export function verifyWithTimestamp(
  message: string,
  signature: string,
  publicKey: string | PublicKey,
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutes
): { valid: boolean; error?: string } {
  // Extract timestamp from message
  const timestampMatch = message.match(/Timestamp: (\d+)/);
  if (!timestampMatch) {
    return { valid: false, error: 'Message does not contain timestamp' };
  }

  const messageTimestamp = parseInt(timestampMatch[1], 10);
  const now = Date.now();

  // Check if signature is too old
  if (now - messageTimestamp > maxAgeMs) {
    return { valid: false, error: 'Signature expired (too old)' };
  }

  // Check if signature is from the future (clock skew protection)
  if (messageTimestamp > now + 60000) { // Allow 1 minute clock skew
    return { valid: false, error: 'Signature timestamp is in the future' };
  }

  // Verify signature
  const isValid = verifyWalletSignature(message, signature, publicKey);
  if (!isValid) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}

/**
 * Middleware helper: Extract and verify signature from request headers
 *
 * Expected headers:
 * - x-wallet-address: Base58 public key
 * - x-wallet-signature: Base58 signature
 * - x-wallet-message: Message that was signed
 *
 * @param headers - Request headers
 * @returns Verification result with wallet address if valid
 *
 * @example
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   const auth = await verifyRequestSignature(req.headers);
 *
 *   if (!auth.valid) {
 *     return NextResponse.json(
 *       { error: auth.error },
 *       { status: 401 }
 *     );
 *   }
 *
 *   // auth.walletAddress is now verified
 *   const participant = await createParticipant(auth.walletAddress);
 * }
 * ```
 */
export async function verifyRequestSignature(
  headers: Headers
): Promise<{
  valid: boolean;
  walletAddress?: string;
  error?: string;
}> {
  const walletAddress = headers.get('x-wallet-address');
  const signature = headers.get('x-wallet-signature');
  const message = headers.get('x-wallet-message');

  if (!walletAddress || !signature || !message) {
    return {
      valid: false,
      error: 'Missing authentication headers (x-wallet-address, x-wallet-signature, x-wallet-message)',
    };
  }

  const result = verifyWithTimestamp(message, signature, walletAddress);

  if (!result.valid) {
    return { valid: false, error: result.error };
  }

  return { valid: true, walletAddress };
}

/**
 * HOW TO USE IN API ROUTES:
 *
 * 1. Client-side: Sign a message with wallet
 * ```typescript
 * import { createSignatureMessage } from '@/lib/auth/wallet-verification';
 *
 * const message = createSignatureMessage('claim_reward', {
 *   session_id: sessionId
 * });
 *
 * const signatureBytes = await wallet.signMessage(new TextEncoder().encode(message));
 * const signature = bs58.encode(signatureBytes);
 *
 * const response = await fetch('/api/game/claim-reward', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-wallet-address': wallet.publicKey.toString(),
 *     'x-wallet-signature': signature,
 *     'x-wallet-message': message
 *   },
 *   body: JSON.stringify({ session_id: sessionId })
 * });
 * ```
 *
 * 2. Server-side: Verify signature
 * ```typescript
 * import { verifyRequestSignature } from '@/lib/auth/wallet-verification';
 *
 * export async function POST(req: NextRequest) {
 *   // Verify wallet ownership
 *   const auth = await verifyRequestSignature(req.headers);
 *
 *   if (!auth.valid) {
 *     return NextResponse.json({ error: auth.error }, { status: 401 });
 *   }
 *
 *   // Now you know the user owns auth.walletAddress
 *   const { session_id } = await req.json();
 *
 *   // Process the request...
 * }
 * ```
 */

/**
 * Optional: Rate limit signature verification attempts
 * Store in Redis or in-memory cache
 */
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

const rateLimitCache = new Map<string, RateLimitEntry>();

export function checkSignatureRateLimit(
  walletAddress: string,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitCache.get(walletAddress);

  // No entry or expired window
  if (!entry || now > entry.resetAt) {
    rateLimitCache.set(walletAddress, {
      attempts: 1,
      resetAt: now + windowMs
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Check if limit exceeded
  if (entry.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  // Increment attempts
  entry.attempts++;
  return { allowed: true, remaining: maxAttempts - entry.attempts };
}

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitCache.entries()) {
      if (now > entry.resetAt) {
        rateLimitCache.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
