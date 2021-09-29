const highGasUsedAgent = require("./high.gas.used");
const highGasFeeAgent = require("./high.gas.fee");

function provideHandleTransaction(highGasUsedAgent, highGasFeeAgent) {
  return async function handleTransaction(txEvent) {
    const findings = [];

    const [highGasUsedFindings, highGasFeeFindings] = await Promise.all([
      highGasUsedAgent.handleTransaction(txEvent),
      highGasFeeAgent.handleTransaction(txEvent),
    ]);

    findings.push(...highGasUsedFindings);
    findings.push(...highGasFeeFindings);
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
