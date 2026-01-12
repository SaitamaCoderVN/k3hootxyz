import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { sessionId, walletAddress } = await req.json();

    if (!sessionId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get session with blockchain_quiz_set_id
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('blockchain_quiz_set_id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'finished') {
      return NextResponse.json(
        { error: 'Game not finished yet' },
        { status: 400 }
      );
    }

    if (!session.blockchain_quiz_set_id) {
      return NextResponse.json(
        { error: 'No blockchain quiz linked' },
        { status: 400 }
      );
    }

    // Get leaderboard (rank 1)
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('game_participants')
      .select('wallet_address, score, player_name')
      .eq('session_id', sessionId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (leaderboardError || !leaderboard) {
      return NextResponse.json(
        { error: 'No participants found' },
        { status: 404 }
      );
    }

    // Verify caller is the winner
    if (leaderboard.wallet_address !== walletAddress) {
      return NextResponse.json(
        {
          error: 'You are not the winner',
          winner: leaderboard.player_name,
          winnerAddress: leaderboard.wallet_address
        },
        { status: 403 }
      );
    }

    // Return quiz ID for claiming
    return NextResponse.json({
      success: true,
      quizSetId: session.blockchain_quiz_set_id,
      score: leaderboard.score,
      message: 'You can claim your reward!'
    });

  } catch (error) {
    console.error('Error in verify-winner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
