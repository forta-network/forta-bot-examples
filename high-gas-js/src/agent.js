const highGasUsedAgent = require("./high.gas.used");
const highGasFeeAgent = require("./high.gas.fee");

const handleTransaction = async (txEvent) => {
  const findings = [];

  const [highGasUsedFindings, highGasFeeFindings] = await Promise.all([
    highGasUsedAgent.handleTransaction(txEvent),
    highGasFeeAgent.handleTransaction(txEvent),
  ]);

  findings.push(...highGasUsedFindings);
  findings.push(...highGasFeeFindings);
  return findings;
};

module.exports = {
  handleTransaction,
};
