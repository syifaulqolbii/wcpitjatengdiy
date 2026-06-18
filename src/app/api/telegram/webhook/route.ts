import { NextRequest, NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/leaderboard";
import { resolveTelegramGroup, getAllGroups } from "@/lib/telegram-groups";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function sendPhoto(chatId: number, photoUrl: string, caption: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: "HTML" }),
  });
}

function buildCaption(groupName: string, entries: Awaited<ReturnType<typeof getLeaderboardData>>) {
  const top10 = entries.slice(0, 10);
  const medal: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const lines = top10.map((e) => {
    const prefix = medal[e.rank] ?? `${e.rank}.`;
    return `${prefix} <b>${e.name}</b> — ${e.totalPoints} pts`;
  });
  return `<b>KLASEMEN ${groupName.toUpperCase()}</b>\n\n${lines.join("\n")}`;
}

function getAvailableGroupsText(): string {
  const groups = getAllGroups();
  return groups.map((g) => `• <code>${g.key}</code> (${g.groupName})`).join("\n");
}

const WELCOME_TEXT = `Halo! Saya bot klasemen <b>WC Prediction</b>.

Gunakan perintah:
/klasemen &lt;grup&gt; — lihat klasemen grup

Grup yang tersedia:
${getAvailableGroupsText()}

Contoh: <code>/klasemen itjaya</code>`;

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  // Strip bot username suffix e.g. /klasemen@MyBot → /klasemen
  const rawText = message.text.replace(/@\S+/, "").trim();

  try {
    if (rawText === "/start" || rawText === "/help") {
      await sendMessage(chatId, WELCOME_TEXT);
      return NextResponse.json({ ok: true });
    }

    if (rawText.startsWith("/klasemen")) {
      const arg = rawText.slice("/klasemen".length).trim();

      if (!arg) {
        await sendMessage(
          chatId,
          `Sebutkan nama grup.\n\nContoh: <code>/klasemen itjaya</code>\n\nGrup tersedia:\n${getAvailableGroupsText()}`
        );
        return NextResponse.json({ ok: true });
      }

      const group = resolveTelegramGroup(arg);
      if (!group) {
        await sendMessage(
          chatId,
          `Grup "<b>${arg}</b>" tidak ditemukan.\n\nGrup tersedia:\n${getAvailableGroupsText()}`
        );
        return NextResponse.json({ ok: true });
      }

      const entries = await getLeaderboardData(group.groupId);
      const ogUrl = `${APP_URL}/api/og/leaderboard?groupId=${encodeURIComponent(group.groupId)}&groupName=${encodeURIComponent(group.groupName)}`;
      const caption = buildCaption(group.groupName, entries);

      await sendPhoto(chatId, ogUrl, caption);
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error("[telegram/webhook] error:", err);
    await sendMessage(chatId, "Terjadi kesalahan. Silakan coba lagi.").catch(() => null);
  }

  return NextResponse.json({ ok: true });
}

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}
