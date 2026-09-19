import { extname } from 'node:path'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { changedFilesForPlan, normalizePath, repositoryRoot, validateWriteScope } from './core.mjs'

const LEVEL_RANK = { dev: 1, integration: 2, release: 3 }
export const CHECK_POLICY_VERSION = 4
export const SUPPORTED_CHECK_POLICIES = new Set([1, 2, 3, 4])
const SAFE_DOC_PATTERNS = [
  /^README\.md$/,
  /^docs\/README\.md$/,
  /^docs\/assets\//,
  /^docs\/others\/README\.md$/,
]
const GOVERNANCE_PATTERNS = [
  /^AGENTS\.md$/,
  /^CLAUDE\.md$/,
  /^\.ai\//,
  /^\.claude\//,
  /^\.cursor\//,
  /^\.opencode\//,
  /^\.github\//,
  /^\.editorconfig$/,
  /^\.gitattributes$/,
  /^\.node-version$/,
  /^\.env\.example$/,
  /^(?:package\.json|pnpm-lock\.yaml|tsconfig\.json|eslint\.config\.mjs|vitest\.config\.ts|playwright\.config\.ts|postcss\.config\.mjs)$/,
  /^scripts\//,
  /^prisma\//,
  /^src\/server\/(?:api|auth|database|env)/,
  /^src\/app\/api\//,
  /^src\/lib\/api-client\.ts$/,
  /^tests\//,
  /^docs\/features\//,
  /^docs\/designs\//,
  /^docs\/standards\/(?:workflow|testing|development|security|api|database|architecture|ai-agents|adoption)\.md$/,
]

function matchesAny(path, patterns) {
  return patterns.some((pattern) => pattern.test(path))
}

/**
 * @param {string[]} files
 * @param {string | null} [risk]
 */
export function minimumLevel(files, risk = null) {
  const normalized = files.map(normalizePath)
  const fileLevel =
    normalized.length === 0
      ? 'dev'
      : normalized.some((path) => matchesAny(path, GOVERNANCE_PATTERNS))
        ? 'integration'
        : normalized.every((path) => matchesAny(path, SAFE_DOC_PATTERNS))
          ? 'dev'
          : 'integration'
  return risk && risk !== 'docs' ? 'integration' : fileLevel
}

/**
 * @param {string | undefined} requested
 * @param {string[]} files
 * @param {string | null} [risk]
 */
export function resolveLevel(requested, files, risk = null) {
  const minimum = minimumLevel(files, risk)
  const level = !requested || requested === 'auto' ? minimum : requested
  if (!(level in LEVEL_RANK)) throw new Error(`unknown check level: ${level}`)
  if (LEVEL_RANK[level] < LEVEL_RANK[minimum]) {
    throw new Error(`cannot lower check level from ${minimum} to ${level}`)
  }
  return { level, minimum }
}

function changedDocs(files) {
  return files.some(
    (path) =>
      path === 'AGENTS.md' ||
      path === 'README.md' ||
      path.startsWith('docs/') ||
      path === 'CLAUDE.md' ||
      path.startsWith('.ai/') ||
      path.startsWith('.cursor/') ||
      path.startsWith('.opencode/'),
  )
}

function needsMigrationCheck(files, policyVersion) {
  return files.some(
    (path) =>
      path.startsWith('prisma/') ||
      path.startsWith('src/server/auth/') ||
      path === 'package.json' ||
      (policyVersion >= 4 &&
        [
          'scripts/test-migrations.mjs',
          'scripts/testing/database-adapter.mjs',
          'scripts/testing/migration-probe.mjs',
        ].includes(path)),
  )
}

