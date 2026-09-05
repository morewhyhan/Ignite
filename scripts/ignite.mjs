#!/usr/bin/env node

/**
 * Small, dependency-free execution CLI for the Ignite template.
 *
 * The CLI deliberately stores machine state next to the five existing document
 * layers. Markdown remains the human-readable plan; the JSON block at the top
 * is its single machine-readable state source.
 */
import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const plansDirectory = join(repositoryRoot, 'docs', 'plans')
const releasesDirectory = join(plansDirectory, 'releases')
const runsDirectory = join(repositoryRoot, 'docs', 'others', 'evidence', 'runs')
const generatedStatusPath = join(repositoryRoot, 'docs', 'others', 'ignite-status.md')

const PLAN_MARKER = '<!-- ignite-plan'
const PLAN_END_MARKER = '-->'
const PLAN_STATUSES = new Set([
  'draft',
  'ready',
  'active',
  'verifying',
  'done',
  'blocked',
  'cancelled',
  'superseded',
  'legacy_unverified',
])
const CHANGE_TYPES = new Set(['新增模块', '存量改动', '基础设施变更'])

function die(message, code = 1) {
  console.error(`Ignite: ${message}`)
  process.exitCode = code
}

function parseArgs(argv) {
  const options = {}
  const positionals = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '--') {
      continue
    }
    if (token.startsWith('--')) {
      const [key, inlineValue] = token.slice(2).split('=', 2)
      if (inlineValue !== undefined) options[key] = inlineValue
      else if (argv[index + 1] && !argv[index + 1].startsWith('--')) options[key] = argv[++index]
      else options[key] = true
      continue
    }
    positionals.push(token)
  }

  return { options, positionals }
}

function runGit(args, allowFailure = false) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.error && !allowFailure) throw result.error
  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || `git ${args.join(' ')} failed`).trim())
  }
  return (result.stdout || '').trim()
}

function runCommand(command, args = []) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  }
}

function safeCommandVersion(command, args) {
  const result = runCommand(command, args)
  return result.exitCode === 0 ? result.stdout.trim() : 'unavailable'
}

function now() {
  return new Date().toISOString()
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  const prettierBinary = join(
    repositoryRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prettier.cmd' : 'prettier',
  )
  if (existsSync(prettierBinary)) runCommand(prettierBinary, ['--write', path])
}

function extractPlanMetadata(content) {
  const markerIndex = content.indexOf(PLAN_MARKER)
  if (markerIndex < 0) return null
  const bodyStart = markerIndex + PLAN_MARKER.length
  const endIndex = content.indexOf(PLAN_END_MARKER, bodyStart)
  if (endIndex < 0) throw new Error('plan metadata block is not closed with -->')
  const json = content.slice(bodyStart, endIndex).trim()
  try {
    return { value: JSON.parse(json), start: markerIndex, end: endIndex + PLAN_END_MARKER.length }
  } catch (error) {
    throw new Error(`invalid plan metadata JSON: ${error.message}`)
  }
}

function readPlan(path) {
  const absolutePath = resolve(repositoryRoot, path)
  const content = readFileSync(absolutePath, 'utf8')
  const metadata = extractPlanMetadata(content)
  return {
    path: absolutePath,
    relativePath: relative(repositoryRoot, absolutePath).replaceAll('\\', '/'),
    content,
    metadata: metadata?.value ?? null,
    metadataRange: metadata ? { start: metadata.start, end: metadata.end } : null,
  }
}

function listPlanFiles() {
  if (!existsSync(plansDirectory)) return []
  return readdirSync(plansDirectory)
    .filter((name) => name.endsWith('.md') && !['_template.md', 'README.md'].includes(name))
    .map((name) => join(plansDirectory, name))
}

function listPlans() {
  return listPlanFiles().map(readPlan)
}

