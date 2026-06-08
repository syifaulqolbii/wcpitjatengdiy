import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups, users, groupWhitelists } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

const handler = toNextJsHandler(auth);

async function findGroupByInviteCode(code: string) {
  const [group] = await db
    .select()
    .from(groups)
    .where(sql`upper(${groups.inviteCode}) = upper(${code})`)
    .limit(1);
  return group ?? null;
}

async function findUserByEmailCaseInsensitive(email: string) {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = lower(${email})`)
    .limit(1);
  return row ?? null;
}

export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname.includes("/sign-up/email")) {
    const clonedReq = req.clone();
    let group: typeof groups.$inferSelect | null = null;
    let email = '';

    let body: { invitationCode?: unknown; email?: unknown } | null = null;
    try {
      body = await clonedReq.json();
    } catch {
      return NextResponse.json(
        { data: null, error: { message: 'Body request tidak valid', code: 'INVALID_BODY' } },
        { status: 400 }
      );
    }

    const code = typeof body?.invitationCode === 'string' ? body.invitationCode : '';
    email = typeof body?.email === 'string' ? body.email : '';

    if (!code) {
      return NextResponse.json(
        { data: null, error: { message: 'Kode undangan wajib diisi', code: 'INVALID_INVITATION_CODE' } },
        { status: 400 }
      );
    }

    group = await findGroupByInviteCode(code);
    if (!group) {
      return NextResponse.json(
        { data: null, error: { message: 'Kode undangan tidak valid', code: 'INVALID_INVITATION_CODE' } },
        { status: 400 }
      );
    }

    if (email) {
      // Check whitelist
      const whitelistedEmails = await db
        .select({ email: groupWhitelists.email })
        .from(groupWhitelists)
        .where(eq(groupWhitelists.groupId, group.id));
      
      if (whitelistedEmails.length > 0) {
        const isWhitelisted = whitelistedEmails.some(
          w => w.email.toLowerCase() === email.toLowerCase()
        );
        if (!isWhitelisted) {
          return NextResponse.json(
            { data: null, error: { message: 'Email ini tidak diizinkan untuk mendaftar dengan kode undangan ini.', code: 'NOT_WHITELISTED' } },
            { status: 400 }
          );
        }
      }
    }

    const response = await handler.POST(req);

    // Assign groupId to the newly registered user
    if (response.ok && group && email) {
      try {
        const newUser = await findUserByEmailCaseInsensitive(email);
        if (newUser) {
          await db.update(users).set({ groupId: group.id }).where(sql`${users.id} = ${newUser.id}`);
        }
      } catch (error) {
        // Non-fatal: user registered but group assignment failed.
        // Log so an admin can recover from /admin/users.
        console.error('[signup] Failed to assign group to new user', { email, groupId: group.id, error });
      }
    }

    return response;
  }

  return handler.POST(req);
}

export const GET = handler.GET;
