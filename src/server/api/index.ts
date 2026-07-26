import { handleError } from './error'
import { Hono } from 'hono'
import tasksRoute from './routes/tasks'
import { auth } from '@/server/auth'

const app = new Hono().basePath('/api')

app.onError(handleError)

app.all('/auth/*', (c) => auth.handler(c.req.raw))

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export const routes = app.route('/', tasksRoute)

export default routes

export type AppType = typeof routes
