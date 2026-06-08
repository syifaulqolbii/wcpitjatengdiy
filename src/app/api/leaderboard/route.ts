import { NextRequest } from "next/server";
import { db } from "@/db";
import { leaderboardSnapshots, predictions, tournamentPredictions, users, matches } from "@/db/schema";
import { eq, sql, isNotNull, and, inArray } from "drizzle-orm";
import { ok, requireAuth, handleError } from "@/lib/api-helpers";
import { getScoringRules } from "@/lib/scoring";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);

    const groupId = req.nextUrl.searchParams.get('groupId') ?? null;
    const rules = await getScoringRules();

    // Base list of users (filtered by group if requested) — ensures users with
    // only champion predictions still appear in the leaderboard.
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
    if (userIds.length === 0) return ok([]);

    // Match predictions stats per user, scoped to the same user set.
    const matchStats = await db
      .select({
        userId: predictions.userId,
        totalPoints: sql<number>`COALESCE(SUM(${predictions.points}), 0)`.mapWith(Number),
        perfectScores: sql<number>`COUNT(CASE WHEN ${predictions.points} = ${rules.perfectScore} THEN 1 END)`.mapWith(Number),
        correctResults: sql<number>`COUNT(CASE WHEN ${predictions.points} = ${rules.correctResult} THEN 1 END)`.mapWith(Number),
        totalPredicted: sql<number>`COUNT(${predictions.id})`.mapWith(Number),
      })
      .from(predictions)
      .where(and(isNotNull(predictions.points), inArray(predictions.userId, userIds)))
      .groupBy(predictions.userId);

    const matchStatsByUserId = new Map(matchStats.map((m) => [m.userId, m]));

    // Match predictions points per stage
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

    // Champion points scoped to same user set.
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

    // Latest snapshot per user (global, used for rank-change deltas only).
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

    // Build enriched rows for every user in scope.
    const enrichedRows = userRows.map((u) => {
      const m = matchStatsByUserId.get(u.userId);
      const championPoints = championPointsByUserId.get(u.userId) ?? 0;
      const matchPoints = m?.totalPoints ?? 0;
      
      const emailUsername = u.email ? u.email.split('@')[0] : u.name;

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
    const leaderboard = enrichedRows.map((row, index) => {
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
        // rankChange only meaningful for the global leaderboard since snapshots are global.
        rankChange: !groupId && snapshotRankByUserId.has(row.userId)
          ? snapshotRankByUserId.get(row.userId)! - currentRank
          : null,
      };
    });

    return ok(leaderboard);
  } catch (error) {
    return handleError(error);
  }
}
