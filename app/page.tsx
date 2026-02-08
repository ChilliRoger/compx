"use client";

import { useState } from "react";
import { WalletButton, useWallet } from "@/frontend/components/WalletButton";

export default function Home() {
  const { isConnected } = useWallet();
  const [activeMode, setActiveMode] = useState<'github' | 'onchain' | null>(null);
  
  // GitHub mode state
  const [repo1Url, setRepo1Url] = useState("");
  const [repo2Url, setRepo2Url] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchRepo = async () => {
    if (!repo1Url) {
      setError("Please enter a repository URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/github/fetch-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: repo1Url }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch repository");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            Compx
          </h1>
          <WalletButton />
        </header>

        {/* Mode Selection or Content */}
        {!activeMode ? (
          <>
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
                    disabled={!isConnected}
                    onClick={() => setActiveMode('github')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                  >
                    {isConnected ? "Start Analysis" : "Connect Wallet First"}
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
                    disabled={!isConnected}
                    onClick={() => setActiveMode('onchain')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                  >
                    {isConnected ? "Start Analysis" : "Connect Wallet First"}
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
          </>
        ) : activeMode === 'github' ? (
          /* GitHub Mode UI */
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                📁 GitHub Repository Analysis
              </h2>
              <button
                onClick={() => {
                  setActiveMode(null);
                  setResult(null);
                  setError(null);
                  setRepo1Url("");
                  setRepo2Url("");
                }}
                className="text-gray-300 hover:text-white"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Repository URL #1</label>
                <input
                  type="text"
                  value={repo1Url}
                  onChange={(e) => setRepo1Url(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Repository URL #2 (Optional for testing)</label>
                <input
                  type="text"
                  value={repo2Url}
                  onChange={(e) => setRepo2Url(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleFetchRepo}
                disabled={isLoading || !repo1Url}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {isLoading ? "Fetching..." : "Fetch Repository Data"}
              </button>

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                  {error}
                </div>
              )}

              {result && (
                <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    ✅ Repository Fetched Successfully
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p><strong>Name:</strong> {result.repo.full_name}</p>
                    <p><strong>Description:</strong> {result.repo.description || 'No description'}</p>
                    <p><strong>Default Branch:</strong> {result.repo.default_branch}</p>
                    <p><strong>Files Fetched:</strong> {result.files.length} / {result.totalFiles}</p>
                    <a 
                      href={result.repo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline inline-block mt-2"
                    >
                      View on GitHub →
                    </a>
                  </div>

                  {result.files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-2">Sample Files:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        {result.files.slice(0, 5).map((file: any, idx: number) => (
                          <li key={idx} className="truncate">
                            📄 {file.path} ({(file.size / 1024).toFixed(2)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* On-Chain Mode UI - Placeholder */
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                ⛓️ Smart Contract Analysis
              </h2>
              <button
                onClick={() => setActiveMode(null)}
                className="text-gray-300 hover:text-white"
              >
                ← Back
              </button>
            </div>
            <p className="text-gray-300">
              On-chain mode coming in Step 4...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
