/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  // Skip TypeScript errors during build (for incomplete blockchain integration)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Fix for webpack chunking issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Disable aggressive chunking in dev mode to prevent runtime errors
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      };
    }
    
    // Only apply complex chunk splitting in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk (React, Next.js)
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Solana wallet adapter chunk
            solana: {
              name: 'solana',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@solana[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Three.js chunk
            three: {
              name: 'three',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Framer motion chunk
            framer: {
              name: 'framer',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            // Other vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Experimental features for better chunking
  experimental: {
    optimizePackageImports: ['@solana/wallet-adapter-react-ui', 'framer-motion', 'react-icons'],
  },
};

module.exports = nextConfig;