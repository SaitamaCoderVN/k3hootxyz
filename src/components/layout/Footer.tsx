'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaTwitter, FaDiscord, FaGithub, FaTelegram } from 'react-icons/fa';

const socialLinks = [
  {
    icon: <FaTwitter className="w-6 h-6" />,
    href: 'https://twitter.com/k3hootxyz',
    label: 'Twitter',
    color: 'hover:text-blue-400'
  },
  {
    icon: <FaDiscord className="w-6 h-6" />,
    href: 'https://discord.gg/k3hootxyz',
    label: 'Discord',
    color: 'hover:text-indigo-400'
  },
  {
    icon: <FaTelegram className="w-6 h-6" />,
    href: 'https://t.me/k3hootxyz',
    label: 'Telegram',
    color: 'hover:text-sky-400'
  },
  {
    icon: <FaGithub className="w-6 h-6" />,
    href: 'https://github.com/k3hootxyz',
    label: 'GitHub',
    color: 'hover:text-gray-400'
  }
];

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'How to Play', href: '/#how-to-play' },
      { label: 'Rewards', href: '/rewards' },
      { label: 'Tokenomics', href: '/tokenomics' }
    ]
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: 'https://discord.gg/k3hootxyz' },
      { label: 'Twitter', href: 'https://twitter.com/k3hootxyz' },
      { label: 'Blog', href: '/blog' },
      { label: 'Forum', href: '/forum' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Support', href: '/support' },
      { label: 'Bug Bounty', href: '/bug-bounty' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Disclaimer', href: '/disclaimer' }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-purple-500/20 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-bold gradient-text">K3HOOT.XYZ</h3>
              <p className="text-purple-300 leading-relaxed">
                The ultimate Web3 quiz platform on Solana. Play, Learn, and Earn in the most exciting way possible.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-purple-400 transition-all ${link.color}`}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={link.label}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="font-semibold text-white mb-6 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-purple-300 hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div 
          className="mt-16 pt-8 border-t border-purple-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-purple-300 text-sm text-center md:text-left">
              © 2024 K3HOOT.XYZ. All rights reserved. Built with ❤️ on Solana.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-purple-300 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-purple-500">•</span>
              <Link
                href="/terms"
                className="text-purple-300 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-purple-500">•</span>
              <Link
                href="/sitemap"
                className="text-purple-300 hover:text-white text-sm transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>
    </footer>
  );
} 