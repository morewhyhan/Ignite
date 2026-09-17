import { createHash, randomBytes } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { hostname, uptime } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { databaseTestAdapter } from '../testing/database-adapter.mjs'

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

export const repositoryRoot = resolve(process.env.IGNITE_ROOT || defaultRoot)
export const plansDirectory = join(repositoryRoot, 'docs', 'plans')
export const releasesDirectory = join(plansDirectory, 'releases')
export const durableRunsDirectory = join(repositoryRoot, 'docs', 'others', 'evidence', 'runs')
export const localStateDirectory = join(repositoryRoot, '.ignite')
export const localRunsDirectory = join(localStateDirectory, 'runs')
export const generatedStatusPath = join(repositoryRoot, 'docs', 'others', 'ignite-status.md')

export function normalizePath(path) {
  return path.replaceAll('\\', '/').replace(/^\.\//, '')
}

export function relativePath(path) {
  return normalizePath(relative(repositoryRoot, path))
}

export function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function writeTextIfChanged(path, content) {
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return false
  mkdirSync(dirname(path), { recursive: true })
  const temporaryPath = `${path}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`
  writeFileSync(temporaryPath, content, 'utf8')
  renameSync(temporaryPath, path)
  return true
}

export function writeJson(path, value, { format = true } = {}) {
  const changed = writeTextIfChanged(path, `${JSON.stringify(value, null, 2)}\n`)
  if (!changed || !format) return changed

  const prettierBinary = join(
    repositoryRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prettier.cmd' : 'prettier',
  )
  if (existsSync(prettierBinary)) {
    spawnSync(prettierBinary, ['--write', path], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      windowsHide: true,
    })
  }
  return true
}

export function runGit(args, { allowFailure = false, cwd = repositoryRoot } = {}) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.error && !allowFailure) throw result.error
  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || `git ${args.join(' ')} failed`).trim())
  }
  return {
    exitCode: result.status ?? 1,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  }
}

export function gitLines(args) {
  return runGit(args, { allowFailure: true }).stdout.split(/\r?\n/).filter(Boolean)
}

export function currentCommit() {
  return runGit(['rev-parse', 'HEAD'], { allowFailure: true }).stdout
}

export function gitCommitExists(commit) {
  if (typeof commit !== 'string' || !/^[0-9a-f]{40}$/i.test(commit)) return false
  return runGit(['cat-file', '-e', `${commit}^{commit}`], { allowFailure: true }).exitCode === 0
}

export function isAncestor(ancestor, descendant = 'HEAD') {
  return (
    runGit(['merge-base', '--is-ancestor', ancestor, descendant], { allowFailure: true })
      .exitCode === 0
  )
}

export function walkFiles(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return lstatSync(path).isDirectory() ? walkFiles(path) : [path]
  })
}

export function isExecutionStatePath(inputPath) {
  const path = normalizePath(inputPath)
  return (
    path === 'next-env.d.ts' ||
    path === 'docs/others/ignite-status.md' ||
    path.startsWith('.ignite/') ||
    path.startsWith('docs/others/evidence/runs/') ||
    (path.startsWith('docs/plans/') &&
      !/(?:^|\/)(?:README\.md|_template\.[^/]+)$/.test(path) &&
      (path.endsWith('.md') || /^docs\/plans\/releases\/[^/]+\.json$/.test(path)))
  )
}

function repositoryInputFiles() {
  const paths = new Set([
    ...gitLines(['ls-files']),
    ...gitLines(['ls-files', '--others', '--exclude-standard']),
  ])
  return [...paths]
    .map(normalizePath)
    .filter((path) => !isExecutionStatePath(path))
    .filter((path) => existsSync(join(repositoryRoot, path)))
    .sort()
}

function gitBlobIdentity(content) {
  const header = Buffer.from(`blob ${content.length}\0`)
  return createHash('sha1').update(header).update(content).digest('hex')
}

function fingerprintFromEntries(plan, entries) {
  const digest = createHash('sha256')
  digest.update(JSON.stringify(stablePlanContract(plan.metadata)))
  digest.update('\0')
  for (const [path, identity] of entries.sort(([left], [right]) => left.localeCompare(right))) {
    digest.update(path)
    digest.update('\0')
    digest.update(identity)
    digest.update('\0')
  }
  return digest.digest('hex')
}

