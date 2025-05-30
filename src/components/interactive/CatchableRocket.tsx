'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';
import { useGameSounds } from '../audio/BackgroundMusic';
import confetti from 'canvas-confetti';

export default function CatchableRocket() {
  const [isCaught, setIsCaught] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isMounted, setIsMounted] = useState(false);
  const [score, setScore] = useState(0);
  const controls = useAnimation();
  const { playClickSound } = useGameSounds();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    
    const maxX = Math.max(window.innerWidth - 150, 200);
    const maxY = Math.max(window.innerHeight - 150, 200);
    const minX = 50;
    const minY = 100;
    
    return {
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY
    };
  }, []);

  const moveRocket = useCallback(async () => {
    if (!isMounted || isCaught) return;

    try {
      const newPosition = getRandomPosition();
      
      await controls.start({
        x: newPosition.x,
        y: newPosition.y,
        transition: {
          duration: 1.5,
          ease: "easeInOut"
        }
      });

      setPosition(newPosition);
    } catch (error) {
      console.error('Error moving rocket:', error);
    }
  }, [isMounted, isCaught, controls, getRandomPosition]);

  useEffect(() => {
    setIsMounted(true);
    
    // Start movement after component is mounted
    const initTimer = setTimeout(() => {
      if (isMounted) {
        moveRocket();
        // Set up recurring movement
        intervalRef.current = setInterval(() => {
          if (!isCaught) {
            moveRocket();
          }
        }, 2000);
      }
    }, 1000);

    return () => {
      setIsMounted(false);
      clearTimeout(initTimer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleCatch = async () => {
    if (isCaught || !isMounted) return;

    try {
      setIsCaught(true);
      setScore(prev => prev + 1);
      
      // Clear movement interval temporarily
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      playClickSound();

      // Show confetti
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { 
            x: position.x / window.innerWidth,
            y: position.y / window.innerHeight
          }
        });
      }

      // Animation for caught state
      await controls.start({
        scale: [1, 1.5, 1],
        rotate: [0, 360],
        transition: {
          duration: 0.8
        }
      });

      // Reset after delay
      timeoutRef.current = setTimeout(() => {
        if (isMounted) {
          setIsCaught(false);
          moveRocket();
          
          // Restart movement interval
          intervalRef.current = setInterval(() => {
            if (!isCaught) {
              moveRocket();
            }
          }, 2000);
        }
      }, 1500);

    } catch (error) {
      console.error('Error handling catch:', error);
      setIsCaught(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Score Display */}
      <motion.div
        className="absolute top-4 right-4 z-50 bg-purple-900/80 backdrop-blur-lg rounded-lg px-4 py-2 border border-purple-500/30"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white font-bold">Rockets Caught: {score}</p>
      </motion.div>

      {/* Rocket */}
      <motion.div
        className="fixed z-40 cursor-pointer select-none"
        animate={controls}
        initial={{ x: position.x, y: position.y }}
        onClick={handleCatch}
        style={{ 
          filter: 'drop-shadow(0 0 15px rgba(147, 51, 234, 0.7))',
          pointerEvents: isCaught ? 'none' : 'auto'
        }}
      >
        <motion.div
          animate={isCaught ? {
            rotate: [0, 360, 720],
            scale: [1, 1.5, 1],
          } : {
            rotate: [0, 15, -15, 0],
            y: [0, -5, 0]
          }}
          transition={isCaught ? {
            duration: 0.8,
            ease: "easeInOut",
          } : {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FaRocket 
            className={`w-12 h-12 transition-colors duration-300 ${
              isCaught ? 'text-yellow-400' : 'text-purple-400 hover:text-purple-300'
            }`}
          />
          
          {/* Rocket Trail */}
          {!isCaught && (
            <motion.div
              className="absolute -bottom-1 -right-3 h-3 bg-gradient-to-r from-orange-500 via-red-500 to-transparent rounded-full"
              animate={{
                width: ['20px', '35px', '20px'],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Sparkles when caught */}
          {isCaught && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, (Math.cos(i * Math.PI / 4) * 30)],
                    y: [0, (Math.sin(i * Math.PI / 4) * 30)],
                    opacity: [1, 0],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
} 