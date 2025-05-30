import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, question_id, player_id, selected_option } = body;

    // Get question details
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (questionError) throw questionError;

    // Calculate score based on correctness and response time
    const isCorrect = selected_option === question.correct_option;
    const baseScore = isCorrect ? 1000 : 0;

    // Get session start time
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('started_at')
      .eq('id', session_id)
      .single();

    if (sessionError) throw sessionError;

    const startTime = new Date(session.started_at);
    const responseTime = (new Date().getTime() - startTime.getTime()) / 1000;
    const timeBonus = Math.max(0, Math.floor((question.time_limit - responseTime) * 50));
    const totalScore = baseScore + timeBonus;

    // Record answer
    const { data: answer, error: answerError } = await supabase
      .from('player_answers')
      .insert({
        session_id,
        question_id,
        player_id,
        selected_option,
        is_correct: isCorrect,
        response_time: responseTime,
        score: totalScore,
      })
      .select()
      .single();

    if (answerError) throw answerError;

    // Update player's game score
    const { data: existingScore } = await supabase
      .from('game_scores')
      .select('*')
      .eq('session_id', session_id)
      .eq('player_id', player_id)
      .single();

    if (existingScore) {
      // Update existing score
      const { error: updateError } = await supabase
        .from('game_scores')
        .update({
          score: existingScore.score + totalScore,
          correct_answers: existingScore.correct_answers + (isCorrect ? 1 : 0),
          streak: isCorrect ? existingScore.streak + 1 : 0,
        })
        .eq('id', existingScore.id);

      if (updateError) throw updateError;
    } else {
      // Create new score entry
      const { error: insertError } = await supabase
        .from('game_scores')
        .insert({
          session_id,
          player_id,
          score: totalScore,
          correct_answers: isCorrect ? 1 : 0,
          streak: isCorrect ? 1 : 0,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      answer,
      isCorrect,
      score: totalScore,
    });
  } catch (error) {
    console.error('Error processing answer:', error);
    return NextResponse.json(
      { error: 'Failed to process answer' },
      { status: 500 }
    );
  }
} 