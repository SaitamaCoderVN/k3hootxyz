'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
}

export function ParticleField({ count = 3000 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const scrollSpeed = useRef(0);

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

  useFrame((state) => {
    if (!pointsRef.current) return;

    const scroll = state.clock.elapsedTime * 0.1;
    scrollSpeed.current = scroll;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 2] += speeds[i] * (1 + scrollSpeed.current * 0.5);

      if (positions[i3 + 2] > 25) {
        positions[i3 + 2] = -25;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = scroll * 0.05;
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
}