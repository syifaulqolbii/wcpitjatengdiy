export * from "./scoring-engine";
import { calculatePoints } from "./scoring-engine";

/** Get lock-in minutes from database settings. */
export async function getLockInMinutes(): Promise<number> {
  const [{ db }, { settings }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
  ]);

  const rows = await db.select().from(settings);
  const map = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  const val = map.lockInMinutes;
  if (val === undefined) return 15;
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : 15;
}

/**
 * Build a SQL CASE expression that maps match stage to its perfect score value.
 * Used for counting perfect scores across different stages in aggregate queries.
 */
function buildPerfectScoreCaseSQL(stageColumn: unknown, sql: typeof import("drizzle-orm").sql) {
  return sql`CASE ${stageColumn}
    WHEN 'group_stage' THEN 5
    WHEN 'round_32' THEN 6
    WHEN 'round_16' THEN 7
    WHEN 'quarter_final' THEN 8
    WHEN 'semi_final' THEN 10
    WHEN 'juara_3' THEN 12
    WHEN 'final' THEN 15
    ELSE 5
  END`;
}

export async function getCurrentLeaderboardSnapshot() {
  const [{ db }, { predictions, tournamentPredictions, users, matches }, { eq, isNotNull, sql }] =
    await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("drizzle-orm"),
    ]);

  const perfectScoreCase = buildPerfectScoreCaseSQL(matches.stage, sql);

  const matchRows = await db
    .select({
      userId: predictions.userId,
      totalPoints: sql<number>`COALESCE(SUM(${predictions.points}), 0)`.mapWith(Number),
      perfectScores: sql<number>`COUNT(CASE WHEN ${predictions.points} = ${perfectScoreCase} THEN 1 END)`.mapWith(Number),
    })
    .from(predictions)
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .innerJoin(users, eq(predictions.userId, users.id))
    .where(isNotNull(predictions.points))
    .groupBy(predictions.userId);

  const championRows = await db
    .select({
      userId: tournamentPredictions.userId,
      points: tournamentPredictions.points,
    })
    .from(tournamentPredictions)
    .where(isNotNull(tournamentPredictions.points));

  const championPointsByUserId = new Map(
    championRows.map((cp) => [cp.userId, cp.points ?? 0])
  );

  const matchStatsByUserId = new Map(
    matchRows.map((m) => [m.userId, m])
  );

  const allUserIds = new Set<string>([
    ...matchRows.map((m) => m.userId),
    ...championRows.map((c) => c.userId),
  ]);

  const enriched = Array.from(allUserIds).map((userId) => {
    const m = matchStatsByUserId.get(userId);
    return {
      userId,
      totalPoints: (m?.totalPoints ?? 0) + (championPointsByUserId.get(userId) ?? 0),
      perfectScores: m?.perfectScores ?? 0,
    };
  });

  enriched.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.perfectScores - a.perfectScores;
  });

  let currentRank = 1;
  return enriched.map((row, index) => {
    if (
      index > 0 &&
      (row.totalPoints !== enriched[index - 1].totalPoints ||
        row.perfectScores !== enriched[index - 1].perfectScores)
    ) {
      currentRank = index + 1;
    }

    return {
      userId: row.userId,
      rank: currentRank,
      totalPoints: row.totalPoints,
    };
  });
}

export async function snapshotLeaderboardBeforeCalculation() {
  const [{ db }, { leaderboardSnapshots }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
  ]);
  const currentLeaderboard = await getCurrentLeaderboardSnapshot();

  if (currentLeaderboard.length === 0) {
    return;
  }

  await db.insert(leaderboardSnapshots).values(
    currentLeaderboard.map((entry) => ({
      userId: entry.userId,
      rank: entry.rank,
      totalPoints: entry.totalPoints,
    }))
  );
}

/**
 * Recalculate prediction points for a single match. Wraps snapshot+update in a
 * single transaction so leaderboard rankChange remains coherent even if the
 * write fails. Safe to call multiple times — idempotent given the same scores.
 */
export async function recalculateMatchPoints(matchId: string): Promise<number> {
  const [{ db }, { matches, predictions, leaderboardSnapshots }, { eq }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
    import("drizzle-orm"),
  ]);

  const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
  if (!match) return 0;
  if (match.scoreA === null || match.scoreB === null) return 0;

  const matchPredictions = await db
    .select()
    .from(predictions)
    .where(eq(predictions.matchId, matchId));

  if (matchPredictions.length === 0) return 0;

  const snapshotEntries = await getCurrentLeaderboardSnapshot();

  let updatedCount = 0;
  await db.transaction(async (tx) => {
    if (snapshotEntries.length > 0) {
      await tx.insert(leaderboardSnapshots).values(
        snapshotEntries.map((entry) => ({
          userId: entry.userId,
          rank: entry.rank,
          totalPoints: entry.totalPoints,
        }))
      );
    }

    for (const prediction of matchPredictions) {
      const points = calculatePoints(
        prediction.predictedA,
        prediction.predictedB,
        match.scoreA!,
        match.scoreB!,
        match.stage
      );

      await tx
        .update(predictions)
        .set({ points })
        .where(eq(predictions.id, prediction.id));

      updatedCount++;
    }
  });

  return updatedCount;
}
