'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBell, FaSearch, FaBars, FaTimes, FaHome, FaPlus, FaGamepad, FaTrophy } from 'react-icons/fa';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/WalletButton';

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { connected } = useWallet();

  const navigation = [
    { name: 'Home', href: '/', icon: <FaHome className="w-4 h-4" /> },
    { name: 'Play', href: '/play', icon: <FaGamepad className="w-4 h-4" /> },
    { name: 'Create', href: '/create', icon: <FaPlus className="w-4 h-4" /> },
    { name: 'Leaderboard', href: '/leaderboard', icon: <FaTrophy className="w-4 h-4" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold gradient-text">K3HOOT</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-purple-300 hover:text-purple-200 transition-colors duration-200"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <WalletButton />

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-purple-300 hover:text-purple-200 hover:bg-purple-900/20"
            >
              {showMobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-purple-500/20"
          >
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-purple-300 hover:text-purple-200 px-3 py-2 rounded-lg hover:bg-purple-900/20 transition-colors duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
} 