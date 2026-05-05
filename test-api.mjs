#!/usr/bin/env node
/**
 * WC26 Predictor - API End-to-End Test Script
 * Run: node test-api.mjs
 * Prerequisites: npm run dev running on http://localhost:3000
 */

const BASE = "http://localhost:3000";
let adminCookie = "";
let playerCookie = "";

// ─── Helpers ──────────────────────────────────────────────────
async function req(method, path, body, cookie = "") {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE,
      ...(cookie && { Cookie: cookie }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json;
  try { json = await res.json(); } catch { json = {}; }
  return { status: res.status, body: json };
}

async function extractCookie(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE,
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  const cookies = [];
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      cookies.push(value.split(";")[0]);
    }
  });
  return cookies.join("; ");
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ ${message}`);
}

// ─── Tests ────────────────────────────────────────────────────
let matchId = "";
let predictionId = "";

async function runTests() {
  console.log("\n🏟️  WC26 Predictor — API E2E Test\n");
  console.log("=".repeat(50));

  // [1] Register Admin
  console.log("\n[1] Register Admin User");
  const adminReg = await req("POST", "/api/auth/sign-up/email", {
    name: "Admin WC26",
    email: "admin@wc26.test",
    password: "Admin@12345!",
  });
  console.log(`  → Status: ${adminReg.status}`);

  // Promote admin role directly via DB using DATABASE_URL from .env.local
  try {
    const fs = await import("fs");
    const envContent = fs.readFileSync(".env.local", "utf8");
    const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
    if (!dbUrl) throw new Error("DATABASE_URL not found in .env.local");
    
    const { default: postgres } = await import("./node_modules/postgres/src/index.js");
    const sql = postgres(dbUrl);
    const result = await sql`UPDATE users SET role = 'admin' WHERE email = 'admin@wc26.test' RETURNING id, role`;
    await sql.end();
    if (result.length > 0) {
      console.log(`  → Role promoted to 'admin' ✅ (userId: ${result[0].id})`);
    } else {
      console.log("  ⚠️  No user found yet (will retry after login)");
    }
  } catch (e) {
    console.warn("  ⚠️  DB promote failed:", e.message);
  }

  // [2] Login Admin (first time to ensure user exists)
  console.log("\n[2] Login Admin (first login)");
  await extractCookie("/api/auth/sign-in/email", {
    email: "admin@wc26.test",
    password: "Admin@12345!",
  });

  // Promote role again (in case user was just created)
  try {
    const fs = await import("fs");
    const envContent = fs.readFileSync(".env.local", "utf8");
    const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]?.trim();
    const { default: postgres } = await import("./node_modules/postgres/src/index.js");
    const sql = postgres(dbUrl);
    await sql`UPDATE users SET role = 'admin' WHERE email = 'admin@wc26.test'`;
    await sql.end();
    console.log("  → Role confirmed as 'admin' in DB");
  } catch (e) {
    console.warn("  ⚠️  Role confirm failed:", e.message);
  }

  // Re-login admin so session has refreshed role
  console.log("  → Re-login admin with fresh session...");
  adminCookie = await extractCookie("/api/auth/sign-in/email", {
    email: "admin@wc26.test",
    password: "Admin@12345!",
  });
  assert(adminCookie.length > 0, `Admin cookie received`);
  console.log(`  → Cookie: ${adminCookie.substring(0, 60)}...`);

  // Debug: check what role is in session
  const sessionCheck = await req("GET", "/api/auth/get-session", null, adminCookie);
  const sessionRole = sessionCheck.body?.user?.role;
  console.log(`  → Session role: '${sessionRole}' (expected: 'admin')`);
  if (sessionRole !== "admin") {
    console.error("  ❌ Role is not 'admin' in session! Manual fix needed.");
    console.error("     Run this SQL in pgAdmin: UPDATE users SET role = 'admin' WHERE email = 'admin@wc26.test';");
    console.error("     Then re-run this test.");
    process.exit(1);
  }
  console.log("  ✅ Admin role confirmed in session");

  // [3] Register Player
  console.log("\n[3] Register Player User");
  const playerReg = await req("POST", "/api/auth/sign-up/email", {
    name: "Player One",
    email: "player@wc26.test",
    password: "Player@12345!",
  });
  console.log(`  → Status: ${playerReg.status}`);

  // [4] Login Player
  console.log("\n[4] Login Player");
  playerCookie = await extractCookie("/api/auth/sign-in/email", {
    email: "player@wc26.test",
    password: "Player@12345!",
  });
  assert(playerCookie.length > 0, `Player cookie received`);

  // [5] GET matches — no auth → 401
  console.log("\n[5] GET /api/matches (no auth → expect 401)");
  const noAuth = await req("GET", "/api/matches");
  assert(noAuth.status === 401, `Status 401, got ${noAuth.status}`);

  // [6] GET matches — player auth → 200
  console.log("\n[6] GET /api/matches (player auth)");
  const matchList = await req("GET", "/api/matches", null, playerCookie);
  assert(matchList.status === 200, `Status 200, got ${matchList.status}`);
  assert(Array.isArray(matchList.body.data), "Response is array");
  console.log(`  → ${matchList.body.data.length} matches found`);

  // [7] POST match as player → 403
  console.log("\n[7] POST /api/matches as player (→ expect 403)");
  const playerCreate = await req("POST", "/api/matches", {
    teamA: "Brazil", teamB: "Argentina",
    flagA: "🇧🇷", flagB: "🇦🇷",
    group: "Group A",
    kickoffTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  }, playerCookie);
  assert(playerCreate.status === 403, `Status 403, got ${playerCreate.status}`);

  // [8] POST match as admin → 201
  console.log("\n[8] POST /api/matches as admin (→ expect 201)");
  const kickoff = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const createMatch = await req("POST", "/api/matches", {
    teamA: "Brazil", teamB: "Argentina",
    flagA: "🇧🇷", flagB: "🇦🇷",
    group: "Group A",
    kickoffTime: kickoff,
  }, adminCookie);
  console.log(`  → Status: ${createMatch.status}`, createMatch.body.error ?? "");
  assert(createMatch.status === 201, `Status 201, got ${createMatch.status}`);
  matchId = createMatch.body.data?.id;
  assert(!!matchId, `Match created: ${matchId}`);

  // [9] GET match detail
  console.log("\n[9] GET /api/matches/:matchId");
  const matchDetail = await req("GET", `/api/matches/${matchId}`, null, playerCookie);
  assert(matchDetail.status === 200, `Status 200, got ${matchDetail.status}`);
  assert(matchDetail.body.data?.match?.id === matchId, "Match ID matches");
  assert(matchDetail.body.data?.userPrediction === null, "No prediction yet (null)");

  // [10] POST prediction
  console.log("\n[10] POST /api/predictions");
  const createPred = await req("POST", "/api/predictions",
    { matchId, predictedA: 2, predictedB: 1 }, playerCookie);
  console.log(`  → Status: ${createPred.status}`, createPred.body.error ?? "");
  assert(createPred.status === 201, `Status 201, got ${createPred.status}`);
  predictionId = createPred.body.data?.id;
  assert(!!predictionId, `Prediction created: ${predictionId}`);

  // [11] POST duplicate prediction → 409
  console.log("\n[11] Duplicate prediction (→ expect 409)");
  const dupPred = await req("POST", "/api/predictions",
    { matchId, predictedA: 3, predictedB: 0 }, playerCookie);
  assert(dupPred.status === 409, `Status 409, got ${dupPred.status}`);

  // [12] PUT edit prediction
  console.log("\n[12] PUT /api/predictions/:id (edit)");
  const editPred = await req("PUT", `/api/predictions/${predictionId}`,
    { predictedA: 1, predictedB: 1 }, playerCookie);
  assert(editPred.status === 200, `Status 200, got ${editPred.status}`);
  assert(editPred.body.data?.predictedA === 1, "predictedA → 1");
  assert(editPred.body.data?.predictedB === 1, "predictedB → 1");

  // [13] GET predictions (joined with match)
  console.log("\n[13] GET /api/predictions");
  const predList = await req("GET", "/api/predictions", null, playerCookie);
  assert(predList.status === 200, `Status 200`);
  assert(predList.body.data?.length >= 1, "At least 1 prediction");
  assert(!!predList.body.data?.[0]?.match, "Match detail included");

  // [14] PUT match → set score (auto finish)
  console.log("\n[14] PUT /api/matches/:id → set score (expect status=finished)");
  const setScore = await req("PUT", `/api/matches/${matchId}`,
    { scoreA: 1, scoreB: 1 }, adminCookie);
  assert(setScore.status === 200, `Status 200, got ${setScore.status}`);
  assert(setScore.body.data?.status === "finished", `Status = finished`);
  assert(setScore.body.data?.scoreA === 1, "scoreA = 1");

  // [15] POST calculate scoring
  console.log("\n[15] POST /api/matches/:id/calculate");
  const calculate = await req("POST", `/api/matches/${matchId}/calculate`,
    null, adminCookie);
  assert(calculate.status === 200, `Status 200, got ${calculate.status}`);
  assert(calculate.body.data?.updated >= 1, `${calculate.body.data?.updated} predictions updated`);
  console.log(`  → Points calculated: ${calculate.body.data?.updated} prediction(s)`);

  // [16] GET leaderboard
  console.log("\n[16] GET /api/leaderboard");
  const board = await req("GET", "/api/leaderboard", null, playerCookie);
  assert(board.status === 200, `Status 200`);
  assert(Array.isArray(board.body.data), "Response is array");
  console.log(`  → ${board.body.data.length} player(s) on leaderboard`);
  if (board.body.data.length > 0) {
    const top = board.body.data[0];
    console.log(`  → #1: ${top.name} — ${top.totalPoints} pts | ⭐ ${top.perfectScores} perfect`);
  }

  // [17] DELETE match (has predictions → 409)
  console.log("\n[17] DELETE /api/matches/:id (has predictions → expect 409)");
  const delMatch = await req("DELETE", `/api/matches/${matchId}`, null, adminCookie);
  assert(delMatch.status === 409, `Status 409, got ${delMatch.status}`);

  // [18] Leaderboard no auth → 401
  console.log("\n[18] GET /api/leaderboard (no auth → expect 401)");
  const boardNoAuth = await req("GET", "/api/leaderboard");
  assert(boardNoAuth.status === 401, `Status 401`);

  // [19] Zod validation error → 400
  console.log("\n[19] POST /api/matches with invalid body (→ expect 400)");
  const badBody = await req("POST", "/api/matches", { teamA: "Brazil" }, adminCookie);
  assert(badBody.status === 400, `Status 400, got ${badBody.status}`);
  assert(badBody.body.error?.code === "VALIDATION_ERROR", `Code = VALIDATION_ERROR`);

  // ── Done ──────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("🏆  ALL TESTS PASSED!\n");
}

runTests().catch((err) => {
  console.error("\n💥 Test crashed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
