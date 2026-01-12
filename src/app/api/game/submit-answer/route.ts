import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';
import { arciumService } from '@/lib/encryption/arcium-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Scoring constants
const POINTS_PER_CORRECT = 1000;
const TIME_BONUS_MAX = 500;
const QUESTION_TIME_LIMIT = 20; // seconds

interface SubmitAnswerRequest {
  session_id: string;
  participant_id: string;
  question_index: number;
  selected_answer: number; // 0-3
  time_taken_ms: number;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const body: SubmitAnswerRequest = await req.json();
    const {
      session_id,
      participant_id,
      question_index,
      selected_answer,
      time_taken_ms
    } = body;

    // Validation
    if (!session_id || !participant_id || question_index === undefined || selected_answer === undefined || !time_taken_ms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (selected_answer < 0 || selected_answer > 3) {
      return NextResponse.json(
        { error: 'Invalid answer index. Must be 0-3' },
        { status: 400 }
      );
    }

    console.log(`[Answer Submission] Session: ${session_id}, Participant: ${participant_id}, Q${question_index}, Answer: ${selected_answer}`);

    // 1. Get session data
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('quiz_set_id, current_question_index, status')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'playing') {
      return NextResponse.json(
        { error: 'Game is not in playing state' },
        { status: 400 }
      );
    }

    // Verify question_index matches current question
    if (question_index !== session.current_question_index) {
      return NextResponse.json(
        { error: 'Question index mismatch. Possible race condition.' },
        { status: 400 }
      );
    }

    // 2. Get question data (including encrypted answer)
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_set_id', session.quiz_set_id)
      .eq('question_index', question_index)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // 3. Get participant data
    const { data: participant, error: participantError } = await supabase
      .from('game_participants')
      .select('wallet_address, score')
      .eq('id', participant_id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // 4. Validate answer
    let isCorrect = false;
    let onchainVerified = false;
    let blockchainTx: string | null = null;

    // TODO: Implement on-chain validation via Arcium MPC
    // For now, use server-side validation as fallback
    // If participant has wallet, we can validate on-chain
    if (participant.wallet_address && question.encrypted_answer) {
      try {
        console.log(`[Answer Submission] Attempting on-chain validation for participant with wallet`);

        // Encrypt user's answer using same MXE public key scheme (FIXED)
        const userEncrypted = arciumService.encryptUserAnswer(selected_answer);

        console.log(`[Answer Submission] User answer encrypted:`, {
          answer: selected_answer,
          encrypted_length: userEncrypted.encrypted.length,
          pubkey_length: userEncrypted.pubkey.length,
          nonce: userEncrypted.nonce.toString()
        });

        // TODO: Call Solana program to validate answer via Arcium MPC
        // const tx = await solanaClient.validateAnswerOnchain({
        //   playerWallet: participant.wallet_address,
        //   quizSetId: session.blockchain_quiz_set_id,
        //   questionIndex: question_index,
        //   encryptedUserAnswer: userEncrypted.encrypted,
        //   userPubkey: userEncrypted.pubkey,
        //   userNonce: userEncrypted.nonce,
        //   encryptedCorrectAnswer: question.encrypted_answer,
        //   questionPubkey: question.arcium_pubkey,
        //   questionNonce: BigInt(question.arcium_nonce)
        // });

        // blockchainTx = tx.signature;

        // TODO: Wait for Arcium MPC result
        // isCorrect = await arciumClient.waitForResult(tx.signature);
        // onchainVerified = true;

        console.log(`[Answer Submission] ⚠️ On-chain validation not yet fully implemented. Falling back to server validation.`);

        // Fallback to server validation for now
        isCorrect = selected_answer === question.correct_answer;

      } catch (error) {
        console.error('[Answer Submission] On-chain validation failed:', error);
        // Fallback to server validation
        isCorrect = selected_answer === question.correct_answer;
      }
    } else {
      // No wallet or no encryption data - use server-side validation
      console.log(`[Answer Submission] Using server-side validation (no wallet or no encryption)`);
      isCorrect = selected_answer === question.correct_answer;
    }

    // 5. Calculate score
    const timeElapsedSeconds = time_taken_ms / 1000;
    let pointsEarned = 0;

    if (isCorrect) {
      // Base points + time bonus
      const timeFactor = Math.max(0, 1 - timeElapsedSeconds / QUESTION_TIME_LIMIT);
      const timeBonus = Math.floor(TIME_BONUS_MAX * timeFactor);
      pointsEarned = POINTS_PER_CORRECT + timeBonus;

      console.log(`[Answer Submission] ✅ Correct answer! Points: ${pointsEarned} (base: ${POINTS_PER_CORRECT}, time bonus: ${timeBonus})`);
    } else {
      console.log(`[Answer Submission] ❌ Wrong answer. No points earned.`);
    }

    // 6. Save answer to game_answers table
    const { error: answerInsertError } = await supabase
      .from('game_answers')
      .insert({
        session_id,
        participant_id,
        question_index,
        selected_answer,
        is_correct: isCorrect,
        time_taken_ms,
        points_earned: pointsEarned,
        blockchain_validation_tx: blockchainTx,
        onchain_verified: onchainVerified
      });

    if (answerInsertError) {
      console.error('[Answer Submission] Error saving answer:', answerInsertError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    // 7. Update participant score atomically (prevents race conditions)
    if (isCorrect) {
      const { data: scoreData, error: updateError } = await supabase
        .rpc('atomic_update_score', {
          p_participant_id: participant_id,
          p_points_to_add: pointsEarned,
          p_increment_correct: true
        })
        .single();

      if (updateError) {
        console.error('[Answer Submission] Error updating participant score:', updateError);
        return NextResponse.json(
          { error: 'Failed to update score' },
          { status: 500 }
        );
      }

      console.log(`[Answer Submission] Score updated atomically:`, {
        new_score: (scoreData as any)?.new_score,
        new_correct_answers: (scoreData as any)?.new_correct_answers
      });

      // Update last_answer_at separately (doesn't need atomicity)
      await supabase
        .from('game_participants')
        .update({ last_answer_at: new Date().toISOString() })
        .eq('id', participant_id);
    }

    // 8. Increment answers_submitted counter for real-time tracking
    const { error: rpcError } = await supabase.rpc('increment_answers_submitted', {
      p_session_id: session_id
    });

    if (rpcError) {
      console.error('[Answer Submission] Error incrementing counter:', rpcError);
      // Non-critical error, continue
    }

    console.log(`[Answer Submission] ✅ Answer submitted successfully. Correct: ${isCorrect}, Points: ${pointsEarned}, On-chain: ${onchainVerified}`);

    // 9. Return result
    return NextResponse.json({
      success: true,
      is_correct: isCorrect,
      correct_answer: question.correct_answer, // Return correct answer for client display
      points_earned: pointsEarned,
      blockchain_tx: blockchainTx,
      onchain_verified: onchainVerified,
      time_taken_seconds: Math.round(timeElapsedSeconds * 10) / 10
    });

  } catch (error) {
    console.error('[Answer Submission] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
