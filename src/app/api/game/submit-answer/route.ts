import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const POINTS_PER_CORRECT = 1000;
const TIME_BONUS_MAX = 500;
const QUESTION_TIME_LIMIT = 20;

export async function POST(req: NextRequest) {
  try {
    const { participantId, questionIndex, answer, answeredAt, correctAnswer, questionStartTime } = await req.json();

    if (!participantId || questionIndex === undefined || !answer || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const isCorrect = answer === correctAnswer;
    let pointsEarned = 0;

    if (isCorrect) {
      const timeElapsed = (answeredAt - questionStartTime) / 1000;
      const timeBonus = Math.max(0, Math.floor(TIME_BONUS_MAX * (1 - timeElapsed / QUESTION_TIME_LIMIT)));
      pointsEarned = POINTS_PER_CORRECT + timeBonus;
    }

    const { data: participant, error: fetchError } = await supabase
      .from('game_participants')
      .select('answers, score')
      .eq('id', participantId)
      .single();

    if (fetchError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    const updatedAnswers = [
      ...participant.answers,
      {
        questionIndex,
        answer,
        isCorrect,
        answeredAt,
        pointsEarned,
      },
    ];

    const { data: updated, error: updateError } = await supabase
      .from('game_participants')
      .update({
        answers: updatedAnswers,
        score: participant.score + pointsEarned,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating participant:', updateError);
      return NextResponse.json(
        { error: 'Failed to submit answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      participant: updated,
      isCorrect,
      pointsEarned,
    });
  } catch (error) {
    console.error('Error in submit-answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
