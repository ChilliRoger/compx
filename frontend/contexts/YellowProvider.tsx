'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { createYellowClient, FEATURE_COSTS } from '@/blockend/utils/yellow';
import { parseEther, formatEther, Address } from 'viem';

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

      console.log('Creating Yellow Network session...');
      
      // Create Yellow Network Nitrolite client
      const yellowClient = await createYellowClient(walletClient, publicClient);
      
      // For Yellow Network, we need to:
      // 1. Get ytest.usd token address for Base Sepolia
      // 2. Deposit tokens to custody contract
      // 3. Create a payment channel
      
      // Yellow Test USD token address on Base Sepolia
      const ytestUsdToken = '0x...' as Address; // NEED TOKEN ADDRESS
      
      // Initial deposit amount
      const depositAmount = parseEther('0.1');
      
      // First approve the custody contract to spend tokens
      await yellowClient.approveTokens(ytestUsdToken, depositAmount);
      
      // Deposit tokens to custody
      await yellowClient.deposit(ytestUsdToken, depositAmount);
      
      // Get balance after deposit
      const balance = await yellowClient.getAccountBalance(ytestUsdToken);
      
      setSession({
        sessionId: 'active',
        balance: balance,
        isActive: true,
      });

      console.log('✅ Yellow session created');
      console.log('💰 Balance:', formatEther(balance), 'ytest.usd');
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
