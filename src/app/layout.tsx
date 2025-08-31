import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletContextProvider } from '@/contexts/WalletContextProvider';
import { GameProvider } from '@/contexts/GameContext';
import { VT323, Orbitron } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/LoadingStates';

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-pixel',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-heading',
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
    <html lang="en" className={`${vt323.variable} ${orbitron.variable}`}>
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
