import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

type StoredTask = {
  id: string
  title: string
  completed: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

const testState = vi.hoisted(() => ({
  nextTaskId: 1,
  tasks: [] as StoredTask[],
  userId: null as string | null,
}))

vi.mock('server-only', () => ({}))

vi.mock('@/server/api/session', async () => {
  const { HTTPException } =
    await vi.importActual<typeof import('hono/http-exception')>('hono/http-exception')

  return {
    requireUserId: async () => {
      if (!testState.userId) {
        throw new HTTPException(401, { message: 'Unauthorized' })
      }

      return testState.userId
    },
  }
})

vi.mock('@/server/database/client', () => {
  const task = {
    findMany: async ({ where }: { where: { userId: string } }) =>
      testState.tasks
        .filter((item) => item.userId === where.userId)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    create: async ({ data }: { data: { title: string; userId: string } }) => {
      const now = new Date()
      const createdTask: StoredTask = {
        id: `00000000-0000-4000-8000-${String(testState.nextTaskId++).padStart(12, '0')}`,
        title: data.title,
        completed: false,
        userId: data.userId,
        createdAt: now,
        updatedAt: now,
      }
      testState.tasks.push(createdTask)
      return createdTask
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: { id: string; userId: string }
      data: { title?: string; completed?: boolean }
    }) => {
      const storedTask = testState.tasks.find(
        (item) => item.id === where.id && item.userId === where.userId,
      )
      if (!storedTask) return { count: 0 }

      Object.assign(storedTask, data, { updatedAt: new Date() })
      return { count: 1 }
    },
    findUnique: async ({ where }: { where: { id: string } }) =>
      testState.tasks.find((item) => item.id === where.id) ?? null,
    deleteMany: async ({ where }: { where: { id?: string; userId?: string } }) => {
      const previousLength = testState.tasks.length
      testState.tasks = testState.tasks.filter(
        (item) =>
          !(
            (where.id === undefined || item.id === where.id) &&
            (where.userId === undefined || item.userId === where.userId)
          ),
      )
      return { count: previousLength - testState.tasks.length }
    },
  }

  const prisma = {
    task,
    $transaction: async <T>(callback: (transaction: { task: typeof task }) => Promise<T>) =>
      callback({ task }),
  }

  return { prisma }
})

process.env.APP_ENV = 'test'
process.env.APP_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'vitest-only-secret-with-at-least-32-characters'
process.env.DATABASE_URL = 'file:./vitest.db'

type Api = (typeof import('@/server/api'))['default']

let api: Api

const firstUserId = '11111111-1111-4111-8111-111111111111'
const secondUserId = '22222222-2222-4222-8222-222222222222'

function request(method: string, path: string, body?: Record<string, unknown>) {
  return api.request(`http://localhost${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
}

beforeAll(async () => {
  ;({ default: api } = await import('@/server/api'))
})

beforeEach(() => {
  testState.nextTaskId = 1
  testState.tasks = []
  testState.userId = null
})

describe('tasks API', () => {
  it('returns 401 when there is no authenticated user', async () => {
    const response = await request('GET', '/api/tasks')

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      code: 401,
      message: 'Unauthorized',
    })
  })

  it('returns 422 for an invalid payload', async () => {
    testState.userId = firstUserId

    const response = await request('POST', '/api/tasks', { title: '   ' })

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({ code: 422 })
  })

  it('rejects unknown input fields to keep the OpenAPI contract strict', async () => {
    testState.userId = firstUserId

    const response = await request('POST', '/api/tasks', {
      title: 'Document the contract',
      userId: 'attacker-controlled-user-id',
    })

    expect(response.status).toBe(422)
    expect(testState.tasks).toHaveLength(0)
  })

  it('does not expose another user task', async () => {
    testState.userId = firstUserId
    const createResponse = await request('POST', '/api/tasks', {
      title: 'private task',
    })
    const created = (await createResponse.json()) as {
      data: { id: string }
    }

    testState.userId = secondUserId
    const updateResponse = await request('PUT', `/api/tasks/${created.data.id}`, {
      title: 'stolen task',
    })

    expect(updateResponse.status).toBe(404)
    await expect(updateResponse.json()).resolves.toMatchObject({
      code: 404,
      message: 'Task not found',
    })

    const storedTask = testState.tasks.find((item) => item.id === created.data.id)
    expect(storedTask?.title).toBe('private task')
    expect(storedTask?.userId).toBe(firstUserId)
  })

  it('creates, lists, updates, and deletes the current user task', async () => {
    testState.userId = firstUserId

    const createResponse = await request('POST', '/api/tasks', {
      title: 'ship the template',
    })
    expect(createResponse.status).toBe(200)
    const created = (await createResponse.json()) as {
      data: { id: string; title: string; completed: boolean; userId: string }
    }
    expect(created.data).toMatchObject({
      title: 'ship the template',
      completed: false,
      userId: firstUserId,
    })

    const listResponse = await request('GET', '/api/tasks')
    expect(listResponse.status).toBe(200)
    await expect(listResponse.json()).resolves.toMatchObject({
      data: [
        {
          id: created.data.id,
          title: 'ship the template',
          completed: false,
        },
      ],
    })

    const updateResponse = await request('PUT', `/api/tasks/${created.data.id}`, {
      title: 'publish the template',
      completed: true,
    })
    expect(updateResponse.status).toBe(200)
    await expect(updateResponse.json()).resolves.toMatchObject({
      data: {
        id: created.data.id,
        title: 'publish the template',
        completed: true,
      },
    })

    const deleteResponse = await request('DELETE', `/api/tasks/${created.data.id}`)
    expect(deleteResponse.status).toBe(200)
    await expect(deleteResponse.json()).resolves.toEqual({
      data: { id: created.data.id },
    })

    expect(testState.tasks.find((item) => item.id === created.data.id)).toBeUndefined()
  })
})
