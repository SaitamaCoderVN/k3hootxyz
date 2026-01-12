/**
 * Rate Limiting Middleware for Next.js API Routes
 *
 * Prevents API abuse and DDoS attacks by limiting the number of requests
 * from a single IP address or wallet within a time window.
 *
 * Uses in-memory storage (suitable for single-server deployments).
 * For production with multiple servers, use Redis or similar distributed cache.
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage (use Redis in production for multi-server deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the window
   * @default 100
   */
  maxRequests?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Key generator function (default: IP address)
   * @default (req) => getClientIp(req)
   */
  keyGenerator?: (req: NextRequest) => string;

  /**
   * Custom error message
   */
  message?: string;

  /**
   * Skip rate limiting based on condition
   * @example skipIf: (req) => req.headers.get('x-admin-key') === process.env.ADMIN_KEY
   */
  skipIf?: (req: NextRequest) => boolean;
}

/**
 * Extract client IP address from request
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
function getClientIp(req: NextRequest): string {
  // Try various headers in order of precedence
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be: "client, proxy1, proxy2"
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback (should not happen in production)
  return 'unknown';
}

/**
 * Check rate limit for a request
 *
 * @param key - Unique identifier (IP address, wallet address, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and rate limit info
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {}
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
} {
  const {
    maxRequests = 100,
    windowMs = 60000, // 1 minute
  } = config;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or window expired - create new
  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 *
 * @param config - Rate limit configuration
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
 *
 * const limiter = rateLimitMiddleware({
 *   maxRequests: 50,
 *   windowMs: 60000, // 1 minute
 * });
 *
 * export async function POST(req: NextRequest) {
 *   // Apply rate limiting
 *   const limitResponse = limiter(req);
 *   if (limitResponse) return limitResponse;
 *
 *   // Process request
 *   return NextResponse.json({ success: true });
 * }
 * ```
 */
export function rateLimitMiddleware(config: RateLimitConfig = {}) {
  const {
    maxRequests = 100,
    windowMs = 60000,
    keyGenerator = getClientIp,
    message = 'Too many requests, please try again later',
    skipIf,
  } = config;

  return (req: NextRequest): NextResponse | null => {
    // Skip if condition met
    if (skipIf && skipIf(req)) {
      return null;
    }

    // Generate rate limit key
    const key = keyGenerator(req);

    // Check rate limit
    const result = checkRateLimit(key, { maxRequests, windowMs });

    // Add rate limit headers to response
    const headers = new Headers({
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
    });

    // Rate limit exceeded
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());

      return NextResponse.json(
        {
          error: message,
          retryAfter: retryAfter,
          resetAt: new Date(result.resetAt).toISOString(),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Rate limit OK - return null to continue
    return null;
  };
}

/**
 * Create a rate limiter with specific configuration
 *
 * @example
 * ```typescript
 * // Strict rate limit for sensitive endpoints
 * const strictLimiter = createRateLimiter({
 *   maxRequests: 10,
 *   windowMs: 60000 // 10 requests per minute
 * });
 *
 * // Lenient rate limit for public endpoints
 * const publicLimiter = createRateLimiter({
 *   maxRequests: 100,
 *   windowMs: 60000 // 100 requests per minute
 * });
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  return rateLimitMiddleware(config);
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const RateLimiters = {
  /**
   * Strict rate limit for sensitive operations
   * 10 requests per minute
   */
  strict: createRateLimiter({
    maxRequests: 10,
    windowMs: 60000,
    message: 'Too many sensitive operations, please wait before trying again',
  }),

  /**
   * Standard rate limit for authenticated endpoints
   * 50 requests per minute
   */
  standard: createRateLimiter({
    maxRequests: 50,
    windowMs: 60000,
  }),

  /**
   * Lenient rate limit for public endpoints
   * 100 requests per minute
   */
  public: createRateLimiter({
    maxRequests: 100,
    windowMs: 60000,
  }),

  /**
   * Very strict rate limit for reward claims
   * 3 requests per minute
   */
  claimReward: createRateLimiter({
    maxRequests: 3,
    windowMs: 60000,
    message: 'Too many reward claim attempts, please wait',
  }),

  /**
   * Rate limit for game creation
   * 20 games per hour
   */
  createGame: createRateLimiter({
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Game creation limit reached, please wait',
  }),
};

/**
 * Cleanup expired entries periodically
 * Run every 5 minutes to prevent memory leak
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of rateLimitStore.entries()) {
      if (now >= entry.resetAt) {
        rateLimitStore.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Rate Limit] Cleaned ${cleaned} expired entries`);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * USAGE EXAMPLES:
 *
 * 1. Simple usage with default config:
 * ```typescript
 * import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
 *
 * const limiter = rateLimitMiddleware();
 *
 * export async function POST(req: NextRequest) {
 *   const limitResponse = limiter(req);
 *   if (limitResponse) return limitResponse;
 *
 *   // Your API logic here
 * }
 * ```
 *
 * 2. Using pre-configured limiters:
 * ```typescript
 * import { RateLimiters } from '@/lib/middleware/rate-limit';
 *
 * export async function POST(req: NextRequest) {
 *   // Apply strict rate limiting
 *   const limitResponse = RateLimiters.strict(req);
 *   if (limitResponse) return limitResponse;
 *
 *   // Your API logic here
 * }
 * ```
 *
 * 3. Custom key generator (rate limit by wallet address):
 * ```typescript
 * const walletLimiter = rateLimitMiddleware({
 *   maxRequests: 50,
 *   windowMs: 60000,
 *   keyGenerator: (req) => {
 *     const wallet = req.headers.get('x-wallet-address');
 *     return wallet || getClientIp(req);
 *   },
 * });
 * ```
 *
 * 4. Skip rate limiting for admin users:
 * ```typescript
 * const adminSkipLimiter = rateLimitMiddleware({
 *   maxRequests: 100,
 *   windowMs: 60000,
 *   skipIf: (req) => {
 *     const adminKey = req.headers.get('x-admin-key');
 *     return adminKey === process.env.ADMIN_KEY;
 *   },
 * });
 * ```
 */
