import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { participantToken, pin } = await req.json();

    if (!participantToken || !pin) {
      return NextResponse.json(
        { error: 'Missing required fields: participantToken and pin' },
        { status: 400 }
      );
    }

    // Use the can_rejoin_game function
    const { data: rejoinData, error: rejoinError } = await supabase
      .rpc('can_rejoin_game', {
        p_pin: pin,
        p_participant_token: participantToken
      });

    if (rejoinError || !rejoinData || rejoinData.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid participant token or game not found',
          canReconnect: false
        },
        { status: 404 }
      );
    }

    const rejoinInfo = rejoinData[0];

    if (!rejoinInfo.can_join) {
      return NextResponse.json(
        {
          error: 'Cannot rejoin this game',
          canReconnect: false
        },
        { status: 400 }
      );
    }

    // Get participant details
    const { data: participant, error: participantError } = await supabase
      .from('game_participants')
      .select('*')
      .eq('id', rejoinInfo.participant_id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found', canReconnect: false },
        { status: 404 }
      );
    }

    // Update participant online status
    const { error: updateError } = await supabase
      .from('game_participants')
      .update({
        is_online: true,
        last_seen_at: new Date().toISOString()
      })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Error updating participant status:', updateError);
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', rejoinInfo.session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found', canReconnect: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      canReconnect: true,
      participant,
      session,
      currentPhase: rejoinInfo.current_phase,
      message: 'Successfully reconnected to game'
    });
  } catch (error) {
    console.error('Error in reconnect-player:', error);
    return NextResponse.json(
      { error: 'Internal server error', canReconnect: false },
      { status: 500 }
    );
  }
}
