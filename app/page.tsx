"use client";

import { useState } from "react";
import { WalletButton, useWallet } from "@/frontend/components/WalletButton";
import { useYellow } from "@/frontend/contexts/YellowProvider";
import { formatEther } from "viem";

export default function Home() {
  const { isConnected } = useWallet();
  const { session, makePayment, isLoading: yellowLoading, error: yellowError } = useYellow();
  const [activeMode, setActiveMode] = useState<'github' | 'onchain' | null>(null);
  const [activeTab, setActiveTab] = useState<'compare' | 'similar'>('compare');
  
  // GitHub mode state
  const [repo1Url, setRepo1Url] = useState("");
  const [repo2Url, setRepo2Url] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompareRepos = async () => {
    if (!repo1Url || !repo2Url) {
      setError("Please enter both repository URLs");
      return;
    }

    // Make payment first
    const paymentSuccess = await makePayment('GITHUB_COMPARISON');
    if (!paymentSuccess) {
      setError(yellowError || "Payment failed");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/github/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repo1Url, repo2Url }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to compare repositories");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSimilar = async () => {
    if (!repo1Url) {
      setError("Please enter a repository URL");
      return;
    }

    // Make payment first
    const paymentSuccess = await makePayment('GITHUB_SIMILAR_REPOS');
    if (!paymentSuccess) {
      setError(yellowError || "Payment failed");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/github/similar-repos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: repo1Url, limit: 5 }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to find similar repositories");
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
          <div className="flex items-center gap-4">
            {session.isActive && (
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <p className="text-xs text-gray-400">Session Balance</p>
                <p className="text-white font-semibold">
                  {formatEther(session.balance)} ETH
                </p>
              </div>
            )}
            <WalletButton />
          </div>
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
                  setActiveTab('compare');
                }}
                className="text-gray-300 hover:text-white"
              >
                ← Back
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/20">
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-4 py-2 font-semibold transition-all ${
                  activeTab === 'compare'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Compare Repos
              </button>
              <button
                onClick={() => setActiveTab('similar')}
                className={`px-4 py-2 font-semibold transition-all ${
                  activeTab === 'similar'
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Find Similar
              </button>
            </div>

            {/* Compare Tab */}
            {activeTab === 'compare' && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-200 text-sm">
                  💰 Cost: 0.01 ETH • Compare two repositories for code similarity
                </div>

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
                  <label className="block text-white mb-2">Repository URL #2</label>
                  <input
                    type="text"
                    value={repo2Url}
                    onChange={(e) => setRepo2Url(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleCompareRepos}
                  disabled={isLoading || yellowLoading || !repo1Url || !repo2Url || !session.isActive}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {isLoading || yellowLoading ? "Processing..." : "Pay & Compare Repositories"}
                </button>

                {error && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                    {error}
                  </div>
                )}

                {result && result.similarity && (
                  <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      ✅ Comparison Results
                    </h3>
                    
                    {/* Overall Similarity */}
                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-6 mb-6">
                      <div className="text-center">
                        <p className="text-gray-300 mb-2">Overall Similarity</p>
                        <p className="text-5xl font-bold text-white">
                          {result.similarity.overall.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Repository Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Repository 1</h4>
                        <p className="text-gray-300 text-sm">{result.repo1.fullName}</p>
                        <p className="text-gray-400 text-xs mt-1">{result.repo1.language} • ⭐ {result.repo1.stars}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Repository 2</h4>
                        <p className="text-gray-300 text-sm">{result.repo2.fullName}</p>
                        <p className="text-gray-400 text-xs mt-1">{result.repo2.language} • ⭐ {result.repo2.stars}</p>
                      </div>
                    </div>

                    {/* Top Matches */}
                    <div>
                      <h4 className="text-white font-semibold mb-3">
                        Top Similar Files ({result.similarity.matchedFiles} matches)
                      </h4>
                      <div className="space-y-2">
                        {result.similarity.topMatches.map((match: any, idx: number) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                            <div className="text-sm text-gray-300 truncate flex-1">
                              <p className="truncate">📄 {match.file1}</p>
                              <p className="truncate text-gray-500">↔️ {match.file2}</p>
                            </div>
                            <div className="ml-4 px-3 py-1 bg-blue-500/20 rounded text-blue-300 font-semibold text-sm">
                              {match.similarity.toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Similar Tab */}
            {activeTab === 'similar' && (
              <div className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-purple-200 text-sm">
                  💰 Cost: 0.005 ETH • Find similar repositories on GitHub
                </div>

                <div>
                  <label className="block text-white mb-2">Repository URL</label>
                  <input
                    type="text"
                    value={repo1Url}
                    onChange={(e) => setRepo1Url(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={handleFindSimilar}
                  disabled={isLoading || yellowLoading || !repo1Url || !session.isActive}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {isLoading || yellowLoading ? "Searching..." : "Pay & Find Similar Repos"}
                </button>

                {error && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                    {error}
                  </div>
                )}

                {result && result.similarRepos && (
                  <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      ✅ Similar Repositories Found ({result.count})
                    </h3>
                    
                    <div className="space-y-3">
                      {result.similarRepos.map((repo: any, idx: number) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold">{repo.fullName}</h4>
                              <p className="text-gray-400 text-sm mt-1">{repo.description || 'No description'}</p>
                              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                <span>{repo.language}</span>
                                <span>⭐ {repo.stars}</span>
                              </div>
                            </div>
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
