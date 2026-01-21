'use client';

import React from 'react';
import { Emoji, EmojiStyle } from 'emoji-picker-react';

export const EmojiMap = {
  brandFace: '1f60a', // Smiling Face with Smiling Eyes (closest to uwu)
  catFace: '1f63a',   // Smiling Cat Face
  happy: '1f604',     // Grinning Face with Smiling Eyes
};

export const EmojiAccent = ({ name, size = 24, className = "" }: { name: keyof typeof EmojiMap, size?: number, className?: string }) => {
  const unified = EmojiMap[name];
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Emoji 
        unified={unified} 
        size={size} 
        emojiStyle={EmojiStyle.FACEBOOK}
      />
    </div>
  );
};
