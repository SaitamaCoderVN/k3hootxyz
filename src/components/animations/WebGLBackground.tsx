'use client';

import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { useEffect, useState } from 'react';

export function WebGLBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      const windowHeight = window.innerHeight;
      const currentSection = Math.floor(window.scrollY / windowHeight);
      setSectionIndex(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <ParticleField scrollY={scrollY} sectionIndex={sectionIndex} />
      </Canvas>
    </div>
  );
}
