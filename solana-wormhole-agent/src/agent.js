const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const solanaWeb3 = require("@solana/web3.js");

let findingsCache = [];
let isScanningSolana = false;
let currentSolanaSlot = -1;
const solanaConnection = new solanaWeb3.Connection(
  "https://solana-api.projectserum.com"
);
const WORMHOLE_ADDRESS = "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb";

async function initialize() {
  currentSolanaSlot = await solanaConnection.getSlot();
  console.log(`** currentSolanaSlot: ${currentSolanaSlot}`);
  // scan for blocks every 5 seconds
  setInterval(scanSolanaBlocks, 5000);
}

async function scanSolanaBlocks() {
  if (isScanningSolana) {
    console.log(`** already scanning blocks. returning`);
    return;
  }

  isScanningSolana = true;

  const latestSolanaSlot = (await solanaConnection.getSlot()) - 4; // keeping few slots behind to prevent block not available error
  console.log(
    `** fetching block numbers for slots ${currentSolanaSlot} to ${latestSolanaSlot}...`
  );
  const blockNumbers = await solanaConnection.getBlocks(
    currentSolanaSlot,
    latestSolanaSlot
  );
  currentSolanaSlot = latestSolanaSlot;
  console.log(`** fetching blocks`);
  const blocks = await Promise.all(
    blockNumbers.map((blockNumber) => solanaConnection.getBlock(blockNumber))
  );
  console.log(`** fetched ${blocks.length} blocks`);
  let txCounter = 0;
  const startTime = Date.now();
  for (const block of blocks) {
    for (const tx of block.transactions) {
      findingsCache.push(...getFindingsFromTx(tx));
      txCounter++;
    }
  }
  const endTime = Date.now();
  console.log(
    `** scanned ${txCounter} transactions in ${endTime - startTime}ms`
  );

  isScanningSolana = false;
}

function getFindingsFromTx(tx) {
  const findings = [];

  // if not interacting with Wormhole contract, return
  const { accountKeys, instructions } = tx.transaction.message;
  const programId =
    accountKeys[instructions.length ? instructions[0].programIdIndex : 0];
  if (programId != WORMHOLE_ADDRESS) {
    return findings;
  }

  // for each token involved, check the amount increase ratio
  const { postTokenBalances, preTokenBalances } = tx.meta;
  postTokenBalances.forEach((postTokenBalance, index) => {
    const token = postTokenBalance.mint;
    // if no minted token, return
    if (!token) return;

    const postTokenAmount = postTokenBalance.uiTokenAmount.uiAmount;
    const preTokenAmount = preTokenBalances[index].uiTokenAmount.uiAmount;
    // if the preToken amount was 0 or greater than postToken amount, dont flag the transaction
    if (!preTokenAmount || preTokenAmount > postTokenAmount) return;

    const amountIncreaseRatio = postTokenAmount / preTokenAmount;
    if (amountIncreaseRatio > 100) {
      findings.push(
        Finding.fromObject({
          name: "High Wormhole Token Balance Increase",
          description: `Wormhole transaction with high balance increase: ${amountIncreaseRatio}x`,
          alertId: "WORM-1",
          severity: FindingSeverity.Info,
          type: FindingType.Suspicious,
          metadata: {
            token,
            owner: postTokenBalance.owner,
            preBalance: preTokenAmount,
            postBalance: postTokenAmount,
            increaseRatio: amountIncreaseRatio,
          },
        })
      );
    }
  });

  return findings;
}

async function handleBlock(blockEvent) {
  let findings = [];

  // check if we have any findings cached
  if (findingsCache.length > 0) {
    findings = findingsCache;
    findingsCache = [];
  }

  return findings;
}

module.exports = {
  initialize,
  handleBlock,
  getFindingsFromTx,
};
