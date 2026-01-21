'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, colors } from '@/design-system';

import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function JoinGamePage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoin = async () => {
    if (!pin || !playerName) {
      setError('Please enter PIN and name');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const res = await fetch('/api/game/join-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          playerName,
          walletAddress: publicKey?.toString() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.sessionId) {
        // Store participant token for reconnection
        if (data.participantToken) {
          localStorage.setItem(`participant_token_${pin}`, data.participantToken);
          localStorage.setItem(`participant_id_${pin}`, data.participantId);
        }

        // Redirect to play page
        router.push(`/multiplayer/play/${pin}?participantId=${data.participantId}`);
      } else {
        setError(data.error || 'Failed to join game');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setJoining(false);
    }
  };

  if (!mounted) return null;

  return (
    <PageTemplate
      title="Protocol Access"
      subtitle="Input Credentials to Initialize Inquiry Session"
    >
      <div className="max-w-xl mx-auto pt-12 pb-32 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="border-8 border-black p-12 bg-white shadow-[24px_24px_0px_#00000010]">
            <div className="space-y-12">
              <div className="flex justify-between items-start border-b-4 border-black pb-8">
                <div>
                  <Typography variant="body-xs" className="font-black uppercase tracking-[0.3em] opacity-40 mb-2">
                    Socket Port
                  </Typography>
                  <Typography variant="h3" className="font-black uppercase leading-none">
                    Access Token (PIN)
                  </Typography>
                </div>
                <div className="w-16 h-16 border-4 border-black flex items-center justify-center grayscale font-bold">
                  JS
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block mb-4 font-black uppercase text-[10px] tracking-widest opacity-60">
                    INITIALIZE CONNECTION
                  </label>
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000 000"
                      className="w-full bg-bone border-4 border-black p-6 font-black text-3xl sm:text-4xl md:text-5xl text-center tracking-[0.4em] focus:bg-white focus:shadow-[12px_12px_0px_#00000005] outline-none transition-all placeholder:opacity-10"
                      maxLength={6}
                    />
                </div>

                <div>
                  <label className="block mb-4 font-black uppercase text-[10px] tracking-widest opacity-60">
                    Operator Identity
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="ENTER CODENAME"
                    className="w-full bg-bone border-4 border-black p-6 font-black uppercase tracking-widest focus:bg-white focus:shadow-[12px_12px_0px_#00000005] outline-none transition-all"
                  />
                </div>

                {!connected && (
                  <div className="p-8 border-4 border-black border-dashed bg-bone/50 text-center">
                    <Typography variant="body-xs" className="font-black uppercase tracking-widest opacity-40 mb-6 leading-relaxed">
                      Optional: Connect wallet to claim assets upon successful completion
                    </Typography>
                    <div className="flex justify-center">
                      <WalletMultiButton className="!bg-black !text-white !font-black !px-10 !py-5 !rounded-none !uppercase !tracking-[0.2em] !text-[12px] !transition-all !duration-200 hover:!scale-[1.02] active:!scale-95 !shadow-[12px_12px_0px_rgba(0,0,0,0.1)] !border-0 !h-auto !flex !items-center !justify-center" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 border-4 border-red-600 bg-red-50 text-center animate-shake">
                    <Typography variant="body-xs" className="font-black uppercase text-red-600 tracking-widest">
                      {error}
                    </Typography>
                  </div>
                )}

                <button
                  onClick={handleJoin}
                  disabled={joining || !pin || !playerName || pin.length !== 6}
                  className={`
                    w-full py-6 font-black uppercase tracking-[0.4em] transition-all
                    ${pin.length === 6 && playerName ? 'bg-black text-white hover:scale-[1.01] active:translate-y-1 shadow-[12px_12px_0px_#00000020]' : 'bg-bone text-black/20 border-4 border-black/10 cursor-not-allowed'}
                  `}
                >
                  {joining ? 'LINKING...' : 'INITIATE CONNECTION'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTemplate>
  );
}
