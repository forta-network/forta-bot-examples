const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

let findingsCache = [];
let isScanningRinkeby = false;
let currentRinkebyBlockNumber = -1;
const RINKEBY_RPC_URL = "https://rinkeby.infura.io/v3/YOUR_API_KEY";
const rinkebyProvider = new ethers.providers.JsonRpcProvider(RINKEBY_RPC_URL);

async function initialize() {
  currentRinkebyBlockNumber = await rinkebyProvider.getBlockNumber();
}

async function scanRinkebyBlocks() {
  isScanningRinkeby = true;

  const latestRinkebyBlockNumber = await rinkebyProvider.getBlockNumber();
  while (currentRinkebyBlockNumber <= latestRinkebyBlockNumber) {
    // fetch rinkeby block
    const rinkebyBlock = await rinkebyProvider.getBlock(
      currentRinkebyBlockNumber
    );
    // fetch receipt for each transaction in block
    for (const tx of rinkebyBlock.transactions) {
      const receipt = await rinkebyProvider.getTransactionReceipt(tx);

      if (receipt.gasUsed.gt("1000000")) {
        findingsCache.push(
          Finding.fromObject({
            name: "High gas used",
            description: `Transaction with high gas usage: ${receipt.gasUsed.toString()}`,
            alertId: "RINK-1",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            metadata: {
              txHash: tx,
              gasUsed: receipt.gasUsed.toString(),
            },
          })
        );
      }
    }
    currentRinkebyBlockNumber++;
  }

  isScanningRinkeby = false;
}

async function handleBlock(blockEvent) {
  let findings = [];

  // check if we have any findings cached
  if (findingsCache.length > 0) {
    findings = findingsCache;
    findingsCache = [];
  }

  // make sure only one task is running at a time
  if (!isScanningRinkeby) {
    scanRinkebyBlocks();
  }

  return findings;
}

module.exports = {
  initialize,
  handleBlock,
};
