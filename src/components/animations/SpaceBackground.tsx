'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function SpaceBackground() {
  const { scrollYProgress } = useScroll();

  const nebulaScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const nebulaRotate = useTransform(scrollYProgress, [0, 1], [0, 5]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-gray-900 to-black" />

      {/* Nebula effects */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'url("/nebula.png")',
          backgroundSize: 'cover',
          scale: nebulaScale,
          rotate: nebulaRotate
        }}
      />

      {/* Parallax star layers */}
      {[...Array(3)].map((_, i) => {
        const x = useTransform(scrollYProgress, [0, 1], [0, -50]);
        const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

        return (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle, transparent 60%, black), url("/stars.png")',
              backgroundSize: `${100 + i * 50}px ${100 + i * 50}px`,
              x,
              y
            }}
          />
        );
      })}

      {/* Glowing overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-purple-900/40" />
    </div>
  );
}