'use client';

import { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailPoints = useRef<TrailPoint[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      trailPoints.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1.0,
      });

      if (trailPoints.current.length > 20) {
        trailPoints.current.shift();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trailPoints.current = trailPoints.current
        .map(point => ({
          ...point,
          opacity: point.opacity - 0.05,
        }))
        .filter(point => point.opacity > 0);

      trailPoints.current.forEach((point, index) => {
        const radius = 8 - (index * 0.3);
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, radius
        );
        
        gradient.addColorStop(0, `rgba(168, 85, 247, ${point.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(249, 115, 22, ${point.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(168, 85, 247, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, mixBlendMode: 'screen' }}
    />
  );
}
