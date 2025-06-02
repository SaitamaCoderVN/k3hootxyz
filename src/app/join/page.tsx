'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { FaGamepad, FaKeyboard } from 'react-icons/fa';

export default function JoinPage() {
  const [pin, setPin] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [pinError, setPinError] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  // Real-time validation
  const handlePinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setPin(cleaned);
    
    // Clear error when user starts typing
    if (pinError) setPinError('');
    
    // Auto-submit when 6 digits are entered
    if (cleaned.length === 6) {
      validateAndJoin(cleaned);
    }
  };

  const validateAndJoin = async (pinCode: string) => {
    if (pinCode.length !== 6) {
      setPinError('PIN must be exactly 6 digits');
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await fetch('/api/game/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pinCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        showToast({
          type: 'success',
          title: 'Joining game!',
          message: 'Get ready to play...'
        });
        
        router.push(`/game/${pinCode}`);
      } else {
        setPinError(data.message || 'Invalid game PIN. Please check and try again.');
        showToast({
          type: 'error',
          title: 'Invalid PIN',
          message: data.message || 'This game room doesn\'t exist.'
        });
      }
    } catch (error) {
      setPinError('Connection error. Please try again.');
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to game server.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndJoin(pin);
  };

  // Generate virtual keyboard for mobile
  const renderVirtualKeyboard = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    
    return (
      <div className="grid grid-cols-3 gap-2 mt-6 md:hidden">
        {keys.map((key) => (
          <motion.button
            key={key}
            type="button"
            className="p-4 bg-purple-900/30 rounded-lg text-xl font-bold hover:bg-purple-900/50 transition-colors"
            onClick={() => handlePinChange(pin + key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {key}
          </motion.button>
        ))}
        <motion.button
          type="button"
          className="p-4 bg-red-900/30 rounded-lg text-xl font-bold hover:bg-red-900/50 transition-colors col-span-2"
          onClick={() => setPin('')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Clear
        </motion.button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <SpaceBackground />
      <Stars />
      <Header />

      <section className="relative pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-block p-4 bg-purple-900/20 rounded-full mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaGamepad className="w-12 h-12 text-purple-400" />
              </motion.div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Join a Game</h1>
              <p className="text-purple-300">Enter the 6-digit PIN to join</p>
            </div>

            {/* PIN Input Form */}
            <motion.div
              className="bg-purple-900/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* PIN Display */}
                <div className="relative">
                  <div className="flex justify-center gap-2 mb-4">
                    {[...Array(6)].map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-14 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold
                          ${pin[index] 
                            ? 'bg-purple-900/50 border-purple-500 text-white' 
                            : 'bg-purple-900/20 border-purple-500/30'
                          }
                          ${pinError ? 'border-red-500/50' : ''}
                        `}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {pin[index] || '·'}
                      </motion.div>
                    ))}
                  </div>

                  {/* Hidden input for desktop */}
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    maxLength={6}
                    className="sr-only md:not-sr-only absolute inset-0 opacity-0"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {pinError && (
                    <motion.p
                      className="text-red-400 text-sm text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {pinError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isValidating}
                  loadingText="Joining..."
                  disabled={pin.length !== 6}
                  icon={<FaGamepad />}
                >
                  Join Game
                </Button>

                {/* Virtual Keyboard for Mobile */}
                {renderVirtualKeyboard()}

                {/* Helper Text */}
                <div className="text-center space-y-2 mt-6">
                  <p className="text-purple-300 text-sm">
                    Don't have a PIN?
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/browse')}
                    >
                      Browse Games
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/create')}
                    >
                      Create Quiz
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Demo PIN */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-purple-400 text-sm">
                Try demo PIN: <code className="bg-purple-900/30 px-2 py-1 rounded">123456</code>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 