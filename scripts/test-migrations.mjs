import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { databaseTestAdapter } from './testing/database-adapter.mjs'
import {
  assertMigrationProbe,
  loadMigrationProbeFixture,
  migrationProbeFixturePath,
  seedMigrationProbe,
} from './testing/migration-probe.mjs'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const prismaCli = join(repositoryRoot, 'node_modules', 'prisma', 'build', 'index.js')

/** All writes are confined to a newly allocated workspace, never the application's database. */
export function verifyMigrationHistory({
  sourcePrismaDirectory = join(repositoryRoot, 'prisma'),
} = {}) {
  const sourceMigrationsDirectory = join(sourcePrismaDirectory, 'migrations')
  databaseTestAdapter.assertSchema(join(sourcePrismaDirectory, 'schema.prisma'))
  if (!existsSync(prismaCli))
    throw new Error('Prisma CLI is missing. Run `pnpm install --frozen-lockfile` first.')
  const migrationNames = readdirSync(sourceMigrationsDirectory)
    .filter((name) => {
      const path = join(sourceMigrationsDirectory, name)
      return statSync(path).isDirectory() && existsSync(join(path, 'migration.sql'))
    })
    .sort()
  if (!migrationNames.length) throw new Error('No Prisma migrations were found.')

  const root = mkdtempSync(join(tmpdir(), 'ignite-migrations-'))
  const prismaDirectory = join(root, 'prisma')
  const migrationsDirectory = join(prismaDirectory, 'migrations')
  const schemaPath = join(prismaDirectory, 'schema.prisma')
  const databasePath = join(root, 'upgrade.db')
  const databaseUrl = databaseTestAdapter.isolatedUrl(databasePath)
  const fixturePath = migrationProbeFixturePath(dirname(sourcePrismaDirectory))
  const fixture = loadMigrationProbeFixture(fixturePath)
  const seededTables = new Set()

  function runPrisma(args, url = databaseUrl) {
    execFileSync(process.execPath, [prismaCli, ...args], {
      cwd: prismaDirectory,
      env: {
        ...process.env,
        DATABASE_URL: url,
        ...(process.platform === 'win32' ? { RUST_LOG: 'info' } : {}),
      },
      stdio: 'inherit',
      timeout: 120_000,
    })
  }
  function inspect(callback) {
    const database = databaseTestAdapter.openFile(databasePath)
    try {
      return callback(database)
    } finally {
      database.close()
    }
  }
  function assertNoDrift(url) {
    runPrisma(
      ['migrate', 'diff', '--from-url', url, '--to-schema-datamodel', schemaPath, '--exit-code'],
      url,
    )
  }

  try {
    mkdirSync(migrationsDirectory, { recursive: true })
    copyFileSync(join(sourcePrismaDirectory, 'schema.prisma'), schemaPath)
    copyFileSync(
      join(sourceMigrationsDirectory, 'migration_lock.toml'),
      join(migrationsDirectory, 'migration_lock.toml'),
    )
    for (let index = 0; index < migrationNames.length; index += 1) {
      const snapshot =
        index === 0
          ? null
          : inspect((database) => seedMigrationProbe(database, { fixture, fixturePath }))
      for (const table of snapshot?.keys() || []) seededTables.add(table)
      const name = migrationNames[index]
      cpSync(join(sourceMigrationsDirectory, name), join(migrationsDirectory, name), {
        recursive: true,
      })
      runPrisma(['migrate', 'deploy', '--schema', schemaPath])
      if (snapshot) {
        try {
          inspect((database) => assertMigrationProbe(database, snapshot))
        } catch (error) {
          throw new Error(`Migration ${name} data upgrade failed: ${error.message}`)
        }
      }
    }
    // Verify the current schema can hold representative related data even with one initial migration.
    const finalSnapshot = inspect((database) =>
      seedMigrationProbe(database, { fixture, fixturePath }),
    )
    for (const table of finalSnapshot.keys()) seededTables.add(table)
    assertNoDrift(databaseUrl)
    runPrisma(['migrate', 'deploy', '--schema', schemaPath])
    inspect((database) => assertMigrationProbe(database, finalSnapshot))
    runPrisma(['migrate', 'status', '--schema', schemaPath])

    const freshUrl = databaseTestAdapter.isolatedUrl(join(root, 'fresh.db'))
    runPrisma(['migrate', 'deploy', '--schema', schemaPath], freshUrl)
    assertNoDrift(freshUrl)
    const result = {
      migrations: migrationNames.length,
      upgrade_boundaries: migrationNames.length - 1,
      seeded_tables: seededTables.size,
    }
    console.log(
      `Migration smoke checks passed: ${result.upgrade_boundaries} real upgrade boundaries, ${result.seeded_tables} populated tables.`,
    )
    return result
  } finally {
    rmSync(root, { force: true, maxRetries: 3, recursive: true, retryDelay: 100 })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  verifyMigrationHistory()
