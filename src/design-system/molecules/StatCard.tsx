import React, { ReactNode } from 'react';
import { Typography } from '../atoms/Typography';
import { GlassCard } from './GlassCard';
import { colors } from '../tokens';

type StatCardVariant = 'orange' | 'purple' | 'pink' | 'default';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  variant?: StatCardVariant;
  className?: string;
}

export function StatCard({
  icon,
  value,
  label,
  variant = 'default',
  className = '',
}: StatCardProps) {
  return (
    <div 
      className={`border-2 border-black p-8 bg-white transition-all duration-300 hover:shadow-[8px_8px_0px_#00000010] ${className}`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b-2 border-black opacity-10 pb-4">
          <div className="text-3xl text-black grayscale opacity-100">
            {icon}
          </div>
          <div className="w-2 h-2 bg-black" />
        </div>
        <div>
          <Typography variant="display-sm" className="font-black leading-none mb-2">
            {value}
          </Typography>
          <Typography
            variant="body-xs"
            className="font-black uppercase tracking-[0.2em] opacity-40"
          >
            {label}
          </Typography>
        </div>
      </div>
    </div>
  );
}