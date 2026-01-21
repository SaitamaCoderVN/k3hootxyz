'use client';

import { motion } from 'framer-motion';
import { ANSWER_COLORS } from '@/types/multiplayer';

interface KahootAnswerButtonProps {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  showCorrect?: boolean; // Show green border if correct
  showIncorrect?: boolean; // Show red overlay if incorrect
  correctAnswer?: 'A' | 'B' | 'C' | 'D'; // For answer reveal
}

// Shape icons for each answer (Kahoot style) - Now monochromatic
const ShapeIcon = ({ letter }: { letter: 'A' | 'B' | 'C' | 'D' }) => {
  const size = 20;

  switch (letter) {
    case 'A': // Triangle
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      );
    case 'B': // Diamond
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
    case 'C': // Circle
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'D': // Square
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="2" width="20" height="20" rx="2" />
        </svg>
      );
  }
};

export function KahootAnswerButton({
  letter,
  text,
  selected,
  onClick,
  disabled = false,
  showCorrect = false,
  showIncorrect = false,
  correctAnswer,
}: KahootAnswerButtonProps) {
  const isCorrectAnswer = correctAnswer === letter;
  const isSelectedIncorrect = showIncorrect && selected && !isCorrectAnswer;

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        relative w-full border-4 transition-all duration-200 flex items-center gap-6 p-6 overflow-hidden
        ${selected ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black'}
        ${!disabled && !selected ? 'hover:border-black hover:bg-bone' : ''}
        ${isCorrectAnswer && correctAnswer !== undefined ? 'ring-8 ring-black ring-inset' : ''}
        ${isSelectedIncorrect ? 'border-red-600 bg-red-600 text-white' : ''}
        ${disabled && !selected && !isCorrectAnswer ? 'opacity-20' : 'opacity-100'}
      `}
    >
      {/* Letter Indicator */}
      <div className={`
        w-14 h-14 border-2 flex flex-col items-center justify-center flex-shrink-0 transition-colors
        ${selected || isSelectedIncorrect ? 'border-white/20 text-white' : 'border-black/10 text-black'}
      `}>
        <span className="text-xs font-black uppercase tracking-tighter mb-1">{letter}</span>
        <ShapeIcon letter={letter} />
      </div>

      {/* Answer Text */}
      <div className="flex-1 text-left">
        <p className="text-xl font-black uppercase leading-tight tracking-tight">
          {text}
        </p>
      </div>

      {/* Status Icons */}
      <div className="flex-shrink-0">
        {selected && !showIncorrect && !showCorrect && (
          <div className="w-8 h-8 border-2 border-white/40 flex items-center justify-center">
            <span className="text-xs font-black">ACTIVE</span>
          </div>
        )}
        {isCorrectAnswer && (correctAnswer !== undefined) && (
          <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black">
            ✓
          </div>
        )}
        {isSelectedIncorrect && (
          <div className="w-10 h-10 bg-white text-red-600 flex items-center justify-center font-black">
            ✕
          </div>
        )}
      </div>

      {/* Correct Reveal Pattern */}
      {isCorrectAnswer && (correctAnswer !== undefined) && (
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
      )}
    </motion.button>
  );
}
