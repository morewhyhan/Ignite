import 'server-only'

import { z } from 'zod'

const developmentSecret = 'ignite-development-only-secret-change-before-deploying'

const appUrlSchema = z
  .string()
  .url()
  .superRefine((value, context) => {
    const url = new URL(value)

    if (value !== url.origin) {
      context.addIssue({
        code: 'custom',
        message: 'APP_URL must be an origin only, for example https://app.example.com.',
      })
    }
  })

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    APP_ENV: z.enum(['development', 'test', 'production']),
    APP_URL: appUrlSchema,
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
  })
  .superRefine((value, context) => {
    if (value.APP_ENV === 'production' && value.NODE_ENV && value.NODE_ENV !== 'production') {
      context.addIssue({
        code: 'custom',
        path: ['APP_ENV'],
        message:
          'APP_ENV=production requires NODE_ENV=production. Development and test APP_ENV values may use either Next.js build mode.',
      })
    }

    if (value.APP_ENV !== 'production') return

    const appUrl = new URL(value.APP_URL)
    const hostname = appUrl.hostname.toLowerCase()

    if (appUrl.protocol !== 'https:') {
      context.addIssue({
        code: 'custom',
        path: ['APP_URL'],
        message: 'Production APP_URL must use HTTPS.',
      })
    }

    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      /^127(?:\.\d{1,3}){3}$/.test(hostname) ||
      hostname === '[::1]' ||
      hostname === '0.0.0.0'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['APP_URL'],
        message: 'Production APP_URL must use the deployed public origin.',
      })
    }

    if (value.BETTER_AUTH_SECRET === developmentSecret) {
      context.addIssue({
        code: 'custom',
        path: ['BETTER_AUTH_SECRET'],
        message: 'Production must not use the development-only secret.',
      })
    }

    if (value.DATABASE_URL.startsWith('file:')) {
      context.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message:
          'The bundled SQLite setup is local-only. Migrate the Prisma provider, adapter, and migrations before production.',
      })
    }
  })

export function parseServerEnv(input: Record<string, string | undefined>) {
  const result = serverEnvSchema.safeParse(input)

  if (!result.success) {
    throw new Error(`Invalid server environment:\n${z.prettifyError(result.error)}`)
  }

  return result.data
}

export const env = parseServerEnv(process.env)
