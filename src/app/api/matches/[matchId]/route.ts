import { NextRequest } from "next/server";
import { db } from "@/db";
import { matches, predictions } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import {
  ok,
  Err,
  requireAuth,
  requireAdmin,
  handleError,
} from "@/lib/api-helpers";
import { updateMatchSchema } from "@/lib/validators";

// ─── GET /api/matches/:matchId ────────────────────────────────
// Auth: required
// Returns match details + the current user's prediction for this match (if any)
export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await requireAuth(req);

    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, params.matchId));

    if (!match) return Err.notFound("Match");

    // Also fetch the user's prediction for this match, if any
    const [userPrediction] = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.matchId, params.matchId),
          eq(predictions.userId, session.user.id)
        )
      );

    return ok({ match, userPrediction: userPrediction ?? null });
  } catch (error) {
    return handleError(error);
  }
}

// ─── PUT /api/matches/:matchId ────────────────────────────────
// Auth: admin only
// If scoreA/scoreB updated → auto set status to 'finished'
export async function PUT(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    await requireAdmin(req);

    const [existing] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, params.matchId));

    if (!existing) return Err.notFound("Match");

    const body = await req.json();
    const parsed = updateMatchSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return Err.badRequest(msg, "VALIDATION_ERROR");
    }
    const input = parsed.data;

    // Auto-set status to 'finished' if scores are provided
    const statusOverride: { status?: string } = {};
    if (input.scoreA !== undefined && input.scoreB !== undefined) {
      statusOverride.status = "finished";
    }

    const [updated] = await db
      .update(matches)
      .set({
        ...(input.teamA !== undefined && { teamA: input.teamA }),
        ...(input.teamB !== undefined && { teamB: input.teamB }),
        ...(input.flagA !== undefined && { flagA: input.flagA }),
        ...(input.flagB !== undefined && { flagB: input.flagB }),
        ...(input.group !== undefined && { group: input.group }),
        ...(input.kickoffTime !== undefined && {
          kickoffTime: new Date(input.kickoffTime),
        }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.scoreA !== undefined && { scoreA: input.scoreA }),
        ...(input.scoreB !== undefined && { scoreB: input.scoreB }),
        ...statusOverride,
      })
      .where(eq(matches.id, params.matchId))
      .returning();

    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

// ─── DELETE /api/matches/:matchId ─────────────────────────────
// Auth: admin only
// Cannot delete a match that already has predictions
export async function DELETE(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    await requireAdmin(req);

    const [existing] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, params.matchId));

    if (!existing) return Err.notFound("Match");

    // Check if any predictions exist for this match
    const [{ predictionCount }] = await db
      .select({ predictionCount: count() })
      .from(predictions)
      .where(eq(predictions.matchId, params.matchId));

    if (Number(predictionCount) > 0) {
      return Err.conflict(
        `Cannot delete match with ${predictionCount} existing prediction(s).`
      );
    }

    await db.delete(matches).where(eq(matches.id, params.matchId));

    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
