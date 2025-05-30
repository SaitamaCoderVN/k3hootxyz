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
    return <div>Loading quizzes...</div>;
  }

  if (!connected) {
    return (
      <div className="text-center">
        <p className="text-lg mb-4">Please connect your wallet to view and join quizzes.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{quiz.title}</h2>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              <div className="text-sm text-gray-500">
                <p>Creator: {quiz.creator.slice(0, 4)}...{quiz.creator.slice(-4)}</p>
                <p>Participants: {quiz.participants}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-purple-600">{quiz.reward} SOL</p>
              <Link
                href={`/quiz/${quiz.id}`}
                className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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