'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { ScrollReveal } from '@/components/animations';
import { FaRocket, FaGamepad, FaPlus, FaUsers } from 'react-icons/fa';
import { Typography, colors } from '@/design-system';
import { supabase } from '@/lib/supabase-client';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  {
    ssr: false,
    loading: () => null,
  }
);

interface QuizSet {
  id: string;
  owner_wallet: string;
  title: string;
  description: string | null;
  reward_amount: number;
  total_questions: number;
  created_at: string;
}

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [myQuizSets, setMyQuizSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      fetchQuizSets();
    }
  }, [connected, publicKey]);

  const fetchQuizSets = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all active quiz sets
      const { data: allQuizSets, error: allError } = await supabase
        .from('quiz_sets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Supabase allError:', allError);
        throw allError;
      }

      // Fetch user's quiz sets
      const { data: userQuizSets, error: userError } = await supabase
        .from('quiz_sets')
        .select('*')
        .eq('owner_wallet', publicKey.toString())
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (userError) {
        console.error('Supabase userError:', userError);
        throw userError;
      }

      setQuizSets(allQuizSets || []);
      setMyQuizSets(userQuizSets || []);
    } catch (err: any) {
      console.error('Error fetching quiz sets:', err);
      setError(err?.message || 'Failed to load quiz sets. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleHostQuiz = (quizSetId: string) => {
    router.push(`/multiplayer/host?quizId=${quizSetId}`);
  };

  const displayedQuizSets = activeTab === 'all' ? quizSets : myQuizSets;
  const isOwner = (quizSet: QuizSet) => quizSet.owner_wallet === publicKey?.toString();

  if (!mounted) return null;

  return (
    <PageTemplate
      title="Protocol Hub"
      subtitle="Executive Quiz Management & Participation"
      containerClassName="pb-24"
    >
      <div className="pt-12 max-w-7xl mx-auto px-4">
        {!connected && (
          <ScrollReveal type="fadeInUp" delay={0.2} amount={40}>
            <div className="max-w-2xl mx-auto mb-12">
              <div className="border-4 border-black p-12 bg-white text-center">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 border-2 border-black flex items-center justify-center">
                    <FaRocket className="text-4xl" />
                  </div>
                </div>
                <Typography variant="h2" className="font-black uppercase mb-6">
                  Access Denied
                </Typography>
                <Typography variant="body-lg" className="mb-10 font-bold uppercase opacity-60 tracking-widest">
                  Connect Solana Wallet to Authenticate
                </Typography>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {connected && (
          <>
            {/* Quick Action Buttons */}
            <ScrollReveal type="fadeInUp" delay={0.1} amount={50}>
              <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <button
                  onClick={() => router.push('/create-quiz')}
                  className="group relative p-8 border-4 border-black bg-white hover:bg-black transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 border-2 border-black flex items-center justify-center group-hover:border-white group-hover:text-white">
                      <FaPlus className="text-2xl" />
                    </div>
                    <div className="text-left">
                      <Typography variant="h4" className="font-black uppercase group-hover:text-white">
                        Deploy Quiz
                      </Typography>
                      <Typography variant="body-xs" className="font-bold uppercase opacity-50 tracking-widest group-hover:text-white">
                        Create New Protocol
                      </Typography>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/multiplayer/join')}
                  className="group relative p-8 border-4 border-black bg-transparent hover:bg-black transition-all duration-300"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 border-2 border-black flex items-center justify-center group-hover:border-white group-hover:text-white">
                      <FaUsers className="text-2xl" />
                    </div>
                    <div className="text-left">
                      <Typography variant="h4" className="font-black uppercase group-hover:text-white">
                        Join Arena
                      </Typography>
                      <Typography variant="body-xs" className="font-bold uppercase opacity-50 tracking-widest group-hover:text-white">
                        Engage Multiplayer
                      </Typography>
                    </div>
                  </div>
                </button>
              </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal type="fadeInUp" delay={0.2} amount={50}>
              <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
                <div className="p-8 bg-white">
                  <Typography variant="body-xs" className="font-black uppercase opacity-40 mb-2 tracking-[0.2em]">Live Protocols</Typography>
                  <Typography variant="display-sm" className="font-black leading-none">{quizSets.length}</Typography>
                </div>
                <div className="p-8 bg-white">
                  <Typography variant="body-xs" className="font-black uppercase opacity-40 mb-2 tracking-[0.2em]">Owned Units</Typography>
                  <Typography variant="display-sm" className="font-black leading-none">{myQuizSets.length}</Typography>
                </div>
                <div className="p-8 bg-white">
                  <Typography variant="body-xs" className="font-black uppercase opacity-40 mb-2 tracking-[0.2em]">Total Questions</Typography>
                  <Typography variant="display-sm" className="font-black leading-none">{quizSets.reduce((sum, q) => sum + q.total_questions, 0)}</Typography>
                </div>
              </div>
            </ScrollReveal>

            {/* Tabs */}
            <div className="mb-8 border-b-4 border-black flex gap-0 px-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-8 py-4 font-black uppercase tracking-widest transition-all ${
                  activeTab === 'all' ? 'bg-black text-white' : 'hover:bg-black/5'
                }`}
              >
                Global List [{quizSets.length}]
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                className={`px-8 py-4 font-black uppercase tracking-widest transition-all ${
                  activeTab === 'mine' ? 'bg-black text-white' : 'hover:bg-black/5'
                }`}
              >
                Registered [{myQuizSets.length}]
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-24 border-4 border-black border-dashed">
                <div className="inline-block animate-spin w-12 h-12 border-4 border-black border-t-transparent mb-6" />
                <Typography variant="body" className="font-black uppercase tracking-widest">
                  Initializing Stream...
                </Typography>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-12 border-4 border-black bg-white text-center">
                <Typography variant="h4" className="font-black uppercase text-red-600 mb-4">
                  Critical Error
                </Typography>
                <Typography variant="body" className="font-bold opacity-70 mb-0">
                  {error}
                </Typography>
              </div>
            )}

            {/* Quiz Sets Grid */}
            {!loading && !error && (
              <ScrollReveal type="fadeInUp" delay={0.3} amount={50}>
                {displayedQuizSets.length === 0 ? (
                  <div className="text-center py-24 border-4 border-black bg-white">
                    <div className="w-20 h-20 border-2 border-black flex items-center justify-center mx-auto mb-8">
                      <FaGamepad className="text-3xl" />
                    </div>
                    <Typography variant="h3" className="font-black uppercase mb-4">
                      Protocol Empty
                    </Typography>
                    <Typography variant="body-lg" className="font-bold uppercase opacity-40 mb-10 tracking-[0.2em]">
                      {activeTab === 'mine' ? 'No user deployments found' : 'No available nodes'}
                    </Typography>
                    {activeTab === 'mine' && (
                      <button
                        onClick={() => router.push('/create-quiz')}
                        className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Deploy First System
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedQuizSets.map((quizSet, index) => (
                      <ScrollReveal key={quizSet.id} type="scaleIn" delay={index * 0.05}>
                        <div className="group border-4 border-black bg-white p-8 hover:translate-y-[-8px] transition-all duration-300">
                          <div className="mb-8 h-12 border-b-2 border-black flex justify-between items-start">
                            <Typography variant="body-xs" className="font-black uppercase opacity-30 tracking-[0.2em]">
                              {index < 9 ? `0${index + 1}` : index + 1} // Protocol Node
                            </Typography>
                            <div className={`w-3 h-3 ${isOwner(quizSet) ? 'bg-black' : 'bg-transparent border-2 border-black'}`} />
                          </div>
                          
                          <div className="mb-8">
                            <Typography variant="h4" className="font-black uppercase leading-tight mb-2">
                              {quizSet.title}
                            </Typography>
                            {quizSet.description && (
                              <Typography variant="body-sm" className="font-bold opacity-60 line-clamp-2">
                                {quizSet.description}
                              </Typography>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t-2 border-black/5">
                            <div>
                              <Typography variant="body-xs" className="font-black uppercase opacity-40 tracking-widest mb-1">Items</Typography>
                              <Typography variant="h5" className="font-black">{quizSet.total_questions}</Typography>
                            </div>
                            <div className="text-right">
                              <Typography variant="body-xs" className="font-black uppercase opacity-40 tracking-widest mb-1">Reward</Typography>
                              <Typography variant="h5" className="font-black">{quizSet.reward_amount.toFixed(2)} SOL</Typography>
                            </div>
                          </div>

                          {isOwner(quizSet) ? (
                            <button
                              onClick={() => handleHostQuiz(quizSet.id)}
                              className="w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-[-1px] transition-all duration-300 shadow-[4px_4px_0px_#00000020]"
                            >
                              Host Protocol
                            </button>
                          ) : (
                            <div className="pt-4 border-t-2 border-black/5 text-center">
                              <Typography variant="body-xs" className="font-black uppercase opacity-30 tracking-widest">
                                BY {quizSet.owner_wallet.slice(0, 4)}...{quizSet.owner_wallet.slice(-4)}
                              </Typography>
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                )}
              </ScrollReveal>
            )}
          </>
        )}
      </div>
    </PageTemplate>
  );
}