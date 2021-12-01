const BigNumber = require("bignumber.js");
const openpgp = require("openpgp");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");

// declare the public key which will be setup in the initialize() handler
let publicKey;
// paste the pgp public key string in the code so that it can be obfuscated
const publicKeyString = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEYaX/KBYJKwYBBAHaRw8BAQdAS373U8tIP2ZjYfzY2tBVzmXgl8UWafEW
YRPfLFiHMtrNGG5hbWUgPGVtYWlsQGVtYWlsLmVtYWlsPsKMBBAWCgAdBQJh
pf8oBAsJBwgDFQgKBBYAAgECGQECGwMCHgEAIQkQyiITiv6nfv4WIQT2s16P
sSrrZYIqhtrKIhOK/qd+/gszAP9Q3dCxR8KBldbhhy/hdSWnHyRYuH8OGksq
FwHpJ+JmeQD+Pljw/CD14+ezFhzU8cshzGiqnF3yGcNIxUVMTb5uoQXOOARh
pf8oEgorBgEEAZdVAQUBAQdADc8/FqjKdtrEh64MjWkXZfoGrsQ5GPqEw/dA
ZSac5jIDAQgHwngEGBYIAAkFAmGl/ygCGwwAIQkQyiITiv6nfv4WIQT2s16P
sSrrZYIqhtrKIhOK/qd+/madAQCoJMZ1/75x5R3rb44Py2nroe90OisHeszU
Ei3R2xv3QQEA3Luc1EhUZGuSdvjWhg7YZXJVTOCISdTNrdnodw99kQI=
=YYoH
-----END PGP PUBLIC KEY BLOCK-----
`;

async function initialize() {
  publicKey = await openpgp.readKey({
    armoredKey: publicKeyString,
  });
}

async function handleTransaction(txEvent) {
  const findings = [];

  // create finding if gas used is higher than threshold
  const gasUsed = new BigNumber(txEvent.gasUsed);

  if (gasUsed.isGreaterThan("100000")) {
    findings.push(
      Finding.fromObject({
        name: "High Gas Used",
        description: `Gas Used: ${gasUsed}`,
        alertId: "XYZ-1",
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious,
        metadata: {
          some: "other data",
        },
      })
    );
  }

  return encryptFindings(findings);
}

async function encryptFindings(findings) {
  return Promise.all(
    findings.map(async (finding) => {
      // encrypt the original finding
      const originalFindingString = JSON.stringify(finding);
      const message = await openpgp.createMessage({
        text: originalFindingString,
      });
      const encryptedOriginalFinding = await openpgp.encrypt({
        message,
        encryptionKeys: publicKey,
      });

      // create a new finding with most fields replaced with the string 'omitted'
      const omittedString = "omitted";
      const encryptedFinding = Finding.fromObject({
        name: omittedString,
        description: omittedString,
        alertId: omittedString,
        protocol: omittedString,
        severity: FindingSeverity.Unknown,
        type: FindingType.Unknown,
        metadata: {
          data: encryptedOriginalFinding.toString("base64"), // nest the original finding into the metadata
        },
      });

      return encryptedFinding;
    })
  );
}

module.exports = {
  initialize,
  handleTransaction,
};
