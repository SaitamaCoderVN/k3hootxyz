'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { colors, typography, spacing, animations, shadows } from '@/design-system';

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
      transition={{ delay: 1, duration: parseFloat(animations.duration.slow) / 1000 }}
    >
      <div className="flex flex-col" style={{ gap: spacing[4] }}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group flex flex-row-reverse items-center" style={{ gap: spacing[4] }}
          >
            <div
              className={`
                h-4 border-l-4 transition-all duration-300
                ${activeSection === section.id ? 'border-black h-12' : 'border-black/5 group-hover:border-black/40'}
              `}
            />
            <span
              style={{
                fontSize: '10px',
                fontFamily: typography.fontFamily.display,
                fontWeight: 900,
                color: colors.grayscale.ink,
                opacity: activeSection === section.id ? 1 : 0,
                transition: `all ${animations.duration.normal}`,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
              className="group-hover:opacity-100"
            >
              {section.label}
            </span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
}