function listReleaseFiles() {
  if (!existsSync(releasesDirectory)) return []
  return readdirSync(releasesDirectory)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
    .map((name) => join(releasesDirectory, name))
}

function listRuns() {
  if (!existsSync(runsDirectory)) return []
  return readdirSync(runsDirectory)
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(runsDirectory, name))
    .map((path) => ({ path, value: readJson(path) }))
}

function findPlan(identifier) {
  const plans = listPlans()
  const match = plans.find(
    (plan) => plan.relativePath === identifier || plan.metadata?.id === identifier,
  )
  if (match) return match
  const candidate = resolve(identifier)
  if (existsSync(candidate) && extname(candidate) === '.md') return readPlan(candidate)
  throw new Error(`structured plan not found: ${identifier}`)
}

function validatePlan(plan, { allowLegacy = true } = {}) {
  if (!plan.metadata) {
    if (allowLegacy) return ['legacy plan without structured metadata']
    return ['missing structured metadata block']
  }

  const value = plan.metadata
  const failures = []
  if (value.schema !== 1) failures.push('schema must be 1')
  if (typeof value.id !== 'string' || !/^IGT-\d{3,}$/.test(value.id)) {
    failures.push('id must match IGT-000')
  }
  if (typeof value.release !== 'string' || !value.release) failures.push('release is required')
  if (!PLAN_STATUSES.has(value.status)) failures.push(`unknown status: ${value.status}`)
  if (typeof value.outcome !== 'string' || !value.outcome.trim())
    failures.push('outcome is required')
  if (!CHANGE_TYPES.has(value.change_type)) failures.push('change_type is invalid')
  if (
    !Array.isArray(value.requirements) ||
    value.requirements.some((item) => !/^REQ-[A-Z0-9-]+$/.test(item))
  ) {
    failures.push('requirements must contain stable REQ-* IDs')
  }
  if (!Array.isArray(value.write_scope) || value.write_scope.length === 0) {
    failures.push('write_scope must contain at least one path')
  }
  if (!Array.isArray(value.required_evidence)) failures.push('required_evidence must be an array')
  if (!Array.isArray(value.evidence)) failures.push('evidence must be an array')
  const runRecords = new Map(listRuns().map((run) => [run.value.run_id, run.value]))
  for (const evidence of value.evidence || []) {
    if (typeof evidence.id !== 'string' || typeof evidence.status !== 'string') {
      failures.push('each evidence item requires id and status')
      continue
    }
    if (evidence.run_id) {
      const run = runRecords.get(evidence.run_id)
      if (!run) failures.push(`evidence ${evidence.id} references missing run ${evidence.run_id}`)
      else {
        if (run.plan_id !== value.id)
          failures.push(`evidence ${evidence.id} references another Plan`)
        if (evidence.status === 'passed' && run.status !== 'passed') {
          failures.push(
            `evidence ${evidence.id} is passed but run ${evidence.run_id} is ${run.status}`,
          )
        }
      }
    }
  }
  if (value.status === 'blocked') {
    const blocker = value.blocker
    for (const field of ['id', 'owner', 'reason', 'resume_action']) {
      if (!blocker || typeof blocker[field] !== 'string' || !blocker[field].trim()) {
        failures.push(`blocked plans require blocker.${field}`)
      }
    }
  }
  if (value.status === 'ready' && value.open_questions?.length) {
    failures.push('ready plans cannot contain open_questions')
  }
  if (value.status === 'done') {
    const evidence = Array.isArray(value.evidence) ? value.evidence : []
    const passed = new Set(
      evidence.filter((item) => item.status === 'passed').map((item) => item.id),
    )
    for (const required of value.required_evidence || []) {
      if (!passed.has(required)) failures.push(`done plan is missing passed evidence: ${required}`)
    }
    if (value.integrated_commit === null || typeof value.integrated_commit !== 'string') {
      failures.push('done plans require integrated_commit')
    }
  }
  return failures
}

