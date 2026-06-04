const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const speakBtn = document.getElementById("speakBtn");
const transcriptEl = document.getElementById("transcript");
const lastCommandEl = document.getElementById("lastCommand");
const messageEl = document.getElementById("message");
const controls = document.querySelectorAll("[data-command]");

const commandMap = [
  ["oldinga", "oldinga"],
  ["orqaga", "orqaga"],
  ["chapga", "chapga"],
  ["o'ngga", "ongga"],
  ["o'ngga", "ongga"],
  ["ongga", "ongga"],
  ["to'xta", "toxta"],
  ["toxta", "toxta"]
];

let recognition;
let stopTimer;

function setMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? "#e03131" : "#1769ff";
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[‘’`]/g, "'")
    .replace(/oʻ/g, "o'")
    .replace(/o‘/g, "o'")
    .replace(/toʻ/g, "to'")
    .replace(/to‘/g, "to'");
}

function extractCommand(text) {
  const normalized = normalize(text);
  const found = commandMap.find(([spoken]) => normalized.includes(spoken));
  return found ? found[1] : "";
}

async function sendCommand(command) {
  const response = await fetch("/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Buyruq yuborilmadi");

  lastCommandEl.textContent = data.command || "-";
  setMessage(`Serverga yuborildi: ${data.command}`);
}

function startListening() {
  if (!SpeechRecognition) {
    setMessage("Bu brauzer SpeechRecognition ni qo'llamaydi.", true);
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "uz-UZ";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  speakBtn.classList.add("listening");
  speakBtn.disabled = true;
  setMessage("Tinglayapman...");

  recognition.onresult = async (event) => {
    const text = event.results[0][0].transcript;
    transcriptEl.textContent = text;

    const command = extractCommand(text);
    if (!command) {
      setMessage("Buyruq topilmadi. oldinga, orqaga, chapga, o'ngga yoki to'xta deb ayting.", true);
      return;
    }

    try {
      await sendCommand(command);
    } catch (error) {
      setMessage(error.message, true);
    }
  };

  recognition.onerror = (event) => {
    setMessage(`Mikrofon xatosi: ${event.error}`, true);
  };

  recognition.onend = () => {
    clearTimeout(stopTimer);
    speakBtn.classList.remove("listening");
    speakBtn.disabled = false;
  };

  recognition.start();
  stopTimer = setTimeout(() => recognition.stop(), 5000);
}

speakBtn.addEventListener("click", startListening);

controls.forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      transcriptEl.textContent = `Tugma: ${button.textContent}`;
      await sendCommand(button.dataset.command);
    } catch (error) {
      setMessage(error.message, true);
    }
  });
});
