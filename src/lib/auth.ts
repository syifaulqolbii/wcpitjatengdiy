import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  // TODO: Sesuaikan adapter database nanti (misal Prisma, Drizzle, dll)
  database: {} as any, 
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});
