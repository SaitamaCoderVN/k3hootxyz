'use client';

import { useEffect, useState, useRef } from 'react';
import { frames } from './asciiFrames';

interface AsciiScrollAnimationProps {
  className?: string;
}

export default function AsciiScrollAnimation({ className = '' }: AsciiScrollAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = Date.now();
    const fps = 15;
    const interval = 1000 / fps;
    let index = 0;
    let dir: 'inc' | 'dec' = 'inc';

    const animate = () => {
      const now = Date.now();
      const elapsed = now - lastTime;

      if (elapsed > interval) {
        lastTime = now - (elapsed % interval);

        // Frame Logic
        if (dir === 'inc') {
          if (index === frames.length - 1) {
            dir = 'dec';
            index--;
          } else {
            index++;
          }
        } else {
          if (index === 0) {
            dir = 'inc';
            index++;
          } else {
            index--;
          }
        }
        
        setCurrentFrame(index);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Responsive Scaling Logic
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        
        // Create a temporary element to measure the intrinsic width of the first frame
        // This avoids issues with transform scaling affecting scrollWidth measurements
        const measureEl = document.createElement('pre');
        measureEl.style.position = 'absolute';
        measureEl.style.visibility = 'hidden';
        measureEl.style.fontFamily = 'var(--font-plex-mono), monospace';
        measureEl.style.fontSize = '12px'; // Base font size
        measureEl.style.whiteSpace = 'pre';
        // Use the first line of the first frame for consistent width measurement
        measureEl.textContent = frames[0].split('\n')[1]; 
        document.body.appendChild(measureEl);
        
        const intrinsicWidth = measureEl.getBoundingClientRect().width;
        document.body.removeChild(measureEl);

        if (intrinsicWidth > 0) {
          // Calculate scale relative to the base font size (12px)
          const newScale = containerWidth / intrinsicWidth;
          setScale(newScale);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(containerRef.current);
    updateScale();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden flex items-start justify-start bg-transparent ${className}`}
    >
      <pre 
        ref={preRef}
        className="font-mono text-[12px] leading-[12px] whitespace-pre select-none origin-top-left"
        style={{ 
          fontFamily: 'var(--font-plex-mono), monospace',
          transform: `scale(${scale}) translateY(-13%)`,
          display: 'block'
        }}
      >
        {frames[currentFrame]}
      </pre>
    </div>
  );
}
