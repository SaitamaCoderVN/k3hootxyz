'use client';

import { motion } from 'framer-motion';

export default function LuminousWaves() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-1/4 left-0 w-full h-[600px] opacity-20"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139, 92, 246, 0.3), transparent)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          y: ['-5%', '5%', '-5%'],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-0 w-full h-[800px] opacity-15"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59, 130, 246, 0.4), transparent)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: ['10%', '-10%', '10%'],
          y: ['5%', '-5%', '5%'],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/4 w-full h-[700px] opacity-10"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(168, 85, 247, 0.5), transparent)',
          filter: 'blur(100px)',
        }}
        animate={{
          x: ['0%', '15%', '0%'],
          y: ['0%', '-10%', '0%'],
          scale: [0.9, 1.2, 0.9],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
