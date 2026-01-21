'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { CursorTrail } from '@/components/interactive/CursorTrail';
import { FlashProvider } from '@/components/interactive/FlashEffect';
import { ScrollReveal } from '@/components/animations';
import { LeaderboardPreview } from '@/components/sections/LeaderboardPreview';
import BentoGrid from '@/components/ui/BentoGrid';
import BentoCard from '@/components/ui/BentoCard';


// Design System Imports
import { Typography, colors, typography } from '@/design-system';

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-32 overflow-hidden bg-bone">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <ScrollReveal type="fadeIn" delay={0.1}>
          <div className="mb-12 overflow-hidden">
            <Typography variant="body-xs" className="uppercase tracking-[0.5em] font-black text-black opacity-30">
              The platform truly protects your answers.
            </Typography>
          </div>
        </ScrollReveal>

        <ScrollReveal type="fadeIn" delay={0.2}>
          <h1 
            className="text-[clamp(3rem,12vw,12rem)] font-black leading-[0.85] tracking-[-0.06em] mb-16 text-black uppercase break-words"
            style={{ fontFamily: typography.fontFamily.display }}
          >
          AMA<br />
            <span className="opacity-20">QUIZ</span><br />
            REWARD
          </h1>
        </ScrollReveal>

        <div className="flex flex-col md:flex-row items-end justify-between gap-16 border-t-8 border-black pt-16">
            <ScrollReveal type="fadeIn" delay={0.3} className="max-w-2xl">
              <Typography variant="body-xl" className="font-black leading-tight text-black text-3xl uppercase tracking-tighter flex items-center">
                HOOT is the premier private inquiry protocol. High-fidelity responses, immediate settlements, zero-custody rewards.
              </Typography>
            </ScrollReveal>

            <ScrollReveal type="fadeIn" delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <Link href="/play" className="w-full sm:w-auto">
                  <button className="w-full px-12 py-6 bg-black text-white font-black uppercase tracking-[0.4em] hover:scale-[1.05] transition-all shadow-[12px_12px_0px_rgba(0,0,0,0.15)]">
                    Enter Arena
                  </button>
                </Link>
                <Link href="/create" className="w-full sm:w-auto">
                  <button className="w-full px-12 py-6 border-4 border-black font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-[12px_12px_0px_rgba(0,0,0,0.05)]">
                    Host Unit
                  </button>
                </Link>
              </div>
            </ScrollReveal>
        </div>
      </div>

      {/* Structured Geometry - Refined Watermarks */}
      <div className="absolute top-0 right-0 w-[40%] h-full border-l-4 border-black/5 pointer-events-none" />
    </section>
  );
};

