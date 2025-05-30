'use client';

import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SpaceBackground from '@/components/animations/SpaceBackground';
import Stars from '@/components/animations/Stars';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      <SpaceBackground />
      <Stars />
      <Header />

      <section className="relative pt-32 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-block p-4 bg-purple-900/20 rounded-full mb-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRocket className="w-12 h-12 text-purple-400" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              {title}
            </h1>

            <p className="text-xl text-purple-300 mb-8">
              {description || 'This feature is coming soon. Stay tuned for updates!'}
            </p>

            <motion.div
              className="absolute -z-10 inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 20%, transparent 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 