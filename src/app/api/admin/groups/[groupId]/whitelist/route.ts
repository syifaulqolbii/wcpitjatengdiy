import { NextRequest } from "next/server";
import { db } from "@/db";
import { groupWhitelists, groups } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ok, requireAuth, Err, created, handleError } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await requireAuth(req);
    if (session.user.role !== "admin") return Err.unauthorized();

    const whitelists = await db
      .select({
        id: groupWhitelists.id,
        email: groupWhitelists.email,
        createdAt: groupWhitelists.createdAt,
      })
      .from(groupWhitelists)
      .where(eq(groupWhitelists.groupId, params.groupId))
      .orderBy(groupWhitelists.createdAt);

    return ok(whitelists);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await requireAuth(req);
    if (session.user.role !== "admin") return Err.unauthorized();

    const { emails } = await req.json(); // expect { emails: string[] }
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return Err.badRequest("Daftar email kosong");
    }

    // Verify group exists
    const [group] = await db.select().from(groups).where(eq(groups.id, params.groupId));
    if (!group) return Err.notFound("Grup tidak ditemukan");

    // Fetch existing to avoid duplicates
    const existing = await db
      .select({ email: groupWhitelists.email })
      .from(groupWhitelists)
      .where(eq(groupWhitelists.groupId, params.groupId));
    
    const existingSet = new Set(existing.map(e => e.email.toLowerCase()));
    
    const toInsert = emails
      .map(e => e.trim().toLowerCase())
      .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) // basic email validation
      .filter(e => !existingSet.has(e)) // remove duplicates
      .map(e => ({
        groupId: params.groupId,
        email: e
      }));

    if (toInsert.length > 0) {
      // Need to deduplicate within the new list itself
      const uniqueToInsertMap = new Map();
      toInsert.forEach(item => {
        uniqueToInsertMap.set(item.email, item);
      });
      const uniqueToInsert = Array.from(uniqueToInsertMap.values());
      
      await db.insert(groupWhitelists).values(uniqueToInsert);
    }

    return created({ addedCount: toInsert.length });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await requireAuth(req);
    if (session.user.role !== "admin") return Err.unauthorized();

    const { emailId } = await req.json(); // id of the whitelist row
    if (!emailId) return Err.badRequest("ID email tidak valid");

    await db
      .delete(groupWhitelists)
      .where(and(
        eq(groupWhitelists.id, emailId),
        eq(groupWhitelists.groupId, params.groupId)
      ));

    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
