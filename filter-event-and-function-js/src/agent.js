const {
  handleTransaction: handleLargeTransferEvent,
} = require("./large.transfer.event");
const {
  handleTransaction: handleTransferFromFunction,
} = require("./transfer.from.function");

let findingsCount = 0;

const handleTransaction = async (txEvent) => {
  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return [];

  const findings = (
    await Promise.all([
      handleLargeTransferEvent(txEvent),
      handleTransferFromFunction(txEvent),
    ])
  ).flat();
  findingsCount += findings.length;

  return findings;
};

module.exports = {
  handleTransaction,
};
