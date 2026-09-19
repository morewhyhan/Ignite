import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import {
  changedFilesForPlan,
  changedFilesForPlanAtCommit,
  computeInputFingerprint,
  computeInputFingerprintAtCommit,
  currentCommit,
  durableRunsDirectory,
  executionWorkspaceIsClean,
  generatedStatusPath,
  gitCommitExists,
  hash,
  isAncestor,
  localRunsDirectory,
  normalizePath,
  plansDirectory,
  readJson,
  relativePath,
  releasesDirectory,
  repositoryRoot,
  runGit,
  stablePlanContract,
  walkFiles,
  writeTextIfChanged,
} from './core.mjs'
import { CHECK_POLICY_VERSION, SUPPORTED_CHECK_POLICIES, commandsForLevel } from './checks.mjs'
import { acceptanceTestTitles } from './source-analysis.mjs'
export { acceptanceTestTitles } from './source-analysis.mjs'

const PLAN_MARKER = '<!-- ignite-plan'
const PLAN_END_MARKER = '-->'
const CURRENT_STATUSES = new Set([
  'draft',
  'ready',
  'active',
  'verifying',
  'done',
  'blocked',
  'cancelled',
  'superseded',
])
const ALL_STATUSES = new Set([...CURRENT_STATUSES, 'legacy_unverified'])
const CURRENT_CHANGE_TYPES = new Set(['新增模块', '存量改动'])
const LEGACY_CHANGE_TYPES = new Set([...CURRENT_CHANGE_TYPES, '基础设施变更'])
const RISKS = new Set([
  'docs',
  'feature',
  'ui',
  'api',
  'auth',
  'database',
  'security',
  'infrastructure',
])
const TRANSITIONS = {
  draft: new Set(['ready', 'cancelled', 'superseded']),
  ready: new Set(['active', 'blocked', 'cancelled', 'superseded']),
  active: new Set(['verifying', 'blocked', 'cancelled', 'superseded']),
  verifying: new Set(['active', 'done', 'blocked', 'cancelled', 'superseded']),
  blocked: new Set(['active', 'cancelled', 'superseded']),
  done: new Set([]),
  cancelled: new Set([]),
  superseded: new Set([]),
}

const EVIDENCE_IDS = new Set(['check-dev', 'check-integration', 'check-release'])
const TEST_PATH_PATTERN = /^tests\/(?:api|contracts)\/.+\.test\.tsx?$|^tests\/e2e\/.+\.spec\.tsx?$/

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
}

function isValidTimestamp(value) {
  if (typeof value !== 'string') return false
  const parsed = new Date(value)
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString() === value
}

