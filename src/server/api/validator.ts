import { zValidator as honoZValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodType } from 'zod'

export function zValidator<Target extends keyof ValidationTargets, Schema extends ZodType>(
  target: Target,
  schema: Schema,
) {
  return honoZValidator(target, schema, (result) => {
    if (!result.success) {
      throw result.error
    }
  })
}
