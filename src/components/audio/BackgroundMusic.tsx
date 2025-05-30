'use client';

import { useState, useEffect, useRef } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(true);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgMusicRef.current = new Audio('/sounds/background.mp3');
    hoverSoundRef.current = new Audio('/sounds/hover.mp3');
    clickSoundRef.current = new Audio('/sounds/click.mp3');

    bgMusicRef.current.loop = true;
    hoverSoundRef.current.volume = 0.3;
    clickSoundRef.current.volume = 0.5;

    return () => {
      if (bgMusicRef.current) bgMusicRef.current.pause();
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (bgMusicRef.current) {
      if (isMuted) {
        bgMusicRef.current.play();
      } else {
        bgMusicRef.current.pause();
      }
    }
    playClickSound();
  };

  const playHoverSound = () => {
    if (!isMuted && hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0;
      hoverSoundRef.current.play();
    }
  };

  const playClickSound = () => {
    if (!isMuted && clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleMute}
        onMouseEnter={playHoverSound}
        className="p-3 bg-purple-900/50 rounded-full hover:bg-purple-800/50 transition-all duration-300 backdrop-blur-sm"
      >
        {isMuted ? (
          <FaVolumeMute className="w-6 h-6 text-white" />
        ) : (
          <FaVolumeUp className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}

// Export các hàm để sử dụng trong các components khác
export const useGameSounds = () => {
  const playHoverSound = () => {
    const sound = new Audio('/sounds/hover.mp3');
    sound.volume = 0.3;
    sound.play();
  };

  const playClickSound = () => {
    const sound = new Audio('/sounds/click.mp3');
    sound.volume = 0.5;
    sound.play();
  };

  return { playHoverSound, playClickSound };
}; 