function changedFiles() {
  const tracked = runGit(['diff', '--name-only', 'HEAD'], true)
  const staged = runGit(['diff', '--cached', '--name-only'], true)
  const untracked = runGit(['ls-files', '--others', '--exclude-standard'], true)
  return [...new Set(`${tracked}\n${staged}\n${untracked}`.split(/\r?\n/).filter(Boolean))]
}

function contentFingerprint() {
  const hash = createHash('sha256')
  hash.update(runGit(['rev-parse', 'HEAD'], true))
  hash.update('\0')
  hash.update(
    runGit(
      [
        'diff',
        '--no-ext-diff',
        'HEAD',
        '--',
        ':(exclude)docs/others/evidence/runs/**',
        ':(exclude)docs/others/ignite-status.md',
      ],
      true,
    ),
  )
  hash.update('\0')
  for (const path of runGit(['ls-files', '--others', '--exclude-standard'], true)
    .split(/\r?\n/)
    .filter(
      (path) =>
        Boolean(path) &&
        !path.startsWith('docs/others/evidence/runs/') &&
        path !== 'docs/others/ignite-status.md',
    )
    .sort()) {
    const absolutePath = join(repositoryRoot, path)
    if (existsSync(absolutePath)) hash.update(path).update(readFileSync(absolutePath))
  }
  return hash.digest('hex')
}

function environmentFingerprint(environment = process.env) {
  const databaseUrl = environment.DATABASE_URL || ''
  const provider = databaseUrl.startsWith('file:') ? 'sqlite' : databaseUrl ? 'remote' : 'unset'
  return {
    node: process.version,
    pnpm: safeCommandVersion('pnpm', ['--version']),
    app_env: environment.APP_ENV || 'unset',
    database_provider: provider,
    platform: process.platform,
  }
}

function validateAllPlans() {
  const failures = []
  const ids = new Map()
  for (const plan of listPlans()) {
    const errors = validatePlan(plan)
    if (plan.metadata) {
      if (ids.has(plan.metadata.id))
        failures.push(`${plan.relativePath}: duplicate id ${plan.metadata.id}`)
      ids.set(plan.metadata.id, plan.relativePath)
    }
    for (const error of errors.filter(
      (item) => item !== 'legacy plan without structured metadata',
    )) {
      failures.push(`${plan.relativePath}: ${error}`)
    }
  }
  return failures
}

function markdownTable(headers, rows, rightColumns = []) {
  const widths = headers.map((header, index) =>
    Math.max(String(header).length, ...rows.map((row) => String(row[index] ?? '').length)),
  )
  const renderRow = (row) =>
    `| ${row
      .map((cell, index) => {
        const value = String(cell ?? '')
        return rightColumns.includes(index)
          ? value.padStart(widths[index])
          : value.padEnd(widths[index])
      })
      .join(' | ')} |`
  const separator = widths.map(
    (width, index) =>
      `${'-'.repeat(Math.max(width, 3) - 1)}${rightColumns.includes(index) ? ':' : '-'}`,
  )
  return [renderRow(headers), renderRow(separator), ...rows.map(renderRow)]
}

function renderStatus() {
  const plans = listPlans()
  const structured = plans.filter((plan) => plan.metadata)
  const legacyCount = plans.length - structured.length
  const releases = listReleaseFiles().map((path) => readJson(path))
  const counts = Object.fromEntries([...PLAN_STATUSES].map((status) => [status, 0]))
  for (const plan of structured) counts[plan.metadata.status] += 1

  const lines = [
    '# Ignite 状态摘要',
    '',
    `生成时间：${now()}`,
    `结构化 Plan：${structured.length}；历史未迁移 Plan：${legacyCount}`,
    '',
    ...markdownTable(
      ['状态', '数量'],
      Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => [status, count]),
      [1],
    ),
    '',
    '## 当前 Plan',
    '',
    ...markdownTable(
      ['ID', '状态', '交付结果', '发布'],
      structured.length
        ? structured.map((plan) => [
            plan.metadata.id,
            plan.metadata.status,
            plan.metadata.outcome,
            plan.metadata.release,
          ])
        : [['—', '—', '暂无结构化 Plan', '—']],
    ),
    '',
    '## 发布范围',
    '',
    ...markdownTable(
      ['发布', '状态', '纳入 Plan'],
      releases.length
        ? releases.map((release) => [
            release.id,
            release.status,
            (release.plan_ids || []).join(', ') || '—',
          ])
        : [['—', '—', '—']],
    ),
    '',
    '> 此文件由 `pnpm ignite status --write` 生成。不要手工修改状态表；请修改 Plan 元数据。',
    '',
  ]
  return lines.join('\n')
}

