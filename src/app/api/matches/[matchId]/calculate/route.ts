import { NextRequest } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ok, Err, requireAdmin, handleError } from "@/lib/api-helpers";
import { recalculateMatchPoints } from "@/lib/scoring";

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

    const updatedCount = await recalculateMatchPoints(params.matchId);

    if (updatedCount === 0) {
      return ok({ updated: 0, message: "No predictions to calculate." });
    }

    return ok({
      updated: updatedCount,
      message: `Successfully calculated points for ${updatedCount} prediction(s).`,
    });
  } catch (error) {
    return handleError(error);
  }
}
