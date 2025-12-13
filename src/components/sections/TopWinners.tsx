'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import BentoCard from '@/components/ui/BentoCard';

const winners = [
  { address: 'Dx8K...mP4q', amount: 4.82, avatar: '🏆' },
  { address: 'FnQ2...7Lm9', amount: 3.45, avatar: '🥈' },
  { address: 'Kp9R...nX2w', amount: 2.91, avatar: '🥉' },
  { address: 'Wm5T...hZ8c', amount: 2.34, avatar: '⭐' },
];

export default function TopWinners() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % winners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BentoCard size="small" glowColor="rgba(234, 179, 8, 0.5)" delay={0.2}>
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-yellow-300 uppercase tracking-wider mb-4">
          Top Winners
        </h3>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center">
              <div className="text-5xl mb-3">{winners[currentIndex].avatar}</div>
              <div className="font-mono text-lg text-purple-200 mb-2">
                {winners[currentIndex].address}
              </div>
              <div 
                className="text-3xl font-bold"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {winners[currentIndex].amount} SOL
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-center gap-1.5 mt-4">
          {winners.map((_, i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-yellow-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </BentoCard>
  );
}
