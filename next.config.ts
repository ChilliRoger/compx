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
      };
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'ws', 'utf-8-validate', 'bufferutil');
    return config;
  },
};

export default nextConfig;
