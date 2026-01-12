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

// Shape icons for each answer (Kahoot style)
const ShapeIcon = ({ letter }: { letter: 'A' | 'B' | 'C' | 'D' }) => {
  const size = 24;

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
  const colors = ANSWER_COLORS[letter];
  const isCorrectAnswer = correctAnswer === letter;

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative w-full rounded-xl overflow-hidden group"
      style={{
        backgroundColor: selected ? colors.bg : `${colors.bg}dd`,
        opacity: disabled && !selected && !isCorrectAnswer ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: selected ? '4px solid white' : showCorrect ? '4px solid #4CAF50' : 'none',
        boxShadow: selected
          ? `0 8px 24px ${colors.bg}60, 0 0 0 4px white`
          : `0 4px 12px ${colors.bg}40`,
      }}
    >
      {/* Incorrect overlay */}
      {showIncorrect && selected && !isCorrectAnswer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          className="absolute inset-0 bg-black z-10 flex items-center justify-center"
        >
          <span className="text-6xl">❌</span>
        </motion.div>
      )}

      {/* Correct answer highlight */}
      {isCorrectAnswer && (correctAnswer !== undefined) && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 z-20 bg-green-500 rounded-full p-2"
        >
          <span className="text-xl">✓</span>
        </motion.div>
      )}

      {/* Button content */}
      <div className="relative z-0 px-6 py-6 flex items-center gap-4">
        {/* Letter + Shape icon */}
        <div className="flex items-center gap-3 min-w-[80px]">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
            <span className="text-2xl font-bold" style={{ color: colors.text }}>
              {letter}
            </span>
          </div>
          <div style={{ color: colors.text, opacity: 0.9 }}>
            <ShapeIcon letter={letter} />
          </div>
        </div>

        {/* Answer text */}
        <div className="flex-1 text-left">
          <p
            className="text-lg sm:text-xl font-bold leading-tight"
            style={{ color: colors.text }}
          >
            {text}
          </p>
        </div>

        {/* Selected indicator */}
        {selected && !showIncorrect && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
          >
            <span className="text-lg" style={{ color: colors.bg }}>✓</span>
          </motion.div>
        )}
      </div>

      {/* Hover effect */}
      {!disabled && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `linear-gradient(135deg, transparent, ${colors.hover}40)`,
          }}
        />
      )}
    </motion.button>
  );
}