export default function LandingPage() {
  return (
    <FlashProvider>
      <PageWrapper className="magic-cursor">
        <CursorTrail />
        <Header />
        
        <HeroSection />

        <section id="features" className="py-60 bg-paper border-y-8 border-black">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12">
            <div className="mb-32 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
              <div className="border-l-[12px] border-black pl-10 py-2">
                  <Typography variant="h1" className="text-black font-black uppercase tracking-tighter leading-none mb-2">01. Features</Typography>
                  <Typography variant="body-xs" className="uppercase tracking-[0.3em] font-black opacity-30">Industrial Grade Inquiry Protocol</Typography>
              </div>
               <div className="text-right border-t-4 border-black/5 pt-8 md:border-none md:pt-0">
                    <Typography variant="display-sm" className="font-black leading-none mb-2 flex items-center justify-end gap-2">
                     Network: Online
                    </Typography>
                    <Typography variant="body-xs" className="uppercase tracking-widest font-black opacity-30">Active Instances: 429</Typography>
               </div>
            </div>

            <BentoGrid className="gap-12">
              <BentoCard size="wide">
                <div className="h-full border-8 border-black bg-white p-12 flex flex-col md:flex-row gap-16 items-center shadow-[16px_16px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex-1">
                    <Typography variant="h2" className="mb-8 font-black uppercase leading-none">Encrypted Inquiry Engine</Typography>
                    <Typography variant="body-lg" className="mb-12 font-black text-2xl uppercase tracking-tighter leading-tight opacity-60">High-fidelity Solana settlements with verified non-custodial payouts at scale.</Typography>
                    <div className="flex flex-wrap gap-4">
                      {['Protocol-Level', 'No Fees', 'Instant Sync'].map(t => (
                        <span key={t} className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </BentoCard>

              <BentoCard size="large">
                <div className="h-full border-8 border-black bg-white overflow-hidden shadow-[16px_16px_0px_rgba(0,0,0,0.05)]">
                   <div className="p-10 bg-black text-white flex justify-between items-center">
                        <Typography variant="h3" className="font-black uppercase text-white">Global Standings</Typography>
                        <Typography variant="body-xs" className="font-black uppercase opacity-40">Live Feed</Typography>
                   </div>
                   <div className="p-10">
                        <LeaderboardPreview />
                   </div>
                </div>
              </BentoCard>

              <BentoCard size="medium">
                <div className="h-full border-8 border-black bg-white p-12 flex flex-col justify-between shadow-[16px_16px_0px_rgba(0,0,0,0.05)]">
                  <div>
                    <Typography variant="body-xs" className="mb-12 font-black uppercase tracking-[0.5em] opacity-30">Unit Returns</Typography>
                    <Typography variant="display-lg" className="mb-4 font-black text-6xl sm:text-7xl md:text-8xl leading-none">2.8K</Typography>
                    <Typography variant="h4" className="font-black uppercase tracking-tight">SOL Dispatched</Typography>
                  </div>
                  <div className="pt-10 border-t-4 border-black/5 flex justify-between items-center opacity-40">
                       <Typography variant="body-xs" className="uppercase font-black opacity-30 tracking-widest leading-none">On-Chain Verification</Typography>
                  </div>
                </div>
              </BentoCard>

              <BentoCard size="medium">
                <div className="h-full border-8 border-black bg-black text-white p-12 shadow-[16px_16px_0px_rgba(0,0,0,0.15)]">
                  <div className="flex justify-between items-start mb-20">
                     <Typography variant="body-xs" className="font-black uppercase tracking-[0.5em] text-white/30">Node Density</Typography>
                  </div>
                  <Typography variant="body-xl" className="mb-8 font-black text-3xl uppercase tracking-tighter leading-tight text-white">Universal access across 140+ countries.</Typography>
                  <div className="w-12 h-1 bg-white/20" />
                </div>
              </BentoCard>
            </BentoGrid>
          </div>
        </section>

        <section id="tokenomics" className="py-60 bg-bone">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12">
            <div className="mb-32 border-b-[12px] border-black pb-16 flex justify-between items-end">
              <Typography variant="h1" className="text-black font-black uppercase tracking-tighter leading-none">02. Tokenomics</Typography>
              <Typography variant="body-xs" className="font-black uppercase tracking-[0.5em] opacity-20 mb-4 hidden md:block">Supply Configuration</Typography>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-[8px] border-black">
              {[
                { label: 'Total Supply', value: '1,000,000,000' },
                { label: 'Player Rewards', value: '400,000,000' },
                { label: 'Liquidity Pool', value: '250,000,000' },
                { label: 'Ecosystem Fond', value: '350,000,000' },
              ].map((s, i) => (
                <div key={i} className="p-8 sm:p-12 md:p-16 border-black md:border-r-[8px] border-b-[8px] md:border-b-0 last:border-r-0 bg-white hover:bg-black group transition-all duration-500 overflow-hidden">
                  <Typography variant="body-xs" className="mb-8 md:mb-20 font-black uppercase tracking-[0.4em] opacity-20 group-hover:text-white/40 transition-all truncate">{s.label}</Typography>
                  <Typography variant="h2" className="font-black group-hover:text-white transition-all tracking-tighter text-3xl sm:text-4xl lg:text-5xl break-all line-clamp-1">{s.value}</Typography>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-80 bg-black text-white text-center relative overflow-hidden">
            <Typography variant="h1" className="text-[clamp(4rem,22vw,20rem)] mb-24 font-black leading-[0.65] tracking-[-0.08em] uppercase text-white relative z-10">
                Access<br />
                Now.
            </Typography>
            <div className="flex justify-center relative z-10 px-6">
                <Link href="/play" className="w-full max-w-2xl">
                    <button className="w-full py-10 border-8 border-white text-white font-black uppercase tracking-[0.5em] text-3xl hover:bg-white hover:text-black transition-all shadow-[24px_24px_0px_rgba(255,255,255,0.05)]">
                        Initialize
                    </button>
                </Link>
            </div>
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            </div>
        </section>

        <Footer />
      </PageWrapper>
    </FlashProvider>
  );
}