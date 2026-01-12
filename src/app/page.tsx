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
import { ScrollReveal, StaggerContainer, StaggerItem, ParallaxSection, FadeOnScroll } from '@/components/animations';
import { LeaderboardPreview } from '@/components/sections/LeaderboardPreview';

// Design System Imports
import { Typography, NeonButton, GlassCard, colors, shadows, animations, spacing, motionVariants } from '@/design-system';

const PixelEffect = dynamic(() => import('@/components/animations/PixelEffect'), {
  ssr: false,
  loading: () => null,
});

const WebGLBackground = dynamic(() => import('@/components/animations/WebGLBackground'), {
  ssr: false,
  loading: () => null,
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
              <ScrollReveal type="scaleIn" delay={0.1} amount={40}>
                <Tilt3D intensity={10}>
                  <div className="mb-12 flex justify-center lg:justify-start">
                    <NeonLogo />
                  </div>
                </Tilt3D>
              </ScrollReveal>
              
              <ScrollReveal type="fadeInUp" delay={0.3} amount={100}>
                <div className="mb-8">
                  <Typography
                    variant="display-2xl"
                    gradient="orange-purple"
                    as="h1"
                    className="mb-6 leading-[0.9] tracking-tighter"
                    style={{
                      textShadow: '0 0 100px rgba(249, 115, 22, 0.4), 0 0 200px rgba(168, 85, 247, 0.3)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    THE<br />
                    ULTIMATE<br />
                    WEB3 QUIZ
                  </Typography>
                  <ScrollReveal type="fadeInUp" delay={0.4} amount={50}>
                    <Typography 
                      variant="body-xl" 
                      color={`${colors.primary.purple[200]}dd`}
                      className="max-w-2xl leading-relaxed"
                      style={{
                        textShadow: '0 2px 20px rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      Play, Learn, and Earn on Solana. Compete globally, climb leaderboards, and claim your rewards in crypto.
                    </Typography>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
              
              <ScrollReveal type="scaleInUp" delay={0.6} amount={60}>
                <HeroButtons />
              </ScrollReveal>
            </div>
          </div>

          <ParallaxSection speed={0.3} direction="up">
            <motion.div
              className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-orange-500/15 rounded-full blur-[200px] pointer-events-none"
              animate={{
                scale: [1, 1.4, 1],
                x: [0, 80, 0],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </ParallaxSection>
          <ParallaxSection speed={0.5} direction="down">
            <motion.div
              className="absolute top-1/3 right-1/4 w-[900px] h-[900px] bg-purple-500/15 rounded-full blur-[220px] pointer-events-none"
              animate={{
                scale: [1.4, 0.8, 1.4],
                x: [0, -80, 0],
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </ParallaxSection>
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[180px] pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 40, 0],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </section>

        {/* WEB3 POWERED SECTION */}
        <section id="web3-powered" className="relative min-h-screen flex items-center py-32 overflow-hidden" style={{ scrollSnapAlign: 'start', borderTop: `1px solid ${colors.semantic.border}40` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-center">
              <div className="lg:col-span-2">
                <ScrollReveal type="fadeInLeft" delay={0.1}>
                  <div className="mb-6 tracking-[0.3em] uppercase">
                    <Typography variant="body-xs" color={colors.primary.orange[400]} style={{ textShadow: `0 0 20px ${colors.primary.orange[400]}40` }}>
                      K3HOOT.XYZ EDITIONS
                    </Typography>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal type="fadeInLeft" delay={0.2} amount={80}>
                  <Typography variant="display-lg" gradient="purple-pink" className="mb-6" style={{ textShadow: '0 0 60px rgba(168, 85, 247, 0.3)' }}>
                    WEB3<br />POWERED
                  </Typography>
                  <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`} className="max-w-xl leading-relaxed">
                    Built on Solana blockchain for lightning-fast transactions, transparent scoring, and instant payouts. Every action is verified on-chain.
                  </Typography>
                </ScrollReveal>
              </div>

              <ScrollReveal type="scaleIn" delay={0.3}>
                <GlassCard variant="purple" hover={true} size="lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="p-4 rounded-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.primary.purple[500]}20, ${colors.primary.purple[400]}10)`,
                        border: `1px solid ${colors.primary.purple[400]}30`,
                      }}
                    >
                      <FaBolt style={{ fontSize: '2.5rem', color: colors.primary.purple[400] }} />
                    </div>
                    <Typography variant="h3" gradient="purple" className="mb-0">
                      Built on Solana
                    </Typography>
                  </div>
                  <Typography variant="body" color={`${colors.primary.purple[200]}dd`} className="mb-8 leading-relaxed">
                    Lightning-fast transactions with near-zero fees. Every quiz answer is recorded on-chain for complete transparency.
                  </Typography>
                  <StaggerContainer staggerDelay={0.1}>
                    <StaggerItem type="fadeInRight" delay={0.1}>
                      <div className="flex items-center gap-3 py-2">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: colors.primary.orange[400],
                            boxShadow: `0 0 10px ${colors.primary.orange[400]}80`,
                          }} 
                        />
                        <Typography variant="body-sm" color={`${colors.primary.purple[200]}dd`} className="font-medium">
                          Instant payouts
                        </Typography>
                      </div>
                    </StaggerItem>
                    <StaggerItem type="fadeInRight" delay={0.2}>
                      <div className="flex items-center gap-3 py-2">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: colors.primary.purple[400],
                            boxShadow: `0 0 10px ${colors.primary.purple[400]}80`,
                          }} 
                        />
                        <Typography variant="body-sm" color={`${colors.primary.purple[200]}dd`} className="font-medium">
                          Decentralized scoring
                        </Typography>
                      </div>
                    </StaggerItem>
                    <StaggerItem type="fadeInRight" delay={0.3}>
                      <div className="flex items-center gap-3 py-2">
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: colors.primary.pink[400],
                            boxShadow: `0 0 10px ${colors.primary.pink[400]}80`,
                          }} 
                        />
                        <Typography variant="body-sm" color={`${colors.primary.purple[200]}dd`} className="font-medium">
                          Non-custodial wallets
                        </Typography>
                      </div>
                    </StaggerItem>
                  </StaggerContainer>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* EARN REWARDS SECTION */}
        <section id="earn-rewards" className="relative min-h-screen flex items-center py-32 overflow-hidden" style={{ scrollSnapAlign: 'start', borderTop: `1px solid ${colors.semantic.border}40` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-center">
              <ScrollReveal type="rotateIn" delay={0.2} amount={60}>
                <GlassCard variant="orange" hover={true} size="lg" className="text-center">
                  <div 
                    className="flex justify-center mb-8 p-6 rounded-2xl mx-auto w-fit"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary.orange[500]}20, ${colors.primary.orange[400]}10)`,
                      border: `1px solid ${colors.primary.orange[400]}30`,
                      boxShadow: `0 0 40px ${colors.primary.orange[400]}20`,
                    }}
                  >
                    <FaCoins style={{ fontSize: '4rem', color: colors.primary.orange[400], filter: 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.5))' }} />
                  </div>
                  <AnimatedStat value={2847} label="SOL Distributed" />
                  <div className="mt-10 pt-8 border-t" style={{ borderColor: `${colors.semantic.border}60` }}>
                    <AnimatedStat value={324} label="Total Prize Pool" prefix="$" suffix="K" />
                  </div>
                </GlassCard>
              </ScrollReveal>

              <div className="lg:col-span-2">
                <ScrollReveal type="fadeInRight" delay={0.1}>
                  <div className="mb-6">
                    <Typography variant="body-xs" color={colors.primary.orange[400]} className="tracking-[0.3em] uppercase" style={{ textShadow: `0 0 20px ${colors.primary.orange[400]}40` }}>
                      PLAY-TO-EARN
                    </Typography>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal type="fadeInRight" delay={0.2} amount={80}>
                  <Typography variant="display-lg" gradient="orange" className="mb-6" style={{ textShadow: '0 0 60px rgba(249, 115, 22, 0.3)' }}>
                    EARN<br />REWARDS
                  </Typography>
                </ScrollReveal>

                <ScrollReveal type="blurIn" delay={0.3}>
                  <Typography variant="body-xl" color={`${colors.primary.purple[200]}dd`} className="max-w-2xl leading-relaxed">
                    Answer correctly, climb the leaderboard, and earn $K3 tokens. Top performers receive SOL rewards directly to their wallet.
                  </Typography>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* COMPETE SECTION */}
        <section id="compete" className="relative min-h-screen flex items-center py-32 overflow-hidden" style={{ scrollSnapAlign: 'start', borderTop: `1px solid ${colors.semantic.border}40` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <ScrollReveal type="fadeInLeft" delay={0.1}>
                  <div className="mb-6">
                    <Typography variant="body-xs" color={colors.primary.purple[400]} className="tracking-[0.3em] uppercase" style={{ textShadow: `0 0 20px ${colors.primary.purple[400]}40` }}>
                      GLOBAL LEADERBOARDS
                    </Typography>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal type="reveal" delay={0.2} amount={100}>
                  <Typography variant="display-lg" gradient="purple-pink" className="mb-6" style={{ textShadow: '0 0 60px rgba(236, 72, 153, 0.3)' }}>
                    COMPETE<br />GLOBALLY
                  </Typography>
                  <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`} className="max-w-xl leading-relaxed mb-8">
                    Challenge players worldwide, track your progress in real-time, and climb the ranks to become the ultimate quiz master.
                  </Typography>
                </ScrollReveal>

                <ScrollReveal type="fadeInLeft" delay={0.4}>
                  <GlassCard variant="pink" hover={true} size="md">
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="p-3 rounded-xl"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.primary.pink[500]}20, ${colors.primary.pink[400]}10)`,
                          border: `1px solid ${colors.primary.pink[400]}30`,
                        }}
                      >
                        <FaTrophy style={{ fontSize: '2rem', color: colors.primary.pink[400], filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.5))' }} />
                      </div>
                      <Typography variant="h4" gradient="pink" className="mb-0">
                        Real-Time Rankings
                      </Typography>
                    </div>
                    <Typography variant="body" color={`${colors.primary.purple[200]}dd`} className="mb-6 leading-relaxed">
                      Compete against players worldwide. Track your progress, challenge friends, and dominate the leaderboard.
                    </Typography>
                    <StaggerContainer staggerDelay={0.15}>
                      <StaggerItem type="slideInRight" delay={0.1}>
                        <div className="flex items-center gap-3 py-2">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ 
                              backgroundColor: colors.primary.orange[400],
                              boxShadow: `0 0 10px ${colors.primary.orange[400]}80`,
                            }} 
                          />
                          <Typography variant="body-sm" color={`${colors.primary.purple[200]}dd`} className="font-medium">
                            Live score updates
                          </Typography>
                        </div>
                      </StaggerItem>
                      <StaggerItem type="slideInRight" delay={0.2}>
                        <div className="flex items-center gap-3 py-2">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ 
                              backgroundColor: colors.primary.purple[400],
                              boxShadow: `0 0 10px ${colors.primary.purple[400]}80`,
                            }} 
                          />
                          <Typography variant="body-sm" color={`${colors.primary.purple[200]}dd`} className="font-medium">
                            Seasonal tournaments
                          </Typography>
                        </div>
                      </StaggerItem>
                      <StaggerItem type="slideInRight" delay={0.3}>
                        <div className="flex items-center gap-3 py-2">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ 
                              backgroundColor: colors.primary.pink[400],
                              boxShadow: `0 0 10px ${colors.primary.pink[400]}80`,
                            }} 
                          />
                          <Typography variant="body-sm" color={`${colors.primary.purple[200]}dd`} className="font-medium">
                            Achievement badges
                          </Typography>
                        </div>
                      </StaggerItem>
                    </StaggerContainer>
                  </GlassCard>
                </ScrollReveal>
              </div>

              <ScrollReveal type="scaleInUp" delay={0.3} amount={60}>
                <LeaderboardPreview />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* TOKENOMICS SECTION */}
        <section id="tokenomics" className="relative min-h-screen flex items-center py-32 overflow-hidden" style={{ scrollSnapAlign: 'start', borderTop: `1px solid ${colors.semantic.border}40` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal type="fadeInDown" delay={0.1} amount={60}>
              <div className="text-center mb-24">
                <Typography variant="body-xs" color={colors.primary.purple[400]} className="mb-6 tracking-[0.3em] uppercase" style={{ textShadow: `0 0 20px ${colors.primary.purple[400]}40` }}>
                  $K3 TOKEN
                </Typography>
                
                <Typography variant="display-xl" gradient="purple-orange" className="mb-6" style={{ textShadow: '0 0 60px rgba(168, 85, 247, 0.3)' }}>
                  TOKENOMICS
                </Typography>
                <Typography variant="body-lg" color={`${colors.primary.purple[300]}cc`} className="max-w-2xl mx-auto">
                  Fair distribution ensures sustainable growth and rewards for all participants
                </Typography>
              </div>
            </ScrollReveal>

            <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                { label: 'Total Supply', value: '1B', color: 'orange' as const },
                { label: 'Player Rewards', value: '40%', color: 'purple' as const },
                { label: 'Liquidity Pool', value: '25%', color: 'pink' as const },
                { label: 'Team & Dev', value: '15%', color: 'purple' as const },
              ].map((stat, i) => (
                <StaggerItem key={i} type={i % 2 === 0 ? 'scaleIn' : 'rotateIn'} delay={i * 0.1}>
                  <GlassCard variant={stat.color} hover={true} className="text-center">
                    <Typography variant="display-sm" color={colors.primary[stat.color][400]} className="mb-4">
                      {stat.value}
                    </Typography>
                    <Typography variant="body-sm" color={`${colors.primary.purple[300]}b3`} className="uppercase tracking-wider">
                      {stat.label}
                    </Typography>
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <ScrollReveal type="blurIn" delay={0.5} amount={40}>
              <GlassCard
                variant="purple"
                size="xl"
                hover={false}
                className="max-w-4xl mx-auto text-center mt-24"
              >
                <Typography variant="h1" gradient="orange-purple" className="mb-6" style={{ textShadow: '0 0 60px rgba(249, 115, 22, 0.3)' }}>
                  READY TO PLAY?
                </Typography>
                <Typography variant="h5" color={`${colors.primary.purple[200]}dd`} className="mb-12 leading-relaxed">
                  Join thousands earning crypto through knowledge. Start your journey today!
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
            </ScrollReveal>
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