'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface NetworkStatusProps {
  isOnline?: boolean;
  rpcStatus?: 'connected' | 'disconnected' | 'slow' | 'checking';
  onRetry?: () => void;
  className?: string;
}

export default function NetworkStatus({ 
  isOnline = true, 
  rpcStatus = 'connected',
  onRetry,
  className = ''
}: NetworkStatusProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-400';
    
    switch (rpcStatus) {
      case 'connected':
        return 'text-green-400';
      case 'slow':
        return 'text-yellow-400';
      case 'checking':
        return 'text-blue-400';
      case 'disconnected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline || rpcStatus === 'disconnected') {
      return <WifiOff className="w-4 h-4" />;
    }
    
    if (rpcStatus === 'checking') {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    
    if (rpcStatus === 'slow') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (rpcStatus) {
      case 'connected':
        return 'Connected';
      case 'slow':
        return 'Slow Connection';
      case 'checking':
        return 'Connecting...';
      case 'disconnected':
        return 'RPC Disconnected';
      default:
        return 'Unknown';
    }
  };

  const shouldShowRetry = rpcStatus === 'disconnected' || (!isOnline && onRetry);

  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className={`${getStatusColor()} flex items-center gap-1 text-sm`}>
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="absolute top-full left-0 mt-2 p-3 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg z-50 min-w-[200px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Network:</span>
                <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Solana RPC:</span>
                <span className={`text-xs ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
              
              {shouldShowRetry && onRetry && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                  }}
                  className="w-full mt-2 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 text-xs hover:bg-purple-600/30 transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Connection
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Hook to monitor network and RPC status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [rpcStatus, setRpcStatus] = useState<'connected' | 'disconnected' | 'slow' | 'checking'>('connected');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Test RPC connection
  const testRpcConnection = async () => {
    setRpcStatus('checking');
    
    try {
      const startTime = Date.now();
      const response = await fetch(process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth'
        })
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        setRpcStatus(responseTime > 3000 ? 'slow' : 'connected');
      } else {
        setRpcStatus('disconnected');
      }
    } catch (error) {
      console.error('RPC connection test failed:', error);
      setRpcStatus('disconnected');
    }
  };

  useEffect(() => {
    if (isOnline) {
      testRpcConnection();
      
      // Test every 30 seconds
      const interval = setInterval(testRpcConnection, 30000);
      return () => clearInterval(interval);
    } else {
      setRpcStatus('disconnected');
    }
  }, [isOnline]);

  return {
    isOnline,
    rpcStatus,
    testRpcConnection
  };
}
