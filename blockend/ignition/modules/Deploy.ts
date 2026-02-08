import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for SimilarityChecker contract
 * 
 * Default fee: 0.001 ETH (1000000000000000 wei)
 * 
 * To deploy:
 * npx hardhat ignition deploy ./ignition/modules/SimilarityChecker.ts --network <network>
 */
const SimilarityCheckerModule = buildModule("SimilarityCheckerModule", (m) => {
  // Comparison fee: 0.001 ETH by default
  const comparisonFee = m.getParameter("comparisonFee", "1000000000000000");

  const similarityChecker = m.contract("SimilarityChecker", [comparisonFee]);

  return { similarityChecker };
});

export default SimilarityCheckerModule;
