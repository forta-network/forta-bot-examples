const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const TransactionCounter = require("./transaction.counter");

const TIME_INTERVAL_MINS = 5;
const THRESHOLD = 10;

const txCounter = new TransactionCounter(TIME_INTERVAL_MINS);
let findingsCount = 0;

function provideHandleTransaction(txCounter) {
  return async function handleTransaction(txEvent) {
    // limiting this agent to emit only 5 findings so that the alert feed is not spammed
    if (findingsCount >= 5) return [];

    // report finding if transaction sender has high volume of transactions over specified time period
    const findings = [];
    const { from, hash: txHash } = txEvent.transaction;
    const blockTimestamp = txEvent.timestamp;

    // increment count for the from address
    const count = txCounter.increment(from, txHash, blockTimestamp);

    if (count < THRESHOLD) return findings;

    findings.push(
      Finding.fromObject({
        name: "High Transaction Volume",
        description: `High transaction volume (${count}) from ${from}`,
        alertId: "FORTA-4",
        type: FindingType.Suspicious,
        severity: FindingSeverity.Medium,
        metadata: {
          from,
          transactions: JSON.stringify(txCounter.getTransactions(from)),
        },
      })
    );

    txCounter.reset(from);
    findingsCount += findings.length;
    return findings;
  };
}

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(txCounter),
};
