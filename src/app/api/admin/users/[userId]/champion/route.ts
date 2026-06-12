import { NextRequest } from "next/server";
import { db } from "@/db";
import { tournamentPredictions } from "@/db/schema";
import { ok, Err, requireAuth, handleError } from "@/lib/api-helpers";
import { WC2026_TEAMS } from "@/lib/wc2026-teams";
import { eq } from "drizzle-orm";
import { z } from "zod";

const payloadSchema = z.object({
  predictedWinner: z.string().min(1),
  predictedWinnerFlag: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await requireAuth(req);

    if (session.user.role !== "admin") {
      return Err.forbidden("Akses ditolak. Anda bukan admin.");
    }

    const userId = params.userId;
    if (!userId) {
      return Err.badRequest("userId wajib diisi");
    }

    const body = await req.json();
    const data = payloadSchema.parse(body);

    // Check if team is valid
    const validTeam = WC2026_TEAMS.find(
      (t) =>
        t.name === data.predictedWinner && t.flag === data.predictedWinnerFlag
    );
    if (!validTeam) {
      return Err.badRequest("Tim tidak valid");
    }

    // Check if prediction already exists
    const [existing] = await db
      .select()
      .from(tournamentPredictions)
      .where(eq(tournamentPredictions.userId, userId));

    if (existing) {
      // Update
      const [updated] = await db
        .update(tournamentPredictions)
        .set({
          predictedWinner: data.predictedWinner,
          predictedWinnerFlag: data.predictedWinnerFlag,
          updatedAt: new Date(),
        })
        .where(eq(tournamentPredictions.userId, userId))
        .returning();

      return ok(updated);
    } else {
      // Insert
      const [inserted] = await db
        .insert(tournamentPredictions)
        .values({
          userId: userId,
          predictedWinner: data.predictedWinner,
          predictedWinnerFlag: data.predictedWinnerFlag,
        })
        .returning();

      return ok(inserted);
    }
  } catch (error) {
    return handleError(error);
  }
}
