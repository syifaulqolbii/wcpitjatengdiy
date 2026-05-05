import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─── Standard Response Types ──────────────────────────────────
type SuccessResponse<T> = { data: T; error: null };
type ErrorResponse = { data: null; error: { message: string; code: string } };

// ─── Response Helpers ─────────────────────────────────────────
export function ok<T>(data: T, status = 200): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ data, error: null }, { status });
}

export function created<T>(data: T): NextResponse<SuccessResponse<T>> {
  return ok(data, 201);
}

export function err(
  message: string,
  code: string,
  status: number
): NextResponse<ErrorResponse> {
  return NextResponse.json({ data: null, error: { message, code } }, { status });
}

export const Err = {
  badRequest: (message = "Bad request", code = "BAD_REQUEST") =>
    err(message, code, 400),
  unauthorized: (message = "Unauthorized") =>
    err(message, "UNAUTHORIZED", 401),
  forbidden: (message = "Forbidden") =>
    err(message, "FORBIDDEN", 403),
  notFound: (resource = "Resource") =>
    err(`${resource} not found`, "NOT_FOUND", 404),
  conflict: (message = "Conflict") =>
    err(message, "CONFLICT", 409),
  internal: (message = "Internal server error") =>
    err(message, "INTERNAL_ERROR", 500),
};

// ─── Auth Helpers ──────────────────────────────────────────────
export async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers });
}

export async function requireAuth(req: NextRequest) {
  const session = await getSession(req);
  if (!session) throw new AuthError("Unauthorized", 401);
  return session;
}

export async function requireAdmin(req: NextRequest) {
  const session = await requireAuth(req);
  if (session.user.role !== "admin") throw new AuthError("Forbidden", 403);
  return session;
}

// ─── Auth Error ───────────────────────────────────────────────
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ─── Route Error Handler ─────────────────────────────────────
export function handleError(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof AuthError) {
    return error.status === 403 ? Err.forbidden() : Err.unauthorized();
  }
  if (error instanceof z.ZodError) {
    const msg = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return Err.badRequest(msg, "VALIDATION_ERROR");
  }
  console.error("[API Error]", error);
  return err(
    error instanceof Error ? error.message : "Internal server error",
    "INTERNAL_ERROR",
    500
  );
}
