import { db } from "@/db";
import { leaderboardSnapshots, predictions, tournamentPredictions, users, matches } from "@/db/schema";
import { eq, sql, isNotNull, and, inArray } from "drizzle-orm";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  totalPoints: number;
  stagePoints: Record<string, number>;
  perfectScores: number;
  correctResults: number;
  totalPredicted: number;
  rankChange: number | null;
}

export async function getLeaderboardData(groupId: string | null): Promise<LeaderboardEntry[]> {
  const usersQuery = db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      groupId: users.groupId,
    })
    .from(users);

  const userRows = groupId
    ? await usersQuery.where(eq(users.groupId, groupId))
    : await usersQuery;

  const userIds = userRows.map((u) => u.userId);
  if (userIds.length === 0) return [];

  // Stage-aware perfect score and correct result SQL CASE expressions
  const perfectScoreCase = sql`CASE ${matches.stage}
    WHEN 'group_stage' THEN 5
    WHEN 'round_32' THEN 6
    WHEN 'round_16' THEN 7
    WHEN 'quarter_final' THEN 8
    WHEN 'semi_final' THEN 10
    WHEN 'juara_3' THEN 12
    WHEN 'final' THEN 15
    ELSE 5
  END`;

  const correctResultCase = sql`CASE ${matches.stage}
    WHEN 'group_stage' THEN 2
    WHEN 'round_32' THEN 3
    WHEN 'round_16' THEN 4
    WHEN 'quarter_final' THEN 5
    WHEN 'semi_final' THEN 6
    WHEN 'juara_3' THEN 7
    WHEN 'final' THEN 10
    ELSE 2
  END`;

  const matchStats = await db
    .select({
      userId: predictions.userId,
      totalPoints: sql<number>`COALESCE(SUM(${predictions.points}), 0)`.mapWith(Number),
      perfectScores: sql<number>`COUNT(CASE WHEN ${predictions.points} = ${perfectScoreCase} THEN 1 END)`.mapWith(Number),
      correctResults: sql<number>`COUNT(CASE WHEN ${predictions.points} = ${correctResultCase} THEN 1 END)`.mapWith(Number),
      totalPredicted: sql<number>`COUNT(${predictions.id})`.mapWith(Number),
    })
    .from(predictions)
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .where(and(isNotNull(predictions.points), inArray(predictions.userId, userIds)))
    .groupBy(predictions.userId);

  const matchStatsByUserId = new Map(matchStats.map((m) => [m.userId, m]));

  const matchStatsByStage = await db
    .select({
      userId: predictions.userId,
      stage: matches.stage,
      points: sql<number>`COALESCE(SUM(${predictions.points}), 0)`.mapWith(Number),
    })
    .from(predictions)
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .where(and(isNotNull(predictions.points), inArray(predictions.userId, userIds)))
    .groupBy(predictions.userId, matches.stage);

  const stagePointsByUserId = new Map<string, Record<string, number>>();
  for (const stat of matchStatsByStage) {
    if (!stagePointsByUserId.has(stat.userId)) {
      stagePointsByUserId.set(stat.userId, {});
    }
    stagePointsByUserId.get(stat.userId)![stat.stage] = stat.points;
  }

  const championRows = await db
    .select({
      userId: tournamentPredictions.userId,
      points: tournamentPredictions.points,
    })
    .from(tournamentPredictions)
    .where(and(isNotNull(tournamentPredictions.points), inArray(tournamentPredictions.userId, userIds)));

  const championPointsByUserId = new Map(
    championRows.map((cp) => [cp.userId, cp.points ?? 0])
  );

  const latestSnapshots = await db
    .select({
      userId: leaderboardSnapshots.userId,
      rank: leaderboardSnapshots.rank,
    })
    .from(leaderboardSnapshots)
    .where(
      sql`${leaderboardSnapshots.id} IN (
        SELECT DISTINCT ON (user_id) id
        FROM leaderboard_snapshots
        ORDER BY user_id, snapshot_at DESC
      )`
    );

  const snapshotRankByUserId = new Map(
    latestSnapshots.map((snapshot) => [snapshot.userId, snapshot.rank])
  );

  const enrichedRows = userRows.map((u) => {
    const m = matchStatsByUserId.get(u.userId);
    const championPoints = championPointsByUserId.get(u.userId) ?? 0;
    const matchPoints = m?.totalPoints ?? 0;
    const emailUsername = u.email ? u.email.split("@")[0] : u.name;

    return {
      userId: u.userId,
      name: emailUsername,
      image: u.image,
      totalPoints: matchPoints + championPoints,
      stagePoints: stagePointsByUserId.get(u.userId) ?? {},
      perfectScores: m?.perfectScores ?? 0,
      correctResults: m?.correctResults ?? 0,
      totalPredicted: m?.totalPredicted ?? 0,
    };
  });

  enrichedRows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.perfectScores - a.perfectScores;
  });

  let currentRank = 1;
  return enrichedRows.map((row, index) => {
    if (
      index > 0 &&
      (row.totalPoints !== enrichedRows[index - 1].totalPoints ||
        row.perfectScores !== enrichedRows[index - 1].perfectScores)
    ) {
      currentRank = index + 1;
    }

    return {
      rank: currentRank,
      userId: row.userId,
      name: row.name,
      image: row.image,
      totalPoints: row.totalPoints,
      stagePoints: row.stagePoints,
      perfectScores: row.perfectScores,
      correctResults: row.correctResults,
      totalPredicted: row.totalPredicted,
      rankChange: !groupId && snapshotRankByUserId.has(row.userId)
        ? snapshotRankByUserId.get(row.userId)! - currentRank
        : null,
    };
  });
}
