'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { ReactNode } from 'react';

// Create wagmi config
export const config = createConfig(
  getDefaultConfig({
    // App Info
    appName: 'Compx',
    appDescription: 'Code Comparison Tool with Yellow Network',
    appUrl: 'https://compx.vercel.app',
    appIcon: 'https://compx.vercel.app/logo.png',

    // WalletConnect Project ID
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // Chains
    chains: [baseSepolia, mainnet],
    transports: {
      [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_TESTNET_RPC || 'https://sepolia.base.org'),
      [mainnet.id]: http(),
    },
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="midnight">
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
