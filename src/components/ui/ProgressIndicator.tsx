'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function ProgressIndicator({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'linear',
  color = 'primary'
}: ProgressIndicatorProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: { height: 'h-2', width: 'w-24', circular: 'w-16 h-16' },
    md: { height: 'h-3', width: 'w-32', circular: 'w-24 h-24' },
    lg: { height: 'h-4', width: 'w-48', circular: 'w-32 h-32' }
  };

  const colors = {
    primary: 'from-purple-500 to-pink-500',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-red-600'
  };

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative ${sizes[size].circular}`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-purple-900/30"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference
            }}
          />
          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={`${sizes[size].width} ${sizes[size].height} bg-purple-900/30 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-purple-300 text-center">
          {value} / {max}
        </div>
      )}
    </div>
  );
} 