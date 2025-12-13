'use client';

import BentoCard from '@/components/ui/BentoCard';
import { FaRocket, FaGamepad, FaCoins, FaGlobe } from 'react-icons/fa';

const roadmapItems = [
  {
    quarter: 'Q1 2025',
    title: 'Platform Launch',
    icon: <FaRocket className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    quarter: 'Q2 2025',
    title: 'Multiplayer',
    icon: <FaGamepad className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    quarter: 'Q3 2025',
    title: 'Token Launch',
    icon: <FaCoins className="w-5 h-5" />,
    color: 'from-orange-500 to-yellow-500',
  },
  {
    quarter: 'Q4 2025',
    title: 'Global Expansion',
    icon: <FaGlobe className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
  },
];

export default function RoadmapBento() {
  return (
    <>
      {roadmapItems.map((item, index) => (
        <BentoCard
          key={item.quarter}
          size="small"
          glowColor={`rgba(139, 92, 246, ${0.3 + index * 0.1})`}
          delay={0.1 * index}
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <div
                className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${item.color} mb-4`}
              >
                {item.icon}
              </div>
              <h3 className="text-sm font-medium text-purple-300/70 uppercase tracking-wider mb-2">
                {item.quarter}
              </h3>
              <p className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                {item.title}
              </p>
            </div>
          </div>
        </BentoCard>
      ))}
    </>
  );
}
