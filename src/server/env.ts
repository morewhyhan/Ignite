import 'server-only'

import { z } from 'zod'
import { environmentPolicyIssues } from './env-policy.mjs'

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    APP_ENV: z.enum(['development', 'test', 'production']),
    APP_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
  })
  .superRefine((value, context) => {
    for (const issue of environmentPolicyIssues(value)) {
      context.addIssue({
        code: 'custom',
        path: [issue.path],
        message: issue.message,
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
