'use client';

import { FC, ReactNode, useMemo } from 'react';
import {
    ConnectionProvider,
    WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';

export function WalletContextProvider({ children }: { children: ReactNode }) {
    // Use custom RPC endpoint from env or fallback to public endpoint
    const url = useMemo(() => {
        const customRpc = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC;

        // If custom RPC is provided and different from default, use it
        if (customRpc && customRpc !== 'https://api.devnet.solana.com') {
            console.log('✅ Using custom RPC endpoint');
            return customRpc;
        }

        // Fallback to default devnet
        console.log('⚠️ Using default devnet RPC (may hit rate limits)');
        return clusterApiUrl('devnet');
    }, []);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={url}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
} 