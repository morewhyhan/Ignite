import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const developmentSecret = 'ignite-development-only-secret-change-before-deploying'

const testEnvironment = {
  NODE_ENV: 'test',
  APP_ENV: 'test',
  APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'file:./test.db',
  BETTER_AUTH_SECRET: 'test-only-secret-with-at-least-32-characters',
} satisfies Record<string, string>

const productionEnvironment = {
  NODE_ENV: 'production',
  APP_ENV: 'production',
  APP_URL: 'https://app.example.com',
  DATABASE_URL: 'postgresql://user:password@db.example.com:5432/ignite',
  BETTER_AUTH_SECRET: 'production-secret-that-is-not-the-development-placeholder',
} satisfies Record<string, string>

type ParseServerEnv = (typeof import('@/server/env'))['parseServerEnv']

let parseServerEnv: ParseServerEnv

beforeAll(async () => {
  Object.assign(process.env, testEnvironment)
  ;({ parseServerEnv } = await import('@/server/env'))
})

describe('parseServerEnv', () => {
  it('requires an explicit APP_ENV', () => {
    expect(() => parseServerEnv({ ...testEnvironment, APP_ENV: undefined })).toThrow(/APP_ENV/)
  })

  it('accepts only an origin as APP_URL', () => {
    expect(parseServerEnv(testEnvironment).APP_URL).toBe('http://localhost:3000')

    for (const appUrl of [
      'https://app.example.com/',
      'https://app.example.com/dashboard',
      'https://app.example.com?preview=true',
    ]) {
      expect(() => parseServerEnv({ ...testEnvironment, APP_URL: appUrl })).toThrow(
        /APP_URL must be an origin only/,
      )
    }
  })

  it.each(['development', 'test'] as const)(
    'allows NODE_ENV=production with APP_ENV=%s for local compilation',
    (appEnvironment) => {
      expect(
        parseServerEnv({
          ...testEnvironment,
          NODE_ENV: 'production',
          APP_ENV: appEnvironment,
        }).APP_ENV,
      ).toBe(appEnvironment)
    },
  )

  it.each(['development', 'test'] as const)(
    'rejects APP_ENV=production while NODE_ENV=%s',
    (nodeEnvironment) => {
      expect(() =>
        parseServerEnv({
          ...productionEnvironment,
          NODE_ENV: nodeEnvironment,
        }),
      ).toThrow(/APP_ENV=production/)
    },
  )

  it('allows APP_ENV=test under the development server used by E2E', () => {
    expect(
      parseServerEnv({
        ...testEnvironment,
        NODE_ENV: 'development',
      }).APP_ENV,
    ).toBe('test')
  })

  it('accepts a complete production environment', () => {
    const parsed = parseServerEnv(productionEnvironment)

    expect(parsed.APP_ENV).toBe('production')
  })

  it('requires HTTPS in production', () => {
    expect(() =>
      parseServerEnv({
        ...productionEnvironment,
        APP_URL: 'http://app.example.com',
      }),
    ).toThrow(/HTTPS/)
  })

  it.each([
    'https://localhost',
    'https://api.localhost',
    'https://127.0.0.1',
    'https://127.12.34.56',
    'https://[::1]',
  ])('rejects the production loopback origin %s', (appUrl) => {
    expect(() => parseServerEnv({ ...productionEnvironment, APP_URL: appUrl })).toThrow(
      /public origin/,
    )
  })

  it('rejects the development secret in production', () => {
    expect(() =>
      parseServerEnv({
        ...productionEnvironment,
        BETTER_AUTH_SECRET: developmentSecret,
      }),
    ).toThrow(/development-only secret/)
  })

  it('rejects a file database in production', () => {
    expect(() =>
      parseServerEnv({
        ...productionEnvironment,
        DATABASE_URL: 'file:./production.db',
      }),
    ).toThrow(/SQLite setup is local-only/)
  })
})
