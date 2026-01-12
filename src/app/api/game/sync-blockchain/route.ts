import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import IDL from '../../../idl/k_3_hoot_program_arcium.json';
import { K3HootProgramArcium } from '../../../types/k_3_hoot_program_arcium';

export const dynamic = 'force-dynamic';

/**
 * Sync blockchain state with database
 * Called periodically to update player scores and determine winner
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // Get session
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

    if (!session.blockchain_quiz_set_id) {
      return NextResponse.json({
        success: true,
        message: 'Session not linked to blockchain',
      });
    }

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com',
      'confirmed'
    );

    const programId = new PublicKey(
      process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '4cFJG9XUcYGmNG6H3xNASihZ8rR9TSfYZQaxPZUxZGMq'
    );

    // Create dummy provider (read-only)
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
    };

    const provider = new anchor.AnchorProvider(connection, dummyWallet as any, {
      commitment: 'confirmed',
    });

    const program = new Program(IDL as any, provider) as Program<K3HootProgramArcium>;

    // Fetch QuizSet from blockchain
    const quizSetPda = new PublicKey(session.blockchain_quiz_set_id);
    const quizSetAccount = await program.account.quizSet.fetch(quizSetPda);

    // Get all participants
    const { data: participants } = await supabase
      .from('game_participants')
      .select('*')
      .eq('session_id', sessionId);

    if (!participants) {
      return NextResponse.json({
        success: true,
        message: 'No participants found',
      });
    }

    // Sync each participant's on-chain score
    const updates = [];
    for (const participant of participants) {
      if (!participant.wallet_address) continue;

      try {
        const playerPubkey = new PublicKey(participant.wallet_address);
        const [playerAnswerPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('player_answer'),
            quizSetPda.toBuffer(),
            playerPubkey.toBuffer(),
          ],
          programId
        );

        const playerAnswerAccount = await program.account.playerAnswer.fetch(playerAnswerPda);

        // Update database with on-chain score
        const { error: updateError } = await supabase
          .from('game_participants')
          .update({
            total_correct_onchain: playerAnswerAccount.correctCount,
            can_claim_reward: playerAnswerAccount.correctCount >= quizSetAccount.questionCount,
          })
          .eq('id', participant.id);

        if (!updateError) {
          updates.push({
            participantId: participant.id,
            onChainScore: playerAnswerAccount.totalScore.toNumber(),
            onChainCorrect: playerAnswerAccount.correctCount,
          });
        }
      } catch (error) {
        console.error(`Error syncing participant ${participant.id}:`, error);
      }
    }

    // Determine winner (highest score)
    const { data: leaderboard } = await supabase
      .from('game_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('total_correct_onchain', { ascending: false })
      .order('last_answer_at', { ascending: true })
      .limit(1);

    if (leaderboard && leaderboard.length > 0 && session.status === 'finished') {
      const winner = leaderboard[0];
      
      // Update session with winner
      await supabase
        .from('game_sessions')
        .update({
          winner_wallet: winner.wallet_address,
        })
        .eq('id', sessionId);
    }

    return NextResponse.json({
      success: true,
      updates,
      quizSet: {
        winner: quizSetAccount.winner,
        rewardClaimed: quizSetAccount.isRewardClaimed,
        correctAnswersCount: quizSetAccount.correctAnswersCount,
      },
    });
  } catch (error: any) {
    console.error('Error syncing blockchain:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

