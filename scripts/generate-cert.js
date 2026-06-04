const fs = require("fs");
const path = require("path");
const selfsigned = require("selfsigned");

const certDir = path.join(__dirname, "..", "certs");
fs.mkdirSync(certDir, { recursive: true });

const attrs = [{ name: "commonName", value: "localhost" }];
const pems = selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
  algorithm: "sha256",
  extensions: [
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" }
      ]
    }
  ]
});

fs.writeFileSync(path.join(certDir, "key.pem"), pems.private);
fs.writeFileSync(path.join(certDir, "cert.pem"), pems.cert);

console.log("HTTPS sertifikat yaratildi: certs/key.pem va certs/cert.pem");
