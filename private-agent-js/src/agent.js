const path = require('path');
const { readFileSync } = require('fs');
const BigNumber = require('bignumber.js');
const openpgp = require('openpgp');
const { Finding, FindingSeverity, FindingType } = require('forta-agent');

const initializeData = {};

async function encryptFindings(findings) {
  const promises = findings.map(async (finding) => {
    // create a new finding with most fields replaced with the string 'omitted'
    const omittedString = 'omitted';
    const encryptedFinding = Finding.fromObject({
      name: omittedString,
      description: omittedString,
      alertId: initializeData.publicKeyString,
      protocol: omittedString,
      severity: FindingSeverity.Unknown,
      type: FindingType.Unknown,
      everestId: omittedString,
      metadata: JSON.stringify(finding), // nest the original finding into the metadata
    });

    // encrypt the contents of the metadata field
    const message = await openpgp.createMessage({ text: encryptedFinding.metadata });
    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: initializeData.publicKey,
    });
    encryptedFinding.metadata = encrypted.toString('base64');

    return encryptedFinding;
  });

  const encryptedFindings = await Promise.all(promises);

  return encryptedFindings;
}

async function initialize() {
  // load the content of the public key file
  initializeData.publicKeyString = readFileSync(
    path.resolve(__dirname, '..', 'public.pem'),
    'utf8',
  );

  // create openpgp public key object
  initializeData.publicKey = await openpgp.readKey({
    armoredKey: initializeData.publicKeyString,
  });
}

async function handleTransaction(txEvent) {
  const findings = [];

  // create finding if gas used is higher than threshold
  const gasUsed = new BigNumber(txEvent.gasUsed);

  if (gasUsed.isGreaterThan('1000000')) {
    findings.push(
      Finding.fromObject({
        name: 'High Gas Used',
        description: `Gas Used: ${gasUsed}`,
        alertId: 'XYZ-1',
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious,
        metadata: {
          some: 'other data',
        },
      }),
    );
  }

  const encryptedFindings = await encryptFindings(findings);

  return encryptedFindings;
}

module.exports = {
  initialize,
  handleTransaction,
};
