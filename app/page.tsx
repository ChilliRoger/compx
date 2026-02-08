"use client";

import { useState } from "react";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const handleConnectWallet = async () => {
    // Placeholder for wallet connection
    console.log("Connect wallet clicked");
    setWalletConnected(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            Compx
          </h1>
          <button
            onClick={handleConnectWallet}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              walletConnected
                ? "bg-green-600 text-white"
                : "bg-yellow-500 text-black hover:bg-yellow-400"
            }`}
          >
            {walletConnected ? "✓ Connected" : "Connect Wallet"}
          </button>
        </header>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">
            Code Similarity Analyzer
          </h2>
          
          <p className="text-gray-300 mb-8">
            Compare code across GitHub repositories and on-chain smart contracts.
            Pay-per-use with instant, gas-free transactions powered by Yellow Network.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* GitHub Mode Card */}
            <div className="bg-white/5 border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-semibold text-white mb-3">
                📁 GitHub Mode
              </h3>
              <p className="text-gray-300 mb-4">
                Compare two GitHub repositories and find similar codebases
              </p>
              <button
                disabled={!walletConnected}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
              >
                {walletConnected ? "Start Analysis" : "Connect Wallet First"}
              </button>
            </div>

            {/* On-Chain Mode Card */}
            <div className="bg-white/5 border border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all">
              <h3 className="text-xl font-semibold text-white mb-3">
                ⛓️ On-Chain Mode
              </h3>
              <p className="text-gray-300 mb-4">
                Compare deployed smart contracts and detect similar bytecode
              </p>
              <button
                disabled={!walletConnected}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
              >
                {walletConnected ? "Start Analysis" : "Connect Wallet First"}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-white font-semibold mb-2">Instant Payments</h3>
            <p className="text-gray-400 text-sm">
              Gas-free transactions with Yellow Network
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-white font-semibold mb-2">Secure & Trustless</h3>
            <p className="text-gray-400 text-sm">
              On-chain settlement ensures security
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-white font-semibold mb-2">Dynamic Analysis</h3>
            <p className="text-gray-400 text-sm">
              Real-time code comparison, no mocks
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
