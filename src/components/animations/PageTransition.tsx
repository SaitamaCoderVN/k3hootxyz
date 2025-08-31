'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  type?: 'slide' | 'fade' | 'scale' | 'slideUp';
}

const variants = {
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }
};

export default function PageTransition({ 
  children, 
  className = '', 
  type = 'slideUp' 
}: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={variants[type].initial}
      animate={variants[type].animate}
      exit={variants[type].exit}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smoother feel
      }}
    >
      {children}
    </motion.div>
  );
}

// Higher-order component for page wrapping
export function withPageTransition<P extends object>(
  Component: React.ComponentType<P>,
  transitionType: 'slide' | 'fade' | 'scale' | 'slideUp' = 'slideUp'
) {
  return function WrappedComponent(props: P) {
    return (
      <PageTransition type={transitionType}>
        <Component {...props} />
      </PageTransition>
    );
  };
}

// Staggered children animation
export function StaggerContainer({ 
  children, 
  className = '',
  staggerDelay = 0.1
}: { 
  children: ReactNode; 
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children, 
  className = '',
  delay = 0
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { 
          opacity: 1, 
          y: 0,
          transition: {
            delay,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Loading to content transition
export function LoadingTransition({
  loading,
  loadingComponent,
  children,
  className = ''
}: {
  loading: boolean;
  loadingComponent: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {loadingComponent}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Smooth height transition for dynamic content
export function HeightTransition({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      layout
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}
