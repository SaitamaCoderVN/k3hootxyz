'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 }
};

export default function Logo({ 
  size = 'md', 
  animated = false, 
  className = '',
  showText = false 
}: LogoProps) {
  const { width, height } = sizeMap[size];

  const logoElement = (
    <Image
      src="/logo.png"
      alt="K3Hoot"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  );

  return (
    <div className="flex items-center gap-2">
      {animated ? (
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {logoElement}
        </motion.div>
      ) : (
        logoElement
      )}
      
      {showText && (
        <motion.span 
          className="font-bold text-white text-lg"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          K3Hoot
        </motion.span>
      )}
    </div>
  );
}

// Specialized animated logo for loading states
export function LoadingLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const { width, height } = sizeMap[size];
  
  return (
    <motion.div
      className="relative"
      animate={{ 
        scale: [0.8, 1.1, 0.8],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Image
        src="/logo.png"
        alt="K3Hoot Loading"
        width={width}
        height={height}
        className="object-contain drop-shadow-lg"
        priority
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}

// Logo with brand text for headers
export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <motion.div 
      className="flex items-center gap-3"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Logo size={size} animated className="drop-shadow-lg" />
      <div className="flex flex-col">
        <span className="font-bold text-white text-xl leading-none">K3Hoot</span>
        <span className="text-purple-400 text-xs font-medium">Quiz Gaming Platform</span>
      </div>
    </motion.div>
  );
}
