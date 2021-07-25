// in-memory transaction counter that records transactions from an address over a specified time interval
module.exports = class TransactionCounter {
  constructor(timeIntervalMins) {
    this.timeIntervalMs = timeIntervalMins * 60 * 1000;
    this.transactionMap = {};
  }

  increment(from, txHash, blockTimestamp) {
    // if transactions array does not exist, initialize it
    if (!this.transactionMap[from]) {
      this.transactionMap[from] = [];
    }

    const blockTimestampMs = blockTimestamp * 1000; //convert seconds to ms
    // append transaction
    this.transactionMap[from].push({
      txHash,
      timestamp: blockTimestampMs,
    });
    // filter out any transactions that fall outside of the time interval
    this.transactionMap[from] = this.transactionMap[from].filter(
      (t) => t.timestamp > blockTimestampMs - this.timeIntervalMs
    );

    return this.transactionMap[from].length;
  }

  getTransactions(from) {
    return this.transactionMap[from]
      ? this.transactionMap[from].map((t) => t.txHash)
      : [];
  }
};
