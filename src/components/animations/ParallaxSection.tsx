'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down';
}

export function ParallaxSection({
  children,
  speed = 0.5,
  className = '',
  direction = 'up',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' ? [0, -100 * speed] : [0, 100 * speed]
  );

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

interface FadeOnScrollProps {
  children: ReactNode;
  className?: string;
  fadeIn?: boolean;
}

export function FadeOnScroll({
  children,
  className = '',
  fadeIn = true,
}: FadeOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    fadeIn ? [0, 1, 1] : [1, 1, 0]
  );

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  return (
    <motion.div ref={ref} style={{ opacity, scale }} className={className}>
      {children}
    </motion.div>
  );
}

