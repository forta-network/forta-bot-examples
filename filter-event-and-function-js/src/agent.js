const largeTransferEventAgent = require("./large.transfer.event");
const transferFromFunctionAgent = require("./transfer.from.function");

let findingsCount = 0;

function provideHandleTransaction(
  largeTransferEventAgent,
  transferFromFunctionAgent
) {
  return async function handleTransaction(txEvent) {
    // limiting this agent to emit only 5 findings so that the alert feed is not spammed
    if (findingsCount >= 5) return [];

    const findings = (
      await Promise.all([
        largeTransferEventAgent.handleTransaction(txEvent),
        transferFromFunctionAgent.handleTransaction(txEvent),
      ])
    ).flat();

    findingsCount += findings.length;
    return findings;
  };
}

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(
    largeTransferEventAgent,
    transferFromFunctionAgent
  ),
};
