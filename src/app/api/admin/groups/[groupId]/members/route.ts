import { db } from "@/db";
import { groups, users, predictions } from "@/db/schema";
import { Err, handleError, ok, requireAdmin } from "@/lib/api-helpers";
import { eq, sum, isNotNull } from "drizzle-orm";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ groupId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { groupId } = await params;

    const [group] = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!group) return Err.notFound('Grup');

    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        createdAt: users.createdAt,
        totalPoints: sum(predictions.points),
      })
      .from(users)
      .leftJoin(predictions, eq(predictions.userId, users.id))
      .where(eq(users.groupId, groupId))
      .groupBy(users.id);

    return ok(members.map(m => ({
      ...m,
      totalPoints: m.totalPoints ? Number(m.totalPoints) : 0,
    })));
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
