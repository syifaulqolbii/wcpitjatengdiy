import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const handler = toNextJsHandler(auth);

async function findGroupByInviteCode(code: string) {
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.inviteCode, code.toUpperCase()))
    .limit(1);
  return group ?? null;
}

export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname.includes("/sign-up/email")) {
    const clonedReq = req.clone();
    let group: typeof groups.$inferSelect | null = null;
    let email = '';

    try {
      const body = await clonedReq.json();
      const code = body.invitationCode;
      email = body.email ?? '';

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
    } catch {
      // Ignore JSON parse error, let better-auth handle it
    }

    const response = await handler.POST(req);

    // Assign groupId to the newly registered user
    if (response.ok && group && email) {
      try {
        const [newUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);
        if (newUser) {
          await db.update(users).set({ groupId: group.id }).where(eq(users.id, newUser.id));
        }
      } catch {
        // Non-fatal: user registered but group assignment failed
      }
    }

    return response;
  }

  return handler.POST(req);
}

export const GET = handler.GET;
