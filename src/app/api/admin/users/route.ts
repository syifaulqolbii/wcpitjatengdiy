import { db } from "@/db";
import { groups, users } from "@/db/schema";
import { handleError, ok, requireAdmin } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        groupId: users.groupId,
        groupName: groups.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(groups, eq(users.groupId, groups.id))
      .orderBy(users.createdAt);

    return ok({ users: rows });
  } catch (error) {
    return handleError(error);
  }
}
