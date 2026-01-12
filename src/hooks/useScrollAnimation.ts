'use client';

import { useInView, useAnimation, useMotionValue, useTransform, useScroll } from 'framer-motion';
import { useEffect, useRef } from 'react';

export type ScrollAnimationType = 
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideInUp'
  | 'slideInDown'
  | 'scaleIn'
  | 'scaleInUp'
  | 'rotateIn'
  | 'blurIn'
  | 'reveal'
  | 'parallax';

interface UseScrollAnimationOptions {
  type?: ScrollAnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  amount?: number;
  parallaxSpeed?: number;
}

export function useScrollAnimation({
  type = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  once = true,
  amount = 50,
  parallaxSpeed = 0.5,
}: UseScrollAnimationOptions = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold,
    margin: '-100px',
  });
  const controls = useAnimation();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once]);

  const getVariants = () => {
    const baseVariants = {
      hidden: {},
      visible: {
        transition: {
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        },
      },
    };

    switch (type) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, ...baseVariants.visible },
        };
      case 'fadeInUp':
        return {
          hidden: { opacity: 0, y: amount },
          visible: { opacity: 1, y: 0, ...baseVariants.visible },
        };
      case 'fadeInDown':
        return {
          hidden: { opacity: 0, y: -amount },
          visible: { opacity: 1, y: 0, ...baseVariants.visible },
        };
      case 'fadeInLeft':
        return {
          hidden: { opacity: 0, x: amount },
          visible: { opacity: 1, x: 0, ...baseVariants.visible },
        };
      case 'fadeInRight':
        return {
          hidden: { opacity: 0, x: -amount },
          visible: { opacity: 1, x: 0, ...baseVariants.visible },
        };
      case 'slideInLeft':
        return {
          hidden: { x: -amount, opacity: 0 },
          visible: { x: 0, opacity: 1, ...baseVariants.visible },
        };
      case 'slideInRight':
        return {
          hidden: { x: amount, opacity: 0 },
          visible: { x: 0, opacity: 1, ...baseVariants.visible },
        };
      case 'slideInUp':
        return {
          hidden: { y: amount, opacity: 0 },
          visible: { y: 0, opacity: 1, ...baseVariants.visible },
        };
      case 'slideInDown':
        return {
          hidden: { y: -amount, opacity: 0 },
          visible: { y: 0, opacity: 1, ...baseVariants.visible },
        };
      case 'scaleIn':
        return {
          hidden: { scale: 0.8, opacity: 0 },
          visible: { scale: 1, opacity: 1, ...baseVariants.visible },
        };
      case 'scaleInUp':
        return {
          hidden: { scale: 0.8, y: amount, opacity: 0 },
          visible: { scale: 1, y: 0, opacity: 1, ...baseVariants.visible },
        };
      case 'rotateIn':
        return {
          hidden: { rotate: -10, opacity: 0, scale: 0.9 },
          visible: { rotate: 0, opacity: 1, scale: 1, ...baseVariants.visible },
        };
      case 'blurIn':
        return {
          hidden: { filter: 'blur(10px)', opacity: 0 },
          visible: { filter: 'blur(0px)', opacity: 1, ...baseVariants.visible },
        };
      case 'reveal':
        return {
          hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          visible: { clipPath: 'inset(0 0% 0 0)', opacity: 1, ...baseVariants.visible },
        };
      default:
        return {
          hidden: { opacity: 0, y: amount },
          visible: { opacity: 1, y: 0, ...baseVariants.visible },
        };
    }
  };

  // Parallax transform
  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    type === 'parallax' ? [-amount * parallaxSpeed, amount * parallaxSpeed] : [0, 0]
  );

  return {
    ref,
    controls,
    variants: getVariants(),
    style: type === 'parallax' ? { y: parallaxY } : undefined,
  };
}

