'use client';

import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { 
    ssr: false,
    loading: () => (
      <button 
        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
        disabled
      >
        Loading...
      </button>
    ),
  }
);

export default function WalletButton() {
  const { connected, wallet } = useWallet();
  
  return (
    <WalletMultiButtonDynamic 
      className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !text-white !font-semibold !px-4 !py-2 !rounded-lg !transition-all !duration-200 !border-0" 
    />
  );
} 