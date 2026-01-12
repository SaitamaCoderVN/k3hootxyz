'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Header from './Header';
import Footer from './Footer';
import { PageWrapper } from './MinHeightContainer';
import { colors, animations } from '@/design-system';

const WebGLBackground = dynamic(() => import('@/components/animations/WebGLBackground'), {
  ssr: false,
  loading: () => null,
});

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
  loading: () => null,
});

interface PageTemplateProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackground?: boolean;
  className?: string;
  containerClassName?: string;
}

export function PageTemplate({
  children,
  title,
  subtitle,
  showBackground = true,
  className = '',
  containerClassName = '',
}: PageTemplateProps) {
  return (
    <PageWrapper minHeight="screen" className={`text-white overflow-hidden ${className}`} style={{ backgroundColor: colors.background.primary }}>
      {showBackground && (
        <>
          <WebGLBackground />
          <PixelEffect />
        </>
      )}
      <Header />
      
      <main className="relative z-10">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: parseFloat(animations.duration.normal) / 1000 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12"
          >
            {title && (
              <h1 className="text-center mb-4">
                <span
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.orange[400]}, ${colors.primary.purple[400]}, ${colors.primary.pink[400]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 60px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  {title}
                </span>
              </h1>
            )}
            {subtitle && (
              <p
                className="text-center text-lg sm:text-xl max-w-2xl mx-auto"
                style={{ color: `${colors.primary.purple[300]}dd` }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
          {children}
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
}