function writeGeneratedStatus() {
  writeFileSync(generatedStatusPath, renderStatus(), 'utf8')
  const prettierBinary = join(
    repositoryRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prettier.cmd' : 'prettier',
  )
  if (existsSync(prettierBinary)) runCommand(prettierBinary, ['--write', generatedStatusPath])
}

function updatePlanMetadata(plan, updater) {
  if (!plan.metadataRange) throw new Error(`${plan.relativePath} has no structured metadata`)
  const next = updater(structuredClone(plan.metadata))
  const errors = validatePlan({ ...plan, metadata: next }, { allowLegacy: false })
  if (errors.length) throw new Error(`metadata would be invalid:\n- ${errors.join('\n- ')}`)
  const before = plan.content.slice(0, plan.metadataRange.start)
  const after = plan.content.slice(plan.metadataRange.end)
  writeFileSync(
    plan.path,
    `${before}${PLAN_MARKER}\n${JSON.stringify(next, null, 2)}\n${PLAN_END_MARKER}${after}`,
    'utf8',
  )
}

function resolvePlanPath(identifier) {
  return findPlan(identifier).path
}

function processIsAlive(pid) {
  if (!pid || !Number.isInteger(pid)) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function refreshRun(run) {
  if (run.value.status === 'running' && !processIsAlive(run.value.pid)) {
    run.value.status = 'orphaned'
    run.value.needs_retry = true
    run.value.ended_at = now()
    writeJson(run.path, run.value)
  }
  return run.value
}

function startRecordedRun({ plan, evidenceType, command, args, force = false }) {
  mkdirSync(runsDirectory, { recursive: true })
  const fingerprint = createHash('sha256')
    .update(
      JSON.stringify({
        plan: plan.metadata.id,
        evidenceType,
        command,
        args,
        input: contentFingerprint(),
      }),
    )
    .digest('hex')

  for (const existing of listRuns()) {
    const value = refreshRun(existing)
    if (value.fingerprint !== fingerprint) continue
    if (value.status === 'running') {
      console.log(`reusing active run ${value.run_id} (pid ${value.pid})`)
      return { reused: true, exitCode: 2, value }
    }
    if (value.status === 'passed' && !force) {
      console.log(`reusing passed run ${value.run_id} for unchanged input`)
      return { reused: true, exitCode: 0, value }
    }
  }

  const runId = `run-${new Date()
    .toISOString()
    .replaceAll(/[-:.TZ]/g, '')
    .slice(0, 14)}-${randomBytes(3).toString('hex')}`
  const logPath = join(runsDirectory, `${runId}.log`)
  const recordPath = join(runsDirectory, `${runId}.json`)
  const record = {
    schema: 1,
    run_id: runId,
    plan_id: plan.metadata.id,
    evidence_type: evidenceType,
    status: 'running',
    command: [command, ...args],
    cwd: repositoryRoot,
    started_at: now(),
    ended_at: null,
    pid: null,
    exit_code: null,
    commit: runGit(['rev-parse', 'HEAD'], true),
    input_fingerprint: contentFingerprint(),
    fingerprint,
    environment: null,
    log_path: relative(repositoryRoot, logPath).replaceAll('\\', '/'),
    needs_retry: false,
  }
  const childEnvironment = {
    ...process.env,
    ...(process.env.APP_ENV
      ? {}
      : {
          APP_ENV: 'test',
          APP_URL: 'http://localhost:3000',
          DATABASE_URL: 'file:./ignite-check.db',
          BETTER_AUTH_SECRET: 'ignite-check-secret-with-at-least-32-characters',
        }),
  }
  record.environment = environmentFingerprint(childEnvironment)
  writeJson(recordPath, record)

  const child = spawn(command, args, {
    cwd: repositoryRoot,
    env: childEnvironment,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  record.pid = child.pid
  writeJson(recordPath, record)

  const chunks = []
  const logStream = []
  child.stdout.on('data', (chunk) => {
    const text = chunk.toString()
    logStream.push(text)
    chunks.push(text)
    process.stdout.write(text)
  })
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString()
    logStream.push(text)
    chunks.push(text)
    process.stderr.write(text)
  })

  return new Promise((resolveResult) => {
    child.on('close', (exitCode, signal) => {
      writeFileSync(logPath, logStream.join(''), 'utf8')
      record.ended_at = now()
      record.exit_code = exitCode
      record.signal = signal
      record.status = exitCode === 0 ? 'passed' : 'failed'
      record.needs_retry = exitCode !== 0
      record.output_tail = chunks.join('').slice(-4000)
      writeJson(recordPath, record)
      resolveResult({ reused: false, exitCode: exitCode ?? 1, value: record })
    })
  })
}

function commandForLevel(level, files) {
  const normalized = files.map((file) => file.replaceAll('\\', '/'))
  if (level === 'dev') {
    const docs = normalized.filter((file) => file.endsWith('.md'))
    if (docs.length && docs.length === normalized.length) {
      return [
        ['pnpm', ['docs:check']],
        ['pnpm', ['exec', 'prettier', '--check', ...docs]],
      ]
    }
    return [
      [
        'pnpm',
        [
          'exec',
          'eslint',
          ...normalized.filter((file) => file.endsWith('.ts') || file.endsWith('.tsx')),
        ],
      ],
    ]
  }
  if (level === 'integration') {
    const commands = [
      ['pnpm', ['typecheck']],
      ['pnpm', ['lint']],
      ['pnpm', ['test']],
    ]
    if (
      normalized.some((file) => file.startsWith('prisma/') || file.startsWith('src/server/auth/'))
    ) {
      commands.push(['pnpm', ['test:migrations']])
    }
    return commands
  }
  if (level === 'release') {
    return [
      ['pnpm', ['verify']],
      ['pnpm', ['test:e2e']],
    ]
  }
  throw new Error(`unknown check level: ${level}`)
}

function autoLevel(files) {
  if (files.length === 0) return 'dev'
  const normalized = files.map((file) => file.replaceAll('\\', '/'))
  if (normalized.every((file) => file.endsWith('.md'))) return 'dev'
  if (
    normalized.some((file) =>
      /(^|\/)(package\.json|pnpm-lock\.yaml|prisma\/|\.github\/|scripts\/)/.test(file),
    )
  ) {
    return 'integration'
  }
  if (normalized.some((file) => /(^|\/)(src\/server|src\/app\/api|tests\/e2e)/.test(file))) {
    return 'integration'
  }
  return 'dev'
}

async function commandCheck(options) {
  const planId = options.plan
  if (!planId) throw new Error('check requires --plan IGT-000')
  const plan = findPlan(planId)
  const files = options.files
    ? String(options.files)
        .split(',')
        .map((file) => file.trim())
        .filter(Boolean)
    : changedFiles()
  const level = options.level === 'auto' || !options.level ? autoLevel(files) : options.level
  const commands = commandForLevel(level, files)
  console.log(
    JSON.stringify(
      { level, changed_files: files, commands: commands.map(([cmd, args]) => [cmd, ...args]) },
      null,
      2,
    ),
  )
  if (options['dry-run']) return

  const results = []
  for (const [command, args] of commands) {
    const result = await startRecordedRun({
      plan,
      evidenceType: `check-${level}`,
      command,
      args,
      force: options.force,
    })
    results.push(result)
  }
  if (results.some((result) => result.exitCode !== 0 && result.exitCode !== 2)) process.exitCode = 1
}

function commandPlanValidate(positionals) {
  const targets = positionals.length ? positionals.map(resolvePlanPath) : listPlanFiles()
  const failures = []
  for (const path of targets) {
    const plan = readPlan(path)
    const errors = validatePlan(plan, { allowLegacy: false })
    for (const error of errors) failures.push(`${plan.relativePath}: ${error}`)
  }
  if (failures.length) {
    die(failures.join('\n- '))
    return
  }
  console.log(`Validated ${targets.length} structured plan(s).`)
}

function commandPlanSetStatus(positionals, options) {
  if (positionals.length < 2) throw new Error('plan set-status requires <plan-id> <status>')
  const plan = findPlan(positionals[0])
  const status = positionals[1]
  if (!PLAN_STATUSES.has(status)) throw new Error(`unknown status: ${status}`)
  updatePlanMetadata(plan, (metadata) => {
    metadata.status = status
    metadata.updated_at = now().slice(0, 10)
    if (status === 'blocked') {
      const blocker = String(options.blocker || '').split('|')
      metadata.blocker = {
        id: blocker[0] || 'BLOCKER-UNSPECIFIED',
        owner: blocker[1] || '待确认责任方',
        reason: blocker[2] || '待补充阻塞原因',
        resume_action: blocker[3] || '补齐阻塞项后重新运行对应检查',
      }
    } else {
      metadata.blocker = null
    }
    return metadata
  })
  writeGeneratedStatus()
  console.log(`Updated ${plan.metadata.id} to ${status}.`)
}

function commandStatus(options) {
  const failures = validateAllPlans()
  const summary = renderStatus()
  if (options.write) {
    writeGeneratedStatus()
    console.log(`Wrote ${relative(repositoryRoot, generatedStatusPath).replaceAll('\\', '/')}`)
  } else if (options.json) {
    const plans = listPlans().filter((plan) => plan.metadata)
    console.log(JSON.stringify({ plans: plans.map((plan) => plan.metadata), failures }, null, 2))
  } else {
    process.stdout.write(summary)
  }
  if (failures.length) process.exitCode = 1
}

function commandRunStatus(positionals) {
  const runs = listRuns().map((run) => refreshRun(run))
  const selected = positionals[0] ? runs.filter((run) => run.run_id === positionals[0]) : runs
  if (positionals[0] && selected.length === 0) throw new Error(`run not found: ${positionals[0]}`)
  console.log(JSON.stringify(selected, null, 2))
}

async function main() {
  const raw = process.argv.slice(2)
  const command = raw[0]
  const hasSubcommand = command === 'plan' || command === 'run'
  const subcommand = hasSubcommand ? raw[1] : undefined
  const { options, positionals } = parseArgs(raw.slice(hasSubcommand ? 2 : 1))

  if (command === 'plan' && subcommand === 'validate') return commandPlanValidate(positionals)
  if (command === 'plan' && subcommand === 'set-status')
    return commandPlanSetStatus(positionals, options)
  if (command === 'status') return commandStatus(options)
  if (command === 'run' && subcommand === 'status') return commandRunStatus(positionals)
  if (command === 'check') return commandCheck(options)
  throw new Error(
    'commands: status [--write|--json], plan validate [path], plan set-status <id> <status>, check --plan <id> [--level auto|dev|integration|release] [--dry-run], run status [run-id]',
  )
}

main().catch((error) => die(error.stack || error.message))
