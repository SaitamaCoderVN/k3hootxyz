import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({ 
      sessionId: session.id,
      participantId: participant.id,
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