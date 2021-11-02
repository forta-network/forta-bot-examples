const highGasUsedAgent = require("./high.gas.used");
const highGasFeeAgent = require("./high.gas.fee");

let findingsCount = 0;

function provideHandleTransaction(highGasUsedAgent, highGasFeeAgent) {
  return async function handleTransaction(txEvent) {
    // limiting this agent to emit only 5 findings so that the alert feed is not spammed
    if (findingsCount >= 5) return [];

    const findings = (
      await Promise.all([
        highGasUsedAgent.handleTransaction(txEvent),
        highGasFeeAgent.handleTransaction(txEvent),
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
    highGasFeeAgent
  ),
};
