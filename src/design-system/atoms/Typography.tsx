'use client';

import { ReactNode, CSSProperties } from 'react';
import { typography, colors } from '../tokens';

type TypographyVariant =
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | 'display-md'
  | 'display-sm'
  | 'display-xs'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body-xl'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'body-xs';

type GradientDirection = 'orange' | 'purple' | 'pink' | 'orange-purple' | 'purple-pink' | 'orange-pink' | 'purple-orange';

interface TypographyProps {
  children: ReactNode;
  variant?: TypographyVariant;
  gradient?: GradientDirection | false;
  color?: string;
  className?: string;
  style?: CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const variantStyles: Record<TypographyVariant, { font: any; element: string; style?: any }> = {
  // Display variants (responsive with clamp)
  'display-2xl': { 
    font: typography.fontSize.display['2xl'], 
    element: 'h1',
    style: { 
      lineHeight: 0.85, 
      letterSpacing: '-0.04em', 
      fontWeight: 700,
      fontFamily: typography.fontFamily.display,
    },
  },
  'display-xl': { 
    font: typography.fontSize.display.xl, 
    element: 'h1',
    style: { 
      lineHeight: 0.85, 
      letterSpacing: '-0.04em', 
      fontWeight: 700,
      fontFamily: typography.fontFamily.display,
    },
  },
  'display-lg': { 
    font: typography.fontSize.display.lg, 
    element: 'h1',
    style: { 
      lineHeight: 0.85, 
      letterSpacing: '-0.04em', 
      fontWeight: 700,
      fontFamily: typography.fontFamily.display,
    },
  },
  'display-md': { 
    font: typography.fontSize.display.md, 
    element: 'h2',
    style: { 
      lineHeight: 0.9, 
      letterSpacing: '-0.03em', 
      fontWeight: 700,
      fontFamily: typography.fontFamily.display,
    },
  },
  'display-sm': { 
    font: typography.fontSize.display.sm, 
    element: 'h2',
    style: { 
      lineHeight: 0.9, 
      letterSpacing: '-0.03em', 
      fontWeight: 700,
      fontFamily: typography.fontFamily.display,
    },
  },
  'display-xs': { 
    font: typography.fontSize.display.xs, 
    element: 'h3',
    style: { 
      lineHeight: 0.95, 
      letterSpacing: '-0.02em', 
      fontWeight: 700,
      fontFamily: typography.fontFamily.display,
    },
  },
  h1: { font: typography.fontSize.h1, element: 'h1' },
  h2: { font: typography.fontSize.h2, element: 'h2' },
  h3: { font: typography.fontSize.h3, element: 'h3' },
  h4: { font: typography.fontSize.h4, element: 'h4' },
  h5: { font: typography.fontSize.h5, element: 'h5' },
  h6: { font: typography.fontSize.h6, element: 'h6' },
  'body-xl': { font: typography.fontSize.xl, element: 'p' },
  'body-lg': { font: typography.fontSize.lg, element: 'p' },
  body: { font: typography.fontSize.base, element: 'p' },
  'body-sm': { font: typography.fontSize.sm, element: 'p' },
  'body-xs': { font: typography.fontSize.xs, element: 'p' },
};

const gradientMap: Record<GradientDirection, string> = {
  orange: `linear-gradient(135deg, ${colors.primary.orange[500]}, ${colors.primary.orange[400]})`,
  purple: `linear-gradient(135deg, ${colors.primary.purple[500]}, ${colors.primary.purple[400]})`,
  pink: `linear-gradient(135deg, ${colors.primary.pink[500]}, ${colors.primary.pink[400]})`,
  'orange-purple': `linear-gradient(135deg, ${colors.primary.orange[500]}, ${colors.primary.purple[500]})`,
  'purple-pink': `linear-gradient(135deg, ${colors.primary.purple[500]}, ${colors.primary.pink[500]})`,
  'orange-pink': `linear-gradient(135deg, ${colors.primary.orange[500]}, ${colors.primary.pink[500]})`,
  'purple-orange': `linear-gradient(135deg, ${colors.primary.purple[500]}, ${colors.primary.orange[500]})`,
};

export function Typography({
  children,
  variant = 'body',
  gradient = false,
  color,
  className = '',
  style = {},
  as,
}: TypographyProps) {
  const config = variantStyles[variant];
  
  // Handle new clamp-based display variants (string format)
  const isClampVariant = typeof config.font === 'string';
  const fontSize = isClampVariant ? config.font : config.font[0];
  const fontConfig = isClampVariant ? config.style : config.font[1];
  
  const Element = (as || config.element) as any;

  const isDisplay = variant.startsWith('display');
  const isHeading = variant.startsWith('h');
  const fontFamily = isDisplay || isHeading ? typography.fontFamily.display : typography.fontFamily.body;

  const baseStyles: CSSProperties = {
    fontFamily,
    fontSize,
    ...(typeof fontConfig === 'object' && fontConfig),
    ...(gradient && {
      background: gradientMap[gradient],
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }),
    ...(color && !gradient && { color }),
    ...style,
  };

  return (
    <Element className={className} style={baseStyles}>
      {children}
    </Element>
  );
}