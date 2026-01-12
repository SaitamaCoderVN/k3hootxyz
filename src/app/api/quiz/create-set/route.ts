import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';
import { v4 as uuidv4 } from 'uuid';
import { arciumService, ArciumEncryptionService } from '@/lib/encryption/arcium-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface QuestionInput {
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

interface CreateQuizSetRequest {
  ownerWallet: string;
  title: string;
  description?: string;
  rewardAmount: number;
  questions: QuestionInput[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const body: CreateQuizSetRequest = await req.json();
    const { ownerWallet, title, description, rewardAmount, questions } = body;

    // Validation
    if (!ownerWallet || !title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (questions.length < 3) {
      return NextResponse.json(
        { error: 'Quiz must have at least 3 questions' },
        { status: 400 }
      );
    }

    if (questions.length > 20) {
      return NextResponse.json(
        { error: 'Quiz cannot have more than 20 questions' },
        { status: 400 }
      );
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim()) {
        return NextResponse.json(
          { error: `Question ${i + 1} text is required` },
          { status: 400 }
        );
      }
      if (!q.options || q.options.length < 2) {
        return NextResponse.json(
          { error: `Question ${i + 1} must have at least 2 options` },
          { status: 400 }
        );
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return NextResponse.json(
          { error: `Question ${i + 1} has invalid correct answer index` },
          { status: 400 }
        );
      }
    }

    // Generate quiz set ID (TEXT format for Solana PDA compatibility)
    const quizSetId = `quiz_${uuidv4().replace(/-/g, '')}`;

    // Create quiz set
    const { data: quizSet, error: quizSetError } = await supabase
      .from('quiz_sets')
      .insert({
        id: quizSetId,
        owner_wallet: ownerWallet,
        title,
        description: description || null,
        reward_amount: rewardAmount,
        total_questions: questions.length,
        is_active: true,
      })
      .select()
      .single();

    if (quizSetError) {
      console.error('Error creating quiz set:', quizSetError);
      return NextResponse.json(
        { error: `Failed to create quiz set: ${quizSetError.message || JSON.stringify(quizSetError)}` },
        { status: 500 }
      );
    }

    // Encrypt all questions using Arcium MPC
    console.log(`[Quiz Creation] Encrypting ${questions.length} questions with Arcium...`);

    const questionsData = questions.map((q, index) => {
      // Encrypt the correct answer
      const encrypted = arciumService.encryptAnswer(q.correctAnswer);
      const storageFormat = ArciumEncryptionService.toStorageFormat(encrypted);

      return {
        quiz_set_id: quizSetId,
        question_text: q.question,
        options: q.options,
        correct_answer: q.correctAnswer, // Still save plaintext for server-side fallback validation
        reward_amount: rewardAmount / questions.length, // Split reward evenly
        time_limit: q.timeLimit,
        question_index: index,

        // Arcium encrypted data for on-chain validation
        encrypted_answer: storageFormat.encrypted_answer,
        arcium_pubkey: storageFormat.arcium_pubkey,
        arcium_nonce: storageFormat.arcium_nonce,
      };
    });

    console.log(`[Quiz Creation] ✅ All questions encrypted successfully`);

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsData);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      // Rollback: delete quiz set
      await supabase.from('quiz_sets').delete().eq('id', quizSetId);
      return NextResponse.json(
        { error: `Failed to create questions: ${questionsError.message || JSON.stringify(questionsError)}` },
        { status: 500 }
      );
    }

    console.log(`[Quiz Creation] ✅ Quiz set ${quizSetId} created with ${questions.length} encrypted questions`);

    return NextResponse.json({
      success: true,
      quizSetId: quizSetId,
      totalQuestions: questions.length,
      message: 'Quiz set created successfully with Arcium encryption',
      encryptionEnabled: true,
    });

  } catch (error) {
    console.error('Error in create-set:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
