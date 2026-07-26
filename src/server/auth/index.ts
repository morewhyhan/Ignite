import 'server-only'

import { betterAuth } from 'better-auth/minimal'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { authConfig } from '@/config/auth'
import { siteConfig } from '@/config/site'
import { prisma } from '@/server/database/client'
import { env } from '@/server/env'

export const auth = betterAuth({
  appName: siteConfig.name,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.APP_URL,
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  advanced: {
    cookiePrefix: siteConfig.slug,
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    // The template intentionally keeps auth self-contained: no external mail provider.
    requireEmailVerification: false,
    minPasswordLength: authConfig.minPasswordLength,
    maxPasswordLength: authConfig.maxPasswordLength,
  },
})
