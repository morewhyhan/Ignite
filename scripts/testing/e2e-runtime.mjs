import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

function isProcessRunning(pid) {
  if (!Number.isInteger(pid) || pid < 1) return false

  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error?.code !== 'ESRCH'
  }
}

export function createE2eRuntime({ repositoryRoot, mode = 'development' }) {
  if (mode !== 'development' && mode !== 'production') {
    throw new Error(`Unsupported E2E server mode: ${mode}`)
  }

  const root = resolve(repositoryRoot)
  const distDir = mode === 'development' ? '.next/e2e' : '.next'
  const cachePath = resolve(root, distDir)
  const ownerPath = mode === 'development' ? resolve(root, '.next', '.e2e-dev-owner') : null
  const recoveryPath = mode === 'development' ? resolve(root, '.next', '.e2e-dev-recovery') : null
  const token = randomUUID()

  async function readOwner(path) {
    try {
      return JSON.parse(await readFile(resolve(path, 'owner.json'), 'utf8'))
    } catch {
      throw new Error(
        `E2E cache ownership record is unreadable at ${path}. Verify no E2E runner remains active before removing this owner directory and the E2E cache.`,
      )
    }
  }

  async function assertNoRecovery() {
    try {
      await stat(recoveryPath)
    } catch (error) {
      if (error?.code === 'ENOENT') return
      throw error
    }

    let recoveryOwner
    try {
      recoveryOwner = await readOwner(recoveryPath)
    } catch {
      try {
        await readFile(resolve(recoveryPath, 'owner.json'), 'utf8')
      } catch (readError) {
        if (readError?.code === 'ENOENT') {
          throw new Error(
            `E2E cache recovery is in progress at ${recoveryPath}; its owner record is incomplete. Verify no E2E runner is active before removing this recovery directory.`,
          )
        }
      }
      throw new Error(`E2E cache recovery record is invalid at ${recoveryPath}.`)
    }

    if (isProcessRunning(recoveryOwner.pid)) {
      throw new Error(
        `E2E cache recovery is already owned by live PID ${recoveryOwner.pid} at ${recoveryPath}.`,
      )
    }

    throw new Error(
      `E2E cache recovery was interrupted by PID ${recoveryOwner.pid} at ${recoveryPath}. Verify that PID is stopped, then remove the recovery directory to resume.`,
    )
  }

  async function writeOwner(path, owner) {
    await mkdir(path)
    try {
      await writeFile(resolve(path, 'owner.json'), JSON.stringify(owner), { flag: 'wx' })
    } catch (error) {
      await rm(path, { recursive: true, force: true })
      throw error
    }
  }

  return {
    distDir,
    cachePath,
    ownerPath,
    async acquire() {
      if (mode === 'production') return async () => {}

      const owner = { pid: process.pid, token, startedAt: new Date().toISOString() }
      await mkdir(dirname(ownerPath), { recursive: true })
      await assertNoRecovery()

      try {
        await writeOwner(ownerPath, owner)
        try {
          await assertNoRecovery()
        } catch (error) {
          const currentOwner = await readOwner(ownerPath)
          if (currentOwner.token === token) await rm(ownerPath, { recursive: true, force: true })
          throw error
        }
      } catch (error) {
        if (error?.code !== 'EEXIST') throw error

        const existing = await readOwner(ownerPath)

        if (isProcessRunning(existing.pid)) {
          throw new Error(
            `E2E development cache is already owned by live PID ${existing.pid} since ${existing.startedAt ?? 'an unknown time'}.`,
          )
        }

        try {
          await mkdir(recoveryPath)
        } catch (recoveryError) {
          if (recoveryError?.code !== 'EEXIST') throw recoveryError
          await assertNoRecovery()
          throw recoveryError
        }

        const recoveryOwner = {
          pid: process.pid,
          token,
          startedAt: new Date().toISOString(),
        }
        try {
          await writeFile(resolve(recoveryPath, 'owner.json'), JSON.stringify(recoveryOwner), {
            flag: 'wx',
          })
          const currentOwner = await readOwner(ownerPath)
          if (currentOwner.token !== existing.token || isProcessRunning(currentOwner.pid)) {
            throw new Error(`E2E cache owner changed during stale recovery at ${ownerPath}.`)
          }

          const staleOwnerPath = `${ownerPath}.stale-${randomUUID()}`
          await rename(ownerPath, staleOwnerPath)
          await rm(staleOwnerPath, { recursive: true, force: true })

          for (let attempt = 0; attempt < 40; attempt += 1) {
            try {
              await writeOwner(ownerPath, owner)
              break
            } catch (acquireError) {
              if (acquireError?.code !== 'EEXIST') throw acquireError
              await new Promise((resolveWait) => setTimeout(resolveWait, 25))
            }
          }

          const acquiredOwner = await readOwner(ownerPath)
          if (acquiredOwner.token !== token) {
            throw new Error(`Another E2E run acquired the development cache at ${ownerPath}.`)
          }
          await rm(recoveryPath, { recursive: true, force: true })
        } catch (retryError) {
          await rm(recoveryPath, { recursive: true, force: true })
          throw retryError
        }
      }

      try {
        await rm(cachePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
      } catch (error) {
        await rm(ownerPath, { recursive: true, force: true })
        throw error
      }

      let released = false
      return async () => {
        if (released) return
        released = true

        let currentOwner
        try {
          currentOwner = JSON.parse(await readFile(resolve(ownerPath, 'owner.json'), 'utf8'))
        } catch {
          throw new Error(`Cannot confirm ownership of E2E cache lock at ${ownerPath}.`)
        }

        if (currentOwner.token !== token) {
          throw new Error(
            `E2E cache lock ownership changed while this run was active: ${ownerPath}.`,
          )
        }

        await rm(cachePath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
        await rm(ownerPath, { recursive: true, force: true })
      }
    },
  }
}

function isGeneratedE2eNextEnv(content) {
  const lines = content.split(/\r?\n/)
  if (lines.at(-1) === '') lines.pop()
  if (
    lines[0] !== '/// <reference types="next" />' ||
    !lines.some((line) =>
      /^import "\.\/\.next\/e2e\/(?:dev\/)?types\/routes\.d\.ts";$/.test(line),
    ) ||
    lines.at(-2) !== '// NOTE: This file should not be edited' ||
    !/^\/\/ see https:\/\/nextjs\.org\/docs\/(app|pages)\/api-reference\/config\/typescript for more information\.$/.test(
      lines.at(-1) ?? '',
    )
  ) {
    return false
  }

  const allowedLines = new Set([
    '/// <reference types="next" />',
    '/// <reference types="next/image-types/global" />',
    '/// <reference types="next/navigation-types/compat/navigation" />',
    'import "./.next/e2e/types/routes.d.ts";',
    'import "./.next/e2e/types/cache-life.d.ts";',
    'import "./.next/e2e/types/validator.ts";',
    'import "./.next/e2e/types/link.d.ts";',
    'import "./.next/e2e/dev/types/routes.d.ts";',
    'import "./.next/e2e/dev/types/cache-life.d.ts";',
    'import "./.next/e2e/dev/types/validator.ts";',
    'import "./.next/e2e/dev/types/link.d.ts";',
    '',
    '// NOTE: This file should not be edited',
    lines.at(-1),
  ])
  return lines.every((line) => allowedLines.has(line))
}

/**
 * @param {{ path: string, originalContent: Uint8Array | null, generatedContent?: Uint8Array | null }} options
 */
export async function restoreE2eNextEnv({ path, originalContent, generatedContent = null }) {
  let currentContent
  try {
    currentContent = await readFile(path)
  } catch (error) {
    if (error?.code === 'ENOENT') return 'missing'
    throw error
  }

  const currentText = currentContent.toString('utf8')
  const generatedBytes = generatedContent == null ? null : Buffer.from(generatedContent)
  const exactE2eGeneration = generatedBytes?.equals(currentContent) ?? false
  const restoredDefaultReference =
    originalContent != null &&
    /\.next\/e2e\/(?:dev\/)?types\/routes\.d\.ts/.test(currentText) &&
    currentText.replaceAll('.next/e2e/', '.next/') === Buffer.from(originalContent).toString('utf8')
  const generatedWithoutPriorFile = originalContent == null && isGeneratedE2eNextEnv(currentText)

  if (!exactE2eGeneration && !restoredDefaultReference && !generatedWithoutPriorFile) {
    return 'changed'
  }

  if (originalContent == null) {
    await rm(path, { force: true })
  } else {
    await writeFile(path, originalContent)
  }
  return 'restored'
}

async function responseBody(response, maxBytes = 1_000) {
  const reader = response.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let body = ''
  let readBytes = 0
  try {
    while (readBytes < maxBytes) {
      const { done, value } = await reader.read()
      if (done) {
        body += decoder.decode()
        break
      }

      const chunk = value.subarray(0, maxBytes - readBytes)
      body += decoder.decode(chunk, { stream: true })
      readBytes += chunk.byteLength
      if (chunk.byteLength < value.byteLength || readBytes >= maxBytes) {
        await reader.cancel()
        break
      }
    }
  } finally {
    reader.releaseLock()
  }
  return body
}

export async function prepareE2eRoutes({ baseURL, fetchImpl = fetch, timeoutMs = 120_000 }) {
  const origin = new URL(baseURL)
  if (
    origin.protocol !== 'http:' ||
    origin.username ||
    origin.password ||
    !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname) ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  ) {
    throw new Error('E2E route preparation requires a pure HTTP loopback origin.')
  }

  const checks = [
    { path: '/', expected: (status) => status === 200 },
    { path: '/dashboard', expected: (status) => status === 307 || status === 308 },
  ]
  const results = []

  for (const check of checks) {
    let response
    let body
    try {
      response = await fetchImpl(new URL(check.path, origin), {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
      })
      body = await responseBody(response)
    } catch (error) {
      throw new Error(`E2E route preparation failed for ${check.path}: ${String(error)}`, {
        cause: error,
      })
    }

    if (!check.expected(response.status)) {
      throw new Error(
        `E2E route preparation failed: route ${check.path} returned HTTP ${response.status}${body ? `: ${body}` : ''}`,
      )
    }

    if (check.path === '/dashboard') {
      const location = response.headers.get('location')
      const target = location ? new URL(location, origin) : null
      if (!target || target.origin !== origin.origin || target.pathname !== '/') {
        throw new Error(
          `E2E route preparation failed: route /dashboard returned HTTP ${response.status} with unexpected location ${location ?? '(missing)'}.`,
        )
      }
    }

    results.push({ path: check.path, status: response.status })
  }

  return results
}
