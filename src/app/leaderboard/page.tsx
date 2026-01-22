'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { GlassCard, Typography, colors, spacing } from '@/design-system';
import { useWallet } from '@solana/wallet-adapter-react';
import { SimpleK3HootClient } from '@/lib/simple-solana-client';
import { LeaderboardEntry } from '@/types/quiz';
import { PageTemplate } from '@/components/layout/PageTemplate';

const getRankIcon = (rank: number) => {
  return (
    <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xs">
      {rank < 10 ? `0${rank}` : rank}
    </div>
  );
};

export default function LeaderboardPage() {
  const wallet = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!wallet.publicKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const client = new SimpleK3HootClient(
          wallet as any,
          'devnet'
        );

        const data = await client.getLeaderboard();

        // Sort by reward amount (highest first)
        const sorted = data.sort((a, b) => b.rewardAmount - a.rewardAmount);

        setLeaderboard(sorted);
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [wallet.publicKey]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset to page 1 when data changes (optional, but good UX if filters added later)
  useEffect(() => {
    setCurrentPage(1);
  }, [leaderboard.length]);

  const totalPages = Math.ceil(leaderboard.length / ITEMS_PER_PAGE);
  const paginatedData = leaderboard.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageTemplate
      title="Global Rankings"
      subtitle="The High-Stakes Performance Ledger"
    >
      <div className="pt-12 pb-32 max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 border-b-4 border-black pb-8 flex justify-between items-end"
        >
          <div>
            <Typography variant="display-sm" className="font-black uppercase leading-none">
              Top Operators
            </Typography>
            <Typography variant="body-xs" className="font-black uppercase tracking-[0.3em] opacity-40 mt-2">
              Blockchain Verified Standings
            </Typography>
          </div>
          <Typography variant="display-xs" className="font-black opacity-10">02</Typography>
        </motion.div>

        {!wallet.connected && (
          <div className="max-w-2xl mx-auto border-4 border-black p-12 bg-white text-center">
            <Typography variant="h3" className="font-black uppercase mb-6">
              Authentication Required
            </Typography>
            <Typography variant="body-lg" className="mb-10 font-bold uppercase opacity-50 tracking-widest">
              Please connect wallet to view protocol rankings
            </Typography>
          </div>
        )}

        {wallet.connected && loading && (
          <div className="text-center py-24 border-4 border-black border-dashed">
            <div className="inline-block animate-spin w-12 h-12 border-4 border-black border-t-transparent mb-6" />
            <Typography variant="body" className="font-black uppercase tracking-widest">
              Syncing Ledger...
            </Typography>
          </div>
        )}

        {wallet.connected && error && !loading && (
          <div className="p-12 border-4 border-black bg-white text-center">
            <Typography variant="h4" className="font-black uppercase text-red-600 mb-4">
              Protocol Error
            </Typography>
            <Typography variant="body" className="font-bold opacity-70 mb-0">
              {error}
            </Typography>
          </div>
        )}

        {wallet.connected && !loading && !error && (
          <div className="space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-24 border-4 border-black bg-white">
                <Typography variant="h3" className="font-black uppercase mb-4">
                  No Logs Found
                </Typography>
                <Typography variant="body" className="font-bold uppercase opacity-40 tracking-widest">
                  Be the first to secure a node
                </Typography>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {paginatedData.map((entry, index) => {
                    const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    const isCurrentUser = entry.winner === wallet.publicKey?.toString();

                    return (
                      <motion.div
                        key={`${entry.quizSetId}-${entry.questionIndex}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`
                          flex items-center gap-4 sm:gap-8 p-4 sm:p-6 border-4 transition-all duration-300
                          ${isCurrentUser ? 'border-black bg-white' : 'border-black/5 bg-transparent'}
                          hover:border-black hover:bg-white overflow-hidden
                        `}
                      >
                        {/* Rank */}
                        <div className="w-12 flex justify-center flex-shrink-0">
                          {getRankIcon(rank)}
                        </div>

                        {/* Winner Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-1">
                            <Typography
                              variant="h5"
                              className="font-black uppercase tracking-tighter truncate"
                            >
                              {entry.winnerDisplay}
                            </Typography>
                            {isCurrentUser && (
                              <span className="text-[10px] px-2 py-0.5 border border-black font-black uppercase tracking-widest">
                                You
                              </span>
                            )}
                          </div>
                          <Typography variant="body-xs" className="font-black uppercase opacity-30 tracking-widest truncate">
                            Task ID: {entry.quizSetName || entry.quizSetId.slice(0, 12)}
                          </Typography>
                        </div>

                        {/* Reward */}
                        <div className="text-right flex-shrink-0">
                          <Typography variant="h4" className="font-black leading-none mb-1">
                            {entry.rewardAmount.toFixed(2)}
                          </Typography>
                          <Typography variant="body-xs" className="font-black uppercase opacity-30 tracking-widest">
                            {entry.isClaimed ? 'Secured' : 'Open'}
                          </Typography>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center items-center gap-4 mt-16">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-black font-black uppercase disabled:opacity-20 hover:bg-black hover:text-white transition-colors"
                    >
                      Prev
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`
                            w-10 h-10 border-2 border-black flex items-center justify-center font-black transition-colors
                            ${currentPage === page ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}
                          `}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-black font-black uppercase disabled:opacity-20 hover:bg-black hover:text-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
