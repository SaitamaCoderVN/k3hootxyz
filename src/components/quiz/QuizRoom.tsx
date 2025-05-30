'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizCard from './QuizCard';
import { useGame } from '@/contexts/GameContext';
import { useGameSounds } from '../audio/BackgroundMusic';
import { FaCrown, FaUserAstronaut } from 'react-icons/fa';
import GlowingButton from '../ui/GlowingButton';

export default function QuizRoom() {
  const {
    session,
    currentQuestion,
    players,
    answers,
    isHost,
    startGame,
    submitAnswer,
    nextQuestion,
    endGame,
  } = useGame();
  const { playClickSound } = useGameSounds();

  const handleAnswer = (answer: number) => {
    playClickSound();
    submitAnswer(answer);
  };

  const handleNextQuestion = () => {
    playClickSound();
    nextQuestion();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black/90 text-white flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-3xl font-bold mb-4">Connecting...</h2>
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

  if (session.status === 'waiting') {
    return (
      <div className="min-h-screen bg-black/90 text-white py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="bg-purple-900/20 backdrop-blur-lg rounded-xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-8">
              Waiting Room
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  className="bg-purple-800/30 rounded-lg p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <FaUserAstronaut className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                  <p className="text-sm font-medium truncate">{player.player_id}</p>
                </motion.div>
              ))}
            </div>

            {isHost && (
              <GlowingButton
                variant="primary"
                onClick={() => {
                  playClickSound();
                  startGame();
                }}
                disabled={players.length < 2}
              >
                Start Game
              </GlowingButton>
            )}

            <p className="mt-4 text-purple-300">
              {isHost
                ? 'Waiting for more players to join...'
                : 'Waiting for the host to start the game...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (session.status === 'finished') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="min-h-screen bg-black/90 text-white py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="bg-purple-900/20 backdrop-blur-lg rounded-xl p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              Game Results
            </h2>

            <div className="relative mb-16">
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <FaCrown className="w-16 h-16 text-yellow-400" />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sortedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    className={`bg-purple-800/30 rounded-lg p-6 ${
                      index === 0 ? 'md:col-span-2 border-2 border-yellow-400' : ''
                    }`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 * index }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold">#{index + 1}</span>
                        <FaUserAstronaut className="w-8 h-8 text-purple-400" />
                        <div>
                          <p className="font-medium">{player.player_id}</p>
                          <p className="text-sm text-purple-300">
                            {player.correct_answers} correct answers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{player.score}</p>
                        <p className="text-sm text-purple-300">points</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <GlowingButton 
                variant="primary"
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </GlowingButton>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 text-white py-12 px-4">
      <div className="container mx-auto">
        {/* Players List */}
        <motion.div
          className="fixed top-4 right-4 w-64 bg-purple-900/20 backdrop-blur-lg rounded-xl p-4"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-lg font-semibold mb-4">Players</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <motion.div
                key={player.id}
                className="flex items-center justify-between text-sm bg-purple-800/30 rounded-lg p-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center space-x-2">
                  <FaUserAstronaut className="w-4 h-4 text-purple-400" />
                  <span className="truncate">{player.player_id}</span>
                </div>
                <span className="font-semibold">{player.score}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quiz Content */}
        <AnimatePresence mode="wait">
          {currentQuestion ? (
            <QuizCard
              key={currentQuestion.id}
              question={currentQuestion.content}
              answers={currentQuestion.options}
              correctAnswer={currentQuestion.correct_option}
              timeLimit={currentQuestion.time_limit}
              onAnswer={handleAnswer}
              isAnswered={answers.some(a => a.question_id === currentQuestion.id)}
              selectedAnswer={answers.find(a => a.question_id === currentQuestion.id)?.selected_option}
              totalPlayers={players.length}
              answeredCount={answers.filter(a => a.question_id === currentQuestion.id).length}
            />
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">
                Preparing the next question...
              </h2>
              {isHost && (
                <GlowingButton 
                  variant="primary"
                  onClick={handleNextQuestion}
                >
                  Next Question
                </GlowingButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 