export function extractPlanMetadata(content) {
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

export function readPlan(path) {
  const absolutePath = resolve(repositoryRoot, path)
  const content = readFileSync(absolutePath, 'utf8')
  const metadata = extractPlanMetadata(content)
  return {
    path: absolutePath,
    relativePath: relativePath(absolutePath),
    content,
    metadata: metadata?.value ?? null,
    metadataRange: metadata ? { start: metadata.start, end: metadata.end } : null,
  }
}

export function planContractAtCommit(plan, commit = 'HEAD') {
  const result = runGit(['show', `${commit}:${plan.relativePath}`], { allowFailure: true })
  if (result.exitCode !== 0) return false
  try {
    const committed = extractPlanMetadata(result.stdout)?.value
    return (
      JSON.stringify(stablePlanContract(committed)) ===
      JSON.stringify(stablePlanContract(plan.metadata))
    )
  } catch {
    return false
  }
}

export function listPlanFiles() {
  return walkFiles(plansDirectory)
    .filter((path) => extname(path) === '.md')
    .filter((path) => !['_template.md', 'README.md'].includes(path.split(/[\\/]/).at(-1)))
    .filter((path) => !normalizePath(path).includes('/releases/'))
    .sort()
}

export function listPlans() {
  return listPlanFiles().map(readPlan)
}

export function listReleaseFiles() {
  if (!existsSync(releasesDirectory)) return []
  return readdirSync(releasesDirectory)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
    .map((name) => join(releasesDirectory, name))
    .sort()
}

export function listReleases() {
  return listReleaseFiles().map((path) => ({ path, value: readJson(path) }))
}

export function listDurableRuns() {
  if (!existsSync(durableRunsDirectory)) return []
  return readdirSync(durableRunsDirectory)
    .filter((name) => name.endsWith('.json'))
    .map((name) => join(durableRunsDirectory, name))
    .map((path) => ({ path, value: readJson(path) }))
}

export function findPlan(identifier) {
  const match = listPlans().find(
    (plan) => plan.relativePath === normalizePath(identifier) || plan.metadata?.id === identifier,
  )
  if (match) return match
  const candidate = resolve(repositoryRoot, identifier)
  if (existsSync(candidate) && extname(candidate) === '.md') return readPlan(candidate)
  throw new Error(`structured plan not found: ${identifier}`)
}

function readRepositoryText(path, commit = null) {
  if (commit) {
    const result = runGit(['show', `${commit}:${path}`], { allowFailure: true })
    return result.exitCode === 0 ? result.stdout : null
  }
  const absolutePath = join(repositoryRoot, path)
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : null
}

export function specificationRegistry(commit = null) {
  const featureRoot = join(repositoryRoot, 'docs', 'features')
  const requirements = new Map()
  const acceptance = new Map()
  const duplicates = []

  const featurePaths = commit
    ? runGit(['ls-tree', '-r', '--name-only', commit, '--', 'docs/features/'])
        .stdout.split(/\r?\n/)
        .filter(Boolean)
    : walkFiles(featureRoot).map(relativePath)
  for (const path of featurePaths.filter(
    (file) => file.endsWith('.md') && !/[/\\](?:README|_template)\.md$/.test(file),
  )) {
    const content = readRepositoryText(path, commit)
    if (content === null) continue
    for (const match of content.matchAll(/^- R\d+（(REQ-[A-Z0-9-]+)）：/gm)) {
      if (requirements.has(match[1])) duplicates.push(match[1])
      requirements.set(match[1], path)
    }
    for (const match of content.matchAll(
      /^- (AC-[A-Z0-9-]+)(?:（([^）]+)）)?：Given .+When .+Then /gm,
    )) {
      if (acceptance.has(match[1])) duplicates.push(match[1])
      acceptance.set(match[1], {
        path,
        requirements: [...new Set((match[2] || '').match(/REQ-[A-Z0-9-]+/g) || [])],
      })
    }
  }
  return { requirements, acceptance, duplicates }
}

export function templateMode() {
  const identityPath = join(repositoryRoot, '.ai', 'project.json')
  if (existsSync(identityPath)) {
    try {
      const identity = readJson(identityPath)
      return identity.schema === 1 && ['template-baseline', 'adopted'].includes(identity.mode)
        ? identity.mode
        : 'unknown'
    } catch {
      return 'unknown'
    }
  }
  // Historical fixtures and repositories may still use the original prose marker.
  const productPath = join(repositoryRoot, 'docs', 'features', 'product.md')
  if (!existsSync(productPath)) return 'unknown'
  return (
    readFileSync(productPath, 'utf8').match(/^- 状态：`(template-baseline|adopted)`$/m)?.[1] ||
    'unknown'
  )
}

function validateLegacyPlan(plan) {
  const value = plan.metadata
  const failures = []
  if (value.schema !== 1) failures.push('schema must be 1 or 2')
  if (typeof value.id !== 'string' || !/^IGT-\d{3,}$/.test(value.id)) {
    failures.push('id must match IGT-000')
  }
  if (!ALL_STATUSES.has(value.status)) failures.push(`unknown status: ${value.status}`)
  if (!LEGACY_CHANGE_TYPES.has(value.change_type)) failures.push('change_type is invalid')
  if (!Array.isArray(value.requirements)) failures.push('requirements must be an array')
  if (!Array.isArray(value.evidence)) failures.push('evidence must be an array')
  if (value.status === 'done' && !value.integrated_commit) {
    failures.push('done plans require integrated_commit')
  }
  return failures
}

export function validatePlan(plan, { allowLegacy = true, requireCurrentEvidence = false } = {}) {
  if (!plan.metadata) {
    return allowLegacy ? ['legacy plan without structured metadata'] : ['missing metadata block']
  }
  if (plan.metadata.schema === 1) return validateLegacyPlan(plan)

  const value = plan.metadata
  const failures = []
  const retired = ['cancelled', 'superseded'].includes(value.status)
  const draft = value.status === 'draft'
  const historicalCommit =
    value.status === 'done' && gitCommitExists(value.integrated_commit)
      ? value.integrated_commit
      : null
  const registry = specificationRegistry(historicalCommit)
  const manifests = new Map(listDurableRuns().map((item) => [item.value.run_id, item.value]))

  if (value.schema !== 2) failures.push('schema must be 2 for current Plans')
  if (typeof value.id !== 'string' || !/^IGT-\d{3,}$/.test(value.id)) {
    failures.push('id must match IGT-000')
  }
  if (typeof value.release !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(value.release)) {
    failures.push('release must be a kebab-case id')
  }
  if (!CURRENT_STATUSES.has(value.status)) failures.push(`unknown current status: ${value.status}`)
  if (typeof value.outcome !== 'string' || !value.outcome.trim())
    failures.push('outcome is required')
  if (value.contract_version !== undefined && value.contract_version !== 2) {
    failures.push('contract_version must be 2 when provided')
  }
  if (value.contract_version === 2) {
    for (const field of ['goals', 'constraints', 'non_goals', 'deliverables']) {
      if (!Array.isArray(value[field])) failures.push(`${field} must be an array`)
    }
    if (!draft && (!Array.isArray(value.goals) || value.goals.length === 0)) {
      failures.push('goals must name each user-visible result')
    }
    for (const goal of value.goals || []) {
      if (
        typeof goal?.text !== 'string' ||
        !goal.text.trim() ||
        !Array.isArray(goal.requirements) ||
        goal.requirements.length === 0 ||
        goal.requirements.some((id) => !value.requirements?.includes(id))
      ) {
        failures.push('each goal must have text and declared REQ-* mappings')
      }
    }
    if (!draft) {
      const mappedRequirements = new Set(
        (value.goals || []).flatMap((goal) => goal.requirements || []),
      )
      for (const requirement of value.requirements || []) {
        if (!mappedRequirements.has(requirement)) {
          failures.push(`${requirement} has no user-visible goal mapping`)
        }
      }
    }
    for (const item of [
      ...(value.constraints || []),
      ...(value.non_goals || []),
      ...(value.deliverables || []),
    ]) {
      if (typeof item !== 'string' || !item.trim())
        failures.push('contract entries must be non-empty strings')
    }
    if (
      !value.authorization ||
      typeof value.authorization.source !== 'string' ||
      !value.authorization.source.trim()
    ) {
      failures.push('authorization.source is required')
    }
    if (value.remaining_work !== undefined) {
      if (
        !Array.isArray(value.remaining_work) ||
        value.remaining_work.some((item) => typeof item !== 'string' || !item.trim())
      ) {
        failures.push('remaining_work must be an array of non-empty acceptance gaps')
      } else if (value.status === 'done' && value.remaining_work.length > 0) {
        failures.push(`done Plan still has unverified work: ${value.remaining_work.join('; ')}`)
      }
    }
  }
  if (!CURRENT_CHANGE_TYPES.has(value.change_type)) {
    failures.push('change_type must be 新增模块 or 存量改动')
  }
  if (!gitCommitExists(value.base_commit)) failures.push('base_commit must identify a real commit')
  else if (!isAncestor(value.base_commit, 'HEAD'))
    failures.push('base_commit must be an ancestor of HEAD')
  if (!Array.isArray(value.requirements) || (!draft && value.requirements.length === 0)) {
    failures.push('requirements must contain at least one REQ-* ID')
  } else {
    for (const id of value.requirements) {
      if (!/^REQ-[A-Z0-9-]+$/.test(id) || (!retired && !draft && !registry.requirements.has(id)))
        failures.push(`unknown requirement: ${id}`)
    }
    if (new Set(value.requirements).size !== value.requirements.length) {
      failures.push('requirements must be unique')
    }
  }
  if (!Array.isArray(value.acceptance) || (!draft && value.acceptance.length === 0)) {
    failures.push('acceptance must map at least one AC to tests')
  } else {
    const coveredRequirements = new Set()
    const acceptanceIds = new Set()
    for (const item of value.acceptance) {
      if (!item || typeof item.id !== 'string') {
        failures.push('each acceptance mapping requires an id')
        continue
      }
      if (acceptanceIds.has(item.id)) failures.push(`duplicate acceptance mapping: ${item.id}`)
      acceptanceIds.add(item.id)
      const spec = registry.acceptance.get(item.id)
      if (!/^AC-[A-Z0-9-]+$/.test(item.id) || (!retired && !draft && !spec))
        failures.push(`unknown acceptance criterion: ${item.id}`)
      for (const requirement of spec?.requirements || []) {
        coveredRequirements.add(requirement)
        if (!draft && !value.requirements?.includes(requirement)) {
          failures.push(`acceptance ${item.id} covers undeclared requirement ${requirement}`)
        }
      }
      if (!Array.isArray(item.tests) || (!draft && item.tests.length === 0)) {
        failures.push(`acceptance ${item.id} must name at least one test`)
      } else {
        if (new Set(item.tests).size !== item.tests.length) {
          failures.push(`acceptance ${item.id} test mappings must be unique`)
        }
        for (const test of item.tests) {
          const testPath = String(test).split('::', 1)[0]
          if (!TEST_PATH_PATTERN.test(testPath)) {
            failures.push(`acceptance ${item.id} references a non-runnable test ${testPath}`)
            continue
          }
          if (retired || draft) continue
          const testContent = readRepositoryText(testPath, historicalCommit)
          if (testContent === null) {
            failures.push(`acceptance ${item.id} references missing test ${testPath}`)
          } else if (!acceptanceTestTitles(testContent).has(item.id)) {
            failures.push(`acceptance ${item.id} is not tagged inside ${testPath}`)
          }
        }
      }
    }
    for (const requirement of value.requirements || []) {
      if (!retired && !draft && !coveredRequirements.has(requirement)) {
        failures.push(`requirement ${requirement} is not linked by a Plan acceptance criterion`)
      }
    }
  }
  if (!Array.isArray(value.depends_on)) failures.push('depends_on must be an array')
  else {
    if (new Set(value.depends_on).size !== value.depends_on.length) {
      failures.push('depends_on must be unique')
    }
    if (value.depends_on.includes(value.id)) failures.push('a Plan cannot depend on itself')
  }
  if (typeof value.owner !== 'string' || !value.owner.trim()) failures.push('owner is required')
  if (!RISKS.has(value.risk)) failures.push('risk is invalid')
  if (!Array.isArray(value.write_scope) || value.write_scope.length === 0) {
    failures.push('write_scope must contain at least one path')
  } else {
    if (
      value.write_scope.some(
        (path) =>
          typeof path !== 'string' || !path || path.includes('..') || /^[A-Za-z]:|^\//.test(path),
      )
    ) {
      failures.push('write_scope entries must be repository-relative paths without ..')
    }
    if (new Set(value.write_scope).size !== value.write_scope.length) {
      failures.push('write_scope entries must be unique')
    }
  }
  if (!Array.isArray(value.required_evidence) || value.required_evidence.length === 0) {
    failures.push('required_evidence must not be empty')
  } else {
    const required = new Set(value.required_evidence)
    if (required.size !== value.required_evidence.length) {
      failures.push('required_evidence must be unique')
    }
    for (const id of required) {
      if (!EVIDENCE_IDS.has(id)) failures.push(`unknown required evidence: ${id}`)
    }
    const minimumEvidence =
      value.risk === 'docs' ? ['check-dev'] : ['check-integration', 'check-release']
    for (const id of minimumEvidence) {
      if (!required.has(id)) failures.push(`${value.risk} Plans must require ${id}`)
    }
  }
  if (!Array.isArray(value.evidence)) failures.push('evidence must be an array')
  if (!Array.isArray(value.open_questions)) failures.push('open_questions must be an array')
  if (!isValidDate(value.updated_at)) failures.push('updated_at must be a real YYYY-MM-DD date')
  if (
    ['ready', 'active', 'verifying', 'done'].includes(value.status) &&
    value.open_questions?.length
  ) {
    failures.push(`${value.status} plans cannot contain open_questions`)
  }
  if (value.status === 'blocked') {
    for (const field of ['id', 'owner', 'reason', 'resume_action']) {
      if (
        !value.blocker ||
        typeof value.blocker[field] !== 'string' ||
        !value.blocker[field].trim()
      ) {
        failures.push(`blocked plans require blocker.${field}`)
      }
    }
  } else if (value.blocker !== null) {
    failures.push('only blocked plans may retain blocker details')
  }
  if (['verifying', 'done'].includes(value.status)) {
    if (!gitCommitExists(value.integrated_commit)) {
      failures.push(`${value.status} plans require a real integrated_commit`)
    } else if (!isAncestor(value.integrated_commit, 'HEAD')) {
      failures.push('integrated_commit must be an ancestor of HEAD')
    } else {
      if (!isAncestor(value.base_commit, value.integrated_commit)) {
        failures.push('integrated_commit must descend from base_commit')
      }
      if (!planContractAtCommit(plan, value.integrated_commit)) {
        failures.push('integrated_commit does not contain the current Plan contract')
      }
    }
  }

  const validEvidence = new Set()
  const evidenceIds = new Set()
  for (const item of value.evidence || []) {
    const evidenceFailures = []
    if (!item || typeof item.id !== 'string' || typeof item.run_id !== 'string') {
      failures.push('each evidence item requires id and run_id')
      continue
    }
    if (evidenceIds.has(item.id)) failures.push(`duplicate evidence binding: ${item.id}`)
    evidenceIds.add(item.id)
    const manifest = manifests.get(item.run_id)
    if (!manifest) {
      failures.push(`evidence ${item.id} references missing manifest ${item.run_id}`)
      continue
    }
    // During development, receipts retain the contract they actually tested.
    // Completion checks still compare every receipt with the current contract.
    const historicalPlanText =
      !requireCurrentEvidence && value.status !== 'done' && gitCommitExists(manifest.commit)
        ? readRepositoryText(plan.relativePath, manifest.commit)
        : null
    const historicalMetadata = historicalPlanText
      ? extractPlanMetadata(historicalPlanText)?.value
      : null
    const evidencePlan = historicalMetadata ? { ...plan, metadata: historicalMetadata } : plan
    if (manifest.schema !== 2) failures.push(`evidence ${item.id} must reference a schema 2 run`)
    if (manifest.schema !== 2) evidenceFailures.push('schema')
    if (manifest.plan_id !== value.id) {
      failures.push(`evidence ${item.id} belongs to another Plan`)
      evidenceFailures.push('plan')
    }
    if (manifest.evidence_id !== item.id) {
      failures.push(`evidence ${item.id} has a mismatched manifest id`)
      evidenceFailures.push('id')
    }
    if (manifest.status !== 'passed' || manifest.exit_code !== 0) {
      failures.push(`evidence ${item.id} did not pass`)
      evidenceFailures.push('result')
    }
    const expectedInputFingerprint = requireCurrentEvidence
      ? computeInputFingerprint(plan)
      : gitCommitExists(manifest.commit)
        ? computeInputFingerprintAtCommit(evidencePlan, manifest.commit)
        : null
    if (manifest.input_fingerprint !== expectedInputFingerprint) {
      failures.push(`evidence ${item.id} is stale for the current execution input`)
      evidenceFailures.push('input')
    }
    if (!manifest.workspace_clean) {
      failures.push(`evidence ${item.id} tested uncommitted inputs`)
      evidenceFailures.push('workspace')
    }
    if (!gitCommitExists(manifest.commit)) {
      failures.push(`evidence ${item.id} has an invalid commit`)
      evidenceFailures.push('commit')
    }
    if (!planContractAtCommit(evidencePlan, manifest.commit)) {
      failures.push(`evidence ${item.id} commit does not contain the current Plan contract`)
      evidenceFailures.push('plan-contract')
    }
    const validLevel = ['dev', 'integration', 'release'].includes(manifest.level)
    const policyVersion = manifest.check_policy_version ?? 1
    const validPolicy = SUPPORTED_CHECK_POLICIES.has(policyVersion)
    if (requireCurrentEvidence && policyVersion !== CHECK_POLICY_VERSION) {
      failures.push(`evidence ${item.id} must use the current check policy`)
      evidenceFailures.push('policy')
    }
    const evidenceFiles =
      !requireCurrentEvidence && gitCommitExists(manifest.commit)
        ? changedFilesForPlanAtCommit(evidencePlan, manifest.commit)
        : changedFilesForPlan(plan)
    const expectedCommands =
      validLevel && validPolicy
        ? commandsForLevel(manifest.level, evidenceFiles, evidencePlan, policyVersion).map(
            (command) => ({
              label: command.label,
              command: [command.command, ...command.args],
            }),
          )
        : []
    const actualCommands = Array.isArray(manifest.commands)
      ? manifest.commands.map((command) => ({
          label: command?.label,
          command: command?.command,
        }))
      : []
    if (
      !validLevel ||
      !validPolicy ||
      manifest.evidence_id !== `check-${manifest.level}` ||
      JSON.stringify(actualCommands) !== JSON.stringify(expectedCommands) ||
      !Array.isArray(manifest.commands) ||
      manifest.commands.some(
        (command) =>
          command?.status !== 'passed' ||
          command.exit_code !== 0 ||
          !Number.isInteger(command.duration_ms) ||
          command.duration_ms < 0,
      )
    ) {
      failures.push(`evidence ${item.id} does not contain the required check command set`)
      evidenceFailures.push('commands')
    }
    if (typeof manifest.log_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(manifest.log_sha256)) {
      failures.push(`evidence ${item.id} has no valid log digest`)
      evidenceFailures.push('log')
    }
    if (requireCurrentEvidence && policyVersion >= 3) {
      const localRecordPath = join(localRunsDirectory, `${manifest.run_id}.json`)
      const localLogPath = join(localRunsDirectory, `${manifest.run_id}.log`)
      try {
        const localRecord = readJson(localRecordPath)
        const actualLogDigest = hash(readFileSync(localLogPath))
        const sameRun =
          localRecord.run_id === manifest.run_id &&
          localRecord.plan_id === manifest.plan_id &&
          localRecord.evidence_id === manifest.evidence_id &&
          localRecord.status === 'passed' &&
          localRecord.exit_code === 0 &&
          localRecord.commit === manifest.commit &&
          localRecord.input_fingerprint === manifest.input_fingerprint &&
          localRecord.environment_fingerprint === manifest.environment_fingerprint &&
          JSON.stringify(
            localRecord.commands.map((command) => ({
              label: command.label,
              command: command.command,
              status: command.status,
              exit_code: command.exit_code,
              duration_ms: command.duration_ms,
            })),
          ) === JSON.stringify(manifest.commands)
        if (
          manifest.execution_source !== 'ignite-runner-local' ||
          !sameRun ||
          actualLogDigest !== manifest.log_sha256
        ) {
          failures.push(`evidence ${item.id} does not match its local execution record and log`)
          evidenceFailures.push('source')
        }
      } catch {
        failures.push(`evidence ${item.id} has no readable local execution record and log`)
        evidenceFailures.push('source')
      }
    }
    if (
      !isValidTimestamp(manifest.started_at) ||
      !isValidTimestamp(manifest.ended_at) ||
      Date.parse(manifest.ended_at) < Date.parse(manifest.started_at)
    ) {
      failures.push(`evidence ${item.id} has invalid run timestamps`)
      evidenceFailures.push('timestamps')
    }
    const runtimeText = readRepositoryText(
      '.ai/runtime.json',
      !requireCurrentEvidence && gitCommitExists(manifest.commit) ? manifest.commit : null,
    )
    if (runtimeText !== null) {
      const runtime = JSON.parse(runtimeText)
      const expectedPnpm = String(runtime.package_manager || '').replace(/^pnpm@/, '')
      if (
        !runtime.supported_platforms?.includes(manifest.environment?.platform) ||
        !runtime.supported_architectures?.includes(manifest.environment?.arch) ||
        manifest.environment?.node !== runtime.node ||
        manifest.environment?.pnpm !== expectedPnpm ||
        typeof manifest.environment_fingerprint !== 'string' ||
        !/^[0-9a-f]{64}$/.test(manifest.environment_fingerprint)
      ) {
        failures.push(`evidence ${item.id} was not produced by an approved runtime`)
        evidenceFailures.push('environment')
      }
    }
    if (evidenceFailures.length === 0) validEvidence.add(item.id)
  }

  if (value.status === 'done') {
    for (const id of value.required_evidence || []) {
      if (!validEvidence.has(id)) failures.push(`done plan is missing valid evidence: ${id}`)
    }
    for (const item of value.evidence || []) {
      const manifest = manifests.get(item.run_id)
      if (manifest?.commit && gitCommitExists(value.integrated_commit)) {
        if (!isAncestor(value.integrated_commit, manifest.commit)) {
          failures.push(`evidence ${item.id} was not run on or after integrated_commit`)
        }
      }
    }
  }
  return [...new Set(failures)]
}

export function validatePlanDependencies(
  plan,
  plans = listPlans(),
  { requireDone = ['active', 'verifying', 'done'].includes(plan.metadata?.status) } = {},
) {
  const failures = []
  const byId = new Map(
    plans.filter((item) => item.metadata).map((item) => [item.metadata.id, item]),
  )
  byId.set(plan.metadata.id, plan)
  const path = []
  const visited = new Set()
  function visit(id) {
    const cycleStart = path.indexOf(id)
    if (cycleStart !== -1) {
      failures.push(`dependency cycle: ${[...path.slice(cycleStart), id].join(' -> ')}`)
      return
    }
    if (visited.has(id)) return
    visited.add(id)
    path.push(id)
    const current = byId.get(id)
    for (const dependency of current?.metadata.depends_on || []) {
      const target = byId.get(dependency)
      if (!target) failures.push(`missing dependency ${dependency}`)
      else {
        if (id === plan.metadata.id && requireDone && target.metadata.status !== 'done') {
          failures.push(`dependency ${dependency} is not done`)
        }
        visit(dependency)
      }
    }
    path.pop()
  }
  visit(plan.metadata.id)
  return [...new Set(failures)]
}

export function validateAllPlans() {
  const failures = []
  const plans = listPlans()
  const ids = new Map()
  for (const plan of plans) {
    if (plan.metadata) {
      if (ids.has(plan.metadata.id))
        failures.push(`${plan.relativePath}: duplicate id ${plan.metadata.id}`)
      ids.set(plan.metadata.id, plan)
    }
    for (const error of validatePlan(plan).filter(
      (item) => item !== 'legacy plan without structured metadata',
    )) {
      failures.push(`${plan.relativePath}: ${error}`)
    }
  }
  for (const plan of plans.filter((item) => item.metadata?.schema === 2)) {
    for (const error of validatePlanDependencies(plan, plans)) {
      failures.push(`${plan.relativePath}: ${error}`)
    }
  }
  const releases = new Map(listReleases().map(({ value }) => [value.id, value]))
  for (const plan of plans.filter((item) => item.metadata?.schema === 2)) {
    const release = releases.get(plan.metadata.release)
    if (!release) failures.push(`${plan.relativePath}: missing release ${plan.metadata.release}`)
    else if (!release.plan_ids?.includes(plan.metadata.id)) {
      failures.push(
        `${plan.relativePath}: release ${plan.metadata.release} does not include the Plan`,
      )
    }
  }
  return failures
}

export function validateRelease(
  release,
  plansById = new Map(listPlans().map((p) => [p.metadata?.id, p])),
) {
  const failures = []
  if (release.schema !== 2) failures.push('release schema must be 2')
  if (typeof release.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(release.id)) {
    failures.push('release id must be kebab-case')
  }
  if (!Array.isArray(release.plan_ids) || release.plan_ids.length === 0) {
    failures.push('release must include at least one Plan')
  } else {
    if (new Set(release.plan_ids).size !== release.plan_ids.length) {
      failures.push('release plan_ids must be unique')
    }
    for (const id of release.plan_ids) {
      const plan = plansById.get(id)
      if (!plan) failures.push(`release references missing Plan ${id}`)
      else if (plan.metadata.release !== release.id)
        failures.push(`Plan ${id} points to another release`)
    }
  }
  if (!Array.isArray(release.must_pass) || release.must_pass.length === 0) {
    failures.push('release must_pass must not be empty')
  } else if (new Set(release.must_pass).size !== release.must_pass.length) {
    failures.push('release must_pass must be unique')
  }
  const declaredEvidence = new Set(
    (release.plan_ids || []).flatMap((id) => plansById.get(id)?.metadata?.required_evidence || []),
  )
  for (const id of release.must_pass || []) {
    if (!declaredEvidence.has(id)) failures.push(`release requires undeclared evidence ${id}`)
  }
  for (const id of declaredEvidence) {
    if (!release.must_pass?.includes(id)) failures.push(`release omits required evidence ${id}`)
  }
  if (!Array.isArray(release.excluded)) failures.push('release excluded must be an array')
  else {
    if (release.excluded.some((item) => typeof item !== 'string' || !item.trim())) {
      failures.push('release excluded entries must be non-empty strings')
    }
    if (new Set(release.excluded).size !== release.excluded.length) {
      failures.push('release excluded entries must be unique')
    }
  }
  if (!isValidDate(release.updated_at))
    failures.push('release updated_at must be a real YYYY-MM-DD date')
  if ('status' in release) failures.push('release status is derived and must not be stored')
  return failures
}

export function deriveRelease(release) {
  const plansById = new Map(listPlans().map((plan) => [plan.metadata?.id, plan]))
  const failures = validateRelease(release, plansById)
  const plans = (release.plan_ids || []).map((id) => plansById.get(id)).filter(Boolean)
  for (const plan of plans)
    failures.push(...validatePlan(plan).map((error) => `${plan.metadata.id}: ${error}`))
  const evidence = new Set(
    plans
      .filter((plan) => !['cancelled', 'superseded'].includes(plan.metadata.status))
      .flatMap((plan) => (plan.metadata.evidence || []).map((item) => item.id)),
  )
  const remainingPlans = plans.filter(
    (plan) => !['cancelled', 'superseded'].includes(plan.metadata.status),
  )
  const remainingRequired = new Set(
    remainingPlans.flatMap((plan) => plan.metadata.required_evidence || []),
  )
  const missingEvidence = (release.must_pass || []).filter(
    (id) => remainingRequired.has(id) && !evidence.has(id),
  )

  let status = 'draft'
  if (failures.length) status = 'invalid'
  else if (plans.some((plan) => plan.metadata.schema === 1)) status = 'legacy_unverified'
  else if (plans.length > 0 && remainingPlans.length === 0) status = 'cancelled'
  else if (plans.some((plan) => plan.metadata.status === 'blocked')) status = 'blocked'
  else if (
    remainingPlans.length > 0 &&
    remainingPlans.every((plan) => plan.metadata.status === 'done') &&
    missingEvidence.length === 0
  )
    status = 'done'
  else if (plans.some((plan) => plan.metadata.status === 'verifying')) status = 'verifying'
  else if (plans.some((plan) => plan.metadata.status === 'active')) status = 'active'
  else if (remainingPlans.every((plan) => ['ready', 'done'].includes(plan.metadata.status)))
    status = 'ready'

  return {
    ...release,
    status,
    failures: [...new Set(failures)],
    missing_evidence: missingEvidence,
    excluded_plans: plans
      .filter((plan) => ['cancelled', 'superseded'].includes(plan.metadata.status))
      .map((plan) => ({ id: plan.metadata.id, status: plan.metadata.status })),
  }
}

export function validateAllReleases() {
  const failures = []
  const ids = new Set()
  for (const { path, value } of listReleases()) {
    if (ids.has(value.id)) failures.push(`${relativePath(path)}: duplicate release id ${value.id}`)
    ids.add(value.id)
    if (path.split(/[\\/]/).at(-1) !== `${value.id}.json`) {
      failures.push(`${relativePath(path)}: filename must match release id`)
    }
    failures.push(...validateRelease(value).map((error) => `${relativePath(path)}: ${error}`))
  }
  return failures
}

export function renderStatus() {
  const allPlans = listPlans()
  const plans = allPlans.filter((plan) => plan.metadata)
  const legacyPlans = allPlans.filter((plan) => !plan.metadata)
  const currentPlans = plans.filter(
    (plan) => !['done', 'cancelled', 'superseded'].includes(plan.metadata.status),
  )
  const releases = listReleases().map(({ value }) => deriveRelease(value))
  const failures = [...validateAllPlans(), ...validateAllReleases()]
  const contractFingerprint = computeInputFingerprint({
    metadata: { schema: 0, id: 'status' },
  }).slice(0, 12)
  return [
    '# Ignite 状态摘要',
    '',
    `模板状态：\`${templateMode()}\``,
    `输入指纹：\`${contractFingerprint}\``,
    `当前 Plan：${currentPlans.length}；结构化历史：${plans.length - currentPlans.length}；未迁移历史：${legacyPlans.length}`,
    '',
    '## 当前工作',
    '',
    ...(currentPlans.length
      ? currentPlans.map(
          (plan) =>
            `- \`${plan.metadata.id}\` · \`${plan.metadata.status}\` · \`${plan.metadata.release}\``,
        )
      : ['- 无。']),
    '',
    '## 发布范围',
    '',
    ...releases.flatMap((release) => [
      `- \`${release.id}\` · \`${release.status}\``,
      `  - Plan：${release.plan_ids.map((id) => `\`${id}\``).join('、')}`,
      `  - 缺少证据：${
        release.status === 'legacy_unverified'
          ? '历史证据不参与当前验证'
          : release.missing_evidence.map((id) => `\`${id}\``).join('、') || '无'
      }`,
    ]),
    '',
    '## 结构问题',
    '',
    ...(failures.length ? failures.map((failure) => `- ${failure}`) : ['- 无。']),
    '',
    '> 本文件是确定性派生视图；修改 Plan 或 Release 机器源后重新生成。',
    '',
  ].join('\n')
}

export function writeGeneratedStatus() {
  return writeTextIfChanged(generatedStatusPath, renderStatus())
}

export function updatePlanMetadata(plan, updater) {
  if (!plan.metadataRange) throw new Error(`${plan.relativePath} has no structured metadata`)
  const next = updater(structuredClone(plan.metadata))
  const before = plan.content.slice(0, plan.metadataRange.start)
  const after = plan.content.slice(plan.metadataRange.end)
  writeTextIfChanged(
    plan.path,
    `${before}${PLAN_MARKER}\n${JSON.stringify(next, null, 2)}\n${PLAN_END_MARKER}${after}`,
  )
  return findPlan(next.id)
}

export function bindPlanEvidence(planId, evidenceId, runId) {
  const plan = findPlan(planId)
  const nextMetadata = structuredClone(plan.metadata)
  const evidence = (nextMetadata.evidence || []).filter((item) => item.id !== evidenceId)
  evidence.push({ id: evidenceId, run_id: runId })
  nextMetadata.evidence = evidence
  nextMetadata.updated_at = new Date().toISOString().slice(0, 10)
  const errors = validatePlan({ ...plan, metadata: nextMetadata }, { allowLegacy: false })
  if (errors.length) throw new Error(`invalid evidence binding:\n- ${errors.join('\n- ')}`)
  const updated = updatePlanMetadata(plan, () => nextMetadata)
  writeGeneratedStatus()
  return updated
}

export function currentIntegrationCommit(plan, head = currentCommit()) {
  const binding = (plan.metadata.evidence || []).find((item) => item.id === 'check-integration')
  const manifest = listDurableRuns().find((item) => item.value.run_id === binding?.run_id)?.value
  if (
    manifest?.plan_id === plan.metadata.id &&
    manifest.evidence_id === 'check-integration' &&
    manifest.check_policy_version === CHECK_POLICY_VERSION &&
    manifest.status === 'passed' &&
    manifest.exit_code === 0 &&
    manifest.workspace_clean === true &&
    manifest.input_fingerprint === computeInputFingerprint(plan) &&
    gitCommitExists(manifest.commit) &&
    isAncestor(manifest.commit, head) &&
    planContractAtCommit(plan, manifest.commit)
  ) {
    return manifest.commit
  }
  return head
}

export function setPlanStatus(planId, nextStatus, { blocker = null, commit = null } = {}) {
  const plan = findPlan(planId)
  if (plan.metadata.schema !== 2) throw new Error('state transitions require a schema 2 Plan')
  if (!CURRENT_STATUSES.has(nextStatus)) throw new Error(`unknown status: ${nextStatus}`)
  if (plan.metadata.status !== nextStatus && !TRANSITIONS[plan.metadata.status]?.has(nextStatus)) {
    throw new Error(`invalid transition: ${plan.metadata.status} -> ${nextStatus}`)
  }
  if (nextStatus === 'done') {
    if (!executionWorkspaceIsClean()) {
      throw new Error('cannot complete a Plan while execution inputs are uncommitted')
    }
    const currentErrors = validatePlan(plan, { allowLegacy: false, requireCurrentEvidence: true })
    if (currentErrors.length) {
      throw new Error(
        `cannot complete a Plan with stale current evidence:\n- ${currentErrors.join('\n- ')}`,
      )
    }
  }
  const nextMetadata = structuredClone(plan.metadata)
  nextMetadata.status = nextStatus
  nextMetadata.updated_at = new Date().toISOString().slice(0, 10)
  if (commit) {
    nextMetadata.integrated_commit =
      commit === 'HEAD'
        ? nextStatus === 'verifying'
          ? currentIntegrationCommit(plan)
          : currentCommit()
        : commit
  }
  if (nextStatus === 'blocked') nextMetadata.blocker = blocker
  else nextMetadata.blocker = null
  const candidate = { ...plan, metadata: nextMetadata }
  const errors = [
    ...validatePlan(candidate, { allowLegacy: false }),
    ...validatePlanDependencies(candidate),
  ]
  if (errors.length) throw new Error(`invalid Plan state:\n- ${errors.join('\n- ')}`)
  const updated = updatePlanMetadata(plan, () => nextMetadata)
  writeGeneratedStatus()
  return updated
}

export function reintegratePlan(planId) {
  const plan = findPlan(planId)
  if (plan.metadata?.schema !== 2 || !['verifying', 'done'].includes(plan.metadata.status)) {
    throw new Error('reintegrate requires a verifying or done schema 2 Plan')
  }
  if (!executionWorkspaceIsClean()) {
    throw new Error('commit the merged snapshot before reintegrating the Plan')
  }
  const mergedCommit = currentCommit()
  if (!planContractAtCommit(plan, mergedCommit)) {
    throw new Error('merged HEAD does not contain the current stable Plan contract')
  }
  if (
    gitCommitExists(plan.metadata.integrated_commit) &&
    isAncestor(plan.metadata.integrated_commit, mergedCommit)
  ) {
    throw new Error('integrated_commit is still reachable; ordinary verification can continue')
  }
  const next = structuredClone(plan.metadata)
  next.integration_history = [
    ...(next.integration_history || []),
    {
      source_commit: next.integrated_commit,
      evidence: next.evidence,
      replaced_by: mergedCommit,
      recorded_at: new Date().toISOString(),
    },
  ]
  next.status = 'active'
  next.integrated_commit = null
  next.evidence = []
  next.blocker = null
  next.updated_at = new Date().toISOString().slice(0, 10)
  const errors = [
    ...validatePlan({ ...plan, metadata: next }, { allowLegacy: false }),
    ...validatePlanDependencies({ ...plan, metadata: next }),
  ]
  if (errors.length) throw new Error(`cannot reintegrate Plan:\n- ${errors.join('\n- ')}`)
  const updated = updatePlanMetadata(plan, () => next)
  writeGeneratedStatus()
  return updated
}
