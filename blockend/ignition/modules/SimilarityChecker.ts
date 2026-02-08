import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimilarityCheckerModule = buildModule("SimilarityCheckerModule", (m) => {
  // Set initial comparison fee to 0.001 ETH (1000000000000000 wei)
  const comparisonFee = m.getParameter("comparisonFee", "1000000000000000");

  const similarityChecker = m.contract("SimilarityChecker", [comparisonFee]);

  return { similarityChecker };
});

export default SimilarityCheckerModule;
