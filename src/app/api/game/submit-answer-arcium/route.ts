import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';
import { Connection, Keypair } from '@solana/web3.js';
import { ArciumK3HootClient, letterToAnswerIndex } from '@/lib/arcium-client';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export const dynamic = 'force-dynamic';

// Helper to create wallet from private key (server-side only)
function createWalletFromPrivateKey(privateKey: string): anchor.Wallet {
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(privateKey))
  );

  return {
    publicKey: keypair.publicKey,
    payer: keypair, // Required by NodeWallet type
    signTransaction: async (tx: any) => {
      tx.sign(keypair);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      txs.forEach(tx => tx.sign(keypair));
      return txs;
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const {
      participantId,
      sessionId,
      questionIndex,
      answer, // "A", "B", "C", or "D"
      walletPrivateKey, // Base64 encoded private key (temporary, should use session-based auth)
    } = await req.json();

    if (!participantId || !sessionId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get session and participant info
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*, quiz_sets!inner(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const { data: participant, error: participantError } = await supabase
      .from('game_participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if already answered this question
    const { data: existingAnswer } = await supabase
      .from('game_answers')
      .select('*')
      .eq('participant_id', participantId)
      .eq('question_index', questionIndex)
      .single();

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'Already answered this question' },
        { status: 400 }
      );
    }

    // Get question to check correct answer
    const { data: question } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_set_id', session.quiz_set_id)
      .eq('question_index', questionIndex)
      .single();

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const isCorrect = answer === question.correct_answer;

    // Store answer in database first (optimistic update)
    const { data: answerRecord, error: answerError } = await supabase
      .from('game_answers')
      .insert({
        session_id: sessionId,
        participant_id: participantId,
        question_index: questionIndex,
        selected_answer: answer,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (answerError) {
      console.error('Error storing answer:', answerError);
      return NextResponse.json(
        { error: 'Failed to store answer' },
        { status: 500 }
      );
    }

    // Update participant score
    const newScore = isCorrect ? (participant.score || 0) + 100 : (participant.score || 0);
    const newCorrectCount = isCorrect 
      ? (participant.correct_answers || 0) + 1 
      : (participant.correct_answers || 0);

    await supabase
      .from('game_participants')
      .update({
        score: newScore,
        correct_answers: newCorrectCount,
        last_answer_at: new Date().toISOString(),
      })
      .eq('id', participantId);

    // If wallet is provided, validate with Arcium on-chain
    let arciumValidation = null;
    if (walletPrivateKey && session.blockchain_quiz_set_id) {
      try {
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
          'confirmed'
        );

        const wallet = createWalletFromPrivateKey(walletPrivateKey);
        const programId = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '4cFJG9XUcYGmNG6H3xNASihZ8rR9TSfYZQaxPZUxZGMq');
        
        const arciumClient = new ArciumK3HootClient(wallet, connection, programId);
        
        // Create encryption context
        const encryptionCtx = await arciumClient.createEncryptionContext();
        
        // Encrypt answer
        const answerIndex = letterToAnswerIndex(answer);
        const encryptedAnswer = arciumClient.encryptAnswer(encryptionCtx, answerIndex);
        
        // Get PDAs
        const quizSetPda = new PublicKey(session.blockchain_quiz_set_id);
        const [questionBlockPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('question_block'),
            quizSetPda.toBuffer(),
            Buffer.from([questionIndex]),
          ],
          programId
        );
        
        // Validate on-chain (async, don't wait)
        const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(walletPrivateKey)));
        const validationResult = await arciumClient.validateAnswerOnchain(
          encryptionCtx,
          quizSetPda,
          questionBlockPda,
          questionIndex,
          encryptedAnswer,
          payer
        );

        // Store Arcium validation record
        const { data: validationRecord } = await supabase
          .from('arcium_validations')
          .insert({
            session_id: sessionId,
            participant_id: participantId,
            question_index: questionIndex,
            computation_offset: validationResult.computationOffset.toString(),
            tx_signature: validationResult.txSignature,
            encrypted_user_answer: Buffer.from(encryptedAnswer.ciphertext),
            arcium_pubkey: Buffer.from(encryptedAnswer.publicKey),
            nonce: encryptedAnswer.nonce.toString(), // Use encryptedAnswer.nonce
            is_correct: null, // Will be updated by callback handler
            callback_tx_signature: validationResult.callbackTxSignature,
          })
          .select()
          .single();

        arciumValidation = validationRecord;
      } catch (error) {
        console.error('Arcium validation error:', error);
        // Continue even if Arcium validation fails (offline mode)
      }
    }

    return NextResponse.json({
      success: true,
      answer: answerRecord,
      isCorrect,
      newScore,
      arciumValidation,
    });
  } catch (error: any) {
    console.error('Error in submit-answer-arcium:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

