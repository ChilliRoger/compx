'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { createYellowClient, createSession, getSessionBalance, FEATURE_COSTS } from '@/blockend/utils/yellow';
import { parseEther } from 'viem';

interface YellowSessionData {
  sessionId: string | null;
  balance: bigint;
  isActive: boolean;
}

interface YellowContextType {
  session: YellowSessionData;
  createYellowSession: () => Promise<void>;
  makePayment: (feature: keyof typeof FEATURE_COSTS) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const YellowContext = createContext<YellowContextType | undefined>(undefined);

export function YellowProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [session, setSession] = useState<YellowSessionData>({
    sessionId: null,
    balance: 0n,
    isActive: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-create session when wallet connects
  useEffect(() => {
    if (isConnected && address && !session.isActive && walletClient && publicClient) {
      handleAutoCreateSession();
    }
  }, [isConnected, address, walletClient, publicClient]);

  const handleAutoCreateSession = async () => {
    if (!walletClient || !publicClient) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Create Yellow Network client
      const yellowClient = await createYellowClient(walletClient, publicClient);
      
      // Create session with initial deposit (0.1 ETH)
      const initialDeposit = parseEther('0.1');
      const sessionData = await createSession(yellowClient, initialDeposit);

      setSession({
        sessionId: sessionData.channelId,
        balance: sessionData.balance,
        isActive: true,
      });

      console.log('Yellow session created:', sessionData.channelId);
    } catch (err: any) {
      console.error('Failed to create Yellow session:', err);
      setError(err.message || 'Failed to create payment session');
    } finally {
      setIsLoading(false);
    }
  };

  const createYellowSession = async () => {
    if (!walletClient || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    await handleAutoCreateSession();
  };

  const makePayment = async (feature: keyof typeof FEATURE_COSTS): Promise<boolean> => {
    if (!session.isActive || !session.sessionId) {
      setError('No active payment session');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const cost = parseEther(FEATURE_COSTS[feature].toString());
      const receiverAddress = '0x696fbc5c90d07B45BD864fDbBA424691415F31A7';

      // Check if sufficient balance
      if (session.balance < cost) {
        setError(`Insufficient balance. Need ${FEATURE_COSTS[feature]} ETH`);
        return false;
      }

      // Transfer payment to receiver address via Yellow Network channel
      // In production, this would use Yellow Network's off-chain payment channel
      const newBalance = session.balance - cost;
      
      setSession(prev => ({
        ...prev,
        balance: newBalance,
      }));

      console.log(`Payment successful: ${FEATURE_COSTS[feature]} ETH for ${feature} → ${receiverAddress}`);
      return true;

    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YellowContext.Provider
      value={{
        session,
        createYellowSession,
        makePayment,
        isLoading,
        error,
      }}
    >
      {children}
    </YellowContext.Provider>
  );
}

export function useYellow() {
  const context = useContext(YellowContext);
  if (context === undefined) {
    throw new Error('useYellow must be used within YellowProvider');
  }
  return context;
}
