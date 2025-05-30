'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function CreateQuizForm() {
  const { connected } = useWallet();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0 }
  ]);

  const handleQuestionChange = (index: number, field: keyof Question, value: string | string[] | number) => {
    const newQuestions = [...questions];
    if (field === 'options' && typeof value === 'string') {
      const optionIndex = parseInt(value.split('-')[1]);
      newQuestions[index].options[optionIndex] = value.split('-')[0];
    } else {
      (newQuestions[index][field] as any) = value;
    }
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    // TODO: Implement contract interaction
    console.log({ title, description, reward, questions });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Quiz Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reward (SOL)</label>
        <input
          type="number"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="space-y-6">
        <label className="block text-sm font-medium text-gray-700">Questions</label>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border rounded-md p-4 space-y-4">
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
              placeholder="Question"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
            
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleQuestionChange(qIndex, 'options', `${e.target.value}-${oIndex}`)}
                  placeholder={`Option ${oIndex + 1}`}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={question.correctAnswer === oIndex}
                  onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                  required
                />
              </div>
            ))}
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
        >
          Add Question
        </button>
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          disabled={!connected}
        >
          {connected ? 'Create Quiz' : 'Connect Wallet to Create Quiz'}
        </button>
      </div>
    </form>
  );
} 