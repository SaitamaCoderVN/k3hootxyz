/**
 * Server-Side Supabase Client
 *
 * This module provides a secure Supabase client for use in Next.js API routes.
 * It uses the SERVICE ROLE KEY which bypasses Row Level Security (RLS) policies.
 *
 * SECURITY CRITICAL:
 * - NEVER use this client in client-side code
 * - NEVER expose the service role key to the browser
 * - Only use in API routes (/app/api/**‍/route.ts)
 * - Always validate inputs before database operations
 * - Implement your own authorization logic
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Get Supabase client with service role key for server-side operations
 *
 * This client bypasses RLS policies and has full database access.
 * Use it carefully and always validate user permissions in your API logic.
 *
 * @returns Supabase client with service role privileges
 * @throws Error if required environment variables are missing
 *
 * @example
 * ```typescript
 * // In API route: /app/api/game/join-session/route.ts
 * import { getServerSupabaseClient } from '@/lib/supabase/server-client';
 *
 * export async function POST(req: Request) {
 *   const supabase = getServerSupabaseClient();
 *
 *   // Now you can perform database operations with service role privileges
 *   const { data, error } = await supabase
 *     .from('game_sessions')
 *     .select('*')
 *     .eq('id', sessionId)
 *     .single();
 *
 *   return Response.json({ data });
 * }
 * ```
 */
export function getServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please add it to your .env.local file.'
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'This is required for server-side operations. ' +
      'Get it from: Supabase Dashboard → Settings → API → service_role key (secret). ' +
      'Add it to your .env.local file.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Cached singleton instance (optional, for better performance)
 *
 * Note: In Next.js API routes, each request creates a new instance anyway,
 * so caching might not provide significant benefits. Use getServerSupabaseClient()
 * directly for simplicity unless you have specific performance requirements.
 */
let cachedClient: SupabaseClient | null = null;

export function getCachedServerSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = getServerSupabaseClient();
  }
  return cachedClient;
}

/**
 * Example: Wrapper with authorization check
 *
 * You can create authorized wrappers that validate user permissions
 * before allowing database access.
 *
 * @example
 * ```typescript
 * export async function getAuthorizedSupabaseClient(
 *   walletAddress: string,
 *   signature: string
 * ): Promise<SupabaseClient> {
 *   // 1. Verify wallet signature
 *   const isValidSignature = await verifyWalletSignature(walletAddress, signature);
 *
 *   if (!isValidSignature) {
 *     throw new Error('Invalid wallet signature');
 *   }
 *
 *   // 2. Return service role client (user is authorized)
 *   return getServerSupabaseClient();
 * }
 * ```
 */
