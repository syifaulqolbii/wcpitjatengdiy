import { NextRequest } from "next/server";
import { db } from "@/db";
import { leaderboardSnapshots, predictions, users } from "@/db/schema";
import { eq, sql, sum, count, desc, isNotNull, and } from "drizzle-orm";
import { ok, requireAuth, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);

    const groupId = req.nextUrl.searchParams.get('groupId') ?? null;

    const baseWhere = isNotNull(predictions.points);
    const whereClause = groupId
      ? and(baseWhere, eq(users.groupId, groupId))
      : baseWhere;

    const rows = await db
      .select({
        userId: predictions.userId,
        name: users.name,
        image: users.image,
        totalPoints: sum(predictions.points).mapWith(Number),
        perfectScores: count(
          sql`CASE WHEN ${predictions.points} = 5 THEN 1 END`
        ).mapWith(Number),
        correctResults: count(
          sql`CASE WHEN ${predictions.points} = 2 THEN 1 END`
        ).mapWith(Number),
        totalPredicted: count(predictions.id).mapWith(Number),
      })
      .from(predictions)
      .innerJoin(users, eq(predictions.userId, users.id))
      .where(whereClause)
      .groupBy(predictions.userId, users.name, users.image)
      .orderBy(
        desc(sum(predictions.points)),
        desc(count(sql`CASE WHEN ${predictions.points} = 5 THEN 1 END`))
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

    let currentRank = 1;
    const leaderboard = rows.map((row, index) => {
      if (
        index > 0 &&
        (row.totalPoints !== rows[index - 1].totalPoints ||
          row.perfectScores !== rows[index - 1].perfectScores)
      ) {
        currentRank = index + 1;
      }

      return {
        rank: currentRank,
        userId: row.userId,
        name: row.name,
        image: row.image,
        totalPoints: row.totalPoints ?? 0,
        perfectScores: row.perfectScores ?? 0,
        correctResults: row.correctResults ?? 0,
        totalPredicted: row.totalPredicted ?? 0,
        rankChange: snapshotRankByUserId.has(row.userId)
          ? snapshotRankByUserId.get(row.userId)! - currentRank
          : null,
      };
    });

    return ok(leaderboard);
  } catch (error) {
    return handleError(error);
  }
}
