import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  advanced: {
    cookiePrefix: "hononext",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: any) => {
      console.log("Send reset password email to", user.email, url)
    },
    sendVerificationEmail: async ({ user, url }: any) => {
      console.log("Send verification email to", user.email, url)
    },
  },
})
