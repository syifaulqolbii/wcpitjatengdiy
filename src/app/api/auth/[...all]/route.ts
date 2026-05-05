import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const handler = toNextJsHandler(auth);

async function validateInvitationCode(inputCode: string): Promise<boolean> {
  const setting = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'invitation_code'))
    .limit(1);

  if (!setting[0]) return false;
  return inputCode.toLowerCase() === setting[0].value.toLowerCase();
}

export async function POST(req: NextRequest) {
  // If it's a register request, intercept it
  if (req.nextUrl.pathname.includes("/sign-up/email")) {
    const clonedReq = req.clone();
    try {
      const body = await clonedReq.json();
      const code = body.invitationCode;
      
      if (!code || !(await validateInvitationCode(code))) {
        return NextResponse.json(
          { data: null, error: { message: 'Kode undangan tidak valid', code: 'INVALID_INVITATION_CODE' } },
          { status: 400 }
        );
      }
    } catch (e) {
      // Ignore JSON parse error, let better-auth handle it
    }
  }
  
  return handler.POST(req);
}

export const GET = handler.GET;
