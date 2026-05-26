import { db } from "@/db";
import { groups, users, predictions, tournamentPredictions } from "@/db/schema";
import { Err, handleError, ok, requireAdmin } from "@/lib/api-helpers";
import { eq, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ groupId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { groupId } = await params;

    const [group] = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!group) return Err.notFound('Grup');

    // Base member list (always returned, even if no predictions yet).
    const memberRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.groupId, groupId));

    const memberIds = memberRows.map((m) => m.id);

    if (memberIds.length === 0) {
      return ok([]);
    }

    // Match-prediction points aggregated per user, scoped to this group.
    const matchPointsRows = await db
      .select({
        userId: predictions.userId,
        totalPoints: sql<number>`COALESCE(SUM(${predictions.points}), 0)`.mapWith(Number),
      })
      .from(predictions)
      .where(inArray(predictions.userId, memberIds))
      .groupBy(predictions.userId);

    // Champion (tournament) points scoped to the same user set.
    const championRows = await db
      .select({
        userId: tournamentPredictions.userId,
        points: tournamentPredictions.points,
      })
      .from(tournamentPredictions)
      .where(inArray(tournamentPredictions.userId, memberIds));

    const matchPointsByUser = new Map(matchPointsRows.map((r) => [r.userId, r.totalPoints]));
    const championPointsByUser = new Map(championRows.map((r) => [r.userId, r.points ?? 0]));

    return ok(
      memberRows.map((m) => ({
        ...m,
        totalPoints: (matchPointsByUser.get(m.id) ?? 0) + (championPointsByUser.get(m.id) ?? 0),
      }))
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { groupId } = await params;

    const [group] = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!group) return Err.notFound('Grup');

    const body = await req.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    if (!userId) return Err.badRequest('userId wajib diisi', 'MISSING_USER_ID');

    const [user] = await db.select({ id: users.id, groupId: users.groupId }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return Err.notFound('User');

    await db.update(users).set({ groupId }).where(eq(users.id, userId));

    return ok({ success: true, userId, groupId });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { groupId } = await params;

    const body = await req.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    if (!userId) return Err.badRequest('userId wajib diisi', 'MISSING_USER_ID');

    const [user] = await db.select({ id: users.id, groupId: users.groupId }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return Err.notFound('User');
    if (user.groupId !== groupId) return Err.badRequest('User bukan member grup ini', 'NOT_MEMBER');

    await db.update(users).set({ groupId: null }).where(eq(users.id, userId));

    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
