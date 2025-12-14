'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SectionNav } from '@/components/layout/SectionNav';
import NeonLogo from '@/components/ui/NeonLogo';
import { FaGamepad, FaRocket, FaCoins, FaTrophy, FaBolt } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { PageWrapper } from '@/components/layout/MinHeightContainer';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useParallax } from '@/hooks/useParallax';
import { CursorTrail } from '@/components/interactive/CursorTrail';
import { FlashProvider, useFlash } from '@/components/interactive/FlashEffect';
import { Tilt3D } from '@/components/ui/Tilt3D';
import { memo } from 'react';

// Design System Imports
import { Typography, NeonButton, GlassCard, colors, shadows, animations, spacing, motionVariants } from '@/design-system';

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
});

const WebGLBackground = dynamic(() => import('@/components/animations/WebGLBackground').then(mod => mod.WebGLBackground), {
  ssr: false,
});


const AnimatedStat = memo(function AnimatedStat({ value, label, prefix = '', suffix = '' }: { value: number; label: string; prefix?: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { count, start } = useCountAnimation(value, 2000, true);

  useEffect(() => {
    if (isInView && count === 0) {
      start();
    }
  }, [isInView, count, start]);

  return (
    <div ref={ref}>
      <Typography variant="display-xs" gradient="orange" className="mb-4">
        {prefix}{count.toLocaleString()}{suffix}
      </Typography>
      <Typography variant="body-lg" color={`${colors.primary.purple[300]}b3`}>
        {label}
      </Typography>
    </div>
  );
});

export default function Home() {
  const parallaxSlow = useParallax(0.3);
  const parallaxFast = useParallax(0.5);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const heroZ = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <FlashProvider>
      <PageWrapper minHeight="screen" className="text-white overflow-hidden scroll-smooth" style={{ backgroundColor: colors.background.primary, scrollSnapType: 'y proximity' }}>
        <WebGLBackground />
        <CursorTrail />
        <PixelEffect />
        <Header />
        <SectionNav />

        {/* HERO SECTION */}
        <section ref={heroRef} id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ scrollSnapAlign: 'start' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Tilt3D intensity={10}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: parseFloat(animations.duration.slower) / 1000 }}
                  className="mb-12 flex justify-center lg:justify-start"
                >
                  <NeonLogo />
                </motion.div>
              </Tilt3D>
              
              <Typography
                variant="display-2xl"
                gradient="orange-purple"
                as="h1"
                className="mb-12 leading-[0.85] tracking-tighter"
                style={{
                  textShadow: '0 0 80px rgba(249, 115, 22, 0.3)',
                }}
              >
                THE<br />
                ULTIMATE<br />
                WEB3 QUIZ
              </Typography>
              
              <HeroButtons />
            </div>
          </div>

          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none"
            style={{ 
              y: parallaxSlow.y,
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)',
            }}
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
            style={{ 
              y: parallaxFast.y,
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)',
            }}
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
              variants={motionVariants.container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="lg:col-span-2">
                <motion.div
                  className="mb-6 tracking-[0.3em] uppercase"
                  variants={motionVariants.item}
                >
                  <Typography variant="body-xs" color={colors.primary.orange[400]}>
                    K3HOOT.XYZ EDITIONS
                  </Typography>
                </motion.div>
                
                <motion.div variants={motionVariants.item}>
                  <Typography variant="display-lg" gradient="purple-pink" className="mb-8">
                    WEB3<br />POWERED
                  </Typography>
                </motion.div>
              </div>

              <GlassCard variant="purple" hover={true} {...motionVariants.item as any}>
                <FaBolt style={{ fontSize: '3rem', color: colors.primary.purple[400], marginBottom: spacing[6] }} />
                <Typography variant="h4" className="mb-4">
                  Built on Solana
                </Typography>
                <Typography variant="body" color={`${colors.primary.purple[300]}b3`} className="mb-6">
                  Lightning-fast transactions with near-zero fees. Every quiz answer is recorded on-chain for complete transparency.
                </Typography>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.primary.orange[400], borderRadius: '9999px' }} />
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
                      Instant payouts
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.primary.purple[400], borderRadius: '9999px' }} />
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
                      Decentralized scoring
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.primary.pink[400], borderRadius: '9999px' }} />
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
                      Non-custodial wallets
                    </Typography>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* EARN REWARDS SECTION */}
        <section id="earn-rewards" className="relative min-h-screen flex items-center py-32 overflow-hidden border-t border-purple-500/10" style={{ scrollSnapAlign: 'start' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center"
              variants={motionVariants.container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <GlassCard variant="orange" hover={true} className="text-center" {...motionVariants.item as any}>
                <div className="flex justify-center mb-6">
                  <FaCoins style={{ fontSize: '4rem', color: colors.primary.orange[400] }} />
                </div>
                <AnimatedStat value={2847} label="SOL Distributed" />
                <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.semantic.border }}>
                  <AnimatedStat value={324} label="Total Prize Pool" prefix="$" suffix="K" />
                </div>
              </GlassCard>

              <div className="lg:col-span-2">
                <motion.div variants={motionVariants.item} className="mb-6">
                  <Typography variant="body-xs" color={colors.primary.orange[400]} className="tracking-[0.3em] uppercase">
                    PLAY-TO-EARN
                  </Typography>
                </motion.div>
                
                <motion.div variants={motionVariants.item}>
                  <Typography variant="display-lg" gradient="orange" className="mb-8">
                    EARN<br />REWARDS
                  </Typography>
                </motion.div>

                <motion.div variants={motionVariants.item}>
                  <Typography variant="body-xl" color={`${colors.primary.purple[300]}b3`} className="max-w-2xl">
                    Answer correctly, climb the leaderboard, and earn $K3 tokens. Top performers receive SOL rewards directly to their wallet.
                  </Typography>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* COMPETE SECTION */}
        <section id="compete" className="relative min-h-screen flex items-center py-32 overflow-hidden border-t border-purple-500/10" style={{ scrollSnapAlign: 'start' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center"
              variants={motionVariants.container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="lg:col-span-2">
                <motion.div variants={motionVariants.item} className="mb-6">
                  <Typography variant="body-xs" color={colors.primary.purple[400]} className="tracking-[0.3em] uppercase">
                    GLOBAL LEADERBOARDS
                  </Typography>
                </motion.div>
                
                <motion.div variants={motionVariants.item}>
                  <Typography variant="display-lg" gradient="purple-pink" className="mb-8">
                    COMPETE<br />GLOBALLY
                  </Typography>
                </motion.div>
              </div>

              <GlassCard variant="pink" hover={true} {...motionVariants.item as any}>
                <FaTrophy style={{ fontSize: '3rem', color: colors.primary.pink[400], marginBottom: spacing[6] }} />
                <Typography variant="h4" className="mb-4">
                  Real-Time Rankings
                </Typography>
                <Typography variant="body" color={`${colors.primary.purple[300]}b3`} className="mb-6">
                  Compete against players worldwide. Track your progress, challenge friends, and dominate the leaderboard.
                </Typography>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.primary.orange[400], borderRadius: '9999px' }} />
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
                      Live score updates
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.primary.purple[400], borderRadius: '9999px' }} />
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
                      Seasonal tournaments
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: colors.primary.pink[400], borderRadius: '9999px' }} />
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}99`}>
                      Achievement badges
                    </Typography>
                  </div>
                </div>
              </GlassCard>
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
              transition={{ duration: parseFloat(animations.duration.slower) / 1000 }}
            >
              <Typography variant="body-xs" color={colors.primary.purple[400]} className="mb-6 tracking-[0.3em] uppercase">
                $K3 TOKEN
              </Typography>
              
              <Typography variant="display-xl" gradient="purple-orange">
                TOKENOMICS
              </Typography>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
              variants={motionVariants.container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                { label: 'Total Supply', value: '1B', color: 'orange' as const },
                { label: 'Player Rewards', value: '40%', color: 'purple' as const },
                { label: 'Liquidity Pool', value: '25%', color: 'pink' as const },
                { label: 'Team & Dev', value: '15%', color: 'purple' as const },
              ].map((stat, i) => (
                <GlassCard key={i} variant={stat.color} hover={true} className="text-center" {...motionVariants.item as any}>
                  <Typography variant="display-sm" color={colors.primary[stat.color][400]} className="mb-4">
                    {stat.value}
                  </Typography>
                  <Typography variant="body-sm" color={`${colors.primary.purple[300]}b3`} className="uppercase tracking-wider">
                    {stat.label}
                  </Typography>
                </GlassCard>
              ))}
            </motion.div>

            <GlassCard
              variant="purple"
              size="xl"
              hover={false}
              className="max-w-4xl mx-auto text-center mt-20"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.4, duration: parseFloat(animations.duration.slow) / 1000 }}
            >
              <Typography variant="h1" gradient="orange-purple" className="mb-6">
                READY TO PLAY?
              </Typography>
              <Typography variant="h5" color={`${colors.primary.purple[300]}cc`} className="mb-10">
                Join thousands earning crypto through knowledge
              </Typography>
              <Link href="/play">
                <NeonButton
                  size="xl"
                  neonColor="orange"
                  rightIcon={<FaGamepad />}
                >
                  Start Playing Now
                </NeonButton>
              </Link>
            </GlassCard>
          </div>
        </section>

        <Footer />
      </PageWrapper>
    </FlashProvider>
  );
}

function HeroButtons() {
  const { triggerFlash } = useFlash();

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-center gap-6 mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: parseFloat(animations.duration.slower) / 1000, delay: 0.6 }}
    >
      <Link href="/play" className="w-full sm:w-auto">
        <NeonButton
          size="xl"
          neonColor="orange"
          fullWidth
          leftIcon={<FaGamepad />}
          onClick={triggerFlash}
        >
          Play Now
        </NeonButton>
      </Link>
      
      <Link href="/create" className="w-full sm:w-auto">
        <NeonButton
          size="xl"
          neonColor="purple"
          variant="secondary"
          fullWidth
          leftIcon={<FaRocket />}
          onClick={triggerFlash}
        >
          Create Quiz
        </NeonButton>
      </Link>
    </motion.div>
  );
}