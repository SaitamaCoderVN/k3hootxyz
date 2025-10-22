'use client';

import { useState } from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ClaimButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  rewardAmount: number;
  onClaim: () => Promise<void>;
  isClaimed?: boolean;
}

/**
 * Claim Reward Button Component
 * Shows animated button for winners to claim their SOL reward
 */
export function ClaimButton({ 
  rewardAmount, 
  onClaim,
  isClaimed = false,
  disabled,
  ...props
}: ClaimButtonProps) {
  const [claiming, setClaiming] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClaim = async () => {
    if (claiming || isClaimed) return;
    
    setClaiming(true);
    try {
      await onClaim();
      setSuccess(true);
      
      // Reset success state after animation
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setClaiming(false);
    }
  };

  if (isClaimed) {
    return (
      <div className="w-full p-4 rounded-xl border-2 border-green-500 bg-green-500/10 text-center">
        <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Reward Already Claimed
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full p-6 rounded-xl border-2 border-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-center animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl">🎉</div>
          <div className="text-green-400 font-bold text-lg">
            Successfully Claimed {rewardAmount} SOL!
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={`
        group relative w-full
        p-6 rounded-xl
        font-bold text-lg
        border-2
        transition-all duration-300
        overflow-hidden
        ${claiming
          ? 'border-yellow-400 bg-yellow-500/20 cursor-wait'
          : 'border-cyan-400 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        animate-pulse hover:animate-none
      `}
      onClick={handleClaim}
      disabled={claiming || disabled}
      {...props}
    >
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative flex items-center justify-center gap-3">
        {claiming ? (
          <>
            {/* Loading Spinner */}
            <svg 
              className="animate-spin h-6 w-6 text-yellow-400" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-yellow-300">Claiming Reward...</span>
          </>
        ) : (
          <>
            {/* Trophy Icon */}
            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
              🏆
            </span>
            
            {/* Text */}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Claim {rewardAmount} SOL
            </span>
            
            {/* Sparkle Icon */}
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
              ✨
            </span>
          </>
        )}
      </div>
      
      {/* Shimmer Effect */}
      {!claiming && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
    </button>
  );
}

