import { createServer } from 'node:http'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createE2eRuntime,
  prepareE2eRoutes,
  restoreE2eNextEnv,
} from '../../scripts/testing/e2e-runtime.mjs'

const fixtures: string[] = []

function makeRoot() {
  const root = mkdtempSync(join(tmpdir(), 'ignite-e2e-runtime-'))
  fixtures.push(root)
  return root
}

afterEach(() => {
  for (const fixture of fixtures.splice(0)) rmSync(fixture, { recursive: true, force: true })
})

describe('E2E startup runtime', () => {
  it('[AC-EXECUTION-043] isolates browser startup and warms routes before tests', async () => {
    const root = makeRoot()
    const runtime = createE2eRuntime({ repositoryRoot: root, mode: 'development' })
    mkdirSync(join(root, '.next'), { recursive: true })
    writeFileSync(join(root, '.next', 'normal-dev-cache'), 'preserve')

    expect(runtime.distDir).toBe('.next/e2e')
    const typeConfig = JSON.parse(readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf8'))
    expect(typeConfig.include).toContain('.next/types/**/*.ts')
    expect(typeConfig.include).toContain('.next/dev/types/**/*.ts')
    expect(typeConfig.include).toContain('.next/e2e/types/**/*.ts')
    expect(typeConfig.exclude).toContain('.next/e2e')
    const release = await runtime.acquire()
    expect(readFileSync(join(root, '.next', 'normal-dev-cache'), 'utf8')).toBe('preserve')
    await expect(createE2eRuntime({ repositoryRoot: root }).acquire()).rejects.toThrow(
      /already owned.*PID/i,
    )

    const requests: string[] = []
    const server = createServer((request, response) => {
      requests.push(request.url ?? '')
      if (request.url === '/') response.writeHead(200).end('ready')
      else response.writeHead(307, { location: '/' }).end()
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Expected an allocated port.')

    try {
      await expect(
        prepareE2eRoutes({ baseURL: `http://127.0.0.1:${address.port}` }),
      ).resolves.toEqual([
        { path: '/', status: 200 },
        { path: '/dashboard', status: 307 },
      ])
      expect(requests).toEqual(['/', '/dashboard'])
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      )
    }

    await release()
    expect(() => readFileSync(runtime.cachePath)).toThrow()
    expect(readFileSync(join(root, '.next', 'normal-dev-cache'), 'utf8')).toBe('preserve')
  })

  it('keeps production startup on the real build directory', async () => {
    const root = makeRoot()
    const runtime = createE2eRuntime({ repositoryRoot: root, mode: 'production' })

    expect(runtime.distDir).toBe('.next')
    expect(runtime.ownerPath).toBeNull()
  })

  it('allows only one runner to recover a stale owner', async () => {
    const root = makeRoot()
    const ownerPath = join(root, '.next', '.e2e-dev-owner')
    mkdirSync(ownerPath, { recursive: true })
    writeFileSync(
      join(ownerPath, 'owner.json'),
      JSON.stringify({ pid: 0, token: 'stale-owner', startedAt: '2026-10-12T00:00:00.000Z' }),
    )

    const acquisitions = await Promise.allSettled([
      createE2eRuntime({ repositoryRoot: root }).acquire(),
      createE2eRuntime({ repositoryRoot: root }).acquire(),
    ])
    const releases = acquisitions.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    )

    expect(releases).toHaveLength(1)
    await releases[0]()
  })

  it('prepares the landing page and protected redirect before tests start', async () => {
    const requests: string[] = []
    const server = createServer((request, response) => {
      requests.push(request.url ?? '')
      if (request.url === '/') {
        response.writeHead(200, { 'content-type': 'text/html' }).end('ready')
      } else if (request.url === '/dashboard') {
        response.writeHead(307, { location: '/' }).end()
      } else {
        response.writeHead(404).end('missing')
      }
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Expected an allocated port.')

    try {
      await expect(
        prepareE2eRoutes({ baseURL: `http://127.0.0.1:${address.port}` }),
      ).resolves.toEqual([
        { path: '/', status: 200 },
        { path: '/dashboard', status: 307 },
      ])
      expect(requests).toEqual(['/', '/dashboard'])
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      )
    }
  })

  it('reports failed route preparation with route and response details', async () => {
    const server = createServer((_request, response) => {
      response.writeHead(500).end('compile failed')
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Expected an allocated port.')

    try {
      await expect(
        prepareE2eRoutes({ baseURL: `http://127.0.0.1:${address.port}`, timeoutMs: 1_000 }),
      ).rejects.toThrow(/route \/ returned HTTP 500.*compile failed/i)
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      )
    }
  })

  it('restores only the unchanged E2E next-env write', async () => {
    const root = makeRoot()
    const path = join(root, 'next-env.d.ts')
    const original = Buffer.from(
      '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\nimport "./.next/types/routes.d.ts";\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n',
    )
    const generated = Buffer.from(
      original.toString('utf8').replace('.next/types/', '.next/e2e/types/'),
    )
    writeFileSync(path, generated)

    await expect(
      restoreE2eNextEnv({ path, originalContent: original, generatedContent: generated }),
    ).resolves.toBe('restored')
    expect(readFileSync(path)).toEqual(original)

    writeFileSync(path, generated)
    const normalDevUpdate = Buffer.from(
      original.toString('utf8').replace('types="next"', 'types="next"\n// retained dev update'),
    )
    writeFileSync(path, normalDevUpdate)
    await expect(
      restoreE2eNextEnv({ path, originalContent: original, generatedContent: generated }),
    ).resolves.toBe('changed')
    expect(readFileSync(path)).toEqual(normalDevUpdate)
  })

  it('removes its generated next-env file when no file existed before E2E', async () => {
    const root = makeRoot()
    const path = join(root, 'next-env.d.ts')
    const generated = Buffer.from(
      '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\nimport "./.next/e2e/types/routes.d.ts";\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n',
    )
    writeFileSync(path, generated)

    await expect(restoreE2eNextEnv({ path, originalContent: null })).resolves.toBe('restored')
    expect(() => readFileSync(path)).toThrow()
  })

  it('restores development type references even when startup produced no snapshot', async () => {
    const root = makeRoot()
    const path = join(root, 'next-env.d.ts')
    const original = Buffer.from(
      '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\nimport "./.next/dev/types/routes.d.ts";\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n',
    )
    const generated = Buffer.from(original.toString('utf8').replace('.next/dev/', '.next/e2e/dev/'))
    writeFileSync(path, generated)
    await expect(restoreE2eNextEnv({ path, originalContent: original })).resolves.toBe('restored')
    expect(readFileSync(path)).toEqual(original)
    writeFileSync(path, generated)
    await expect(restoreE2eNextEnv({ path, originalContent: null })).resolves.toBe('restored')
    expect(() => readFileSync(path)).toThrow()
  })

  it('rejects route preparation outside a pure HTTP loopback origin', async () => {
    await expect(prepareE2eRoutes({ baseURL: 'https://example.com' })).rejects.toThrow(
      /pure HTTP loopback origin/i,
    )
  })
})
