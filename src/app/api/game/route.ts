import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quiz_id, host_id } = body;

    // Create game session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        quiz_id,
        host_id,
        status: 'waiting',
        current_question: 0,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { session_id, action } = body;

    let updateData = {};

    switch (action) {
      case 'start':
        updateData = {
          status: 'active',
          started_at: new Date().toISOString(),
        };
        break;
      case 'next_question':
        const { data: currentSession } = await supabase
          .from('game_sessions')
          .select('current_question')
          .eq('id', session_id)
          .single();

        updateData = {
          current_question: (currentSession?.current_question || 0) + 1,
        };
        break;
      case 'end':
        updateData = {
          status: 'finished',
          ended_at: new Date().toISOString(),
        };
        break;
      default:
        throw new Error('Invalid action');
    }

    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .update(updateData)
      .eq('id', session_id)
      .select()
      .single();

    if (sessionError) throw sessionError;

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating game session:', error);
    return NextResponse.json(
      { error: 'Failed to update game session' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      throw new Error('Session ID is required');
    }

    // Get game session with related data
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select(`
        *,
        quiz:quizzes (
          *,
          questions (*)
        ),
        scores:game_scores (*)
      `)
      .eq('id', session_id)
      .single();

    if (sessionError) throw sessionError;

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching game session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game session' },
      { status: 500 }
    );
  }
} 