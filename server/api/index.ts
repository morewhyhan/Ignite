import { handleError } from './error'
import { Hono } from 'hono'
import usersRoute from './routes/users'
import tasksRoute from './routes/tasks'
import { auth } from '@/lib/auth'

const app = new Hono().basePath('/api')

app.onError(handleError)

// CORS middleware for auth routes
app.use('/auth/*', async (c, next) => {
  // Handle OPTIONS preflight
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }
  await next()
})

// BetterAuth handler - handle all auth routes
app.all('/auth/*', async (c) => {
  const response = await auth.handler(c.req.raw)
  // Add CORS headers to response
  if (response instanceof Response) {
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Access-Control-Allow-Credentials', 'true')
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    })
  }
  return response as any
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const routes = app.route('/', usersRoute).route('/', tasksRoute)

export default app

export type AppType = typeof routes
