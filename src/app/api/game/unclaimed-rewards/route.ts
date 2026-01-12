import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase/server-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServerSupabaseClient();

    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Call the database function to get unclaimed rewards
    const { data, error } = await supabase
      .rpc('get_unclaimed_rewards', { p_wallet: walletAddress });

    if (error) {
      console.error('Error fetching unclaimed rewards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch unclaimed rewards' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rewards: data || [],
      totalRewards: (data || []).reduce((sum: number, r: any) => sum + parseFloat(r.reward_amount || 0), 0),
    });

  } catch (error) {
    console.error('Error in unclaimed-rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
