const BigNumber = require("bignumber.js");
const { Finding, FindingSeverity, FindingType, getTransactionReceipt } = require("forta-agent");

let findingsCount = 0;
// this is the sensitive data we want to obfuscate
const INFURA_API_KEY = "97d4fafcc17b46819295fa833ac8877d";

function provideHandleTransaction(getTransactionReceipt) {
  return async function handleTransaction(txEvent) {
    const findings = [];
  
    // limiting this agent to emit only 5 findings so that the alert feed is not spammed
    if (findingsCount >= 5) return findings;
  
    // create finding if gas used is higher than threshold
    const receipt = await getTransactionReceipt(txEvent.hash)
    const gasUsed = new BigNumber(receipt.gasUsed)
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
}

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(getTransactionReceipt),
};
