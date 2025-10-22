'use client';

import { ButtonHTMLAttributes } from 'react';

interface AnswerButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  letter: "A" | "B" | "C" | "D";
  text: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Answer Button Component
 * Displays A/B/C/D answer options for quiz
 */
export function AnswerButton({ 
  letter, 
  text, 
  selected, 
  onClick,
  disabled,
  ...props
}: AnswerButtonProps) {
  return (
    <button
      className={`
        group relative w-full
        flex items-center gap-4
        p-4 md:p-6
        rounded-xl
        border-2 transition-all duration-300
        ${selected 
          ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/50' 
          : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-gray-700/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {/* Letter Badge */}
      <div className={`
        flex-shrink-0 
        w-12 h-12
        flex items-center justify-center
        rounded-lg
        font-bold text-xl
        transition-all duration-300
        ${selected
          ? 'bg-cyan-500 text-white shadow-lg'
          : 'bg-gray-700 text-gray-300 group-hover:bg-cyan-500/30 group-hover:text-cyan-300'
        }
      `}>
        {letter}
      </div>
      
      {/* Answer Text */}
      <div className={`
        flex-1 text-left
        font-medium
        transition-colors duration-300
        ${selected 
          ? 'text-white' 
          : 'text-gray-300 group-hover:text-white'
        }
      `}>
        {text}
      </div>
      
      {/* Selected Indicator */}
      {selected && (
        <div className="flex-shrink-0">
          <svg 
            className="w-6 h-6 text-cyan-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      )}
      
      {/* Hover Glow Effect */}
      {!disabled && (
        <div className={`
          absolute inset-0 rounded-xl
          bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
        `} />
      )}
    </button>
  );
}

