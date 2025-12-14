'use client';

import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { useEffect, useState, memo } from 'react';

export const WebGLBackground = memo(function WebGLBackground() {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldRender(!mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldRender(!e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Don't render if user prefers reduced motion or on low-end devices
  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        dpr={[1, 1.5]} // Reduced from [1, 2] for better performance
        gl={{ 
          antialias: false, // Disable for performance
          alpha: true,
          powerPreference: 'high-performance'
        }}
        frameloop="demand" // Only render when needed
      >
        <ParticleField />
      </Canvas>
    </div>
  );
});