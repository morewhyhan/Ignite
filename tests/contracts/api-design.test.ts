import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { parse } from 'yaml'

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
})
