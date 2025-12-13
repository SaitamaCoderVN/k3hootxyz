'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const sections = [
  { id: 'hero', label: 'K3HOOT' },
  { id: 'web3-powered', label: 'Web3' },
  { id: 'earn-rewards', label: 'Rewards' },
  { id: 'compete', label: 'Compete' },
  { id: 'tokenomics', label: 'Token' },
];

export function SectionNav() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.nav
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-xs font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? 'text-orange-400 opacity-100'
                  : 'text-purple-300/40 opacity-0 group-hover:opacity-100'
              }`}
              style={{ fontFamily: 'var(--font-space)' }}
            >
              {section.label}
            </span>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSection === section.id
                  ? 'w-12 bg-gradient-to-r from-orange-500 to-purple-500'
                  : 'w-8 bg-purple-300/20 group-hover:bg-purple-300/40'
              }`}
              style={{
                boxShadow:
                  activeSection === section.id
                    ? '0 0 20px rgba(249, 115, 22, 0.5)'
                    : 'none',
              }}
            />
          </button>
        ))}
      </div>
    </motion.nav>
  );
}
