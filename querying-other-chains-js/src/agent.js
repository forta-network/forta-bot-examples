const { Finding, FindingSeverity, FindingType, ethers } = require("forta-agent");

let findingsCache = [];
let isScanningGoerli = false;
let currentGoerliBlockNumber = -1;
const GOERLI_RPC_URL =
  "https://eth-goerli.alchemyapi.io/v2/NMpJ40wos2fBOzy5hhJzXHT3SL887lRw";
const goerliProvider = new ethers.providers.JsonRpcProvider(GOERLI_RPC_URL);

async function initialize() {
  currentGoerliBlockNumber = await goerliProvider.getBlockNumber();
}

async function scanGoerliBlocks() {
  isScanningGoerli = true;

  const latestGoerliBlockNumber = await goerliProvider.getBlockNumber();
  while (currentGoerliBlockNumber <= latestGoerliBlockNumber) {
    // fetch goerli block
    const goerliBlock = await goerliProvider.getBlock(currentGoerliBlockNumber);
    // fetch receipt for each transaction in block
    for (const tx of goerliBlock.transactions) {
      const receipt = await goerliProvider.getTransactionReceipt(tx);

      if (receipt.gasUsed.gt("1000000")) {
        findingsCache.push(
          Finding.fromObject({
            name: "High gas used",
            description: `Transaction with high gas usage: ${receipt.gasUsed.toString()}`,
            alertId: "GOERLI-1",
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
    currentGoerliBlockNumber++;
  }

  isScanningGoerli = false;
}

async function handleBlock(blockEvent) {
  let findings = [];

  // check if we have any findings cached
  if (findingsCache.length > 0) {
    findings = findingsCache;
    findingsCache = [];
  }

  // make sure only one task is running at a time
  if (!isScanningGoerli) {
    scanGoerliBlocks();
  }

  return findings;
}

module.exports = {
  initialize,
  handleBlock,
};
