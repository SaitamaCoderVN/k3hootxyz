'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';
import GlowingButton from '@/components/ui/GlowingButton';
import CatchableRocket from '@/components/interactive/CatchableRocket';
import Tokenomics from '@/components/sections/Tokenomics';
import Roadmap from '@/components/sections/Roadmap';
import { FaRocket, FaGamepad, FaTrophy, FaUsers, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import CountUp from 'react-countup';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
});

const features = [
  {
    icon: <FaRocket className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: 'Web3 Powered',
    description: 'Built on Solana for lightning-fast transactions and true ownership',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: <FaGamepad className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: 'Real-time Multiplayer (Soon)',
    description: 'Compete with players worldwide in exciting quiz battles by Magicblock infrastructure',
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    icon: <FaTrophy className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: 'Earn Rewards',
    description: 'Win SOL tokens and exclusive NFTs for your achievements',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: <FaUsers className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: 'Community Driven',
    description: 'Create and share your own quizzes with the community',
    gradient: 'from-green-500 to-blue-500'
  },
  {
    icon: <FaChartLine className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: 'Play to Earn',
    description: 'Turn your knowledge into real crypto rewards',
    gradient: 'from-red-500 to-purple-500'
  },
  {
    icon: <FaShieldAlt className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: 'Secure & Fair',
    description: 'Blockchain-verified results ensure transparent gameplay',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const stats = [
  { label: 'Active Players', value: 50000, suffix: '+' },
  { label: 'Quizzes Created', value: 10000, suffix: '+' },
  { label: 'SOL Distributed', value: 1000, suffix: '' },
  { label: 'Daily Games', value: 5000, suffix: '+' }
];

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <PixelEffect />
      <SpaceBackground />
      <Stars />
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6 sm:mb-8"
            >
              <span className="inline-block px-3 sm:px-4 py-2 mb-4 sm:mb-6 text-xs sm:text-sm font-medium text-purple-300 bg-purple-900/30 rounded-full border border-purple-500/30">
                🚀 Launch Week: Double Rewards for Early Players!
              </span>
            </motion.div>
            
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 gradient-text leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              K3HOOT.XYZ
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-300 mb-3 sm:mb-4 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The Ultimate Web3 Quiz Platform
            </motion.p>
            
            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-400 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Challenge your knowledge, compete with players worldwide, and earn crypto rewards on the fastest blockchain
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/play" className="w-full sm:w-auto">
                <GlowingButton variant="primary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                  <FaGamepad className="inline-block mr-2" />
                  Play Now
                </GlowingButton>
              </Link>
              <Link href="/create" className="w-full sm:w-auto">
                <GlowingButton variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                  <FaRocket className="inline-block mr-2" />
                  Create Quiz
                </GlowingButton>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Animated background elements */}
        <motion.div
          className="absolute top-1/3 -left-16 sm:-left-32 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/4 -right-16 sm:-right-32 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1.2, 0.8, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-text mb-2">
                  {isVisible && (
                    <CountUp
                      start={0}
                      end={stat.value}
                      duration={2.5}
                      separator=","
                      suffix={stat.suffix}
                    />
                  )}
                </h3>
                <p className="text-purple-300 text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Why Choose K3HOOT?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${feature.gradient.split(' ')[1]}, ${feature.gradient.split(' ')[3]})`
                  }}
                />
                <div className="relative bg-purple-900/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-purple-500/20 h-full group-hover:border-purple-500/40 transition-all duration-300">
                  <div className={`inline-flex p-2 sm:p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-4 sm:mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-purple-300 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-gradient-to-b from-purple-900/10 to-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Start Playing in 4 Simple Steps
          </motion.h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />
              {[
                { step: 'Connect Wallet', desc: 'Link your Solana wallet to get started', icon: '🔗' },
                { step: 'Choose or Create', desc: 'Join an existing quiz or create your own', icon: '🎯' },
                { step: 'Play & Compete', desc: 'Answer questions and race against time', icon: '⚡' },
                { step: 'Earn Rewards', desc: 'Win SOL tokens and climb the leaderboard', icon: '💰' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative pl-12 sm:pl-20 pb-8 sm:pb-12 last:pb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="absolute left-2 sm:left-6 -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div className="bg-purple-900/20 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-purple-500/20">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="text-2xl sm:text-4xl">{item.icon}</span>
                      <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-white">
                          Step {index + 1}: {item.step}
                        </h3>
                        <p className="text-purple-300 text-sm sm:text-base lg:text-lg leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Game Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-4 sm:mb-6">
              Mini Game Preview
            </h2>
            <p className="text-lg sm:text-xl text-purple-300 max-w-2xl mx-auto leading-relaxed">
              Get a taste of our interactive features before diving into quiz rooms!
            </p>
          </motion.div>
          
          <div className="relative min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
            <CatchableRocket />
            <motion.div
              className="text-center mt-6 sm:mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-3 sm:mb-4">
                Try to catch the rocket! 🚀
              </h3>
              <p className="text-lg sm:text-xl text-purple-300 leading-relaxed">
                More mini-games and surprises await in our quiz rooms!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <Tokenomics />

      {/* Roadmap Section */}
      <Roadmap />

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-purple-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 gradient-text">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-lg sm:text-xl text-purple-300 mb-6 sm:mb-8 leading-relaxed">
              Join thousands of players earning crypto while having fun!
            </p>
            <Link href="/play" className="inline-block w-full sm:w-auto">
              <GlowingButton variant="primary" className="text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto">
                Start Playing Now 🎮
              </GlowingButton>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
