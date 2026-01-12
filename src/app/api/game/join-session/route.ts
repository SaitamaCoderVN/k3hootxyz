import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { pin, playerName, walletAddress } = await req.json();

    if (!pin || !playerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('pin', pin)
      .eq('status', 'lobby')
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or already started' },
        { status: 404 }
      );
    }

    const { data: participant, error: participantError } = await supabase
      .from('game_participants')
      .insert({
        session_id: session.id,
        player_name: playerName,
        wallet_address: walletAddress,
        score: 0,
        answers: [],
      })
      .select()
      .single();

    if (participantError) {
      console.error('Error creating participant:', participantError);
      return NextResponse.json(
        { error: 'Failed to join session' },
        { status: 500 }
      );
    }

    // Increment total_players count
    await supabase
      .from('game_sessions')
      .update({ total_players: (session.total_players || 0) + 1 })
      .eq('id', session.id);

    return NextResponse.json({
      sessionId: session.id,
      participantId: participant.id,
      participantToken: participant.participant_token, // For reconnection
      session,
      participant
    });
  } catch (error) {
    console.error('Error in join-session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}