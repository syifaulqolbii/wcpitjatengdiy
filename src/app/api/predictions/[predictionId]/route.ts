import { NextRequest } from "next/server";
import { db } from "@/db";
import { matches, predictions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  ok,
  Err,
  requireAuth,
  handleError,
} from "@/lib/api-helpers";
import { updatePredictionSchema } from "@/lib/validators";
import { getScoringRules } from "@/lib/scoring";
import { z } from "zod";

// ─── Lock-in check helper ─────────────────────────────────────
function isLocked(kickoffTime: Date, lockInMinutes: number): boolean {
  const now = new Date();
  const lockDeadline = new Date(kickoffTime.getTime() - lockInMinutes * 60 * 1000);
  return now >= lockDeadline;
}

// ─── PUT /api/predictions/:predictionId ──────────────────────
// Auth: required, user can only edit their own predictions
// Same lock-in check as POST applies
export async function PUT(
  req: NextRequest,
  { params }: { params: { predictionId: string } }
) {
  try {
    const session = await requireAuth(req);

    // 1. Fetch prediction and confirm ownership
    const [prediction] = await db
      .select()
      .from(predictions)
      .where(eq(predictions.id, params.predictionId));

    if (!prediction) return Err.notFound("Prediction");

    if (prediction.userId !== session.user.id) {
      return Err.forbidden("You can only edit your own predictions.");
    }

    // 2. Fetch associated match
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, prediction.matchId));

    if (!match) return Err.notFound("Match");

    // 3. Check match is still upcoming
    if (match.status !== "upcoming") {
      return Err.badRequest(
        `Cannot edit a prediction for a match that is '${match.status}'.`,
        "MATCH_NOT_UPCOMING"
      );
    }

    // 4. Lock-in check: same rule as POST
    const { lockInMinutes } = await getScoringRules();
    if (isLocked(match.kickoffTime, lockInMinutes)) {
      return Err.badRequest(
        `Predictions are locked ${lockInMinutes} minutes before kick-off.`,
        "PREDICTION_LOCKED"
      );
    }

    // 5. Parse and validate body
    const body = await req.json();
    const input = updatePredictionSchema.parse(body);

    // 6. Update prediction
    const [updated] = await db
      .update(predictions)
      .set({
        predictedA: input.predictedA,
        predictedB: input.predictedB,
        submittedAt: new Date(), // Reset submittedAt on edit
      })
      .where(eq(predictions.id, params.predictionId))
      .returning();

    return ok(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return Err.badRequest(msg, "VALIDATION_ERROR");
    }
    return handleError(error);
  }
}
