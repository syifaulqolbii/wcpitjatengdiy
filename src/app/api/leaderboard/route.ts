import { NextRequest } from "next/server";
import { ok, requireAuth, handleError } from "@/lib/api-helpers";
import { getLeaderboardData } from "@/lib/leaderboard";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const groupId = req.nextUrl.searchParams.get("groupId") ?? null;
    const leaderboard = await getLeaderboardData(groupId);
    return ok(leaderboard);
  } catch (error) {
    return handleError(error);
  }
}
