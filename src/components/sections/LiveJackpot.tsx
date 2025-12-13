'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import BentoCard from '@/components/ui/BentoCard';

export default function LiveJackpot() {
  const [jackpot, setJackpot] = useState(12.547);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.random() * 0.01);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BentoCard size="medium" glowColor="rgba(249, 115, 22, 0.5)" delay={0.1}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              className="w-3 h-3 rounded-full bg-orange-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-orange-300 uppercase tracking-wider">Live Jackpot</span>
          </div>
          
          <motion.div
            key={jackpot}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {jackpot.toFixed(3)}
            <span className="text-3xl md:text-4xl ml-2 opacity-80">SOL</span>
          </motion.div>
        </div>
        
        <p className="text-purple-300/70 text-sm">Total prize pool waiting for winners</p>
      </div>
    </BentoCard>
  );
}
