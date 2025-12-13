'use client';

import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';

export function WebGLBackground() {
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
        <ParticleField />
      </Canvas>
    </div>
  );
}