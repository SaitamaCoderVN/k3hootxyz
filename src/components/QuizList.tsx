'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

interface Quiz {
  id: string;
  title: string;
  description: string;
  reward: number;
  creator: string;
  participants: number;
}

export default function QuizList() {
  const { connected } = useWallet();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch quizzes from smart contract
    const fetchQuizzes = async () => {
      try {
        // Temporary mock data
        const mockQuizzes: Quiz[] = [
          {
            id: '1',
            title: 'Solana Basics',
            description: 'Test your knowledge about Solana blockchain',
            reward: 0.1,
            creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            participants: 5
          },
          {
            id: '2',
            title: 'Web3 Fundamentals',
            description: 'Learn about Web3 and decentralization',
            reward: 0.2,
            creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            participants: 3
          }
        ];
        setQuizzes(mockQuizzes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-lg mb-4 text-purple-300">Please connect your wallet to view and join quizzes.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="border border-purple-500/20 rounded-lg p-4 sm:p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 bg-purple-900/10 backdrop-blur-sm"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-white">{quiz.title}</h2>
              <p className="text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">{quiz.description}</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Creator: {quiz.creator.slice(0, 4)}...{quiz.creator.slice(-4)}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Participants: {quiz.participants}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-purple-400">{quiz.reward} SOL</p>
                <p className="text-xs text-purple-300">Reward</p>
              </div>
              <Link
                href={`/quiz/${quiz.id}`}
                className="inline-block w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-center font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
              >
                Join Quiz
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 