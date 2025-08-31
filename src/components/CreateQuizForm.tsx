'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useK3HootClient, QuestionData } from '../lib/solana-client';
import { TopicWithStats } from '@/lib/solana-client';
import { useTopics } from '@/hooks/useTopics';

interface Question {
  question: string;
  choices: string[];
  correctAnswer: string;
}

interface CreateQuizFormProps {
  availableTopics: TopicWithStats[];
}

export default function CreateQuizForm({ availableTopics }: CreateQuizFormProps) {
  const { connected } = useWallet();
  const router = useRouter();
  const client = useK3HootClient();
  const { refreshTopics } = useTopics(); // Add this line
  
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('0.1');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', choices: ['', '', '', ''], correctAnswer: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-select first topic if available
  useEffect(() => {
    if (availableTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(availableTopics[0].name);
    }
  }, [availableTopics, selectedTopic]);

  const addQuestion = () => {
    if (questions.length < 10) {
      setQuestions([...questions, { question: '', choices: ['', '', '', ''], correctAnswer: '' }]);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    if (field === 'question') {
      newQuestions[index].question = value;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value;
    }
    setQuestions(newQuestions);
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices[choiceIndex] = value;
    setQuestions(newQuestions);
  };

  const validateForm = (): boolean => {
    if (!selectedTopic) {
      setError('Please select a topic');
      return false;
    }
    if (!title.trim()) {
      setError('Please enter a quiz title');
      return false;
    }
    if (parseFloat(reward) < 0.01) {
      setError('Reward must be at least 0.01 SOL');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty`);
        return false;
      }
      if (q.choices.some(choice => !choice.trim())) {
        setError(`Question ${i + 1} has empty choices`);
        return false;
      }
      if (!q.correctAnswer.trim()) {
        setError(`Question ${i + 1} has no correct answer`);
        return false;
      }
      if (!q.choices.includes(q.correctAnswer)) {
        setError(`Question ${i + 1}: correct answer must match one of the choices`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!client) {
      setError('Client not available');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`🔐 Creating complete quiz: ${title}`);
      console.log(`📊 Total questions: ${questions.length}`);
      console.log(`💰 Reward: ${reward} SOL`);
      console.log(`📝 Topic: ${selectedTopic}`);

      // Transform questions to match QuestionData interface
      const questionData: QuestionData[] = questions.map(q => ({
        question: q.question,
        choices: q.choices,
        correctAnswer: q.correctAnswer
      }));

      // Preview questions
      console.log(`📚 Quiz Questions Preview:`);
      questionData.forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.question}`);
        console.log(`      Choices: ${q.choices.join(' | ')}`);
        console.log(`      Correct: ${q.correctAnswer}`);
      });

      // Create the complete quiz using the new flow
      const result = await client.createCompleteQuiz(
        selectedTopic,
        title,
        questionData,
        parseFloat(reward)
      );

      console.log(`✅ Quiz created successfully!`);
      console.log(`🔐 Quiz Set PDA: ${result.quizSetPda}`);
      console.log(`📊 Question Blocks: ${result.questionBlocks.length}`);

      setSuccess(`Quiz "${title}" created successfully! Quiz Set: ${result.quizSetPda}`);
      
      // Refresh topics to update stats
      if (refreshTopics) {
        await refreshTopics();
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setReward('0.1');
      setQuestions([{ question: '', choices: ['', '', '', ''], correctAnswer: '' }]);

      // Redirect to browse/play page after success
      setTimeout(() => {
        router.push('/play');
      }, 3000);

    } catch (err: any) {
      console.error('❌ Error creating quiz:', err);
      
      // Handle specific error cases
      if (err.message?.includes('User rejected') || err.message?.includes('canceled')) {
        setError('Transaction was canceled by user');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient SOL balance to create quiz');
      } else {
        setError(err.message || 'Failed to create quiz');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Create Quiz</h2>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Please connect your wallet to create a quiz</p>
          <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Create New Quiz</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Topic Selection */}
          <div>
            <label className="block text-white font-medium mb-3">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a topic</option>
              {availableTopics.map((topic) => (
                <option key={topic.name} value={topic.name}>
                  {topic.name} ({topic.totalQuizzes} quizzes)
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-3">Quiz Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-3">Reward (SOL)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.1"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-3">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your quiz..."
            />
          </div>

          {/* Questions */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Questions ({questions.length})</h3>
              <button
                type="button"
                onClick={addQuestion}
                disabled={questions.length >= 10}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="p-6 bg-gray-800/50 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-white">Question {questionIndex + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <label className="block text-white font-medium mb-2">Question</label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  {/* Choices */}
                  <div className="mb-4">
                    <label className="block text-white font-medium mb-2">Choices</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.choices.map((choice, choiceIndex) => (
                        <input
                          key={choiceIndex}
                          type="text"
                          value={choice}
                          onChange={(e) => updateChoice(questionIndex, choiceIndex, e.target.value)}
                          className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Choice ${choiceIndex + 1}`}
                          required
                        />
                      ))}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <label className="block text-white font-medium mb-2">Correct Answer</label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select correct answer</option>
                      {question.choices.map((choice, choiceIndex) => (
                        <option key={choiceIndex} value={choice}>
                          {choice || `Choice ${choiceIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-900/50 border border-green-500 rounded-lg">
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !connected}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Quiz...
              </div>
            ) : (
              `Create Quiz (${reward} SOL)`
            )}
          </button>
        </form>

        {/* Quiz Creation Info */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-200 font-medium mb-2">🔐 Secure Quiz Creation</h4>
          <ul className="text-blue-200/80 text-sm space-y-1">
            <li>• Questions and choices are encrypted on-chain using XOR encryption</li>
            <li>• Correct answers are encrypted separately for security</li>
            <li>• Each question uses a unique nonce for maximum security</li>
            <li>• All data stored directly on Solana blockchain</li>
            <li>• Winner verification happens on-chain without decryption</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 