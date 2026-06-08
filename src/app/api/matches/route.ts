import { NextRequest } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import {
  ok,
  created,
  Err,
  requireAuth,
  requireAdmin,
  handleError,
} from "@/lib/api-helpers";
import { createMatchSchema } from "@/lib/validators";

// ─── GET /api/matches ──────────────────────────────────────────
// Auth: required (all roles)
// Query params: ?status=upcoming|live|finished&group=A
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const group = searchParams.get("group");

    const conditions = [];
    if (status) {
      if (!["upcoming", "live", "finished"].includes(status)) {
        return Err.badRequest("status must be upcoming, live, or finished");
      }
      conditions.push(eq(matches.status, status));
    }
    if (group) {
      conditions.push(eq(matches.group, group));
    }

    const result = await db
      .select()
      .from(matches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(matches.kickoffTime));

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

// ─── POST /api/matches ─────────────────────────────────────────
// Auth: admin only
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json();

    // Use safeParse to avoid instanceof ZodError issues across module boundaries
    const parsed = createMatchSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return Err.badRequest(msg, "VALIDATION_ERROR");
    }

    const input = parsed.data;

    const [newMatch] = await db
      .insert(matches)
      .values({
        teamA: input.teamA,
        teamB: input.teamB,
        flagA: input.flagA,
        flagB: input.flagB,
        group: input.group,
        stage: input.stage ?? "group_stage",
        kickoffTime: new Date(input.kickoffTime),
        status: "upcoming",
      })
      .returning();

    return created(newMatch);
  } catch (error) {
    return handleError(error);
  }
}