function targetedTests(files) {
  const tests = new Set()
  let unknownCode = false
  for (const path of files) {
    const moduleName = path.match(/^src\/(?:modules|server\/api\/routes)\/([^/]+)\//)?.[1]
    if (moduleName) {
      const candidates = [
        `tests/api/${moduleName}.test.ts`,
        `tests/contracts/${moduleName}.test.ts`,
        `tests/contracts/${moduleName}.test.tsx`,
      ]
      const found = candidates.filter((candidate) => existsSync(join(repositoryRoot, candidate)))
      if (found.length === 0) unknownCode = true
      for (const candidate of found) tests.add(candidate)
      continue
    }
    if (path.startsWith('scripts/ignite') || path.includes('ignite-cli')) {
      tests.add('tests/contracts/ignite-cli.test.ts')
      tests.add('tests/contracts/ignite-checks.test.ts')
      tests.add('tests/contracts/ignite-runs.test.ts')
      continue
    }
    if (path === 'scripts/runtime-doctor.mjs' || path === '.ai/runtime.json') {
      tests.add('tests/contracts/template-runtime.test.ts')
      continue
    }
    if (
      path === 'scripts/check-docs.mjs' ||
      path.startsWith('docs/features/') ||
      path.startsWith('docs/designs/')
    ) {
      tests.add('tests/contracts/docs-traceability.test.ts')
      tests.add('tests/contracts/api-design.test.ts')
      continue
    }
    if (/^tests\/(?:api|contracts)\/.+\.test\.tsx?$/.test(path)) {
      tests.add(path)
      continue
    }
    if (path.startsWith('src/server/env') || path === '.env.example') {
      tests.add('tests/contracts/server-env.test.ts')
      continue
    }
    if (path.startsWith('src/server/auth/') || path === 'prisma/schema.prisma') {
      tests.add('tests/contracts/auth-schema.test.ts')
      continue
    }
    if (['.md', '.json', '.yaml', '.yml', '.puml', '.svg'].includes(extname(path))) continue
    unknownCode = true
  }
  return unknownCode || tests.size === 0 ? [] : [...tests].sort()
}

function command(command, args, label) {
  return { command, args, label }
}

function pnpm(args, label) {
  return command('corepack', ['pnpm', ...args], label)
}

export function commandsForLevel(level, files, plan, policyVersion = CHECK_POLICY_VERSION) {
  if (!SUPPORTED_CHECK_POLICIES.has(policyVersion))
    throw new Error(`unknown check policy: ${policyVersion}`)
  const commands = [
    command('node', ['scripts/check-diff.mjs', '--base', plan.metadata.base_commit], 'git-diff'),
  ]
  if (level === 'dev') {
    if (changedDocs(files)) commands.push(pnpm(['docs:check'], 'docs'))
    const formatTargets = files.filter((path) =>
      ['.md', '.json', '.yaml', '.yml'].includes(extname(path)),
    )
    if (formatTargets.length) {
      commands.push(pnpm(['exec', 'prettier', '--check', ...formatTargets], 'format'))
    }
    return commands
  }
  if (level === 'integration') {
    commands.push(pnpm(['template:doctor'], 'template-doctor'))
    commands.push(pnpm(['ignite', 'validate'], 'governance'))
    commands.push(pnpm(['docs:check'], 'docs'))
    commands.push(pnpm(['typecheck'], 'typecheck'))
    commands.push(pnpm(['lint'], 'lint'))
    commands.push(pnpm(['format:check'], 'format'))
    const selectedTests = targetedTests(files)
    const mappedTests = (plan.metadata.acceptance || [])
      .flatMap((item) => item.tests || [])
      .map((path) => path.split('::', 1)[0])
      .filter((path) => /\.test\.tsx?$/.test(path))
    // Policy 1 is retained for receipts published before Plan-mapped test selection.
    const tests =
      policyVersion === 1
        ? selectedTests
        : selectedTests.length
          ? [...new Set([...selectedTests, ...mappedTests])].sort()
          : []
    commands.push(
      tests.length
        ? pnpm(['exec', 'vitest', 'run', ...tests], 'targeted-tests')
        : pnpm(['test'], 'tests'),
    )
    if (needsMigrationCheck(files, policyVersion)) {
      commands.push(pnpm(['test:migrations'], 'migrations'))
    }
    return commands
  }
  if (policyVersion < 3) commands.push(pnpm(['verify'], 'verify'))
  else commands.push(pnpm(['build'], 'build'))
  commands.push(pnpm(['test:e2e:production'], 'e2e-production'))
  return commands
}

/**
 * @param {{
 *   plan: any,
 *   requestedLevel?: string,
 *   explicitFiles?: string[] | null,
 *   dryRun?: boolean
 * }} options
 */
export function planCheck({ plan, requestedLevel = 'auto', explicitFiles = null, dryRun = false }) {
  if (!['active', 'verifying'].includes(plan.metadata.status)) {
    throw new Error(
      `checks require an active or verifying Plan; current status is ${plan.metadata.status}`,
    )
  }
  if (requestedLevel === 'release' && plan.metadata.status !== 'verifying') {
    throw new Error('release checks require Plan status verifying')
  }
  if (explicitFiles && !dryRun) {
    throw new Error(
      '--files is only available with --dry-run; real checks always inspect the Plan diff',
    )
  }
  const files = explicitFiles || changedFilesForPlan(plan)
  const scopeErrors = explicitFiles ? [] : validateWriteScope(plan, files)
  if (scopeErrors.length) throw new Error(`Plan scope violation:\n- ${scopeErrors.join('\n- ')}`)
  if (plan.metadata.risk === 'docs' && minimumLevel(files) !== 'dev') {
    throw new Error(
      'Plan risk docs understates the actual changes; update risk and required_evidence',
    )
  }
  const { level, minimum } = resolveLevel(requestedLevel, files, plan.metadata.risk)
  return { level, minimum, changedFiles: files, commands: commandsForLevel(level, files, plan) }
}
