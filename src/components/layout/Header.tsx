'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FaTimes, FaBars } from 'react-icons/fa';
import { colors, spacing, shadows, animations, typography, Typography } from '@/design-system';
import WalletButton from '@/components/WalletButton';

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
        backgroundColor: isScrolled ? `${colors.background.primary}cc` : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? `1px solid ${colors.semantic.border}` : 'none',
        boxShadow: isScrolled ? shadows.elevation.md : 'none',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: parseFloat(animations.duration.slow) / 1000 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Typography variant="h3" gradient="orange-purple" style={{ fontFamily: typography.fontFamily.display }}>
              K3HOOT
            </Typography>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center" style={{ gap: spacing[6] }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: pathname === link.href ? colors.primary.purple[200] : colors.primary.purple[300],
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.sm[0],
                  fontWeight: 500,
                  transition: `color ${animations.duration.fast}`,
                }}
                className="hover:text-purple-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center" style={{ gap: spacing[4] }}>
            <WalletButton />

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-purple-900/20"
              style={{
                color: colors.primary.purple[300],
                transition: `all ${animations.duration.fast}`,
              }}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: parseFloat(animations.duration.fast) / 1000 }}
              style={{
                paddingTop: spacing[4],
                paddingBottom: spacing[4],
                borderTop: `1px solid ${colors.semantic.border}`,
              }}
            >
              <nav className="flex flex-col" style={{ gap: spacing[2] }}>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center hover:bg-purple-900/20 rounded-lg"
                    style={{
                      color: colors.primary.purple[300],
                      padding: `${spacing[2]} ${spacing[3]}`,
                      transition: `all ${animations.duration.fast}`,
                      fontFamily: typography.fontFamily.body,
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}