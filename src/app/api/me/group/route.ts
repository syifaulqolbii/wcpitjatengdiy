import { db } from "@/db";
import { groups, users } from "@/db/schema";
import { handleError, ok, requireAuth } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const [row] = await db
      .select({
        groupId: users.groupId,
        groupName: groups.name,
      })
      .from(users)
      .leftJoin(groups, eq(users.groupId, groups.id))
      .where(eq(users.id, session.user.id))
      .limit(1);

    return ok(row ?? { groupId: null, groupName: null });
  } catch (error) {
    return handleError(error);
  }
}
