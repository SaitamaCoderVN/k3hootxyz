'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FaBars, FaTimes, FaWallet, FaGamepad } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const menuItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/join', label: 'Play Now', icon: '🎮' },
  { href: '/create', label: 'Create Quiz', icon: '✨' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0.7, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-xl shadow-lg shadow-purple-500/10' : 'bg-black/50 backdrop-blur-lg'
      } border-b border-purple-500/20`}
      style={{ opacity: headerOpacity }}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <FaGamepad className="relative w-8 h-8 text-white" />
            </motion.div>
            <motion.div
              className="text-2xl font-bold gradient-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              K3HOOT.XYZ
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
                <Link
                  href={item.href}
                  className="relative group px-4 py-2 rounded-lg transition-all"
                >
                  <span className="relative z-10 flex items-center gap-2 text-purple-300 group-hover:text-white transition-colors">
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                  />
                </Link>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <WalletMultiButtonDynamic className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !transition-all !duration-300" />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-3 text-purple-300 hover:text-white transition-colors bg-purple-900/20 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </motion.button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="container mx-auto px-4 pt-32">
              <div className="flex flex-col items-center space-y-6">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full max-w-xs"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-purple-900/20 rounded-xl text-xl text-purple-300 hover:text-white hover:bg-purple-900/30 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: menuItems.length * 0.1 }}
                  className="w-full max-w-xs"
                >
                  <WalletMultiButtonDynamic className="!w-full !justify-center !bg-gradient-to-r !from-purple-600 !to-pink-600" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
} 