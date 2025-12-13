'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  scrollY: number;
  sectionIndex: number;
}

export function ParticleField({ count = 3000, scrollY, sectionIndex }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0.98;
        colors[i3 + 1] = 0.45;
        colors[i3 + 2] = 0.09;
      } else if (colorChoice < 0.66) {
        colors[i3] = 0.66;
        colors[i3 + 1] = 0.33;
        colors[i3 + 2] = 0.97;
      } else {
        colors[i3] = 0.93;
        colors[i3 + 1] = 0.45;
        colors[i3 + 2] = 0.65;
      }
    }
    
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const normalizedScroll = scrollY / 1000;
    
    const speedMultiplier = sectionIndex === 4 ? 2.5 : 1.0;
    const intensityMultiplier = sectionIndex === 4 ? 1.8 : 1.0;
    
    pointsRef.current.rotation.y = time * 0.05 * speedMultiplier + normalizedScroll * 0.2;
    pointsRef.current.rotation.x = Math.sin(time * 0.03) * 0.1 + normalizedScroll * 0.1;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const z = positions[i3 + 2];
      
      positions[i3 + 1] += Math.sin(time + x * 0.01) * 0.01 * speedMultiplier;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    if (pointsRef.current.material instanceof THREE.PointsMaterial) {
      pointsRef.current.material.size = 0.15 + Math.sin(time * 2) * 0.05 * intensityMultiplier;
      pointsRef.current.material.opacity = 0.6 + Math.sin(time * 1.5) * 0.2 * intensityMultiplier;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particlesPosition.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
