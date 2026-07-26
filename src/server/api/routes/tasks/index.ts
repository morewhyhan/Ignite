import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { zValidator } from '../../validator'
import { prisma } from '@/server/database/client'
import { requireUserId } from '../../session'

const taskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
  })
  .strict()

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    completed: z.boolean().optional(),
  })
  .strict()
  .refine((data) => data.title !== undefined || data.completed !== undefined, {
    message: 'At least one field is required',
  })

const taskParamSchema = z.object({
  id: z.string().uuid(),
})

const app = new Hono()
  .basePath('/tasks')
  // Get all tasks for current user
  .get('/', async (c) => {
    const userId = await requireUserId(c.req.raw.headers)

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return c.json({ data: tasks })
  })
  // Create task for current user
  .post('/', zValidator('json', taskSchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)

    const { title } = c.req.valid('json')
    const task = await prisma.task.create({
      data: { title, userId },
    })
    return c.json({ data: task })
  })
  // Update task (only if belongs to current user)
  .put(
    '/:id',
    zValidator('param', taskParamSchema),
    zValidator('json', updateTaskSchema),
    async (c) => {
      const userId = await requireUserId(c.req.raw.headers)

      const { id } = c.req.valid('param')
      const data = c.req.valid('json')

      const task = await prisma.$transaction(async (tx) => {
        const result = await tx.task.updateMany({
          where: { id, userId },
          data,
        })

        if (result.count === 0) return null

        return tx.task.findUnique({ where: { id } })
      })

      if (!task) {
        throw new HTTPException(404, { message: 'Task not found' })
      }

      return c.json({ data: task })
    },
  )
  // Delete task (only if belongs to current user)
  .delete('/:id', zValidator('param', taskParamSchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)

    const { id } = c.req.valid('param')
    const result = await prisma.task.deleteMany({
      where: { id, userId },
    })

    if (result.count === 0) {
      throw new HTTPException(404, { message: 'Task not found' })
    }

    return c.json({ data: { id } })
  })

export default app
