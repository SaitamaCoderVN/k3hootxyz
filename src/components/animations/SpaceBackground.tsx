'use client';

import { motion } from 'framer-motion';

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-gray-900 to-black" />

      {/* Nebula effects */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'url("/nebula.png")',
          backgroundSize: 'cover'
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Parallax star layers */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, transparent 60%, black), url("/stars.png")',
            backgroundSize: `${100 + i * 50}px ${100 + i * 50}px`
          }}
          animate={{
            x: [-50, 0, -50],
            y: [-50, 0, -50]
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* Glowing overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-purple-900/40" />
    </div>
  );
} 