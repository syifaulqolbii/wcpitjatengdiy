/**
 * Calculate the points earned for a prediction based on the actual match result.
 *
 * Rules (configurable via settings):
 * - Perfect score (exact predicted A and B matches actual A and B): perfectScore points
 * - Correct result (predicted winner/draw matches actual winner/draw): correctResult points
 * - Wrong prediction: wrongPrediction points
 */
export interface ScoringRules {
  perfectScore: number;
  correctResult: number;
  wrongPrediction: number;
  lockInMinutes: number;
}

export const DEFAULT_SCORING_RULES: ScoringRules = {
  perfectScore: 5,
  correctResult: 2,
  wrongPrediction: 0,
  lockInMinutes: 15,
};

export async function getScoringRules(): Promise<ScoringRules> {
  const [{ db }, { settings }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
  ]);

  const rows = await db.select().from(settings);
  const map = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  const parseIntSafe = (val: string | undefined, fallback: number) => {
    if (val === undefined) return fallback;
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  return {
    perfectScore: parseIntSafe(map.perfectScore, DEFAULT_SCORING_RULES.perfectScore),
    correctResult: parseIntSafe(map.correctResult, DEFAULT_SCORING_RULES.correctResult),
    wrongPrediction: parseIntSafe(map.wrongPrediction, DEFAULT_SCORING_RULES.wrongPrediction),
    lockInMinutes: parseIntSafe(map.lockInMinutes, DEFAULT_SCORING_RULES.lockInMinutes),
  };
}

export function calculatePoints(
  predictedA: number,
  predictedB: number,
  actualA: number,
  actualB: number,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): number {
  // 1. Perfect score
  if (predictedA === actualA && predictedB === actualB) {
    return rules.perfectScore;
  }

  // 2. Correct result (Win/Draw/Loss)
  const predictedResult = Math.sign(predictedA - predictedB);
  const actualResult = Math.sign(actualA - actualB);

  if (predictedResult === actualResult) {
    return rules.correctResult;
  }

  // 3. Wrong prediction
  return rules.wrongPrediction;
}

export async function getCurrentLeaderboardSnapshot() {
  const [{ db }, { predictions, tournamentPredictions, users }, { count, eq, isNotNull, sql }] =
    await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("drizzle-orm"),
    ]);

  const rules = await getScoringRules();

  const matchRows = await db
    .select({
      userId: predictions.userId,
      totalPoints: sql<number>`COALESCE(SUM(${predictions.points}), 0)`.mapWith(Number),
      perfectScores: count(
        sql`CASE WHEN ${predictions.points} = ${rules.perfectScore} THEN 1 END`
      ).mapWith(Number),
    })
    .from(predictions)
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

  const [snapshotEntries, rules] = await Promise.all([
    getCurrentLeaderboardSnapshot(),
    getScoringRules(),
  ]);

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
        rules
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
