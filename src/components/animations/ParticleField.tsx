'use client';

import { useRef, useMemo, useEffect, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
}

export const ParticleField = memo(function ParticleField({ count = 3000 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [scrollY, setScrollY] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [positions, colors, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0.976;
        colors[i3 + 1] = 0.451;
        colors[i3 + 2] = 0.086;
      } else if (colorChoice < 0.66) {
        colors[i3] = 0.659;
        colors[i3 + 1] = 0.333;
        colors[i3 + 2] = 0.969;
      } else {
        colors[i3] = 0.925;
        colors[i3 + 1] = 0.282;
        colors[i3 + 2] = 0.580;
      }

      speeds[i] = Math.random() * 0.5 + 0.2;
    }

    return [positions, colors, speeds];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const scrollDelta = (scrollY - lastScrollY.current) * 0.01;
    lastScrollY.current = scrollY;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 2] += speeds[i] * scrollDelta;

      if (positions[i3 + 2] > 25) {
        positions[i3 + 2] = -25;
      } else if (positions[i3 + 2] < -25) {
        positions[i3 + 2] = 25;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = scrollY * 0.0001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
});