const { ethers } = require("forta-agent");
const ganache = require("ganache-core");
const { USER } = require("./src/constants");

const RPC_URL = "https://mainnet.infura.io/v3/YOUR_API_KEY";
const PORT = 7545;

async function runGanacheFork() {
  // get the latest block number
  console.log(`fetching latest block number...`);
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const blockNumber = await provider.getBlockNumber();

  // fork the chain from the block number and unlock an account to simulate transactions from
  console.log(
    `starting ganache fork on block ${blockNumber} from ${RPC_URL}...`
  );
  const server = ganache.server({
    fork: RPC_URL,
    fork_block_number: blockNumber,
    unlocked_accounts: [USER],
  });

  // start a rpc server
  server.listen(PORT, () => {
    console.log(`json-rpc listening on port ${PORT}`);
  });
}

runGanacheFork();
