'use client';

import { motion } from 'framer-motion';
import { FaRocket, FaCoins, FaUsers, FaChartLine, FaGamepad, FaHandshake } from 'react-icons/fa';

const roadmapData = [
  {
    quarter: 'Q3 2025',
    title: 'Alpha Launch',
    status: 'current',
    icon: <FaRocket className="w-6 h-6" />,
    items: [
      'Alpha Product: K3hoot Gaming Platform',
      'Boost community, marketing, build branding',
      'Airdrop Campaign through K3hoot Platform: Weekly, livestream-based',
      'Tech Partnerships: Arcium, Magicblock',
      'Open Leaderboard / month'
    ]
  },
  {
    quarter: 'Q4 2025',
    title: 'Beta & Token Launch',
    status: 'upcoming',
    icon: <FaCoins className="w-6 h-6" />,
    items: [
      'Beta Product: K3hoot Gaming Platform',
      'Token Launch: $K3HOOT fair launch',
      'Airdrop Campaign: Weekly, livestream-based',
      'Partnerships: Meteora, dev.fun'
    ]
  },
  {
    quarter: 'Q1 2026',
    title: 'Feature Expansion',
    status: 'future',
    icon: <FaChartLine className="w-6 h-6" />,
    items: [
      'Feature Improvements: Advanced analytics',
      'Creator Program: Reward top hosts',
      'Community Engagement: 1000+ monthly users'
    ]
  },
  {
    quarter: 'Q2 2026',
    title: 'Growth & Partnerships',
    status: 'future',
    icon: <FaHandshake className="w-6 h-6" />,
    items: [
      'CEX Listing: Tier-2 CEX listing',
      'Stream Analytics: Host dashboard release',
      'Partnership Expansion: More gaming partnerships'
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'current':
      return 'from-green-500 to-emerald-500';
    case 'upcoming':
      return 'from-yellow-500 to-orange-500';
    case 'future':
      return 'from-purple-500 to-pink-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'current':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'upcoming':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'future':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function Roadmap() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 relative bg-gradient-to-b from-black to-purple-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4 sm:mb-6">
            $K3HOOT Roadmap
          </h2>
          <p className="text-lg text-purple-300 max-w-2xl mx-auto">
            Our journey to revolutionize Web3 gaming and create the ultimate quiz platform
          </p>
        </motion.div>

        {/* Roadmap Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 transform md:-translate-x-1/2" />

          {roadmapData.map((phase, index) => (
            <motion.div
              key={phase.quarter}
              className={`relative flex items-start mb-12 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              {/* Timeline Node */}
              <div className="absolute left-2 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-black z-10" />

              {/* Content Card */}
              <div className={`ml-12 md:ml-0 ${
                index % 2 === 0 ? 'md:mr-8 md:text-right' : 'md:ml-8'
              } md:w-1/2`}>
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(phase.status)}`}>
                      {phase.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {phase.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-300 font-medium">
                          {phase.quarter}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(phase.status)}`}>
                          {phase.status === 'current' ? 'In Progress' :
                           phase.status === 'upcoming' ? 'Next' : 'Planned'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        className="text-sm text-purple-300 flex items-start gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + itemIndex * 0.1 }}
                      >
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join the Journey
            </h3>
            <p className="text-purple-300 mb-6">
              Be part of the Web3 gaming revolution. Start hosting quizzes today and earn your share of the $K3HOOT ecosystem!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <span className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium">
                🎮 Alpha Live Now
              </span>
              <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium">
                💰 Weekly Airdrops
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
