import { db } from "@/db";
import { groups, users } from "@/db/schema";
import { Err, handleError, ok, requireAdmin } from "@/lib/api-helpers";
import { eq, ne, and } from "drizzle-orm";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ groupId: string }> };

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function uniqueInviteCode(excludeGroupId: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateInviteCode();
    const [existing] = await db
      .select({ id: groups.id })
      .from(groups)
      .where(and(eq(groups.inviteCode, code), ne(groups.id, excludeGroupId)))
      .limit(1);
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique invite code');
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { groupId } = await params;
    const body = await req.json();

    const [existing] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!existing) return Err.notFound('Grup');

    const name = typeof body.name === 'string' ? body.name.trim() : existing.name;
    const regenerate = body.regenerateCode === true;

    if (name.length < 2) return Err.badRequest('Nama grup minimal 2 karakter', 'INVALID_NAME');

    const inviteCode = regenerate ? await uniqueInviteCode(groupId) : existing.inviteCode;

    const [updated] = await db
      .update(groups)
      .set({ name, inviteCode })
      .where(eq(groups.id, groupId))
      .returning();

    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    const { groupId } = await params;

    const [existing] = await db.select({ id: groups.id }).from(groups).where(eq(groups.id, groupId)).limit(1);
    if (!existing) return Err.notFound('Grup');

    await db.delete(groups).where(eq(groups.id, groupId));

    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
