'use client';

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaFire } from 'react-icons/fa';
import { useGameSounds } from '../audio/BackgroundMusic';

export default function TorchLight() {
  const [isLit, setIsLit] = useState(false);
  const controls = useAnimation();
  const { playClickSound } = useGameSounds();

  const handleLight = async () => {
    if (!isLit) {
      setIsLit(true);
      playClickSound();

      // Animation khi đốt
      await controls.start({
        scale: [1, 1.2, 1],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        }
      });

      // Trigger event để bắt đầu hành trình
      const event = new CustomEvent('torchLit');
      window.dispatchEvent(event);
    }
  };

  return (
    <motion.div
      className="fixed bottom-24 right-24 z-50 cursor-pointer"
      animate={controls}
      onClick={handleLight}
      whileHover={{ scale: 1.1 }}
    >
      <div className="relative">
        {/* Ngọn lửa */}
        <motion.div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2"
          animate={isLit ? {
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          } : {
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.5,
            repeat: isLit ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <FaFire className="w-8 h-8 text-orange-500" />
        </motion.div>

        {/* Đuốc */}
        <div className="w-4 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full">
          {/* Phần đầu đuốc */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-800 rounded-full">
            {isLit && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
        </div>

        {/* Hiệu ứng ánh sáng */}
        {isLit && (
          <motion.div
            className="absolute -inset-8 bg-gradient-to-t from-orange-500/20 to-yellow-300/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Text hướng dẫn */}
      {!isLit && (
        <motion.p
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm text-purple-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Click để đốt đuốc
        </motion.p>
      )}
    </motion.div>
  );
} 