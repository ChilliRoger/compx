/**
 * Yellow Network Nitrolite Client Utilities
 * 
 * Integration with Yellow Network for session-based, off-chain payments
 * with on-chain settlement.
 * 
 * Documentation: https://docs.yellow.org/docs/build/quick-start
 * SDK: @erc7824/nitrolite
 */

// Note: Install @erc7824/nitrolite package first
// npm install @erc7824/nitrolite

import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { baseSepolia } from 'viem/chains';

// Yellow Network Configuration
export const YELLOW_CONFIG = {
  WEBSOCKET_URL: process.env.YELLOW_WS || 'wss://clearnet-sandbox.yellow.com/ws',
  TESTNET_RPC: process.env.BASE_TESTNET_RPC || 'https://sepolia.base.org',
  CHAIN_ID: 84532, // Base Sepolia
};

/**
 * Create Yellow Nitrolite Client
 * 
 * This creates a client for interacting with Yellow Network's state channels
 * 
 * @param walletClient - Viem wallet client with account
 * @param publicClient - Viem public client for reading blockchain data
 * @returns Nitrolite client instance
 */
export async function createYellowClient(walletClient: any, publicClient: any) {
  // Dynamic import to avoid build issues if package not installed yet
  try {
    const { NitroliteClient, WalletStateSigner } = await import('@erc7824/nitrolite');
    
    // Create state signer for off-chain operations
    const stateSigner = new WalletStateSigner(walletClient);
    
    // Create Nitrolite client with required config
    const nitroliteClient = new NitroliteClient({
      walletClient,
      publicClient,
      stateSigner,
    });
    
    return nitroliteClient;
  } catch (error) {
    console.error('Failed to create Yellow client. Make sure @erc7824/nitrolite is installed:', error);
    throw new Error('Yellow SDK not available');
  }
}

/**
 * Create a new wallet session
 * 
 * Sessions allow users to lock funds once and make multiple instant
 * off-chain transactions without gas fees
 * 
 * @param nitroliteClient - Nitrolite client instance
 * @param amount - Amount to lock in session (in wei)
 * @returns Session ID
 */
export async function createSession(nitroliteClient: any, amount: bigint) {
  try {
    const sessionId = await nitroliteClient.createSession({
      amount,
      duration: 3600, // 1 hour session
    });
    
    console.log('Session created:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
}

/**
 * Make an off-chain payment within a session
 * 
 * @param nitroliteClient - Nitrolite client instance
 * @param sessionId - Active session ID
 * @param amount - Amount to pay (in wei)
 * @param recipient - Recipient address (optional, defaults to app)
 */
export async function makePayment(
  nitroliteClient: any,
  sessionId: string,
  amount: bigint,
  recipient?: string
) {
  try {
    const payment = await nitroliteClient.pay({
      sessionId,
      amount,
      recipient,
    });
    
    console.log('Payment made:', payment);
    return payment;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

/**
 * Close session and settle on-chain
 * 
 * This finalizes all off-chain transactions on the blockchain
 * 
 * @param nitroliteClient - Nitrolite client instance
 * @param sessionId - Session ID to close
 */
export async function closeSession(nitroliteClient: any, sessionId: string) {
  try {
    const settlement = await nitroliteClient.closeSession(sessionId);
    
    console.log('Session closed and settled:', settlement);
    return settlement;
  } catch (error) {
    console.error('Failed to close session:', error);
    throw error;
  }
}

/**
 * Get session balance
 * 
 * @param nitroliteClient - Nitrolite client instance
 * @param sessionId - Session ID
 */
export async function getSessionBalance(nitroliteClient: any, sessionId: string) {
  try {
    const balance = await nitroliteClient.getBalance(sessionId);
    return balance;
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw error;
  }
}

/**
 * Helper to create public and wallet clients for viem
 */
export function createViemClients() {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(YELLOW_CONFIG.TESTNET_RPC),
  });
  
  // Wallet client with browser wallet (MetaMask, etc.)
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom((window as any).ethereum),
  });
  
  return { publicClient, walletClient };
}

/**
 * Payment amounts for app features (in wei)
 */
export const FEATURE_COSTS = {
  GITHUB_COMPARISON: BigInt('10000000000000000'), // 0.01 ETH
  GITHUB_SIMILAR_REPOS: BigInt('5000000000000000'), // 0.005 ETH
  ONCHAIN_COMPARISON: BigInt('10000000000000000'), // 0.01 ETH
  ONCHAIN_SIMILAR_CONTRACTS: BigInt('5000000000000000'), // 0.005 ETH
};

/**
 * Format wei to ETH for display
 */
export function formatEth(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4);
}
