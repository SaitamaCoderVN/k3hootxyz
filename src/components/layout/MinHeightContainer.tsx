'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MinHeightContainerProps {
  children: ReactNode;
  className?: string;
  minHeight?: 'screen' | 'content' | 'auto';
  pushFooter?: boolean;
}

export default function MinHeightContainer({ 
  children, 
  className = '',
  minHeight = 'screen',
  pushFooter = true 
}: MinHeightContainerProps) {
  const getMinHeightClass = () => {
    switch (minHeight) {
      case 'screen':
        return 'min-h-screen';
      case 'content':
        return 'min-h-[calc(100vh-160px)]'; // Account for header + footer
      case 'auto':
        return 'min-h-fit';
      default:
        return 'min-h-screen';
    }
  };

  const containerClasses = pushFooter 
    ? `${getMinHeightClass()} flex flex-col ${className}`
    : `${getMinHeightClass()} ${className}`;

  return (
    <div className={containerClasses}>
      {pushFooter ? (
        <>
          <div className="flex-1">
            {children}
          </div>
          {/* Spacer to push footer down */}
          <div className="flex-shrink-0" />
        </>
      ) : (
        children
      )}
    </div>
  );
}

// Specialized loading container that ensures footer stays at bottom
export function LoadingContainer({ 
  children, 
  className = '',
  showBackground = true 
}: { 
  children: ReactNode; 
  className?: string;
  showBackground?: boolean;
}) {
  return (
    <MinHeightContainer 
      className={`${showBackground ? 'bg-black text-white' : ''} ${className}`}
      minHeight="screen"
      pushFooter={true}
    >
      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </MinHeightContainer>
  );
}

// Page wrapper that ensures proper layout
export function PageWrapper({ 
  children, 
  className = '',
  loading = false,
  minHeight = 'content',
  style
}: { 
  children: ReactNode; 
  className?: string;
  loading?: boolean;
  minHeight?: 'screen' | 'content' | 'auto';
  style?: React.CSSProperties;
}) {
  if (loading) {
    return (
      <LoadingContainer className={className}>
        {children}
      </LoadingContainer>
    );
  }

  return (
    <MinHeightContainer 
      className={className}
      minHeight={minHeight}
      pushFooter={true}
    >
      <div style={style}>{children}</div>
    </MinHeightContainer>
  );
}