import "dotenv/config";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!BOT_TOKEN || !WEBHOOK_SECRET || !APP_URL) {
  console.error("Missing env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, NEXT_PUBLIC_APP_URL");
  process.exit(1);
}

const BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBHOOK_URL = `${APP_URL}/api/telegram/webhook`;

async function setWebhook() {
  const res = await fetch(`${BASE}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: WEBHOOK_URL, secret_token: WEBHOOK_SECRET }),
  });
  const data = await res.json();
  console.log("setWebhook:", data);
}

async function setMyCommands() {
  const res = await fetch(`${BASE}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "klasemen", description: "Lihat klasemen grup" },
        { command: "start", description: "Mulai & lihat panduan" },
        { command: "help", description: "Panduan penggunaan" },
      ],
    }),
  });
  const data = await res.json();
  console.log("setMyCommands:", data);
}

(async () => {
  console.log(`Setting webhook to: ${WEBHOOK_URL}`);
  await setWebhook();
  await setMyCommands();
  console.log("Done.");
})();
