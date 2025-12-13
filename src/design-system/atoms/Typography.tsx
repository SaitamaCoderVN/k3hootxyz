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
  const variantMap: Record<TypographyVariant, { font: any; element: string }> = {
    'display-2xl': { font: typography.fontSize.display['2xl'], element: 'h1' },
    'display-xl': { font: typography.fontSize.display.xl, element: 'h1' },
    'display-lg': { font: typography.fontSize.display.lg, element: 'h1' },
    'display-md': { font: typography.fontSize.display.md, element: 'h1' },
    'display-sm': { font: typography.fontSize.display.sm, element: 'h2' },
    'display-xs': { font: typography.fontSize.display.xs, element: 'h2' },
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

  const config = variantMap[variant];
  const [fontSize, fontConfig] = config.font;
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