export function stablePlanContract(metadata) {
  if (!metadata) return null
  return {
    schema: metadata.schema,
    id: metadata.id,
    release: metadata.release,
    outcome: metadata.outcome,
    change_type: metadata.change_type,
    base_commit: metadata.base_commit || null,
    requirements: metadata.requirements || [],
    acceptance: metadata.acceptance || [],
    depends_on: metadata.depends_on || [],
    risk: metadata.risk || null,
    write_scope: metadata.write_scope || [],
    required_evidence: metadata.required_evidence || [],
    ...(metadata.contract_version === 2
      ? {
          contract_version: 2,
          goals: metadata.goals || [],
          constraints: metadata.constraints || [],
          non_goals: metadata.non_goals || [],
          authorization: metadata.authorization || null,
          deliverables: metadata.deliverables || [],
        }
      : {}),
  }
}

export function computeInputFingerprint(plan) {
  return fingerprintFromEntries(
    plan,
    repositoryInputFiles().map((path) => [
      path,
      gitBlobIdentity(readFileSync(join(repositoryRoot, path))),
    ]),
  )
}

export function computeInputFingerprintAtCommit(plan, commit) {
  if (!gitCommitExists(commit)) throw new Error(`invalid fingerprint commit: ${commit}`)
  const entries = runGit(['ls-tree', '-r', '--full-tree', commit])
    .stdout.split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.match(/^\d+\s+blob\s+([0-9a-f]+)\t(.+)$/))
    .filter(Boolean)
    .map((match) => [normalizePath(match[2]), match[1]])
    .filter(([path]) => !isExecutionStatePath(path))
  return fingerprintFromEntries(plan, entries)
}

function changedPathSet(baseCommit) {
  const paths = new Set()
  if (gitCommitExists(baseCommit)) {
    for (const path of gitLines(['diff', '--name-only', `${baseCommit}...HEAD`])) paths.add(path)
  }
  for (const path of gitLines(['diff', '--name-only', 'HEAD'])) paths.add(path)
  for (const path of gitLines(['diff', '--cached', '--name-only'])) paths.add(path)
  for (const path of gitLines(['ls-files', '--others', '--exclude-standard'])) paths.add(path)
  return paths
}

function ownedCommittedPaths(plan, commit = 'HEAD') {
  const paths = new Set()
  const history = gitLines([
    'log',
    '--reverse',
    '--format=%H%x09%(trailers:key=Ignite-Plan,valueonly)',
    `${plan.metadata.base_commit}..${commit}`,
  ])
  for (const entry of history) {
    const [sha, owner] = entry.split('\t', 2)
    if (owner?.trim() && owner.trim() !== plan.metadata.id) continue
    const parentCount =
      runGit(['rev-list', '--parents', '-n', '1', sha]).stdout.split(' ').length - 1
    if (parentCount > 1 && !owner?.trim()) continue
    for (const path of gitLines(['diff', '--name-only', `${sha}^`, sha])) paths.add(path)
  }
  return paths
}

export function changedFilesForPlan(plan) {
  const changed =
    plan.metadata?.contract_version === 2 && gitCommitExists(plan.metadata?.base_commit)
      ? new Set([
          ...ownedCommittedPaths(plan),
          ...gitLines(['diff', '--name-only', 'HEAD']),
          ...gitLines(['diff', '--cached', '--name-only']),
          ...gitLines(['ls-files', '--others', '--exclude-standard']),
        ])
      : changedPathSet(plan.metadata?.base_commit)
  return [...changed]
    .map(normalizePath)
    .filter((path) => !isExecutionStatePath(path))
    .sort()
}

export function changedFilesForPlanAtCommit(plan, commit) {
  if (!gitCommitExists(plan.metadata?.base_commit) || !gitCommitExists(commit)) return []
  const changed =
    plan.metadata?.contract_version === 2
      ? [...ownedCommittedPaths(plan, commit)]
      : gitLines(['diff', '--name-only', `${plan.metadata.base_commit}...${commit}`])
  return changed
    .map(normalizePath)
    .filter((path) => !isExecutionStatePath(path))
    .sort()
}

