'use client';

import { motion } from 'framer-motion';
import { useRef, useState, ReactNode } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variants?: any;
  whileHover?: any;
  transition?: any;
}

export function InteractiveCard({ 
  children, 
  className = '', 
  style = {},
  variants,
  whileHover = {},
  transition = {}
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={style}
      variants={variants}
      whileHover={whileHover}
      transition={transition}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className="absolute pointer-events-none rounded-[32px]"
          style={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
            transition: 'left 0.1s ease-out, top 0.1s ease-out',
            zIndex: 0,
          }}
        />
      )}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}
