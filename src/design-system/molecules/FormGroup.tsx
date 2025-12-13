'use client';

import { ReactNode } from 'react';
import { spacing } from '../tokens';

interface FormGroupProps {
  children: ReactNode;
  spacing?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '56' | '64';
  className?: string;
}

export function FormGroup({
  children,
  spacing: spacingValue = '6',
  className = '',
}: FormGroupProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[spacingValue],
      }}
    >
      {children}
    </div>
  );
}