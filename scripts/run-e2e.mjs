import { execFileSync } from 'node:child_process'
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const repositoryRoot = process.cwd()
const workspace = mkdtempSync(join(tmpdir(), 'ignite-e2e-'))
const temporaryPrisma = join(workspace, 'prisma')
const temporarySchema = join(temporaryPrisma, 'schema.prisma')
const schemaPath = resolve(repositoryRoot, 'prisma', 'schema.prisma')
const prismaCli = resolve(repositoryRoot, 'node_modules', 'prisma', 'build', 'index.js')
const playwrightCli = resolve(repositoryRoot, 'node_modules', '@playwright', 'test', 'cli.js')
const databasePath = join(workspace, 'e2e.db')
const databaseUrl = `file:${databasePath.replaceAll('\\', '/')}`

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

try {
  const e2ePort = await findAvailablePort()

  mkdirSync(temporaryPrisma, { recursive: true })
  copyFileSync(schemaPath, temporarySchema)
  cpSync(resolve(repositoryRoot, 'prisma', 'migrations'), join(temporaryPrisma, 'migrations'), {
    recursive: true,
  })

  const migrationArguments = [prismaCli, 'migrate', 'deploy', '--schema', temporarySchema]
  const migrationOptions = {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DATABASE_URL: 'file:../e2e.db',
      ...(process.platform === 'win32' ? { RUST_LOG: 'info' } : {}),
    },
    stdio: 'inherit',
  }

  execFileSync(process.execPath, migrationArguments, migrationOptions)

  execFileSync(process.execPath, [prismaCli, 'generate', '--schema', schemaPath], {
    cwd: repositoryRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  })

  execFileSync(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      APP_ENV: 'test',
      E2E_DATABASE_URL: databaseUrl,
      E2E_PORT: String(e2ePort),
    },
    stdio: 'inherit',
  })
} finally {
  rmSync(workspace, {
    force: true,
    maxRetries: 3,
    recursive: true,
    retryDelay: 100,
  })
}
