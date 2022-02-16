const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const {
  TETHER_ADDRESS,
  TETHER_DECIMALS,
  ERC20_TRANSFER,
} = require("./constants");

const TETHER_AMOUNT_THRESHOLD = 50;

const handleTransaction = async (txEvent) => {
  const findings = [];

  // filter for any tether transfer events
  const tetherTransfers = txEvent.filterLog(ERC20_TRANSFER, TETHER_ADDRESS);
  for (const transfer of tetherTransfers) {
    // if amount of tether being transferred is higher than threshold
    if (
      transfer.args.value.gt(TETHER_AMOUNT_THRESHOLD * 10 ** TETHER_DECIMALS)
    ) {
      findings.push(
        Finding.fromObject({
          name: "TETH transfer",
          description: "High TETH transfer",
          alertId: "TETH-1",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            value: transfer.args.value.div(10 ** TETHER_DECIMALS).toString(),
          },
        })
      );
    }
  }

  return findings;
};

module.exports = {
  handleTransaction,
};
