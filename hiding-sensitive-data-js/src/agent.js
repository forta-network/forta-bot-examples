const BigNumber = require("bignumber.js");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");

let findingsCount = 0;
// this is the sensitive data we want to obfuscate
const INFURA_API_KEY = "97d4fafcc17b46819295fa833ac8877d";

const handleTransaction = async (txEvent) => {
  const findings = [];

  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return findings;

  // create finding if gas used is higher than threshold
  const gasUsed = new BigNumber(txEvent.gasUsed);
  if (gasUsed.isGreaterThan("1000000")) {
    findings.push(
      Finding.fromObject({
        name: "High Gas Used",
        description: `Gas Used: ${gasUsed}`,
        alertId: "FORTA-1",
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious,
      })
    );
    findingsCount++;
  }

  return findings;
};

// const handleBlock = async (blockEvent) => {
//   const findings = [];
//   // detect some block condition
//   return findings;
// };

module.exports = {
  handleTransaction,
  // handleBlock,
};
