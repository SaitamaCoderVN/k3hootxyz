import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';
import type { SupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Generate a unique 6-digit PIN with collision detection
 * Retries up to MAX_ATTEMPTS times if PIN already exists
 */
async function generateUniquePin(supabase: SupabaseClient): Promise<string> {
  const MAX_ATTEMPTS = 10;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if PIN already exists in active sessions
    const { data, error } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('pin', pin)
      .in('status', ['lobby', 'playing']) // Only check active sessions
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking PIN uniqueness:', error);
      // Continue to next attempt on error
      continue;
    }

    // If no existing session found, PIN is unique
    if (!data) {
      console.log(`[PIN Generation] Generated unique PIN: ${pin} (attempt ${attempt + 1})`);
      return pin;
    }

    console.log(`[PIN Generation] Collision detected for PIN: ${pin}, retrying...`);
  }

  throw new Error(`Failed to generate unique PIN after ${MAX_ATTEMPTS} attempts`);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { quizSetId, hostWallet } = await req.json();

    if (!quizSetId || !hostWallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pin = await generateUniquePin(supabase);

    const { data: session, error } = await supabase
      .from('game_sessions')
      .insert({
        pin,
        quiz_set_id: quizSetId,
        blockchain_quiz_set_id: quizSetId, // Link to blockchain for reward claiming
        host_wallet: hostWallet,
        status: 'lobby',
        current_question_index: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Return session with host_token for reconnection
    return NextResponse.json({
      session,
      hostToken: session.host_token
    });
  } catch (error) {
    console.error('Error in create-session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
