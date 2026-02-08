# Compx - Code Comparison Tool

A hybrid pay-per-use dApp for comparing code similarities, powered by Yellow Network.

## Features

- **GitHub Mode**: Compare code similarities across public GitHub repositories
- **On-Chain Mode**: Analyze deployed smart contract bytecode and opcodes
- **Yellow Network Integration**: Gas-free, instant payments with on-chain settlement
- **Dynamic Analysis**: No mocks or hardcoded data - all fetches are live

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Blockchain**: Hardhat, Solidity, viem, wagmi
- **Payment Layer**: Yellow Network SDK (Nitrolite protocol)
- **AI/Similarity**: string-similarity, natural (Node.js)

## Project Structure

```
compx/
├── frontend/     # Client-side components, pages, UI
├── backend/      # API routes, server-side logic
├── blockend/     # Smart contracts, Hardhat config, Yellow integration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- GitHub Personal Access Token
- Yellow Network testnet access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ChilliRoger/compx.git
cd compx
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local .env.local
# Edit .env.local with your API keys
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Development Roadmap

- [x] Step 1: Project setup and initialization
- [ ] Step 2: Backend APIs + Smart contracts + Simple UI
- [ ] Step 3: Wallet connection + GitHub similarity feature
- [ ] Step 4: On-chain contract comparison feature
- [ ] Step 5: Full frontend polish + deployment
- [ ] Step 6: Testing + hackathon submission

## Hackathon: HackMoney 2026

Built for the Yellow Network prize track at ETHGlobal's HackMoney 2026.

## License

MIT
