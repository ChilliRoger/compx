# Blockend - Smart Contracts

This folder contains the Hardhat project for Compx smart contracts.

## Contracts

- `SimilarityChecker.sol`: Main contract for on-chain code similarity analysis

## Setup

The contracts are part of the main Compx project. Dependencies are installed at the root level.

## Commands

From the blockend directory:

```bash
# Compile contracts
npm run compile

# Test contracts
npm run test

# Deploy to local network
npm run deploy:local

# Deploy to Base Sepolia testnet
npm run deploy:baseSepolia
```

## Environment Variables

Add to `.env.local` in the project root:

```
PRIVATE_KEY=your_private_key_here
BASE_TESTNET_RPC=https://sepolia.base.org
```
