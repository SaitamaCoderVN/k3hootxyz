'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  reward: number;
  creator: string;
  questions: Question[];
}

export default function QuizDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { connected } = useWallet();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // TODO: Fetch quiz details from smart contract
    const fetchQuizDetails = async () => {
      try {
        // Temporary mock data
        const mockQuiz: Quiz = {
          id: id as string,
          title: 'Solana Basics',
          description: 'Test your knowledge about Solana blockchain',
          reward: 0.1,
          creator: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
          questions: [
            {
              question: 'What is Solana?',
              options: [
                'A cryptocurrency',
                'A blockchain platform',
                'A smart contract platform',
                'All of the above'
              ]
            },
            {
              question: 'What consensus mechanism does Solana use?',
              options: [
                'Proof of Work',
                'Proof of Stake',
                'Proof of History',
                'Delegated Proof of Stake'
              ]
            }
          ]
        };
        setQuiz(mockQuiz);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz details:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchQuizDetails();
    }
  }, [id]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || selectedAnswers.length !== quiz.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Submit answers to smart contract
      console.log('Submitting answers:', selectedAnswers);
      router.push('/results');
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('Error submitting answers. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="flex min-h-screen items-center justify-center">Quiz not found</div>;
  }

  if (!connected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Please connect your wallet to participate in the quiz.</p>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
          <p className="text-purple-600 font-bold mt-2">Reward: {quiz.reward} SOL</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </h2>
            <span className="text-gray-500">
              {Math.round((currentQuestion + 1) / quiz.questions.length * 100)}% Complete
            </span>
          </div>

          <div className="mb-6">
            <p className="text-lg mb-4">{currentQuestionData.question}</p>
            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedAnswers[currentQuestion] === index
                      ? 'bg-purple-100 border-purple-500'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedAnswers.length !== quiz.questions.length}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === undefined}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 