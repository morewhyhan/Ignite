import { HTTPException } from 'hono/http-exception'
import { auth } from '@/server/auth'

export async function requireUserId(headers: Headers): Promise<string> {
  const session = await auth.api.getSession({ headers })

  if (!session?.user?.id) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  return session.user.id
}
