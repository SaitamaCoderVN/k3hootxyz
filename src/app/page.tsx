'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SectionNav } from '@/components/layout/SectionNav';
import LuminousWaves from '@/components/animations/LuminousWaves';
import Stars from '@/components/animations/Stars';
import NeonLogo from '@/components/ui/NeonLogo';
import { FaGamepad, FaRocket, FaCoins, FaTrophy, FaBolt } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useParallax } from '@/hooks/useParallax';

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function AnimatedStat({ value, label, prefix = '', suffix = '' }: { value: number; label: string; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { count, start } = useCountAnimation(value, 2000, true);

  if (isInView && count === 0) {
    start();
  }

  return (
    <div ref={ref}>
      <h3 className="text-7xl font-bold mb-4 text-orange-400" style={{ fontFamily: 'var(--font-display)' }}>
        {prefix}{count.toLocaleString()}{suffix}
      </h3>
      <p className="text-purple-300/70 text-lg" style={{ fontFamily: 'var(--font-space)' }}>
        {label}
      </p>
    </div>
  );
}

export default function Home() {
  const parallaxSlow = useParallax(0.3);
  const parallaxFast = useParallax(0.5);

  return (
    <PageWrapper minHeight="screen" className="text-white overflow-hidden scroll-smooth" style={{ backgroundColor: '#0A001F', scrollSnapType: 'y proximity' }}>
      <PixelEffect />
      <LuminousWaves />
      <Stars />
      <Header />
      <SectionNav />

      {/* HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-12 flex justify-center lg:justify-start"
            >
              <NeonLogo />
            </motion.div>
            
            <motion.h1
              className="text-[8rem] sm:text-[10rem] md:text-[12rem] lg:text-[16rem] font-bold mb-12 leading-[0.85] tracking-tighter"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #f97316 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 80px rgba(249, 115, 22, 0.3)',
              }}
            >
              THE<br />
              ULTIMATE<br />
              WEB3 QUIZ
            </motion.h1>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-6 mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/play" className="w-full sm:w-auto">
                <motion.button 
                  className="group relative px-12 py-6 text-2xl font-bold rounded-full overflow-hidden w-full sm:w-auto transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                    boxShadow: '0 0 60px rgba(249, 115, 22, 0.6), 0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                  whileHover={{ y: -8, boxShadow: '0 0 80px rgba(249, 115, 22, 0.8), 0 25px 50px rgba(0, 0, 0, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-3">
                    <FaGamepad className="w-6 h-6" />
                    Play Now
                  </span>
                </motion.button>
              </Link>
              
              <Link href="/create" className="w-full sm:w-auto">
                <motion.button 
                  className="group relative px-12 py-6 text-2xl font-bold rounded-full overflow-hidden w-full sm:w-auto backdrop-blur-xl transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                    boxShadow: '0 0 60px rgba(168, 85, 247, 0.4)',
                  }}
                  whileHover={{ 
                    y: -8, 
                    boxShadow: '0 0 80px rgba(168, 85, 247, 0.6), 0 25px 50px rgba(0, 0, 0, 0.5)',
                    borderColor: 'rgba(168, 85, 247, 0.8)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-3">
                    <FaRocket className="w-6 h-6" />
                    Create Quiz
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none"
          style={{ y: parallaxSlow.y }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 60, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[180px] pointer-events-none"
          style={{ y: parallaxFast.y }}
          animate={{
            scale: [1.3, 0.9, 1.3],
            x: [0, -60, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </section>

      {/* WEB3 POWERED SECTION */}
      <section id="web3-powered" className="relative min-h-screen flex items-center py-32 overflow-hidden border-t border-purple-500/10" style={{ scrollSnapAlign: 'start' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="lg:col-span-2">
              <motion.p
                className="text-orange-400 text-sm font-medium mb-6 tracking-[0.3em] uppercase"
                variants={itemVariants}
                style={{ fontFamily: 'var(--font-space)' }}
              >
                K3HOOT.XYZ EDITIONS
              </motion.p>
              
              <motion.h2
                className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] font-bold leading-[0.85] tracking-tighter mb-8"
                variants={itemVariants}
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                WEB3<br />POWERED
              </motion.h2>
            </div>

            <motion.div
              className="backdrop-blur-xl rounded-[32px] p-8 border border-white/10 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                boxShadow: '0 0 60px rgba(168, 85, 247, 0.2)',
              }}
              variants={itemVariants}
              whileHover={{
                boxShadow: '0 0 100px rgba(168, 85, 247, 0.5), 0 20px 40px rgba(0, 0, 0, 0.3)',
                y: -8,
                borderColor: 'rgba(168, 85, 247, 0.6)',
              }}
              transition={{ duration: 0.3 }}
            >
              <FaBolt className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Built on Solana
              </h3>
              <p className="text-purple-300/70 leading-relaxed mb-6" style={{ fontFamily: 'var(--font-space)' }}>
                Lightning-fast transactions with near-zero fees. Every quiz answer is recorded on-chain for complete transparency.
              </p>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-purple-300/60">Instant payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-purple-300/60">Decentralized scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  <span className="text-purple-300/60">Non-custodial wallets</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* EARN REWARDS SECTION */}
      <section id="earn-rewards" className="relative min-h-screen flex items-center py-32 overflow-hidden border-t border-purple-500/10" style={{ scrollSnapAlign: 'start' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="backdrop-blur-xl rounded-[32px] p-12 border border-white/10 text-center transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                boxShadow: '0 0 60px rgba(249, 115, 22, 0.3)',
              }}
              variants={itemVariants}
              whileHover={{
                boxShadow: '0 0 120px rgba(249, 115, 22, 0.6), 0 20px 40px rgba(0, 0, 0, 0.3)',
                y: -8,
                borderColor: 'rgba(249, 115, 22, 0.6)',
              }}
              transition={{ duration: 0.3 }}
            >
              <FaCoins className="w-16 h-16 text-orange-400 mb-6 mx-auto" />
              <AnimatedStat value={2847} label="SOL Distributed" />
              <div className="mt-8 pt-8 border-t border-white/10">
                <AnimatedStat value={324} label="Total Prize Pool" prefix="$" suffix="K" />
              </div>
            </motion.div>

            <div className="lg:col-span-2">
              <motion.p
                className="text-orange-400 text-sm font-medium mb-6 tracking-[0.3em] uppercase"
                variants={itemVariants}
                style={{ fontFamily: 'var(--font-space)' }}
              >
                PLAY-TO-EARN
              </motion.p>
              
              <motion.h2
                className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] font-bold leading-[0.85] tracking-tighter mb-8"
                variants={itemVariants}
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                EARN<br />REWARDS
              </motion.h2>

              <motion.p
                className="text-xl text-purple-300/70 leading-relaxed max-w-2xl"
                variants={itemVariants}
                style={{ fontFamily: 'var(--font-space)' }}
              >
                Answer correctly, climb the leaderboard, and earn $K3 tokens. Top performers receive SOL rewards directly to their wallet.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMPETE SECTION */}
      <section id="compete" className="relative min-h-screen flex items-center py-32 overflow-hidden border-t border-purple-500/10" style={{ scrollSnapAlign: 'start' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="lg:col-span-2">
              <motion.p
                className="text-purple-400 text-sm font-medium mb-6 tracking-[0.3em] uppercase"
                variants={itemVariants}
                style={{ fontFamily: 'var(--font-space)' }}
              >
                GLOBAL LEADERBOARDS
              </motion.p>
              
              <motion.h2
                className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] font-bold leading-[0.85] tracking-tighter mb-8"
                variants={itemVariants}
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                COMPETE<br />GLOBALLY
              </motion.h2>
            </div>

            <motion.div
              className="backdrop-blur-xl rounded-[32px] p-8 border border-white/10 transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                boxShadow: '0 0 60px rgba(236, 72, 153, 0.3)',
              }}
              variants={itemVariants}
              whileHover={{
                boxShadow: '0 0 100px rgba(236, 72, 153, 0.6), 0 20px 40px rgba(0, 0, 0, 0.3)',
                y: -8,
                borderColor: 'rgba(236, 72, 153, 0.6)',
              }}
              transition={{ duration: 0.3 }}
            >
              <FaTrophy className="w-12 h-12 text-pink-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Real-Time Rankings
              </h3>
              <p className="text-purple-300/70 leading-relaxed mb-6" style={{ fontFamily: 'var(--font-space)' }}>
                Compete against players worldwide. Track your progress, challenge friends, and dominate the leaderboard.
              </p>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-purple-300/60">Live score updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-purple-300/60">Seasonal tournaments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  <span className="text-purple-300/60">Achievement badges</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TOKENOMICS SECTION */}
      <section id="tokenomics" className="relative min-h-screen flex items-center py-32 overflow-hidden border-t border-purple-500/10" style={{ scrollSnapAlign: 'start' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <p
              className="text-purple-400 text-sm font-medium mb-6 tracking-[0.3em] uppercase"
              style={{ fontFamily: 'var(--font-space)' }}
            >
              $K3 TOKEN
            </p>
            
            <h2
              className="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] font-bold leading-[0.85] tracking-tighter"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TOKENOMICS
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { label: 'Total Supply', value: '1B', color: 'orange' },
              { label: 'Player Rewards', value: '40%', color: 'purple' },
              { label: 'Liquidity Pool', value: '25%', color: 'pink' },
              { label: 'Team & Dev', value: '15%', color: 'blue' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="backdrop-blur-xl rounded-[32px] p-8 border border-white/10 text-center transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  boxShadow: `0 0 60px rgba(${
                    stat.color === 'orange' ? '249, 115, 22' :
                    stat.color === 'purple' ? '168, 85, 247' :
                    stat.color === 'pink' ? '236, 72, 153' : '59, 130, 246'
                  }, 0.2)`,
                }}
                variants={itemVariants}
                whileHover={{
                  boxShadow: `0 0 100px rgba(${
                    stat.color === 'orange' ? '249, 115, 22' :
                    stat.color === 'purple' ? '168, 85, 247' :
                    stat.color === 'pink' ? '236, 72, 153' : '59, 130, 246'
                  }, 0.5), 0 20px 40px rgba(0, 0, 0, 0.3)`,
                  y: -8,
                  scale: 1.05,
                }}
                transition={{ duration: 0.3 }}
              >
                <h3 
                  className="text-6xl font-bold mb-4"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    color: stat.color === 'orange' ? '#fb923c' :
                           stat.color === 'purple' ? '#a855f7' :
                           stat.color === 'pink' ? '#ec4899' : '#3b82f6'
                  }}
                >
                  {stat.value}
                </h3>
                <p className="text-purple-300/70 text-sm uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto text-center mt-20 backdrop-blur-xl rounded-[48px] p-12 md:p-16 border border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              boxShadow: '0 0 80px rgba(168, 85, 247, 0.2)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #f97316, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              READY TO PLAY?
            </h2>
            <p className="text-xl md:text-2xl text-purple-300/80 mb-10">
              Join thousands earning crypto through knowledge
            </p>
            <Link href="/play">
              <motion.button 
                className="group relative px-12 py-6 text-2xl font-bold rounded-full overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #a855f7)',
                  boxShadow: '0 0 60px rgba(249, 115, 22, 0.6), 0 20px 40px rgba(0, 0, 0, 0.4)',
                }}
                whileHover={{ 
                  y: -8,
                  boxShadow: '0 0 100px rgba(249, 115, 22, 0.8), 0 25px 50px rgba(0, 0, 0, 0.5)'
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Start Playing Now 🎮</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
}