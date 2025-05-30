'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PixelEffectProps {
  className?: string;
}

export default function PixelEffect({ className = '' }: PixelEffectProps) {
  const [pixels, setPixels] = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    const generatePixels = () => {
      const newPixels = [];
      const gridSize = 20;
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          newPixels.push({
            x: (i / gridSize) * 100,
            y: (j / gridSize) * 100,
            delay: Math.random() * 0.5
          });
        }
      }
      setPixels(newPixels);
    };

    generatePixels();
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {pixels.map((pixel, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 bg-primary/20"
          style={{
            left: `${pixel.x}%`,
            top: `${pixel.y}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: pixel.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
} 