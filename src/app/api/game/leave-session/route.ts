import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { participantId, sessionId } = await req.json();

    if (!participantId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Delete participant from game
    const { error: deleteError } = await supabase
      .from('game_participants')
      .delete()
      .eq('id', participantId);

    if (deleteError) {
      console.error('Error leaving session:', deleteError);
      return NextResponse.json(
        { error: 'Failed to leave session' },
        { status: 500 }
      );
    }

    // Decrement total_players count atomically (fix race condition)
    await supabase.rpc('decrement_total_players', {
      p_session_id: sessionId
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully left the game'
    });
  } catch (error) {
    console.error('Error in leave-session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
