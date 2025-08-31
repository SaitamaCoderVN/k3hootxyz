'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useGameSounds } from '../audio/BackgroundMusic';

interface GameCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function GameCard({ icon, title, description, onClick }: GameCardProps) {
  const { playHoverSound, playClickSound } = useGameSounds();
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation
  const springConfig = { damping: 25, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    mouseX.set(mouseXFromCenter / width);
    mouseY.set(mouseYFromCenter / height);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    playHoverSound();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClick = () => {
    if (onClick) {
      playClickSound();
      onClick();
    }
  };

  return (
    <motion.div
      className="relative perspective-1000 w-full max-w-sm mx-auto"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        rotateX,
        rotateY,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300" />
      <div className="relative flex flex-col items-center p-4 sm:p-6 bg-black rounded-lg cursor-pointer h-full">
        {/* Glowing effect */}
        <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur-xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center h-full justify-between">
          <div className="mb-3 sm:mb-4 rounded-full bg-purple-500/10 p-2 sm:p-3 ring-1 ring-purple-500/20">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-center text-white leading-tight">{title}</h3>
            <p className="text-xs sm:text-sm text-purple-300 text-center leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 