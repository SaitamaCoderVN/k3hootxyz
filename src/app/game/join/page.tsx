'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Typography, NeonButton, GlassCard } from '@/design-system';
import { FaGamepad } from 'react-icons/fa';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function JoinGamePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!pin || !playerName) {
      setError('Please enter both PIN and player name');
      return;
    }

    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game/join-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, playerName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join game');
      }

      // Store participant ID and navigate to lobby
      localStorage.setItem('participantId', data.participantId);
      localStorage.setItem('playerName', playerName);
      router.push(`/game/lobby/${data.sessionId}?role=player`);
    } catch (err: any) {
      setError(err.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow digits and max 6 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setPin(cleaned);
  };

  return (
    <PageWrapper minHeight="screen">
      <Header />
      
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard variant="purple" size="xl">
            <div className="text-center mb-8">
              <Typography variant="display-sm" gradient="purple-pink" className="mb-4">
                JOIN GAME
              </Typography>
              <Typography variant="body" color="#a78bfab3">
                Enter the game PIN to join
              </Typography>
            </div>

            <div className="space-y-6">
              {/* PIN Input */}
              <div>
                <label className="block mb-2">
                  <Typography variant="body-sm" color="#a78bfa">
                    Game PIN
                  </Typography>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="w-full px-6 py-4 text-3xl font-bold text-center tracking-[0.5em] bg-black/30 border-2 border-purple-500/30 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-purple-400/30"
                  maxLength={6}
                />
              </div>

              {/* Player Name Input */}
              <div>
                <label className="block mb-2">
                  <Typography variant="body-sm" color="#a78bfa">
                    Your Name
                  </Typography>
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border-2 border-purple-500/30 rounded-xl focus:border-purple-400 focus:outline-none text-white placeholder-purple-400/30"
                  maxLength={50}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoin();
                    }
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <Typography variant="body-sm" color="#ef4444">
                    {error}
                  </Typography>
                </motion.div>
              )}

              {/* Join Button */}
              <NeonButton
                size="xl"
                neonColor="purple"
                fullWidth
                leftIcon={<FaGamepad />}
                onClick={handleJoin}
                disabled={loading || !pin || !playerName}
              >
                {loading ? 'Joining...' : 'Join Game'}
              </NeonButton>
            </div>
          </GlassCard>

          {/* Quick Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Typography variant="body-sm" color="#a78bfa99">
              Ask the host for the game PIN to get started
            </Typography>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </PageWrapper>
  );
}
