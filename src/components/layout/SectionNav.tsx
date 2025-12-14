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
            className="group flex items-center" style={{ gap: spacing[3] }}
          >
            <span
              style={{
                fontSize: typography.fontSize.xs[0],
                fontFamily: typography.fontFamily.body,
                fontWeight: 500,
                color: activeSection === section.id ? colors.primary.orange[400] : `${colors.primary.purple[300]}66`,
                opacity: activeSection === section.id ? 1 : 0,
                transition: `all ${animations.duration.normal}`,
              }}
              className="group-hover:opacity-100"
            >
              {section.label}
            </span>
            <div
              style={{
                height: spacing[2],
                borderRadius: '9999px',
                width: activeSection === section.id ? spacing[12] : spacing[8],
                background: activeSection === section.id 
                  ? `linear-gradient(to right, ${colors.primary.orange[500]}, ${colors.primary.purple[500]})`
                  : `${colors.primary.purple[300]}33`,
                boxShadow: activeSection === section.id ? shadows.neon.orange.sm : 'none',
                transition: `all ${animations.duration.normal}`,
              }}
              className="group-hover:bg-purple-300/40"
            />
          </button>
        ))}
      </div>
    </motion.nav>
  );
}