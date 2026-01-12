import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { hostToken, pin } = await req.json();

    if (!hostToken || !pin) {
      return NextResponse.json(
        { error: 'Missing required fields: hostToken and pin' },
        { status: 400 }
      );
    }

    // Verify host token and get session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('pin', pin)
      .eq('host_token', hostToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid host token or session not found', canReconnect: false },
        { status: 404 }
      );
    }

    // Check if game is still active
    if (session.game_phase === 'finished') {
      return NextResponse.json(
        {
          error: 'Game has already finished',
          canReconnect: false,
          session
        },
        { status: 400 }
      );
    }

    // Update host presence
    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({
        is_host_present: true,
        last_host_ping: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Error updating host presence:', updateError);
    }

    // Get current participants
    const { data: participants, error: participantsError } = await supabase
      .from('game_participants')
      .select('*')
      .eq('session_id', session.id)
      .order('score', { ascending: false });

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
    }

    return NextResponse.json({
      canReconnect: true,
      session,
      participants: participants || [],
      message: 'Successfully reconnected as host'
    });
  } catch (error) {
    console.error('Error in reconnect-host:', error);
    return NextResponse.json(
      { error: 'Internal server error', canReconnect: false },
      { status: 500 }
    );
  }
}
