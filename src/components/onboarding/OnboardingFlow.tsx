'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaGamepad, FaTrophy, FaRocket } from 'react-icons/fa';
import Button from '@/components/ui/Button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  action?: () => void;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to K3HOOT!',
    description: 'The ultimate Web3 quiz platform where knowledge meets rewards.',
    icon: <FaRocket className="w-12 h-12 sm:w-16 sm:h-16" />
  },
  {
    id: 'wallet',
    title: 'Connect Your Wallet',
    description: 'Link your Solana wallet to start playing and earning rewards.',
    icon: <FaWallet className="w-12 h-12 sm:w-16 sm:h-16" />
  },
  {
    id: 'play',
    title: 'Play & Learn',
    description: 'Join quiz rooms or create your own. Answer questions to earn points.',
    icon: <FaGamepad className="w-12 h-12 sm:w-16 sm:h-16" />
  },
  {
    id: 'earn',
    title: 'Win Rewards',
    description: 'Top players earn SOL tokens and exclusive NFTs!',
    icon: <FaTrophy className="w-12 h-12 sm:w-16 sm:h-16" />
  }
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    if (seen) {
      setHasSeenOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('hasSeenOnboarding', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onComplete();
  };

  if (hasSeenOnboarding) {
    return null;
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-purple-900/20 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 max-w-sm sm:max-w-md w-full border border-purple-500/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Progress Bar */}
        <div className="h-2 bg-purple-900/30 rounded-full mb-6 sm:mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[currentStep].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-purple-400 mb-4 sm:mb-6 flex justify-center">
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 gradient-text leading-tight">
              {steps[currentStep].title}
            </h2>
            <p className="text-purple-300 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <button
            onClick={handleSkip}
            className="text-purple-400 hover:text-purple-300 transition-colors text-sm sm:text-base order-2 sm:order-1"
          >
            Skip
          </button>
          
          <div className="flex gap-2 order-1 sm:order-2">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
                size="sm"
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              size="sm"
            >
              {currentStep === steps.length - 1 ? "Let's Go!" : 'Next'}
            </Button>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-purple-500' : 'bg-purple-900/50'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
} 