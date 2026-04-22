import { auth } from "@/lib/auth";
import { toNodeHandler } from "better-auth/node";

const handler = toNodeHandler(auth);

export const GET = handler;
export const POST = handler;
