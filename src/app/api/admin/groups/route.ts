import { db } from "@/db";
import { groups, users } from "@/db/schema";
import { Err, handleError, ok, requireAdmin } from "@/lib/api-helpers";
import { count, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateInviteCode();
    const [existing] = await db.select({ id: groups.id }).from(groups).where(eq(groups.inviteCode, code)).limit(1);
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique invite code');
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const rows = await db
      .select({
        id: groups.id,
        name: groups.name,
        inviteCode: groups.inviteCode,
        createdAt: groups.createdAt,
        memberCount: count(users.id),
      })
      .from(groups)
      .leftJoin(users, eq(users.groupId, groups.id))
      .groupBy(groups.id)
      .orderBy(groups.createdAt);

    return ok(rows);
  } catch (error) {
    return handleError(error);
  }
}

const INVITE_CODE_REGEX = /^[A-Z0-9]+$/;
const MIN_INVITE_CODE_LENGTH = 6;
const MAX_INVITE_CODE_LENGTH = 16;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const customCode = typeof body.inviteCode === 'string' ? body.inviteCode.trim().toUpperCase() : '';

    if (!name || name.length < 2) {
      return Err.badRequest('Nama grup minimal 2 karakter', 'INVALID_NAME');
    }

    let inviteCode: string;
    if (customCode) {
      if (
        customCode.length < MIN_INVITE_CODE_LENGTH ||
        customCode.length > MAX_INVITE_CODE_LENGTH ||
        !INVITE_CODE_REGEX.test(customCode)
      ) {
        return Err.badRequest(
          `Kode undangan harus ${MIN_INVITE_CODE_LENGTH}-${MAX_INVITE_CODE_LENGTH} karakter, hanya huruf besar dan angka`,
          'INVALID_INVITE_CODE'
        );
      }
      inviteCode = customCode;
    } else {
      inviteCode = await uniqueInviteCode();
    }

    const [existing] = await db.select({ id: groups.id }).from(groups).where(eq(groups.inviteCode, inviteCode)).limit(1);
    if (existing) return Err.conflict('Kode undangan sudah digunakan');

    const [group] = await db.insert(groups).values({ name, inviteCode }).returning();

    return ok(group, 201);
  } catch (error) {
    return handleError(error);
  }
}
