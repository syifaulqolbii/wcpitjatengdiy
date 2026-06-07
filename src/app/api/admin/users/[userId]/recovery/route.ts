import { db } from "@/db";
import { accounts, sessions, users } from "@/db/schema";
import { Err, handleError, ok, requireAdmin } from "@/lib/api-helpers";
import { hashPassword } from "better-auth/crypto";
import { and, eq, ne } from "drizzle-orm";
import { NextRequest } from "next/server";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const adminSession = await requireAdmin(req);

    const { userId } = await params;
    const body = await req.json();
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const hasEmail = rawEmail.length > 0;
    const hasName = rawName.length > 0;
    const hasPassword = password.length > 0;

    if (!hasEmail && !hasPassword && !hasName) {
      return Err.badRequest("Isi minimal salah satu data (nama, email, atau password).", "NO_RECOVERY_FIELDS");
    }

    if (hasName && (rawName.length < 2 || rawName.length > 50)) {
      return Err.badRequest("Nama harus antara 2 hingga 50 karakter.", "INVALID_NAME");
    }

    if (hasEmail && (!emailRegex.test(rawEmail) || rawEmail.length > 254)) {
      return Err.badRequest("Format email tidak valid.", "INVALID_EMAIL");
    }

    if (hasPassword && password.length < 8) {
      return Err.badRequest("Password minimal 8 karakter.", "PASSWORD_TOO_SHORT");
    }

    if (hasPassword && password.length > 128) {
      return Err.badRequest("Password terlalu panjang.", "PASSWORD_TOO_LONG");
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!targetUser) return Err.notFound("User");

    const emailChanged = hasEmail && rawEmail !== targetUser.email.toLowerCase();
    const nameChanged = hasName && rawName !== targetUser.name;

    if (!emailChanged && !hasPassword && !nameChanged) {
      return Err.badRequest("Tidak ada perubahan untuk disimpan.", "NO_CHANGES");
    }

    if (emailChanged) {
      const [duplicate] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, rawEmail), ne(users.id, userId)))
        .limit(1);

      if (duplicate) return Err.conflict("Email sudah digunakan user lain.");
    }

    // If admin recovers their own account, preserve their current session so
    // the response cookie remains valid; everything else gets revoked.
    const adminIsTarget = adminSession.user.id === userId;
    const adminSessionId = adminIsTarget ? adminSession.session.id : null;

    await db.transaction(async (tx) => {
      if (emailChanged || nameChanged) {
        await tx
          .update(users)
          .set({ 
            ...(emailChanged && { email: rawEmail }),
            ...(nameChanged && { name: rawName }),
            updatedAt: new Date() 
          })
          .where(eq(users.id, userId));
      }

      if (hasPassword) {
        const passwordHash = await hashPassword(password);
        const [credentialAccount] = await tx
          .select({ id: accounts.id })
          .from(accounts)
          .where(and(eq(accounts.userId, userId), eq(accounts.providerId, "credential")))
          .limit(1);

        if (!credentialAccount) {
          throw new Error("Credential account tidak ditemukan untuk user ini.");
        }

        await tx
          .update(accounts)
          .set({ password: passwordHash, updatedAt: new Date() })
          .where(eq(accounts.id, credentialAccount.id));

        if (adminSessionId) {
          await tx
            .delete(sessions)
            .where(and(eq(sessions.userId, userId), ne(sessions.id, adminSessionId)));
        } else {
          await tx.delete(sessions).where(eq(sessions.userId, userId));
        }
      }
    });

    return ok({
      success: true,
      userId,
      email: emailChanged ? rawEmail : targetUser.email,
      name: nameChanged ? rawName : targetUser.name,
      emailChanged,
      nameChanged,
      passwordChanged: hasPassword,
      adminSessionPreserved: adminIsTarget && hasPassword,
    });
  } catch (error) {
    return handleError(error);
  }
}
