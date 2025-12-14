'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

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

  const opacityTransforms = useMemo(() => {
    return stars.map((_, i) => 
      useTransform(
        scrollYProgress,
        [0, 0.5, 1],
        [0.2 + (i % 5) * 0.1, 1, 0.2 + (i % 5) * 0.1]
      )
    );
  }, [stars, scrollYProgress]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: opacityTransforms[i]
          }}
        />
      ))}
    </div>
  );
}