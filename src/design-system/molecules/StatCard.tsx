'use client';

import { ReactNode } from 'react';
import { GlassCard } from '../atoms/GlassCard';
import { Typography } from '../atoms/Typography';
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
    <GlassCard variant={variant} size="md" className={className}>
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-lg flex-shrink-0"
          style={{
            background: `${colors.primary[variant === 'default' ? 'purple' : variant][500]}20`,
          }}
        >
          <div
            style={{
              color: colors.primary[variant === 'default' ? 'purple' : variant][400],
              fontSize: '2rem',
            }}
          >
            {icon}
          </div>
        </div>
        <div>
          <Typography variant="h3" color={colors.text.primary}>
            {value}
          </Typography>
          <Typography
            variant="body-sm"
            color={colors.primary[variant === 'default' ? 'purple' : variant][300]}
          >
            {label}
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
}
