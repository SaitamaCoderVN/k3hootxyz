'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface FlashContextType {
  triggerFlash: () => void;
}

const FlashContext = createContext<FlashContextType>({ triggerFlash: () => {} });

export function useFlash() {
  return useContext(FlashContext);
}

export function FlashProvider({ children }: { children: ReactNode }) {
  const [showFlash, setShowFlash] = useState(false);

  const triggerFlash = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
  };

  return (
    <FlashContext.Provider value={{ triggerFlash }}>
      {children}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 99999,
              background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>
    </FlashContext.Provider>
  );
}
