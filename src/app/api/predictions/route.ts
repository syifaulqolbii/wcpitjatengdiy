import { NextRequest } from "next/server";
import { db } from "@/db";
import { matches, predictions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  ok,
  created,
  Err,
  requireAuth,
  handleError,
} from "@/lib/api-helpers";
import { createPredictionSchema } from "@/lib/validators";
import { getScoringRules } from "@/lib/scoring";

// ─── Lock-in check helper ─────────────────────────────────────
// Returns true if the current time is within the configured lock window of kickoff
function isLocked(kickoffTime: Date, lockInMinutes: number): boolean {
  const now = new Date();
  const lockDeadline = new Date(kickoffTime.getTime() - lockInMinutes * 60 * 1000);
  return now >= lockDeadline;
}

// ─── GET /api/predictions ─────────────────────────────────────
// Auth: required
// Returns only the logged-in user's predictions
// Query params: ?matchId=xxx (optional filter)
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = req.nextUrl;
    const matchId = searchParams.get("matchId");
    const userIdParam = searchParams.get("userId");
    const allUsers = searchParams.get("allUsers") === "true";

    const conditions = [];
    
    if (allUsers && session.user.role === 'admin') {
      // Admin detail views can inspect every user's prediction for a match.
    } else if (userIdParam && session.user.role === 'admin') {
      conditions.push(eq(predictions.userId, userIdParam));
    } else {
      conditions.push(eq(predictions.userId, session.user.id));
    }
    
    if (matchId) {
      conditions.push(eq(predictions.matchId, matchId));
    }

    // Join predictions with match details
    const result = await db
      .select({
        // Prediction fields
        id: predictions.id,
        matchId: predictions.matchId,
        userId: predictions.userId,
        predictedA: predictions.predictedA,
        predictedB: predictions.predictedB,
        points: predictions.points,
        submittedAt: predictions.submittedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        // Match fields (joined)
        match: {
          id: matches.id,
          teamA: matches.teamA,
          teamB: matches.teamB,
          flagA: matches.flagA,
          flagB: matches.flagB,
          group: matches.group,
          kickoffTime: matches.kickoffTime,
          status: matches.status,
          scoreA: matches.scoreA,
          scoreB: matches.scoreB,
        },
      })
      .from(predictions)
      .innerJoin(matches, eq(predictions.matchId, matches.id))
      .innerJoin(users, eq(predictions.userId, users.id))
      .where(and(...conditions))
      .orderBy(matches.kickoffTime);

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

// ─── POST /api/predictions ────────────────────────────────────
// Auth: required (player role)
// Validations:
//   1. Match must be 'upcoming'
//   2. Current time must be < kickoffTime - 15 minutes (LOCK-IN CHECK)
//   3. User must not have already submitted for this match (UNIQUE constraint)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const body = await req.json();
    const parsed = createPredictionSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return Err.badRequest(msg, "VALIDATION_ERROR");
    }
    const input = parsed.data;

    // 1. Fetch the match
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, input.matchId));

    if (!match) return Err.notFound("Match");

    // 2. Check match status
    if (match.status !== "upcoming") {
      return Err.badRequest(
        `Cannot predict for a match that is '${match.status}'.`,
        "MATCH_NOT_UPCOMING"
      );
    }

    // 3. Lock-in check: configured minutes before kickoff
    const { lockInMinutes } = await getScoringRules();
    if (isLocked(match.kickoffTime, lockInMinutes)) {
      return Err.badRequest(
        `Predictions are locked ${lockInMinutes} minutes before kick-off.`,
        "PREDICTION_LOCKED"
      );
    }

    // 4. Check for duplicate prediction (also enforced by DB UNIQUE constraint)
    const [existing] = await db
      .select({ id: predictions.id })
      .from(predictions)
      .where(
        and(
          eq(predictions.userId, session.user.id),
          eq(predictions.matchId, input.matchId)
        )
      );

    if (existing) {
      return Err.conflict(
        "You have already submitted a prediction for this match. Use PUT to update it."
      );
    }

    // 5. Insert prediction
    const [newPrediction] = await db
      .insert(predictions)
      .values({
        userId: session.user.id,
        matchId: input.matchId,
        predictedA: input.predictedA,
        predictedB: input.predictedB,
      })
      .returning();

    return created(newPrediction);
  } catch (error) {
    // Handle DB unique constraint violation as a fallback
    if (
      error instanceof Error &&
      error.message.includes("uq_user_match")
    ) {
      return Err.conflict(
        "You have already submitted a prediction for this match."
      );
    }
    return handleError(error);
  }
}
