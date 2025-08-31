'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: Error | string | null;
  onRetry?: () => void;
  showRetry?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'network' | 'blockchain' | 'generic' | 'validation';
}

export default function ErrorState({ 
  error, 
  onRetry, 
  showRetry = true, 
  size = 'md',
  type = 'generic'
}: ErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Something went wrong';
  
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-12 h-12 text-red-400" />;
      case 'blockchain':
        return <AlertCircle className="w-12 h-12 text-orange-400" />;
      case 'validation':
        return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-400" />;
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Error';
      case 'blockchain':
        return 'Blockchain Error';
      case 'validation':
        return 'Validation Error';
      default:
        return 'Oops! Something went wrong';
    }
  };

  const getErrorDescription = () => {
    switch (type) {
      case 'network':
        return 'Unable to connect to the network. Please check your internet connection.';
      case 'blockchain':
        return 'Error communicating with the Solana blockchain. The network might be busy.';
      case 'validation':
        return 'Please check your input and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="mb-6"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {getErrorIcon()}
      </motion.div>

      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white mb-2">
          {getErrorTitle()}
        </h3>
        
        <p className="text-gray-300 mb-4">
          {getErrorDescription()}
        </p>
        
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-300 font-mono break-words">
              {errorMessage}
            </p>
          </div>
        )}

        {showRetry && onRetry && (
          <motion.button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        )}
      </motion.div>

      {/* Helper suggestions based on error type */}
      {type === 'blockchain' && (
        <motion.div
          className="mt-6 text-xs text-gray-500 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          💡 Tips: Blockchain operations may take longer during peak times. 
          Try refreshing or wait a moment before retrying.
        </motion.div>
      )}

      {type === 'network' && (
        <motion.div
          className="mt-6 text-xs text-gray-500 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          💡 Tips: Check your internet connection and VPN settings if applicable.
        </motion.div>
      )}
    </motion.div>
  );
}

// Quick error state for inline use
export const InlineError = ({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void; 
}) => (
  <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg p-3">
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-red-400" />
      <span className="text-red-300 text-sm">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-red-400 hover:text-red-300 text-sm underline"
      >
        Retry
      </button>
    )}
  </div>
);
