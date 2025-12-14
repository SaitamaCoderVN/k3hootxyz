'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Stars() {
  const [stars, setStars] = useState<{ x: number; y: number; delay: number }[]>([]);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const newStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => {
        const baseOpacity = 0.2 + (i % 5) * 0.1;
        
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              opacity: useTransform(
                scrollYProgress,
                [0, 0.5, 1],
                [baseOpacity, 1, baseOpacity]
              )
            }}
          />
        );
      })}
    </div>
  );
}