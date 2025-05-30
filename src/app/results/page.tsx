'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

interface QuizResult {
  quizId: string;
  title: string;
  score: number;
  totalQuestions: number;
  reward: number;
  timestamp: number;
}

export default function Results() {
  const { connected } = useWallet();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch results from smart contract
    const fetchResults = async () => {
      try {
        // Temporary mock data
        const mockResults: QuizResult[] = [
          {
            quizId: '1',
            title: 'Solana Basics',
            score: 8,
            totalQuestions: 10,
            reward: 0.1,
            timestamp: Date.now()
          }
        ];
        setResults(mockResults);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setLoading(false);
      }
    };

    if (connected) {
      fetchResults();
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Please connect your wallet to view your results.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading results...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Your Quiz Results</h1>

      <div className="w-full max-w-4xl space-y-6">
        {results.map((result) => (
          <div
            key={result.quizId}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{result.title}</h2>
                <p className="text-gray-600">
                  Completed on: {new Date(result.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-purple-600">
                  {result.reward} SOL
                </p>
                <p className="text-sm text-gray-500">
                  Score: {result.score}/{result.totalQuestions}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{
                  width: `${(result.score / result.totalQuestions) * 100}%`
                }}
              ></div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-gray-600">
                {Math.round((result.score / result.totalQuestions) * 100)}%
                Correct
              </p>
              <Link
                href={`/quiz/${result.quizId}`}
                className="text-purple-600 hover:text-purple-700"
              >
                Take Quiz Again
              </Link>
            </div>
          </div>
        ))}

        <div className="text-center mt-8">
          <Link
            href="/join"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Find More Quizzes
          </Link>
        </div>
      </div>
    </main>
  );
} 