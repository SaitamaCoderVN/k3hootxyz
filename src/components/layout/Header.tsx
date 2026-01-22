'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X as FaTimes, Menu as FaBars } from 'lucide-react';
import { colors, spacing, shadows, animations, typography, Typography } from '@/design-system';
import WalletButton from '@/components/WalletButton';
import { EmojiAccent } from '@/components/ui/EmojiAccents';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/play', label: 'Play' },
  { href: '/create', label: 'Create' },
  { href: '/multiplayer/join', label: 'Join Game' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? 'rgba(251, 251, 251, 0.9)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        borderBottom: isScrolled ? '2px solid #0A0A0A' : 'none',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Typography variant="h3" className="text-black font-black uppercase tracking-tighter flex items-center gap-1" style={{ fontFamily: typography.fontFamily.display }}>
              <EmojiAccent name="brandFace" size={40} className="text-red-500" />HOOT
            </Typography>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`uppercase tracking-[0.2em] text-[10px] font-black transition-all hover:opacity-100 ${pathname === link.href ? 'opacity-100 border-b-2 border-black' : 'opacity-40'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-4 sm:gap-6">
            <WalletButton />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 bg-black text-white"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 top-20 bg-bone border-t-8 border-black z-40 md:hidden flex flex-col"
            >
              <nav className="flex flex-col p-12 gap-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-5xl font-black uppercase tracking-[-0.05em] text-black border-b-4 border-transparent hover:border-black transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-12 border-t-4 border-black/5">
                <Typography variant="body-xs" className="uppercase font-black opacity-30 tracking-widest">
                  Protocol: Online
                </Typography>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}