export function changedFilesSince(baseCommit) {
  if (!gitCommitExists(baseCommit)) return []
  return gitLines(['diff', '--name-only', `${baseCommit}...HEAD`])
    .map(normalizePath)
    .filter((path) => !isExecutionStatePath(path))
    .sort()
}

function pathWithinScope(path, scope) {
  const normalizedPath = normalizePath(path)
  const normalizedScope = normalizePath(scope)
  return normalizedScope.endsWith('/')
    ? normalizedPath.startsWith(normalizedScope)
    : normalizedPath === normalizedScope
}

export function validateWriteScope(plan, changedFiles) {
  if (!plan.metadata?.write_scope) return []
  return changedFiles
    .filter((path) => !plan.metadata.write_scope.some((scope) => pathWithinScope(path, scope)))
    .map((path) => `${path} is outside Plan write_scope`)
}

export function executionWorkspaceIsClean() {
  return (
    [...changedPathSet(null)].map(normalizePath).filter((path) => !isExecutionStatePath(path))
      .length === 0
  )
}

function safeCommandVersion(command, args) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  return result.status === 0 ? result.stdout.trim() : 'unavailable'
}

function currentPnpmVersion(environment) {
  const userAgentVersion = environment.npm_config_user_agent?.match(/^pnpm\/([^ ]+)/)?.[1]
  return userAgentVersion || safeCommandVersion('corepack', ['pnpm', '--version'])
}

export function environmentIdentity(environment = process.env) {
  const databaseUrl = environment.DATABASE_URL || ''
  const dynamicInputs = Object.fromEntries(
    Object.keys(environment)
      .filter((name) => name.startsWith('NEXT_PUBLIC_') || name.startsWith('PLAYWRIGHT_'))
      .sort()
      .map((name) => [name, environment[name] || '']),
  )
  const summary = {
    platform: process.platform,
    arch: process.arch,
    node: process.versions.node,
    pnpm: currentPnpmVersion(environment),
    app_env: environment.APP_ENV || 'unset',
    database_provider: databaseUrl.startsWith('file:')
      ? 'sqlite'
      : databaseUrl
        ? databaseUrl.split(':', 1)[0]
        : 'unset',
    ci: environment.CI === 'true',
  }
  const privateInputs = {
    ...summary,
    app_url: environment.APP_URL || '',
    database_url: databaseUrl,
    auth_secret: environment.BETTER_AUTH_SECRET || '',
    auth_require_email_verification: environment.AUTH_REQUIRE_EMAIL_VERIFICATION || '',
    node_env: environment.NODE_ENV || '',
    dynamic_inputs: dynamicInputs,
  }
  return { summary, fingerprint: hash(JSON.stringify(privateInputs)) }
}

export function runnerIdentity() {
  let bootSource
  try {
    bootSource = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
  } catch {
    bootSource = String(Math.round((Date.now() - uptime() * 1000) / 60_000))
  }
  return {
    host_id: hash(`${hostname()}\0${process.platform}\0${process.arch}`).slice(0, 12),
    boot_id: hash(bootSource).slice(0, 12),
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
  }
}

export function makeSafeTestEnvironment() {
  const allowedNames = new Set([
    'PATH',
    'HOME',
    'USER',
    'TMPDIR',
    'TMP',
    'TEMP',
    'SYSTEMROOT',
    'WINDIR',
    'COMSPEC',
    'PATHEXT',
    'LANG',
    'LC_ALL',
    'TZ',
    'CI',
    'NVM_BIN',
    'XDG_CACHE_HOME',
    'PLAYWRIGHT_BROWSERS_PATH',
    'PLAYWRIGHT_EXECUTABLE_PATH',
  ])
  const inherited = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) =>
        allowedNames.has(name) ||
        name.startsWith('COREPACK_') ||
        name.startsWith('PNPM_') ||
        name.startsWith('npm_config_') ||
        name.startsWith('NEXT_PUBLIC_'),
    ),
  )
  return {
    ...inherited,
    APP_ENV: 'test',
    APP_URL: 'http://127.0.0.1:3000',
    DATABASE_URL: databaseTestAdapter.isolatedUrl('./.ignite/runtime/check.db'),
    BETTER_AUTH_SECRET: 'ignite-isolated-check-secret-with-at-least-32-characters',
    AUTH_REQUIRE_EMAIL_VERIFICATION: 'false',
    IGNITE_RUNNER: 'true',
  }
}
