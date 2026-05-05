import { NextRequest } from "next/server";
import { db } from "@/db";
import { tournamentPredictions, settings } from "@/db/schema";
import { ok, Err, requireAuth, handleError } from "@/lib/api-helpers";
import { WC2026_TEAMS } from "@/lib/wc2026-teams";
import { eq } from "drizzle-orm";
import { z } from "zod";

const payloadSchema = z.object({
  predictedWinner: z.string().min(1),
  predictedWinnerFlag: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    // Get settings
    const settingsData = await db.select().from(settings);
    const settingsMap = settingsData.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    const deadline = settingsMap['champion_deadline'] || '2026-06-10T19:00:00Z';
    const bonusPoints = parseInt(settingsMap['champion_points'] || '30', 10);
    const winner = settingsMap['champion_winner'] || null;

    const isLocked = new Date() >= new Date(deadline);

    // Get prediction
    const [prediction] = await db
      .select()
      .from(tournamentPredictions)
      .where(eq(tournamentPredictions.userId, session.user.id));

    return ok({
      prediction: prediction || null,
      isLocked,
      deadline,
      bonusPoints,
      winner: winner !== '' ? winner : null
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const data = payloadSchema.parse(body);

    // Check if team is valid
    const validTeam = WC2026_TEAMS.find(t => t.name === data.predictedWinner && t.flag === data.predictedWinnerFlag);
    if (!validTeam) {
      return Err.badRequest("Tim tidak valid");
    }

    // Get settings
    const settingsData = await db.select().from(settings);
    const settingsMap = settingsData.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    const deadline = settingsMap['champion_deadline'] || '2026-06-10T19:00:00Z';
    if (new Date() >= new Date(deadline)) {
      return Err.badRequest("Waktu tebakan sudah ditutup");
    }

    // Check if already submitted
    const [existing] = await db
      .select()
      .from(tournamentPredictions)
      .where(eq(tournamentPredictions.userId, session.user.id));

    if (existing) {
      return Err.conflict("Anda sudah mengirimkan tebakan juara");
    }

    const [newPrediction] = await db
      .insert(tournamentPredictions)
      .values({
        userId: session.user.id,
        predictedWinner: data.predictedWinner,
        predictedWinnerFlag: data.predictedWinnerFlag,
      })
      .returning();

    return ok(newPrediction);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const data = payloadSchema.parse(body);

    // Check if team is valid
    const validTeam = WC2026_TEAMS.find(t => t.name === data.predictedWinner && t.flag === data.predictedWinnerFlag);
    if (!validTeam) {
      return Err.badRequest("Tim tidak valid");
    }

    // Get settings
    const settingsData = await db.select().from(settings);
    const settingsMap = settingsData.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    const deadline = settingsMap['champion_deadline'] || '2026-06-10T19:00:00Z';
    if (new Date() >= new Date(deadline)) {
      return Err.badRequest("Waktu tebakan sudah ditutup");
    }

    // Check if already submitted
    const [existing] = await db
      .select()
      .from(tournamentPredictions)
      .where(eq(tournamentPredictions.userId, session.user.id));

    if (!existing) {
      return Err.notFound("Tebakan juara belum ada, silakan buat baru");
    }

    const [updatedPrediction] = await db
      .update(tournamentPredictions)
      .set({
        predictedWinner: data.predictedWinner,
        predictedWinnerFlag: data.predictedWinnerFlag,
        updatedAt: new Date(),
      })
      .where(eq(tournamentPredictions.userId, session.user.id))
      .returning();

    return ok(updatedPrediction);
  } catch (error) {
    return handleError(error);
  }
}
