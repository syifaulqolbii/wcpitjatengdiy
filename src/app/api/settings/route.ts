import { NextRequest } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { ok, Err, requireAdmin, handleError, requireAuth } from "@/lib/api-helpers";

const ALLOWED_SETTING_KEYS = new Set<string>([
  'perfectScore',
  'correctResult',
  'wrongPrediction',
  'lockInMinutes',
  'champion_points',
  'champion_deadline',
  'champion_winner',
  'inviteEnabled',
  'invitation_code',
]);

function isValidSettingsPayload(body: unknown): body is Record<string, string> {
  if (typeof body !== 'object' || body === null) return false;
  return Object.values(body as Record<string, unknown>).every((val) => typeof val === 'string');
}

// GET /api/settings - Read settings (auth required, not necessarily admin so players can read rules)
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);

    const data = await db.select().from(settings);
    const result = data.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/settings - Update settings (Admin only)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    if (!isValidSettingsPayload(body)) {
      return Err.badRequest("Invalid settings data", "VALIDATION_ERROR");
    }

    const keys = Object.keys(body);

    // Reject any unknown keys to prevent settings table abuse.
    const unknownKeys = keys.filter((k) => !ALLOWED_SETTING_KEYS.has(k));
    if (unknownKeys.length > 0) {
      return Err.badRequest(
        `Unknown setting keys: ${unknownKeys.join(', ')}`,
        "UNKNOWN_SETTING_KEY"
      );
    }

    // Upsert each whitelisted setting
    for (const key of keys) {
      await db.insert(settings)
        .values({ key, value: body[key] })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: body[key] }
        });
    }

    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
