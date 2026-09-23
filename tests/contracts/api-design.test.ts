import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { parse } from 'yaml'
import { z } from 'zod'
import { tasksExampleState } from '../../scripts/ignite/examples.mjs'

vi.mock('server-only', () => ({}))

process.env.APP_ENV = 'test'
process.env.APP_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'vitest-only-secret-with-at-least-32-characters'
process.env.DATABASE_URL = 'file:./vitest.db'

type Api = (typeof import('@/server/api'))['default']

let api: Api

beforeAll(async () => {
  ;({ default: api } = await import('@/server/api'))
})

function operationKey(method: string, path: string) {
  return `${method.toUpperCase()} ${path.replace(/:([A-Za-z0-9_]+)/g, '{$1}')}`
}

describe('OpenAPI design snapshot', () => {
  it('[AC-PRODUCT-010] matches every implemented non-auth Hono route', () => {
    const document = parse(
      readFileSync(resolve(process.cwd(), 'docs/designs/api.yaml'), 'utf8'),
    ) as {
      paths: Record<string, Record<string, unknown>>
    }
    const expected = new Set<string>()
    for (const [path, operations] of Object.entries(document.paths)) {
      for (const method of Object.keys(operations)) {
        if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) {
          expected.add(operationKey(method, path))
        }
      }
    }

    const actual = new Set(
      api.routes
        .filter((route) => !route.path.includes('/auth/'))
        .map((route) => operationKey(route.method, route.path)),
    )
    expect(actual).toEqual(expected)
  })

  it.skipIf(tasksExampleState(process.cwd()).fullyRemoved)(
    '[AC-PRODUCT-013] matches documented task request fields to executable validators',
    async () => {
      const document = parse(
        readFileSync(resolve(process.cwd(), 'docs/designs/api.yaml'), 'utf8'),
      ) as {
        components: { schemas: Record<string, Record<string, unknown>> }
      }
      const { taskSchema, updateTaskSchema } = await import('@/server/api/routes/tasks')
      for (const [name, schema] of [
        ['CreateTaskInput', taskSchema],
        ['UpdateTaskInput', updateTaskSchema],
      ] as const) {
        const generated = z.toJSONSchema(schema)
        const documented = document.components.schemas[name]
        expect(generated.properties).toEqual(documented.properties)
        expect(generated.required || []).toEqual(documented.required || [])
        expect(generated.additionalProperties).toBe(documented.additionalProperties)
      }
      expect(document.components.schemas.UpdateTaskInput.minProperties).toBe(1)
    },
  )

  it('[AC-PRODUCT-013] keeps the public health response aligned with OpenAPI', async () => {
    const document = parse(
      readFileSync(resolve(process.cwd(), 'docs/designs/api.yaml'), 'utf8'),
    ) as {
      paths: {
        '/api/health': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      required: string[]
                      properties: Record<string, { const?: string; format?: string }>
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const documented =
      document.paths['/api/health'].get.responses['200'].content['application/json'].schema
    const response = await api.request('http://localhost/api/health')
    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(documented.required.sort())
    expect(body.status).toBe(documented.properties.status.const)
    expect(documented.properties.timestamp.format).toBe('date-time')
    expect(Number.isNaN(Date.parse(String(body.timestamp)))).toBe(false)
  })
})
