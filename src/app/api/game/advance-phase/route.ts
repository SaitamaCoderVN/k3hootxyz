import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';
import type { GamePhase } from '@/types/multiplayer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Advance game to next phase (Kahoot-style flow)
 * Phases: lobby → question → answer_reveal → leaderboard → (next question or finished)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { sessionId, targetPhase } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    // Get current session
    const { data: session, error: fetchError } = await supabase
      .from('game_sessions')
      .select('*, quiz_set_id')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get total questions
    const { data: questions } = await supabase
      .from('questions')
      .select('question_index')
      .eq('quiz_set_id', session.quiz_set_id)
      .order('question_index', { ascending: true });

    const totalQuestions = questions?.length || 0;
    const currentIndex = session.current_question_index ?? 0;

    // Determine next phase
    let nextPhase: GamePhase;
    let updates: any = {
      phase_started_at: new Date().toISOString(),
    };

    if (targetPhase) {
      // Explicit phase target (from host control)
      nextPhase = targetPhase;
    } else {
      // Auto-advance based on current phase
      const currentPhase = session.game_phase as GamePhase;

      switch (currentPhase) {
        case 'lobby':
          nextPhase = 'question';
          updates.status = 'playing';
          updates.started_at = new Date().toISOString();
          updates.current_question_index = 0;
          updates.question_started_at = new Date().toISOString();
          updates.answers_submitted = 0;
          break;

        case 'question':
          nextPhase = 'answer_reveal';
          break;

        case 'answer_reveal':
          nextPhase = 'leaderboard';
          break;

        case 'leaderboard':
          // Check if more questions
          if (currentIndex + 1 < totalQuestions) {
            nextPhase = 'question';
            updates.current_question_index = currentIndex + 1;
            updates.question_started_at = new Date().toISOString();
            updates.answers_submitted = 0;
          } else {
            nextPhase = 'finished';
            updates.status = 'finished';
            updates.ended_at = new Date().toISOString();
          }
          break;

        case 'finished':
          return NextResponse.json(
            { error: 'Game already finished' },
            { status: 400 }
          );

        default:
          nextPhase = 'lobby';
      }
    }

    updates.game_phase = nextPhase;

    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json(
        { error: 'Failed to advance phase' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: updatedSession,
      nextPhase,
      currentQuestion: updates.current_question_index ?? currentIndex,
      totalQuestions,
    });
  } catch (error) {
    console.error('Error in advance-phase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
