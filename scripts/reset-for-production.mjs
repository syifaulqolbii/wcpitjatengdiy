/**
 * Reset script — siapkan database untuk production launch.
 *
 * Yang DI-RESET:
 *  - matches.scoreA / scoreB / status   → null / 'upcoming'
 *  - predictions.points                 → null
 *  - tournament_predictions.points      → null
 *  - settings champion_winner           → ''
 *  - leaderboard_snapshots              → DELETE all rows
 *
 * Yang TIDAK dihapus:
 *  - User accounts, sessions, groups
 *  - Prediksi match user (predictedA / predictedB tetap utuh)
 *  - Pilihan juara user (predictedWinner / predictedWinnerFlag tetap utuh)
 *  - Settings lain (perfectScore, lockInMinutes, dst)
 *
 * Cara pakai:
 *  1) Pastikan DATABASE_URL terisi di .env atau di environment.
 *  2) node scripts/reset-for-production.mjs
 *  3) Akan tampil ringkasan + minta konfirmasi ketik "RESET" untuk lanjut.
 *
 * Untuk skip prompt (CI / non-interactive): tambahkan flag --yes
 */

import postgres from "postgres";
import readline from "node:readline";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[reset] DATABASE_URL belum di-set. Cek .env / .env.local");
  process.exit(1);
}

const skipPrompt = process.argv.includes("--yes");

const sql = postgres(DATABASE_URL, { max: 1 });

async function showCurrentState() {
  const [matches] = await sql`
    SELECT
      COUNT(*)                                              AS total,
      COUNT(*) FILTER (WHERE status = 'finished')           AS finished,
      COUNT(*) FILTER (WHERE score_a IS NOT NULL)           AS with_scores
    FROM matches
  `;

  const [preds] = await sql`
    SELECT
      COUNT(*)                              AS total,
      COUNT(*) FILTER (WHERE points IS NOT NULL) AS scored
    FROM predictions
  `;

  const [tournaments] = await sql`
    SELECT
      COUNT(*)                              AS total,
      COUNT(*) FILTER (WHERE points IS NOT NULL) AS scored
    FROM tournament_predictions
  `;

  const [snapshots] = await sql`SELECT COUNT(*) AS total FROM leaderboard_snapshots`;

  const [championRow] = await sql`SELECT value FROM settings WHERE key = 'champion_winner'`;
  const championWinner = championRow?.value || "(belum di-set)";

  console.log("\n=== STATE SAAT INI ===");
  console.log(`matches:                 ${matches.total} total | ${matches.finished} finished | ${matches.with_scores} ada score`);
  console.log(`predictions:             ${preds.total} total | ${preds.scored} sudah dikalkulasi (points != null)`);
  console.log(`tournament_predictions:  ${tournaments.total} total | ${tournaments.scored} sudah dikalkulasi (points != null)`);
  console.log(`leaderboard_snapshots:   ${snapshots.total} rows`);
  console.log(`settings.champion_winner: "${championWinner}"`);
  console.log("");
}

async function ask(question) {
  if (skipPrompt) return "RESET";
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function reset() {
  console.log("[reset] Mulai transaksi...");

  await sql.begin(async (tx) => {
    const updMatches = await tx`
      UPDATE matches
      SET score_a = NULL,
          score_b = NULL,
          status  = 'upcoming'
      WHERE score_a IS NOT NULL OR score_b IS NOT NULL OR status <> 'upcoming'
    `;
    console.log(`  matches reset:                ${updMatches.count} row`);

    const updPreds = await tx`
      UPDATE predictions
      SET points = NULL
      WHERE points IS NOT NULL
    `;
    console.log(`  predictions.points cleared:   ${updPreds.count} row`);

    const updTournament = await tx`
      UPDATE tournament_predictions
      SET points = NULL
      WHERE points IS NOT NULL
    `;
    console.log(`  tournament points cleared:    ${updTournament.count} row`);

    const updChampion = await tx`
      UPDATE settings
      SET value = ''
      WHERE key = 'champion_winner' AND value <> ''
    `;
    console.log(`  champion_winner cleared:      ${updChampion.count} row`);

    const delSnapshots = await tx`DELETE FROM leaderboard_snapshots`;
    console.log(`  snapshots cleared:            ${delSnapshots.count} row`);
  });

  console.log("[reset] Done.\n");
}

async function main() {
  try {
    await showCurrentState();

    console.log("Yang akan di-reset:");
    console.log("  - Score & status semua match");
    console.log("  - Points semua prediksi (match + champion)");
    console.log("  - Champion winner setting");
    console.log("  - Semua leaderboard snapshots");
    console.log("\nYang DIPERTAHANKAN:");
    console.log("  - User accounts, groups, sessions");
    console.log("  - Tebakan score user (predictedA / predictedB)");
    console.log("  - Tebakan juara user (predictedWinner)");
    console.log("  - Settings poin & deadline\n");

    const answer = await ask('Ketik "RESET" untuk lanjut, atau apapun untuk batal: ');
    if (answer !== "RESET") {
      console.log("[reset] Dibatalkan.");
      process.exit(0);
    }

    await reset();
    await showCurrentState();
    console.log("Database siap untuk production launch.");
  } catch (err) {
    console.error("[reset] Error:", err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();
