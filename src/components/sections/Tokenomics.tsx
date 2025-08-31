'use client';

import { motion } from 'framer-motion';
import { FaCoins, FaLock, FaUsers, FaCalendarAlt, FaTwitter, FaExchangeAlt } from 'react-icons/fa';

const tokenomicsData = [
  {
    label: 'Total Supply',
    value: '1,000,000,000',
    icon: <FaCoins className="w-5 h-5" />,
    color: 'text-yellow-400'
  },
  {
    label: 'Locked for Airdrops',
    value: '500,000,000',
    icon: <FaLock className="w-5 h-5" />,
    color: 'text-green-400'
  },
  {
    label: 'Free Float',
    value: '500,000,000',
    icon: <FaUsers className="w-5 h-5" />,
    color: 'text-blue-400'
  },
  {
    label: 'Buy/Sell Tax',
    value: '0%',
    icon: <FaExchangeAlt className="w-5 h-5" />,
    color: 'text-purple-400'
  }
];

const features = [
  {
    icon: <FaCalendarAlt className="w-6 h-6" />,
    title: 'Weekly Airdrops',
    description: 'Regular token distribution to active game hosts'
  },
  {
    icon: <FaTwitter className="w-6 h-6" />,
    title: 'Social Requirement',
    description: 'Share your stream link on X to qualify for airdrops'
  },
  {
    icon: <FaUsers className="w-6 h-6" />,
    title: 'Proportional Allocation',
    description: 'Rewards based on number of livestreams hosted'
  }
];

export default function Tokenomics() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4 sm:mb-6">
            K3HOOT Tokenomics
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-purple-900/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-purple-500/20">
              <span className="text-lg font-bold text-purple-300">Ticker: </span>
              <span className="text-xl font-bold text-yellow-400">$K3</span>
            </div>
            <div className="bg-purple-900/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-purple-500/20">
              <span className="text-lg font-bold text-purple-300">Chain: </span>
              <span className="text-xl font-bold text-green-400">Solana</span>
            </div>
          </div>
          <p className="text-lg text-purple-300 max-w-2xl mx-auto">
            Fair and transparent tokenomics designed to reward active community members and game hosts
          </p>
        </motion.div>

        {/* Token Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {tokenomicsData.map((item, index) => (
            <motion.div
              key={item.label}
              className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`flex items-center justify-center mb-3 ${item.color}`}>
                {item.icon}
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {item.value}
              </div>
              <div className="text-sm text-gray-400">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Airdrop Mechanism */}
        <motion.div
          className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Airdrop Mechanism
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-purple-300 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-3">
              Token Details
            </h4>
            <ul className="space-y-2 text-sm text-purple-300">
              <li>• Token Address: <span className="text-yellow-400">TBA</span></li>
              <li>• Primary DEX: <span className="text-blue-400">Meteora</span></li>
              <li>• Contract: <span className="text-green-400">Verified & Audited</span></li>
            </ul>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-3">
              Distribution Schedule
            </h4>
            <ul className="space-y-2 text-sm text-purple-300">
              <li>• Frequency: <span className="text-yellow-400">Weekly</span></li>
              <li>• Target: <span className="text-blue-400">Active Game Hosts</span></li>
              <li>• Requirement: <span className="text-green-400">X Post Sharing</span></li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
