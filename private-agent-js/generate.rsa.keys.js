const { writeFileSync } = require("fs");
const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

writeFileSync(
  "private.pem",
  privateKey.export({ type: "pkcs1", format: "pem" })
);
writeFileSync("public.pem", publicKey.export({ type: "pkcs1", format: "pem" }));
