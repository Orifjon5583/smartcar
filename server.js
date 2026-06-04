const fs = require("fs");
const https = require("https");
const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3443;
const HOST = process.env.HOST || "0.0.0.0";
const allowedCommands = new Set(["oldinga", "orqaga", "chapga", "ongga", "toxta"]);

let oxirgiCommand = "";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function normalizeCommand(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[‘’`]/g, "'")
    .replace(/o'ngga/g, "ongga")
    .replace(/oʻngga/g, "ongga")
    .replace(/o‘ngga/g, "ongga")
    .replace(/to'xta/g, "toxta")
    .replace(/toʻxta/g, "toxta")
    .replace(/to‘xta/g, "toxta");
}

function findCommand(text) {
  const normalized = normalizeCommand(text);
  for (const command of allowedCommands) {
    if (normalized.includes(command)) return command;
  }
  return "";
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/command", (req, res) => {
  const command = findCommand(req.body.command || req.body.text);

  if (!command) {
    return res.status(400).json({
      ok: false,
      error: "Noto'g'ri buyruq",
      allowed: Array.from(allowedCommands)
    });
  }

  oxirgiCommand = command;
  console.log(`[COMMAND] ${new Date().toISOString()} -> ${oxirgiCommand}`);
  res.json({ ok: true, command: oxirgiCommand });
});

app.get("/command", (req, res) => {
  res.json({ command: oxirgiCommand });
});

app.post("/clear", (req, res) => {
  oxirgiCommand = "";
  console.log(`[COMMAND] ${new Date().toISOString()} -> cleared`);
  res.json({ ok: true, command: oxirgiCommand });
});

const keyPath = path.join(__dirname, "certs", "key.pem");
const certPath = path.join(__dirname, "certs", "cert.pem");

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error("HTTPS sertifikat topilmadi.");
  console.error("Avval shu buyruqni ishga tushiring: npm run cert");
  process.exit(1);
}

https
  .createServer(
    {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    },
    app
  )
  .listen(PORT, HOST, () => {
    console.log(`HTTPS server ishlayapti: https://${HOST}:${PORT}`);
    console.log("Telefon va ESP32 bir xil WiFi tarmog'ida bo'lishi kerak.");
  });
