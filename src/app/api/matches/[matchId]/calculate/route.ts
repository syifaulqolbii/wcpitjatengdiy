import { NextRequest } from "next/server";
import { db } from "@/db";
import { matches, predictions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, Err, requireAdmin, handleError } from "@/lib/api-helpers";
import { calculatePoints, snapshotLeaderboardBeforeCalculation } from "@/lib/scoring";

// ─── POST /api/matches/:matchId/calculate ─────────────────────
// Auth: admin only
// Trigger scoring engine for all predictions on this match
// Match must be 'finished' with non-null scoreA and scoreB
export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    await requireAdmin(req);

    // 1. Fetch the match
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, params.matchId));

    if (!match) return Err.notFound("Match");

    // 2. Validate match is finished and has scores
    if (match.status !== "finished") {
      return Err.badRequest(
        "Match must be 'finished' before scores can be calculated.",
        "MATCH_NOT_FINISHED"
      );
    }

    if (match.scoreA === null || match.scoreA === undefined || 
        match.scoreB === null || match.scoreB === undefined) {
      return Err.badRequest(
        "Match must have final scores (scoreA and scoreB) before calculating.",
        "MISSING_SCORES"
      );
    }

    await snapshotLeaderboardBeforeCalculation();

    // 3. Fetch all predictions for this match
    const matchPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.matchId, params.matchId));

    if (matchPredictions.length === 0) {
      return ok({ updated: 0, message: "No predictions to calculate." });
    }

    // 4. Calculate and update points for each prediction
    let updatedCount = 0;

    for (const prediction of matchPredictions) {
      const points = calculatePoints(
        prediction.predictedA,
        prediction.predictedB,
        match.scoreA,
        match.scoreB
      );

      await db
        .update(predictions)
        .set({ points })
        .where(eq(predictions.id, prediction.id));

      updatedCount++;
    }

    return ok({
      updated: updatedCount,
      message: `Successfully calculated points for ${updatedCount} prediction(s).`,
    });
  } catch (error) {
    return handleError(error);
  }
}
