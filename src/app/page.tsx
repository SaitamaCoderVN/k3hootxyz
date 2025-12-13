'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LuminousWaves from '@/components/animations/LuminousWaves';
import Stars from '@/components/animations/Stars';
import NeonLogo from '@/components/ui/NeonLogo';
import BentoGrid from '@/components/ui/BentoGrid';
import LiveJackpot from '@/components/sections/LiveJackpot';
import TopWinners from '@/components/sections/TopWinners';
import RoadmapBento from '@/components/sections/RoadmapBento';
import TokenomicsBento from '@/components/sections/TokenomicsBento';
import BentoCard from '@/components/ui/BentoCard';
import { FaGamepad, FaRocket } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { PageWrapper } from '@/components/layout/MinHeightContainer';

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
});

export default function Home() {
  return (
    <PageWrapper minHeight="screen" className="text-white overflow-hidden" style={{ backgroundColor: '#0A001F' }}>
      <PixelEffect />
      <LuminousWaves />
      <Stars />
      <Header />

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 flex justify-center"
            >
              <NeonLogo />
            </motion.div>
            
            <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-8 leading-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #f97316 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              THE ULTIMATE<br />WEB3 QUIZ<br />PLATFORM
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-purple-300/80 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Challenge your knowledge on Solana. Compete globally. Earn crypto rewards.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/play" className="w-full sm:w-auto">
                <button 
                  className="group relative px-10 py-5 text-xl font-bold rounded-3xl overflow-hidden w-full sm:w-auto transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #fb923c)',
                    boxShadow: '0 0 40px rgba(249, 115, 22, 0.5), 0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    <FaGamepad className="w-5 h-5" />
                    Play Now
                  </span>
                </button>
              </Link>
              
              <Link href="/create" className="w-full sm:w-auto">
                <button 
                  className="group relative px-10 py-5 text-xl font-bold rounded-3xl overflow-hidden w-full sm:w-auto backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(168, 85, 247, 0.3)',
                    boxShadow: '0 0 40px rgba(168, 85, 247, 0.3), 0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    <FaRocket className="w-5 h-5" />
                    Create Quiz
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]"
          animate={{
            scale: [1.2, 0.8, 1.2],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </section>

      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <BentoGrid>
            <LiveJackpot />
            <TopWinners />
            <TokenomicsBento />
            <RoadmapBento />
            
            <BentoCard size="medium" glowColor="rgba(59, 130, 246, 0.5)" delay={0.4}>
              <div className="flex flex-col h-full justify-center text-center">
                <h3 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  10,000+
                </h3>
                <p className="text-purple-300/70">Active Players Worldwide</p>
              </div>
            </BentoCard>
            
            <BentoCard size="small" glowColor="rgba(236, 72, 153, 0.5)" delay={0.5}>
              <div className="flex flex-col h-full justify-center text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  500+
                </h3>
                <p className="text-purple-300/70 text-sm">Quiz Topics</p>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center backdrop-blur-xl rounded-[48px] p-12 md:p-16 border border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              boxShadow: '0 0 80px rgba(168, 85, 247, 0.2), 0 30px 60px rgba(0, 0, 0, 0.4)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
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
              <button 
                className="group relative px-12 py-6 text-2xl font-bold rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  boxShadow: '0 0 60px rgba(168, 85, 247, 0.6), 0 20px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Start Playing Now 🎮</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
}