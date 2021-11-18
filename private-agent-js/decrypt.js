const { readFileSync } = require('fs');
const path = require('path');
const openpgp = require('openpgp');

// ref: https://github.com/openpgpjs/openpgpjs/blob/master/README.md#encrypt-and-decrypt-string-data-with-pgp-keys
async function decrypt(encryptedString) {
  const privateKeyString = readFileSync(path.resolve(__dirname, 'private.pem'), 'utf8');
  const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyString });

  const message = await openpgp.readMessage({
    armoredMessage: encryptedString, // parse armored message
  });

  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
  });

  return decrypted;
}

module.exports = {
  decrypt,
};
