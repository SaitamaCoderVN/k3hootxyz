'use client';

import { ReactNode } from 'react';
import { NeonButton } from '../atoms/NeonButton';

interface IconButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  neonColor?: 'orange' | 'purple' | 'pink';
  disabled?: boolean;
  loading?: boolean;
  iconPosition?: 'left' | 'right';
}

export function IconButton({
  icon,
  label,
  iconPosition = 'left',
  ...props
}: IconButtonProps) {
  return (
    <NeonButton
      leftIcon={iconPosition === 'left' ? icon : undefined}
      rightIcon={iconPosition === 'right' ? icon : undefined}
      {...props}
    >
      {label}
    </NeonButton>
  );
}
