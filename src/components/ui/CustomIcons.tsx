'use client';

import React from 'react';
import { Emoji, EmojiStyle } from 'emoji-picker-react';

export const CustomIcons = {
  // Abstract Gamepad / Competition -> Video Game Emoji
  Competition: ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Emoji unified="1f3ae" size={48} emojiStyle={EmojiStyle.FACEBOOK} />
    </div>
  ),

  // Abstract Rewards / Solana -> Money Bag Emoji or Gem
  Rewards: ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Emoji unified="1f48e" size={48} emojiStyle={EmojiStyle.FACEBOOK} />
    </div>
  ),

  // Abstract Global / Web3 -> Globe with Meridians
  Web3: ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Emoji unified="1f310" size={48} emojiStyle={EmojiStyle.FACEBOOK} />
    </div>
  ),

  // Abstract Rocket / Growth -> Rocket
  Launch: ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Emoji unified="1f680" size={48} emojiStyle={EmojiStyle.FACEBOOK} />
    </div>
  ),
};
