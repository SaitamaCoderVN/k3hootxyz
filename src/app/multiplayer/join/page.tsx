'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Typography, NeonButton, GlassCard, colors } from '@/design-system';
import { FaGamepad } from 'react-icons/fa';
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
      title="Join Multiplayer Game"
      subtitle="Enter the game PIN to join"
    >
      <div className="max-w-md mx-auto pt-8 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="purple" size="lg">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.purple[500]}20, ${colors.primary.pink[500]}10)`,
                    border: `1px solid ${colors.primary.purple[400]}30`
                  }}
                >
                  <FaGamepad className="text-5xl" style={{ color: colors.primary.purple[400] }} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2">
                    <Typography variant="body" color={colors.text.secondary}>
                      Game PIN
                    </Typography>
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit PIN"
                    className="w-full px-4 py-3 rounded-lg font-mono text-2xl text-center tracking-widest"
                    style={{
                      background: `${colors.background.secondary}80`,
                      border: `2px solid ${colors.primary.purple[500]}40`,
                      color: colors.text.primary
                    }}
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    <Typography variant="body" color={colors.text.secondary}>
                      Your Name
                    </Typography>
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg"
                    style={{
                      background: `${colors.background.secondary}80`,
                      border: `2px solid ${colors.primary.purple[500]}40`,
                      color: colors.text.primary
                    }}
                  />
                </div>

                {!connected && (
                  <div className="pt-2">
                    <Typography variant="body-sm" color={colors.text.muted} className="mb-2 text-center">
                      Optional: Connect wallet to claim rewards if you win
                    </Typography>
                    <div className="flex justify-center">
                      <WalletMultiButton />
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    className="p-3 rounded-lg text-center"
                    style={{
                      background: `${colors.state.error}20`,
                      border: `1px solid ${colors.state.error}40`
                    }}
                  >
                    <Typography variant="body-sm" color={colors.state.error}>
                      {error}
                    </Typography>
                  </div>
                )}

                <NeonButton
                  onClick={handleJoin}
                  loading={joining}
                  disabled={!pin || !playerName || pin.length !== 6}
                  neonColor="purple"
                  size="lg"
                  fullWidth
                >
                  Join Game
                </NeonButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </PageTemplate>
  );
}
