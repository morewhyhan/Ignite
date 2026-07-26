import { z } from 'zod'
import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export function handleError(err: Error, c: Context): Response {
  if (err instanceof z.ZodError) {
    const firstError = err.issues[0]

    return c.json({ code: 422, message: `\`${firstError.path}\`: ${firstError.message}` }, 422)
  }

  if (err instanceof HTTPException) {
    return c.json({ code: err.status, message: err.message }, err.status)
  }

  console.error(err)
  return c.json(
    {
      code: 500,
      message: '出了点问题, 请稍后再试。',
    },
    { status: 500 },
  )
}
