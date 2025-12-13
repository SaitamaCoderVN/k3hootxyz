'use client';

import BentoCard from '@/components/ui/BentoCard';
import { motion } from 'framer-motion';

const tokenData = [
  { label: 'Community', percentage: 40, color: '#a855f7' },
  { label: 'Rewards', percentage: 30, color: '#ec4899' },
  { label: 'Team', percentage: 20, color: '#3b82f6' },
  { label: 'Treasury', percentage: 10, color: '#f59e0b' },
];

export default function TokenomicsBento() {
  return (
    <BentoCard size="large" glowColor="rgba(168, 85, 247, 0.6)" delay={0.3}>
      <div className="flex flex-col h-full">
        <h3 className="text-xl md:text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          $K3 TOKENOMICS
        </h3>
        
        <div className="flex-1 flex flex-col justify-center space-y-4">
          {tokenData.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-purple-200 font-medium">{item.label}</span>
                <span className="text-white font-bold">{item.percentage}%</span>
              </div>
              <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 20px ${item.color}80`,
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-purple-300/70 text-sm mb-1">Total Supply</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>1B K3</p>
            </div>
            <div>
              <p className="text-purple-300/70 text-sm mb-1">Network</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>SOLANA</p>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
