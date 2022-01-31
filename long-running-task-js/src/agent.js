const { Finding, FindingSeverity, FindingType } = require("forta-agent");

let findingsCache = [];
let isTaskRunning = false;

async function runLongTask(blockNumber) {
  isTaskRunning = true;

  // simulating a long-running task that returns a finding after 35 seconds using setTimeout
  setTimeout(() => {
    findingsCache.push(
      Finding.fromObject({
        name: "Some alert",
        description: `alert description`,
        alertId: "ID",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          blockNumber,
        },
      })
    );

    isTaskRunning = false;
  }, 35000);
}

async function handleBlock(blockEvent) {
  // make sure only one task is running at a time
  if (!isTaskRunning) {
    runLongTask(blockEvent.blockNumber);
  }

  let findings = [];

  // check if we have any findings cached
  if (findingsCache.length > 0) {
    findings = findingsCache;
    findingsCache = [];
  }

  return findings;
}

module.exports = {
  handleBlock,
};
