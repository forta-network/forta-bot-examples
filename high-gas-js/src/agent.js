const { getTransactionReceipt } = require("forta-agent")
const highGasUsedAgent = require("./high.gas.used");
const highGasFeeAgent = require("./high.gas.fee");

let findingsCount = 0;

function provideHandleTransaction(highGasUsedAgent, highGasFeeAgent, getTransactionReceipt) {
  return async function handleTransaction(txEvent) {
    // limiting this agent to emit only 5 findings so that the alert feed is not spammed
    if (findingsCount >= 5) return [];

    const { gasUsed } = await getTransactionReceipt(txEvent.hash)
    const findings = (
      await Promise.all([
        highGasUsedAgent.handleTransaction(txEvent, gasUsed),
        highGasFeeAgent.handleTransaction(txEvent, gasUsed),
      ])
    ).flat();

    findingsCount += findings.length;
    return findings;
  };
}

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(
    highGasUsedAgent,
    highGasFeeAgent,
    getTransactionReceipt
  ),
};
