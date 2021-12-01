const { writeFileSync } = require("fs");
const openpgp = require("openpgp");

// generate pgp keys
async function generateKeys() {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "ecc", // default is ecc
    curve: "curve25519", // default is curve25519
    userIDs: [{ name: "name", email: "email@email.email" }], // required
    format: "armored", // default is armored
    // passphrase: 'some passphrase' // optional, used to encrypt resulting private key
  });

  // console.log(privateKey);
  // console.log(publicKey);
  // console.log(revocationCertificate);

  writeFileSync("private.pem", privateKey);
  writeFileSync("public.pem", publicKey);
}

generateKeys();
