import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, status, currentQuestionIndex } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    const updates: any = { updated_at: new Date().toISOString() };
    
    if (status) updates.status = status;
    if (status === 'playing' && !currentQuestionIndex) {
      updates.started_at = new Date().toISOString();
    }
    if (status === 'finished') {
      updates.ended_at = new Date().toISOString();
    }
    if (currentQuestionIndex !== undefined) {
      updates.current_question_index = currentQuestionIndex;
    }

    const { data: session, error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in update-session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
