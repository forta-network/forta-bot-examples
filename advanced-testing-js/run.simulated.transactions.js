const { ethers, getEthersProvider } = require("forta-agent");
const {
  USER,
  USER2,
  TETHER_ADDRESS,
  TETHER_ABI,
  TETHER_DECIMALS,
} = require("./src/constants");

async function runSimulatedTransactions() {
  // get an ethers provider that points to the ganache fork (will read the jsonRpcUrl from the project's forta.config.json)
  const provider = getEthersProvider();
  const tether = new ethers.Contract(
    TETHER_ADDRESS,
    TETHER_ABI,
    provider.getSigner(USER)
  );

  // simulate a tether transfer for 100 TETH
  console.log(`sending tx for transferring 100 TETH...`);
  const tx1 = await tether.transfer(USER2, 100 * 10 ** TETHER_DECIMALS);
  const receipt1 = await tx1.wait();
  console.log(receipt1);

  // simulate a tether transfer for 10 TETH
  console.log(`sending tx for transferring 10 TETH...`);
  const tx2 = await tether.transfer(USER2, 10 * 10 ** TETHER_DECIMALS);
  const receipt2 = await tx2.wait();
  console.log(receipt2);
}

runSimulatedTransactions();
