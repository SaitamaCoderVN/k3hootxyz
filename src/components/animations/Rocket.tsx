'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaRocket } from 'react-icons/fa';

export default function Rocket() {
  const [rockets, setRockets] = useState<{ y: number; delay: number; direction: 'left' | 'right' }[]>([]);

  useEffect(() => {
    const createRocket = () => ({
      y: Math.random() * 80 + 10, // 10-90% of screen height
      delay: Math.random() * 5,
      direction: Math.random() > 0.5 ? 'left' : 'right' as 'left' | 'right'
    });

    setRockets(Array.from({ length: 3 }, createRocket));

    const interval = setInterval(() => {
      setRockets(prev => [...prev.slice(-2), createRocket()]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {rockets.map((rocket, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${rocket.y}%`,
            left: rocket.direction === 'left' ? '-50px' : 'calc(100% + 50px)',
          }}
          animate={{
            x: rocket.direction === 'left' 
              ? ['0%', '100vw'] 
              : ['0%', '-100vw'],
            rotate: rocket.direction === 'left' ? 45 : 225
          }}
          transition={{
            duration: 4,
            delay: rocket.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <FaRocket className="text-purple-400 w-8 h-8" />
          <motion.div
            className="absolute -bottom-1 -right-2 w-12 h-2 bg-gradient-to-r from-orange-500 to-transparent"
            animate={{
              width: ['48px', '24px', '48px']
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity
            }}
          />
        </motion.div>
      ))}
    </div>
  );
} 