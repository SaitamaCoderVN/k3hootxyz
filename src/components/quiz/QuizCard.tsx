'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSounds } from '../audio/BackgroundMusic';
import confetti from 'canvas-confetti';

interface QuizCardProps {
  question: string;
  answers: string[];
  correctAnswer: number;
  timeLimit: number;
  onAnswer: (index: number) => void;
  isAnswered: boolean;
  selectedAnswer?: number;
  totalPlayers: number;
  answeredCount: number;
}

export default function QuizCard({
  question,
  answers,
  correctAnswer,
  timeLimit,
  onAnswer,
  isAnswered,
  selectedAnswer,
  totalPlayers,
  answeredCount,
}: QuizCardProps) {
  const { playHoverSound, playClickSound } = useGameSounds();
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isAnswered]);

  useEffect(() => {
    if (isAnswered && selectedAnswer === correctAnswer) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isAnswered, selectedAnswer, correctAnswer]);

  const getAnswerStyle = (index: number) => {
    if (!showAnswer) return '';
    if (index === correctAnswer) return 'bg-green-500/20 border-green-500';
    if (index === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'bg-red-500/20 border-red-500';
    }
    return 'opacity-50';
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Timer and Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold">{timeLeft}s</span>
          <span className="text-purple-300">
            {answeredCount}/{totalPlayers} answered
          </span>
        </div>
        <motion.div
          className="h-2 bg-purple-900/50 rounded-full overflow-hidden"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: timeLeft / timeLimit }}
          transition={{ duration: 1, ease: "linear" }}
        >
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" />
        </motion.div>
      </div>

      {/* Question */}
      <motion.div
        className="bg-purple-900/20 backdrop-blur-lg rounded-xl p-8 mb-8"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h3 className="text-2xl font-bold text-center mb-2">{question}</h3>
      </motion.div>

      {/* Answers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
          {answers.map((answer, index) => (
            <motion.button
              key={index}
              className={`p-6 text-left rounded-xl border-2 border-purple-500/20 
                hover:border-purple-400 transition-all duration-300 
                ${getAnswerStyle(index)}
                ${isAnswered ? 'cursor-default' : 'cursor-pointer'}
                relative overflow-hidden`}
              disabled={isAnswered}
              onClick={() => {
                if (!isAnswered) {
                  playClickSound();
                  onAnswer(index);
                  setShowAnswer(true);
                }
              }}
              onMouseEnter={playHoverSound}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={!isAnswered ? {
                scale: 1.02,
                boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)"
              } : {}}
            >
              <div className="flex items-center space-x-4">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500/20 text-lg font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-lg">{answer}</span>
              </div>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Answer Feedback */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            className="mt-8 p-6 rounded-xl bg-purple-500/10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h4 className="text-xl font-bold mb-2">
              {selectedAnswer === correctAnswer ? '🎉 Correct!' : '❌ Sorry!'}
            </h4>
            <p className="text-purple-300">
              {selectedAnswer === correctAnswer
                ? 'You answered this question correctly.'
                : `The correct answer is ${String.fromCharCode(65 + correctAnswer)}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 