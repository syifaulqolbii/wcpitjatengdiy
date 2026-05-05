import { NextRequest } from "next/server";
import { db } from "@/db";
import { tournamentPredictions, users } from "@/db/schema";
import { ok, requireAdmin, handleError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    // Get all predictions with user names
    const predictions = await db
      .select({
        id: tournamentPredictions.id,
        userId: tournamentPredictions.userId,
        predictedWinner: tournamentPredictions.predictedWinner,
        predictedWinnerFlag: tournamentPredictions.predictedWinnerFlag,
        points: tournamentPredictions.points,
        submittedAt: tournamentPredictions.submittedAt,
        userName: users.name,
      })
      .from(tournamentPredictions)
      .innerJoin(users, eq(tournamentPredictions.userId, users.id));

    // Get total players
    const allUsers = await db.select({ id: users.id, role: users.role }).from(users);
    
    // We only count "player" role for the submit/unsubmit stats or all users? Usually just all users or all players.
    // Let's count players since admins might not participate, but we can just count total users.
    // Just count total users to be safe or filter by role === 'player' if the app requires it.
    // The user's prompt: "Hitung: berapa user sudah submit vs belum". Let's use total users.
    const totalUsers = allUsers.length;
    const submittedCount = predictions.length;
    const notSubmittedCount = totalUsers - submittedCount;

    return ok({
      predictions,
      stats: {
        total: totalUsers,
        submitted: submittedCount,
        notSubmitted: notSubmittedCount,
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
