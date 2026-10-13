import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { databaseTestAdapter } from './testing/database-adapter.mjs'
import { createE2eRuntime, restoreE2eNextEnv } from './testing/e2e-runtime.mjs'
import { runManagedCommand } from './ignite/managed-command.mjs'

const repositoryRoot = process.cwd()
const schemaPath = resolve(repositoryRoot, 'prisma', 'schema.prisma')
databaseTestAdapter.assertSchema(schemaPath)
const nextEnvPath = join(repositoryRoot, 'next-env.d.ts')
let originalNextEnv = null
const workspace = mkdtempSync(join(tmpdir(), 'ignite-e2e-'))
const temporaryPrisma = join(workspace, 'prisma')
const temporarySchema = join(temporaryPrisma, 'schema.prisma')
const prismaCli = resolve(repositoryRoot, 'node_modules', 'prisma', 'build', 'index.js')
const playwrightCli = resolve(repositoryRoot, 'node_modules', '@playwright', 'test', 'cli.js')
const databasePath = join(workspace, 'e2e.db')
const databaseUrl = databaseTestAdapter.isolatedUrl(databasePath)
const nextEnvSnapshotPath = join(workspace, 'e2e-next-env.snapshot')
const production =
  process.argv.includes('--production') || process.env.E2E_SERVER_MODE === 'production'
const serverMode = production ? 'production' : 'development'
const playwrightArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== '--production' && argument !== '--')
const runtime = createE2eRuntime({ repositoryRoot, mode: serverMode })
const cancellation = new AbortController()
const cancelRun = () => cancellation.abort()
let releaseRuntime
process.on('SIGINT', cancelRun)
process.on('SIGTERM', cancelRun)

function findAvailablePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer()

    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()

      if (!address || typeof address === 'string') {
        server.close()
        reject(new Error('Unable to allocate an isolated E2E port.'))
        return
      }

      const { port } = address
      server.close((error) => {
        if (error) reject(error)
        else resolvePort(port)
      })
    })
  })
}

function streamOutput(stream, text) {
  const output = stream === 'stderr' ? process.stderr : process.stdout
  output.write(text)
}

async function runStep(label, args, env, timeoutMs) {
  console.log(`E2E ${label} started.`)
  const result = await runManagedCommand({
    command: process.execPath,
    args,
    cwd: repositoryRoot,
    env,
    timeoutMs,
    signal: cancellation.signal,
    onOutput: streamOutput,
  })

  if (
    result.exitCode !== 0 ||
    result.signal !== null ||
    result.timedOut ||
    result.cancelled ||
    result.error
  ) {
    const details = [
      `E2E ${label} failed with exit code ${result.exitCode}${result.signal ? ` and signal ${result.signal}` : ''}.`,
      result.timedOut ? 'The managed command timed out.' : '',
      result.cancelled ? 'The managed command was cancelled.' : '',
      result.error ? `Runner error: ${result.error}` : '',
      result.stdout ? `Recent stdout:\n${result.stdout}` : '',
      result.stderr ? `Recent stderr:\n${result.stderr}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    throw new Error(details)
  }
}

let exitCode = 0
try {
  releaseRuntime = await runtime.acquire()
  originalNextEnv = existsSync(nextEnvPath) ? readFileSync(nextEnvPath) : null
  const e2ePort = await findAvailablePort()

  mkdirSync(temporaryPrisma, { recursive: true })
  copyFileSync(schemaPath, temporarySchema)
  cpSync(resolve(repositoryRoot, 'prisma', 'migrations'), join(temporaryPrisma, 'migrations'), {
    recursive: true,
  })

  await runStep(
    'isolated database migration',
    [prismaCli, 'migrate', 'deploy', '--schema', temporarySchema],
    {
      ...process.env,
      DATABASE_URL: databaseUrl,
      ...(process.platform === 'win32' ? { RUST_LOG: 'info' } : {}),
    },
    120_000,
  )

  await runStep(
    'Prisma client generation',
    [prismaCli, 'generate', '--schema', schemaPath],
    { ...process.env, DATABASE_URL: databaseUrl },
    120_000,
  )

  await runStep(
    `${serverMode} browser run`,
    [playwrightCli, 'test', ...playwrightArguments],
    {
      ...process.env,
      APP_ENV: 'test',
      E2E_DATABASE_URL: databaseUrl,
      E2E_PORT: String(e2ePort),
      E2E_SERVER_MODE: serverMode,
      E2E_NEXT_ENV_SNAPSHOT: nextEnvSnapshotPath,
    },
    30 * 60_000,
  )
} catch (error) {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error))
  exitCode = 1
} finally {
  try {
    if (releaseRuntime && !production) {
      const generatedNextEnv = existsSync(nextEnvSnapshotPath)
        ? readFileSync(nextEnvSnapshotPath)
        : null
      const nextEnvResult = await restoreE2eNextEnv({
        path: nextEnvPath,
        originalContent: originalNextEnv,
        generatedContent: generatedNextEnv,
      })
      if (nextEnvResult === 'changed') {
        console.log('Kept next-env.d.ts because its contents changed after E2E startup.')
      }
    }
  } catch (error) {
    console.error(
      error instanceof Error
        ? `E2E next-env.d.ts cleanup failed: ${error.stack ?? error.message}`
        : `E2E next-env.d.ts cleanup failed: ${String(error)}`,
    )
    exitCode = 1
  }

  try {
    await releaseRuntime?.()
  } catch (error) {
    console.error(
      error instanceof Error
        ? `E2E cache cleanup failed: ${error.stack ?? error.message}`
        : `E2E cache cleanup failed: ${String(error)}`,
    )
    exitCode = 1
  }

  rmSync(workspace, {
    force: true,
    maxRetries: 3,
    recursive: true,
    retryDelay: 100,
  })
  process.removeListener('SIGINT', cancelRun)
  process.removeListener('SIGTERM', cancelRun)
}

process.exitCode = exitCode
