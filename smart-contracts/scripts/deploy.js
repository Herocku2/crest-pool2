const hre = require("hardhat");

async function main() {
  // --- CONFIGURATION ---
  // Replace these with your actual addresses before deploying
  const TCT_ADDRESS = "0xYOUR_TCT_TOKEN_ADDRESS"; 
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
  const PANCAKE_V3_POOL_ADDRESS = "0xYOUR_V3_POOL_ADDRESS";

  // Initial parameters
  const manualPriceE18 = hre.ethers.utils.parseEther("0.01"); // 0.01 USDT per TCT
  const dailyCapUSDT = hre.ethers.utils.parseUnits("500", 18); // 500 USDT (assuming 18 decimals, adjust if USDT has 6 or 18 on your setup)
  // Note: USDT on BSC is 18 decimals. If it's 6, change to parseUnits("500", 6)
  
  const maxPerTxUSDT = hre.ethers.utils.parseUnits("100", 18); // 100 USDT
  
  console.log("Deploying LocalSellDesk with account:", (await hre.ethers.getSigners())[0].address);

  const LocalSellDesk = await hre.ethers.getContractFactory("LocalSellDesk");
  const sellDesk = await LocalSellDesk.deploy(
    TCT_ADDRESS,
    USDT_ADDRESS,
    PANCAKE_V3_POOL_ADDRESS,
    manualPriceE18,
    dailyCapUSDT,
    maxPerTxUSDT
  );

  await sellDesk.deployed();

  console.log("LocalSellDesk deployed to:", sellDesk.address);
  console.log("Please verify on BscScan using the address above.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
