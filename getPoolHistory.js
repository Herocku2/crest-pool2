
import { ethers } from 'ethers';

const poolAddress = '0x4bC40440E313CDDd60b473A02Cb839469FeFbd3f';
const rpcUrl = 'https://bsc-dataseed.binance.org/';

const poolAbi = [
  'event Mint(address sender, address owner, int24 tickLower, int24 tickUpper, uint128 amount, uint256 amount0, uint256 amount1)'
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const pool = new ethers.Contract(poolAddress, poolAbi, provider);

  console.log('Fetching Mint events...');
  
  // BSC Mainnet started around block 0, but let's look from block 25,000,000 (approx early 2023) or just recent if we assume it's new.
  // Or simpler: query from block 0 (might be slow) or find creation block via getCode?
  // Let's try to search from block 30,000,000 (July 2023) to Latest.
  // Actually, standard RPCs limit block range. I'll try last 100,000 blocks first, then widen if needed.
  // Wait, if it's an old pool, this won't work easily.
  // Better approach: get the code, but that doesn't give date.
  // I will try to get the current block number and search back in chunks, or just try a broad search if allowed.
  
  // Let's try to get logs from block 0 to latest (might fail).
  // If it fails, I'll try to guess.
  
  try {
      const filter = pool.filters.Mint();
      // Try fetching from a likely block range. BSC is at ~35M+ blocks.
      // Let's try fetching from 30M to current.
      const currentBlock = await provider.getBlockNumber();
      console.log(`Current block: ${currentBlock}`);
      
      const startBlock = 0; // Try from beginning if possible, else provider will error.
      // Many public RPCs allow 5000 block range.
      // This is hard without an indexer.
      
      // ALTERNATIVE: just get the slot0 to confirm it has liquidity.
      // But user wants the DATE.
      
      // Let's try a binary search approach for the deployment block? No, too complex.
      // Let's just try to get the FIRST log by querying from block 0 (some RPCs allow if few results).
      // Or just try the last 1M blocks.
      
      const logs = await pool.queryFilter(filter, 0, 'latest');
      if (logs.length > 0) {
          const firstMint = logs[0];
          const block = await firstMint.getBlock();
          console.log(`First Mint found!`);
          console.log(`Block Number: ${firstMint.blockNumber}`);
          console.log(`Date: ${new Date(block.timestamp * 1000).toUTCString()}`);
          console.log(`Transaction Hash: ${firstMint.transactionHash}`);
      } else {
          console.log('No Mint events found (or RPC limit hit).');
      }
  } catch (e) {
      console.error('Error fetching logs:', e.message);
  }
}

main();
