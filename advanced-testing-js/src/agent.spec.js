const ganache = require("ganache-core");
const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
  getJsonRpcUrl,
  createTransactionEvent,
} = require("forta-agent");
const {
  USER,
  USER2,
  TETHER_ABI,
  TETHER_ADDRESS,
  TETHER_DECIMALS,
} = require("./constants");
const { handleTransaction } = require("./agent");

describe("Tether transfer agent", () => {
  let provider;
  let tetherContract;
  const TESTCASE_TIMEOUT = 30000; // override the default 5s jest timeout

  beforeAll(async () => {
    // get latest block number
    const blockNumber = await new ethers.providers.JsonRpcProvider(
      getJsonRpcUrl()
    ).getBlockNumber();
    // start ganache fork
    provider = new ethers.providers.Web3Provider(
      ganache.provider({
        fork: getJsonRpcUrl(),
        fork_block_number: blockNumber, // WARNING: if using infura, must be at most 128 blocks old
        unlocked_accounts: [USER],
      })
    );
    // reference to Tether contract
    tetherContract = new ethers.Contract(
      TETHER_ADDRESS,
      TETHER_ABI,
      provider.getSigner(USER)
    );
  });

  it(
    "returns empty findings for a transfer below the threshold",
    async () => {
      const tx = await tetherContract.transfer(
        USER2,
        10 * 10 ** TETHER_DECIMALS
      );
      const receipt = await tx.wait();
      const txEvent = createTransactionEvent({
        transaction: tx,
        receipt,
        block: {
          hash: tx.blockHash,
          number: tx.blockNumber,
          timestamp: Date.now(),
        },
      });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    },
    TESTCASE_TIMEOUT
  );

  it(
    "returns a finding for a transfer above the threshold",
    async () => {
      const tx = await tetherContract.transfer(
        USER2,
        100 * 10 ** TETHER_DECIMALS
      );
      const receipt = await tx.wait();
      const txEvent = createTransactionEvent({
        transaction: tx,
        receipt,
        block: {
          hash: tx.blockHash,
          number: tx.blockNumber,
          timestamp: Date.now(),
        },
      });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "TETH transfer",
          description: "High TETH transfer",
          alertId: "TETH-1",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            value: "100",
          },
        }),
      ]);
    },
    TESTCASE_TIMEOUT
  );
});
