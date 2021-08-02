const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const TransactionCounter = require("./transaction.counter");

const TIME_INTERVAL_MINS = 5;
const MEDIUM_VOLUME_THRESHOLD = 10;
const HIGH_VOLUME_THRESHOLD = 30;
const CRITICAL_VOLUME_THRESHOLD = 50;

const txCounter = new TransactionCounter(TIME_INTERVAL_MINS);

function provideHandleTransaction(txCounter) {
  return async function handleTransaction(txEvent) {
    // report finding if transaction sender has high volume of transactions over specified time period
    const findings = [];
    const { from, hash: txHash } = txEvent.transaction;
    const blockTimestamp = txEvent.timestamp;

    // increment count for the from address
    const count = txCounter.increment(from, txHash, blockTimestamp);

    if (count < MEDIUM_VOLUME_THRESHOLD) return findings;

    findings.push(
      Finding.fromObject({
        name: "High Transaction Volume",
        description: `High transaction volume (${count}) from ${from}`,
        alertId: "FORTA-4",
        type: FindingType.Suspicious,
        severity: getSeverity(count),
        metadata: {
          from,
          transactions: JSON.stringify(txCounter.getTransactions(from)),
        },
      })
    );
    return findings;
  };
}

const getSeverity = (txCount) => {
  return txCount > CRITICAL_VOLUME_THRESHOLD
    ? FindingSeverity.Critical
    : txCount > HIGH_VOLUME_THRESHOLD
    ? FindingSeverity.High
    : FindingSeverity.Medium;
};

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(txCounter),
};
