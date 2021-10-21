const path = require("path");
const { readFileSync } = require("fs");
const BigNumber = require("bignumber.js");
const crypto = require("crypto");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");

let PUBLIC_KEY = undefined;

async function initialize() {
  PUBLIC_KEY = readFileSync(path.resolve(__dirname, "public.pem"), "utf8");
}

async function handleTransaction(txEvent) {
  const findings = [];

  // create finding if gas used is higher than threshold
  const gasUsed = new BigNumber(txEvent.gasUsed);
  if (gasUsed.isGreaterThan("1000000")) {
    findings.push(
      Finding.fromObject({
        name: "omitted",
        description: `omitted`,
        alertId: "XYZ-1",
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious,
        metadata: {
          data: encrypt({
            name: "High Gas Used",
            description: `Gas Used: ${gasUsed}`,
            some: "other data",
          }),
        },
      })
    );
  }

  return findings;
}

function encrypt(data) {
  const buffer = Buffer.from(JSON.stringify(data), "utf8");
  const encrypted = crypto.publicEncrypt(PUBLIC_KEY, buffer);
  return encrypted.toString("base64");
}

module.exports = {
  initialize,
  handleTransaction,
};
