# API Routes

Next.js API routes for server-side operations.

## Structure

- `github/` - GitHub repository comparison endpoints
  - `fetch-repo/` - Fetch repository contents
  - `compare/` - Compare two repositories
  - `similar-repos/` - Find similar repositories

- `onchain/` - On-chain smart contract comparison endpoints
  - `compare/` - Compare contract bytecodes
  - `similar-contracts/` - Find similar contracts

## Usage

These routes are automatically served by Next.js at:
- `http://localhost:3000/api/github/*`
- `http://localhost:3000/api/onchain/*`

## Note

All routes are serverless functions deployed as Vercel Edge Functions.
