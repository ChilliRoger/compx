import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Custom Hardhat task to deploy SimilarityChecker contract
 * 
 * Usage: npx hardhat deploy-similarity --network <network>
 */
task("deploy-similarity", "Deploys the SimilarityChecker contract")
  .addOptionalParam("fee", "Comparison fee in ETH", "0.001")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("Deploying SimilarityChecker contract...");
    console.log("Network:", hre.network.name);
    
    // Convert fee to wei
    const feeInWei = hre.ethers.parseEther(taskArgs.fee);
    console.log("Comparison fee:", taskArgs.fee, "ETH (", feeInWei.toString(), "wei)");
    
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
    
    // Deploy contract
    const SimilarityChecker = await hre.ethers.getContractFactory("SimilarityChecker");
    const similarityChecker = await SimilarityChecker.deploy(feeInWei);
    
    await similarityChecker.waitForDeployment();
    
    const address = await similarityChecker.getAddress();
    console.log("✅ SimilarityChecker deployed to:", address);
    console.log("Owner:", deployer.address);
    console.log("Fee:", taskArgs.fee, "ETH");
    
    // Save deployment info
    console.log("\nAdd this to your .env.local:");
    console.log(`SIMILARITY_CHECKER_ADDRESS=${address}`);
    
    return address;
  });

/**
 * Task to verify deployed contract
 */
task("verify-similarity", "Verifies the SimilarityChecker contract on block explorer")
  .addParam("address", "Contract address")
  .addOptionalParam("fee", "Comparison fee in ETH", "0.001")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const feeInWei = hre.ethers.parseEther(taskArgs.fee);
    
    console.log("Verifying SimilarityChecker at:", taskArgs.address);
    
    try {
      await hre.run("verify:verify", {
        address: taskArgs.address,
        constructorArguments: [feeInWei.toString()],
      });
      console.log("✅ Contract verified!");
    } catch (error: any) {
      console.error("Verification failed:", error.message);
    }
  });

export {};
