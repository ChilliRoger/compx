'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';

export function WalletButton() {
  return (
    <ConnectKitButton />
  );
}

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    chain,
    connect,
    disconnect,
    connectors,
  };
}
