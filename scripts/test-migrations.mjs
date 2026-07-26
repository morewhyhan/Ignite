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

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePrismaDirectory = join(repositoryRoot, 'prisma')
const sourceMigrationsDirectory = join(sourcePrismaDirectory, 'migrations')
const prismaCli = join(repositoryRoot, 'node_modules', 'prisma', 'build', 'index.js')

if (!existsSync(prismaCli)) {
  throw new Error('Prisma CLI is missing. Run `pnpm install --frozen-lockfile` first.')
}

const migrationNames = readdirSync(sourceMigrationsDirectory)
  .filter((name) => {
    const migrationPath = join(sourceMigrationsDirectory, name)
    return statSync(migrationPath).isDirectory() && existsSync(join(migrationPath, 'migration.sql'))
  })
  .sort()

if (migrationNames.length === 0) {
  throw new Error('No Prisma migrations were found.')
}

function runPrisma(arguments_, databaseUrl, cwd = repositoryRoot) {
  execFileSync(process.execPath, [prismaCli, ...arguments_], {
    cwd,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      ...(process.platform === 'win32' ? { RUST_LOG: 'info' } : {}),
    },
    stdio: 'inherit',
  })
}

function createWorkspace(label) {
  const root = mkdtempSync(join(tmpdir(), `ignite-${label}-`))
  const prismaDirectory = join(root, 'prisma')
  const migrationsDirectory = join(prismaDirectory, 'migrations')

  mkdirSync(migrationsDirectory, { recursive: true })
  copyFileSync(join(sourcePrismaDirectory, 'schema.prisma'), join(prismaDirectory, 'schema.prisma'))
  copyFileSync(
    join(sourceMigrationsDirectory, 'migration_lock.toml'),
    join(migrationsDirectory, 'migration_lock.toml'),
  )

  return {
    databaseUrl: `file:../${label}.db`,
    migrationsDirectory,
    root,
    schemaPath: join(prismaDirectory, 'schema.prisma'),
  }
}

function copyMigration(name, destinationDirectory) {
  cpSync(join(sourceMigrationsDirectory, name), join(destinationDirectory, name), {
    recursive: true,
  })
}

function deploy(workspace) {
  runPrisma(['migrate', 'deploy', '--schema', workspace.schemaPath], workspace.databaseUrl)
}

function assertNoDrift(workspace) {
  runPrisma(
    [
      'migrate',
      'diff',
      '--from-url',
      workspace.databaseUrl,
      '--to-schema-datamodel',
      workspace.schemaPath,
      '--exit-code',
    ],
    workspace.databaseUrl,
    dirname(workspace.schemaPath),
  )
}

function verifyFreshInstall() {
  const workspace = createWorkspace('migration-fresh')

  try {
    for (const name of migrationNames) {
      copyMigration(name, workspace.migrationsDirectory)
    }

    deploy(workspace)
    assertNoDrift(workspace)
    deploy(workspace)
    runPrisma(['migrate', 'status', '--schema', workspace.schemaPath], workspace.databaseUrl)
  } finally {
    rmSync(workspace.root, {
      force: true,
      maxRetries: 3,
      recursive: true,
      retryDelay: 100,
    })
  }
}

verifyFreshInstall()
console.log('Migration smoke checks passed.')
