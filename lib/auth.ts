import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path


const prisma = new PrismaClient();
export const auth = betterAuth({
 database: prismaAdapter(prisma, {
        provider: "sqlite", // or "mysql", "postgresql", ...etc
    }),
      emailAndPassword: { 
    enabled: true, 
  }, 
    // socialProviders: { 
   
    //  google: { 
    //   clientId: process.env.GITHUB_CLIENT_ID as string, 
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    // }, 
  // }, 
   session: {
        // IMPORTANT: Cookie configuration
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
        },
    },
});