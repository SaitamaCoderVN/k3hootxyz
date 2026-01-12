import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';
import { getServerSolanaClient } from '@/lib/solana/server-solana-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ClaimRewardRequest {
  session_id: string;
  wallet_address: string;
  tx_signature?: string; // If already claimed on-chain, provide signature
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const body: ClaimRewardRequest = await req.json();
    const { session_id, wallet_address, tx_signature } = body;

    console.log('[Claim Reward] Request:', { session_id, wallet_address, tx_signature });

    // Validation
    if (!session_id || !wallet_address) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id and wallet_address' },
        { status: 400 }
      );
    }

    // 1. Get game session data
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    // 2. Verify game is finished
    if (session.status !== 'finished') {
      return NextResponse.json(
        { error: 'Game is not finished yet' },
        { status: 400 }
      );
    }

    // 3. Verify caller is the winner
    if (session.winner_wallet !== wallet_address) {
      return NextResponse.json(
        { error: 'You are not the winner of this game' },
        { status: 403 }
      );
    }

    // 4. Check if already claimed
    if (session.reward_claimed) {
      return NextResponse.json(
        {
          error: 'Reward has already been claimed',
          tx_signature: session.claim_tx_signature
        },
        { status: 400 }
      );
    }

    // 5. Verify winner participant exists
    const { data: participant, error: participantError } = await supabase
      .from('game_participants')
      .select('*')
      .eq('id', session.winner_participant_id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Winner participant not found' },
        { status: 404 }
      );
    }

    console.log('[Claim Reward] Winner verified:', {
      participant_name: participant.player_name,
      score: participant.score,
      correct_answers: participant.correct_answers
    });

    // 6. Handle blockchain claim
    let finalTxSignature = tx_signature;
    let onchainClaim = false;

    if (session.blockchain_quiz_set_id && !tx_signature) {
      // If quiz is on blockchain, need to claim from vault
      console.log('[Claim Reward] On-chain quiz detected. Preparing claim transaction...');

      try {
        const solanaClient = getServerSolanaClient('devnet');

        // Check vault balance
        const vaultBalance = await solanaClient.getVaultBalance(session.blockchain_quiz_set_id);
        console.log('[Claim Reward] Vault balance:', vaultBalance, 'SOL');

        if (vaultBalance < session.reward_amount) {
          return NextResponse.json(
            {
              error: 'Insufficient vault balance',
              vault_balance: vaultBalance,
              reward_amount: session.reward_amount
            },
            { status: 500 }
          );
        }

        // TODO: Build claim transaction for client to sign
        // For now, return instructions to use frontend SimpleK3HootClient
        console.log('[Claim Reward] ⚠️ On-chain claim must be done via client-side SimpleK3HootClient.claimReward()');

        return NextResponse.json({
          success: false,
          message: 'On-chain claim requires wallet signature',
          instruction: 'Please use your wallet to claim the reward on-chain',
          requires_onchain_tx: true,
          quiz_set_id: session.blockchain_quiz_set_id,
          reward_amount: session.reward_amount,
          vault_balance: vaultBalance
        });

      } catch (blockchainError: any) {
        console.error('[Claim Reward] Blockchain error:', blockchainError);
        // Continue with database claim (fallback)
      }
    }

    // 7. If no blockchain or fallback, mark as claimed in database
    if (!finalTxSignature) {
      // Generate a reference ID for non-blockchain claims
      finalTxSignature = `db_claim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('[Claim Reward] Database-only claim (no blockchain)');
    }

    // 8. Mark reward as claimed
    console.log('[Claim Reward] Marking reward as claimed...');
    const { error: updateError } = await supabase.rpc('mark_reward_claimed', {
      p_session_id: session_id,
      p_tx_signature: finalTxSignature
    });

    if (updateError) {
      console.error('[Claim Reward] Database update failed:', updateError);
      return NextResponse.json(
        { error: 'Failed to update claim status: ' + updateError.message },
        { status: 500 }
      );
    }

    console.log('[Claim Reward] ✅ Reward claimed successfully!');
    console.log('[Claim Reward] Transaction:', finalTxSignature);

    return NextResponse.json({
      success: true,
      tx_signature: finalTxSignature,
      amount_claimed: session.reward_amount,
      onchain_claim: onchainClaim,
      message: onchainClaim
        ? 'Reward claimed from blockchain vault'
        : 'Reward claim recorded in database'
    });

  } catch (error: any) {
    console.error('[Claim Reward] Internal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check claim status
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');
    const wallet_address = searchParams.get('wallet_address');

    if (!session_id || !wallet_address) {
      return NextResponse.json(
        { error: 'Missing session_id or wallet_address' },
        { status: 400 }
      );
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Game session not found' },
        { status: 404 }
      );
    }

    // Check if caller is winner
    const is_winner = session.winner_wallet === wallet_address;
    const can_claim = is_winner && !session.reward_claimed && session.status === 'finished';

    return NextResponse.json({
      is_winner,
      can_claim,
      reward_claimed: session.reward_claimed,
      reward_amount: session.reward_amount,
      claim_tx_signature: session.claim_tx_signature,
      winner_wallet: session.winner_wallet
    });

  } catch (error: any) {
    console.error('[Claim Reward] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
