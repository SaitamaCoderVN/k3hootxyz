'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Header from './Header';
import Footer from './Footer';
import { PageWrapper } from './MinHeightContainer';
import { colors, animations, Typography } from '@/design-system';

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
  title?: ReactNode;
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
    <PageWrapper 
      minHeight="screen" 
      className={`text-black overflow-hidden ${className} bg-bone selection:bg-black selection:text-white`}
    >
      <Header />
      
      <main className="relative z-10">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="container mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-16"
          >
            {title && (
              <div className="mb-4">
                <Typography 
                  variant="display-lg" 
                  className="font-black uppercase leading-[0.85] tracking-tighter"
                >
                  {title}
                </Typography>
              </div>
            )}
            {subtitle && (
              <div className="max-w-3xl border-l-4 border-black pl-6 py-2">
                <Typography 
                  variant="body-lg" 
                  className="font-black uppercase tracking-widest opacity-40 leading-relaxed"
                >
                  {subtitle}
                </Typography>
              </div>
            )}
          </motion.div>
        )}
        
        <div className={`container mx-auto px-6 sm:px-8 lg:px-12 ${containerClassName}`}>
          {children}
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
}

