import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletContextProvider } from '@/contexts/WalletContextProvider';
import { GameProvider } from '@/contexts/GameContext';
import { Press_Start_2P, Pixelify_Sans } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/LoadingStates';

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
});

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-pixelify',
  adjustFontFallback: false,
});

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-press-start',
});

export const metadata: Metadata = {
  title: 'K3HOOT.XYZ - Web3 Quiz Game Platform',
  description: 'The ultimate Web3 quiz platform on Solana - Play, Learn, and Earn!',
  keywords: ['web3', 'quiz', 'game', 'solana', 'blockchain', 'learn', 'earn', 'crypto'],
  authors: [{ name: 'K3HOOT Team' }],
  openGraph: {
    title: 'K3HOOT.XYZ - Web3 Quiz Game Platform',
    description: 'Play, Learn, and Earn on Solana Blockchain',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K3HOOT.XYZ',
    description: 'The ultimate Web3 quiz platform on Solana',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pixelifySans.variable} ${pressStart2P.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <ErrorBoundary>
          <ToastProvider>
            <WalletContextProvider>
              <GameProvider>
                <Suspense fallback={<PageLoader message="Loading K3HOOT..." />}>
                  <PixelEffect />
                  {children}
                </Suspense>
              </GameProvider>
            </WalletContextProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
