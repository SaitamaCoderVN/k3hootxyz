'use client';

import { useEffect, useRef } from 'react';

export function GlobalClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio object
    audioRef.current = new Audio('/sounds/click.mp3');
    audioRef.current.volume = 0.5; // Set volume to 50% to be subtle

    const handleClick = () => {
      if (audioRef.current) {
        // Reset time to allow rapid clicks
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          // Ignore play errors (e.g., if user hasn't interacted yet, though click IS interaction)
          console.warn('Audio play failed:', err);
        });
      }
    };

    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return null; // Headless component
}
