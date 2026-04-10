import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '../../validator'

const paramSchema = z.object({
  id: z.string().cuid(),
})

const querySchema = z.object({
  name: z.string().min(1),
})

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const app = new Hono()
  .basePath('/users')
  .get('/', zValidator('query', querySchema), async (c) => {
    const { name } = c.req.valid('query')
    // 逻辑代码...

    return c.json({ data: [] })
  })
  .post('/', zValidator('json', userSchema), async (c) => {
    const data = await c.req.valid('json')
    // 逻辑代码...

    return c.json({ data: { name: data.name } })
  })
  .get('/:id', zValidator('param', paramSchema), async (c) => {
    const id = c.req.valid('param').id
    // 逻辑代码...
    return c.json({ data: { id } })
  })
  .put('/:id', zValidator('param', paramSchema), async (c) => {
    const id = c.req.valid('param').id
    // 逻辑代码...
    return c.json({ data: { id } })
  })
  .delete('/:id', zValidator('param', paramSchema), async (c) => {
    const id = c.req.valid('param').id
    // 逻辑代码...
    return c.json({ data: { id } })
  })

export default app
