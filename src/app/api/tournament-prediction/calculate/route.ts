import { NextRequest } from "next/server";
import { db } from "@/db";
import { tournamentPredictions, settings, leaderboardSnapshots } from "@/db/schema";
import { ok, Err, requireAdmin, handleError } from "@/lib/api-helpers";
import { WC2026_TEAMS } from "@/lib/wc2026-teams";
import { getCurrentLeaderboardSnapshot } from "@/lib/scoring";
import { eq } from "drizzle-orm";
import { z } from "zod";

const calculateSchema = z.object({
  winner: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const data = calculateSchema.parse(body);

    // Validate winner
    const validTeam = WC2026_TEAMS.find(t => t.name === data.winner);
    if (!validTeam) {
      return Err.badRequest("Tim pemenang tidak valid");
    }

    // 1. Update settings champion_winner = winner
    await db.insert(settings)
      .values({ key: 'champion_winner', value: data.winner })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: data.winner }
      });

    // Fetch settings to get champion_points
    const settingsData = await db.select().from(settings);
    const settingsMap = settingsData.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    const bonusPoints = parseInt(settingsMap['champion_points'] || '30', 10);

    // 2. Ambil semua tournament_predictions
    const allPredictions = await db.select().from(tournamentPredictions);

    if (allPredictions.length === 0) {
      return ok({ correct: 0, wrong: 0, total: 0 });
    }

    // Compute snapshot data BEFORE the write transaction (read-only).
    // It will be inserted inside the transaction so it's atomic with the points update.
    const snapshotEntries = await getCurrentLeaderboardSnapshot();

    let correctCount = 0;
    let wrongCount = 0;

    // 3 & 4. Loop & Bulk Update (Using transaction for safety)
    await db.transaction(async (tx) => {
      // Persist the pre-calculation snapshot first so rankChange remains meaningful.
      if (snapshotEntries.length > 0) {
        await tx.insert(leaderboardSnapshots).values(
          snapshotEntries.map((entry) => ({
            userId: entry.userId,
            rank: entry.rank,
            totalPoints: entry.totalPoints,
          }))
        );
      }

      for (const pred of allPredictions) {
        let pointsToAward = 0;
        
        if (pred.predictedWinner === data.winner) {
          pointsToAward = bonusPoints;
          correctCount++;
        } else {
          pointsToAward = 0;
          wrongCount++;
        }

        await tx.update(tournamentPredictions)
          .set({
            points: pointsToAward,
            updatedAt: new Date()
          })
          .where(eq(tournamentPredictions.id, pred.id));
      }
    });

    return ok({
      correct: correctCount,
      wrong: wrongCount,
      total: allPredictions.length
    });
  } catch (error) {
    return handleError(error);
  }
}
