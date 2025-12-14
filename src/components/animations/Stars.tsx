'use client';

import { motion, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Stars() {
  const [stars, setStars] = useState<{ x: number; y: number; delay: number; baseOpacity: number }[]>([]);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      baseOpacity: 0.2 + (i % 5) * 0.1
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.baseOpacity
          }}
          animate={{
            opacity: [star.baseOpacity, 1, star.baseOpacity],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}