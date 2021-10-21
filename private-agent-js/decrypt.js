const { readFileSync } = require("fs");
const crypto = require("crypto");

function decrypt(data) {
  const privateKey = readFileSync("private.pem", "utf8");
  const decrypted = crypto.privateDecrypt(
    privateKey,
    Buffer.from(data, "base64")
  );
  console.log(JSON.parse(decrypted.toString("utf8")));
}

module.exports = {
  decrypt,
};
