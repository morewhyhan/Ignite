import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '../../validator'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const taskSchema = z.object({
  title: z.string().min(1),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
})

// Helper to get user ID from session
async function getUserId(c: any): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  return session?.user?.id || null
}

const app = new Hono()
  .basePath('/tasks')
  // Get all tasks for current user
  .get('/', async (c) => {
    const userId = await getUserId(c)
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return c.json({ data: tasks })
  })
  // Create task for current user
  .post('/', zValidator('json', taskSchema), async (c) => {
    const userId = await getUserId(c)
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { title } = c.req.valid('json')
    const task = await prisma.task.create({
      data: { title, userId },
    })
    return c.json({ data: task })
  })
  // Update task (only if belongs to current user)
  .put('/:id', zValidator('json', updateTaskSchema), async (c) => {
    const userId = await getUserId(c)
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')
    const data = c.req.valid('json')

    // Check if task belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    })

    if (!existingTask || existingTask.userId !== userId) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    })
    return c.json({ data: task })
  })
  // Delete task (only if belongs to current user)
  .delete('/:id', async (c) => {
    const userId = await getUserId(c)
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = c.req.param('id')

    // Check if task belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id },
    })

    if (!existingTask || existingTask.userId !== userId) {
      return c.json({ error: 'Task not found' }, 404)
    }

    await prisma.task.delete({
      where: { id },
    })
    return c.json({ success: true })
  })

export default app
