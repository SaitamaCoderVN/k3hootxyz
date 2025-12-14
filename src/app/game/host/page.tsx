'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaRocket, FaGamepad } from 'react-icons/fa';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import Header from '@/components/layout/Header';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface QuizSet {
  id: string;
  name: string;
  question_count: number;
}

export default function HostGamePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    loadQuizSets();
  }, []);

  async function loadQuizSets() {
    try {
      const { data, error } = await supabase
        .from('quiz_sets')
        .select('id, name, question_count')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizSets(data || []);
    } catch (error) {
      console.error('Error loading quiz sets:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  }

  async function handleCreateSession() {
    if (!selectedQuizId) {
      alert('Vui lòng chọn quiz set!');
      return;
    }

    if (!connected || !publicKey) {
      alert('Vui lòng kết nối ví để tạo game!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/game/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSetId: selectedQuizId,
          hostWallet: publicKey.toString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');

      const { session } = await response.json();
      router.push(`/game/lobby?sessionId=${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Không thể tạo game session!');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageWrapper minHeight="screen" style={{ backgroundColor: colors.background.primary }}>
      <Header />
      
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <Typography variant="display-lg" gradient="orange-purple" className="mb-4">
              HOST GAME
            </Typography>
            <Typography variant="body-lg" color={`${colors.primary.purple[300]}b3`}>
              Chọn quiz và tạo phòng để mời người chơi tham gia
            </Typography>
          </div>

          <GlassCard variant="purple" size="lg">
            {!connected ? (
              <div className="text-center py-12">
                <Typography variant="h4" className="mb-4">
                  Kết Nối Ví
                </Typography>
                <Typography variant="body" color={`${colors.primary.purple[300]}99`} className="mb-8">
                  Bạn cần kết nối ví để host game
                </Typography>
              </div>
            ) : loadingQuizzes ? (
              <div className="text-center py-12">
                <Typography variant="h4">Đang tải quiz sets...</Typography>
              </div>
            ) : quizSets.length === 0 ? (
              <div className="text-center py-12">
                <Typography variant="h4" className="mb-4">
                  Chưa có quiz nào
                </Typography>
                <Typography variant="body" color={`${colors.primary.purple[300]}99`} className="mb-8">
                  Tạo quiz đầu tiên để có thể host game
                </Typography>
                <NeonButton
                  neonColor="orange"
                  onClick={() => router.push('/create')}
                  leftIcon={<FaRocket />}
                >
                  Tạo Quiz
                </NeonButton>
              </div>
            ) : (
              <>
                <Typography variant="h5" className="mb-6">
                  Chọn Quiz Set
                </Typography>
                
                <div className="space-y-4 mb-8">
                  {quizSets.map((quiz) => (
                    <motion.div
                      key={quiz.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedQuizId(quiz.id)}
                      className="cursor-pointer"
                    >
                      <div
                        className="p-6 rounded-xl border-2 transition-all"
                        style={{
                          backgroundColor: selectedQuizId === quiz.id ? `${colors.primary.orange[500]}20` : `${colors.background.secondary}80`,
                          borderColor: selectedQuizId === quiz.id ? colors.primary.orange[500] : colors.semantic.border,
                        }}
                      >
                        <Typography variant="h6" className="mb-2">
                          {quiz.name}
                        </Typography>
                        <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
                          {quiz.question_count} câu hỏi
                        </Typography>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <NeonButton
                  size="xl"
                  neonColor="orange"
                  fullWidth
                  disabled={!selectedQuizId || isLoading}
                  onClick={handleCreateSession}
                  leftIcon={<FaGamepad />}
                >
                  {isLoading ? 'Đang tạo...' : 'Tạo Game Session'}
                </NeonButton>
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
