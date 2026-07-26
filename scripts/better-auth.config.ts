import { PrismaClient } from '@prisma/client'
import { betterAuth } from 'better-auth/minimal'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { authConfig } from '../src/config/auth'

const prisma = new PrismaClient()

// Keep every schema-affecting auth option and plugin in sync with src/server/auth/index.ts.
// Runtime secrets and email delivery do not belong in this CLI-only instance.
export const auth = betterAuth({
  baseURL: 'http://localhost:3000',
  secret: 'schema-generation-only-secret-32-characters',
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: authConfig.minPasswordLength,
    maxPasswordLength: authConfig.maxPasswordLength,
  },
})
