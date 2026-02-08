import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ['viem', 'wagmi', 'connectkit'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        ws: false,
        'utf-8-validate': false,
        'bufferutil': false,
        '@base-org/account': false,
        '@coinbase/wallet-sdk': false,
        '@gemini-wallet/core': false,
        '@metamask/sdk': false,
        'porto': false,
        'porto/internal': false,
        '@safe-global/safe-apps-sdk': false,
        '@safe-global/safe-apps-provider': false,
        '@walletconnect/ethereum-provider': false,
      };
      
      // Suppress porto warnings completely
      config.ignoreWarnings = [
        { module: /porto/ },
        { module: /porto\/internal/ },
      ];
    }
    
    // Externalize ws and related packages for all builds
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding', 'ws');
    }
    
    return config;
  },
};

export default nextConfig;
