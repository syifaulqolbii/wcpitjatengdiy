/**
 * Calculate the points earned for a prediction based on the actual match result.
 * 
 * Rules:
 * - Perfect score (exact predicted A and B matches actual A and B): 5 points
 * - Correct result (predicted winner/draw matches actual winner/draw): 2 points
 * - Wrong prediction: 0 points
 */
export function calculatePoints(
  predictedA: number,
  predictedB: number,
  actualA: number,
  actualB: number
): number {
  // 1. Perfect score
  if (predictedA === actualA && predictedB === actualB) {
    return 5;
  }

  // 2. Correct result (Win/Draw/Loss)
  const predictedResult = Math.sign(predictedA - predictedB);
  const actualResult = Math.sign(actualA - actualB);
  
  if (predictedResult === actualResult) {
    return 2;
  }

  // 3. Wrong prediction
  return 0;
}

export async function getCurrentLeaderboardSnapshot() {
  const [{ db }, { predictions, users }, { count, desc, eq, isNotNull, sql, sum }] =
    await Promise.all([
      import("@/db"),
      import("@/db/schema"),
      import("drizzle-orm"),
    ]);

  const rows = await db
    .select({
      userId: predictions.userId,
      totalPoints: sum(predictions.points).mapWith(Number),
      perfectScores: count(
        sql`CASE WHEN ${predictions.points} = 5 THEN 1 END`
      ).mapWith(Number),
    })
    .from(predictions)
    .innerJoin(users, eq(predictions.userId, users.id))
    .where(isNotNull(predictions.points))
    .groupBy(predictions.userId)
    .orderBy(
      desc(sum(predictions.points)),
      desc(count(sql`CASE WHEN ${predictions.points} = 5 THEN 1 END`))
    );

  let currentRank = 1;

  return rows.map((row, index) => {
    if (
      index > 0 &&
      (row.totalPoints !== rows[index - 1].totalPoints ||
        row.perfectScores !== rows[index - 1].perfectScores)
    ) {
      currentRank = index + 1;
    }

    return {
      userId: row.userId,
      rank: currentRank,
      totalPoints: row.totalPoints ?? 0,
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
