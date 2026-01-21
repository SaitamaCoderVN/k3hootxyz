import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletContextProvider } from '@/contexts/WalletContextProvider';
import { IBM_Plex_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/LoadingStates';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: 'HOOT.XYZ - Private Reward-Based Question Answering Protocol',
  description: 'The premier secure inquiry infrastructure on Solana. Private answering, immediate settlements, and zero-custody reward disbursement.',
  keywords: ['private reward', 'inquiry protocol', 'solana', 'blockchain', 'secure answering', 'decentralized', 'rewards'],
  authors: [{ name: 'HOOT Team' }],
  openGraph: {
    title: 'HOOT.XYZ - Private Reward-Based Question Answering',
    description: 'Secure, Private, and Instant Rewards on Solana',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HOOT.XYZ',
    description: 'The premier secure inquiry infrastructure on Solana',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <ToastProvider>
            <WalletContextProvider>
              <Suspense fallback={<PageLoader message="Loading K3HOOT..." />}>
                {children}
              </Suspense>
            </WalletContextProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}