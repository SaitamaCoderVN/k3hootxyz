'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useScrollAnimation, ScrollAnimationType } from '@/hooks/useScrollAnimation';

interface ScrollRevealProps {
  children: ReactNode;
  type?: ScrollAnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  amount?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  type = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  className = '',
  amount = 50,
  once = true,
}: ScrollRevealProps) {
  const { ref, controls, variants } = useScrollAnimation({
    type,
    delay,
    duration,
    amount,
    once,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  type?: ScrollAnimationType;
  delay?: number;
}

export function StaggerItem({
  children,
  className = '',
  type = 'fadeInUp',
  delay = 0,
}: StaggerItemProps) {
  const { variants } = useScrollAnimation({ type, delay, amount: 30 });

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

