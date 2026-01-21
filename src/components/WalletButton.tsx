'use client';

import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { 
    ssr: false,
    loading: () => (
      <button 
        className="px-6 py-2 border-2 border-black font-black uppercase text-[10px] tracking-widest opacity-20"
        disabled
      >
        Syncing...
      </button>
    ),
  }
);

export default function WalletButton() {
  return (
    <WalletMultiButtonDynamic 
      className="!bg-black !text-white !font-black !px-8 !py-4 !rounded-none !uppercase !tracking-[0.2em] !text-[12px] !transition-all !duration-200 hover:!scale-[1.02] active:!scale-95 !shadow-[12px_12px_0px_rgba(0,0,0,0.1)] !border-0 !h-auto !flex !items-center !justify-center" 
    />
  );
}