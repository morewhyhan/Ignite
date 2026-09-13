import { DatabaseSync } from 'node:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  changedFilesSince,
  gitCommitExists,
  isAncestor,
  repositoryRoot,
  runGit,
  validateWriteScope,
  walkFiles,
} from './core.mjs'
import {
  deriveRelease,
  listDurableRuns,
  listPlans,
  listReleases,
  renderStatus,
  specificationRegistry,
  templateMode,
} from './state.mjs'
import { acceptanceTestTitles } from './source-analysis.mjs'

function read(path) {
  return readFileSync(join(repositoryRoot, path), 'utf8')
}

export function validateTraceability() {
  const failures = []
  if (templateMode() === 'unknown') {
    failures.push('docs/features/product.md must declare template-baseline or adopted status')
  }
  const registry = specificationRegistry()
  for (const id of registry.duplicates) failures.push(`duplicate specification id: ${id}`)

  const testsRoot = join(repositoryRoot, 'tests')
  const coveredAcceptance = new Set(
    walkFiles(testsRoot)
      .filter((path) => /\.(?:ts|tsx)$/.test(path))
      .flatMap((path) => [...acceptanceTestTitles(readFileSync(path, 'utf8'))]),
  )
  const requirementsWithAcceptance = new Set()
  for (const [id, spec] of registry.acceptance) {
    if (spec.requirements.length === 0) {
      failures.push(`${id} must declare covered REQ-* IDs in parentheses`)
    }
    for (const requirement of spec.requirements) {
      if (!registry.requirements.has(requirement))
        failures.push(`${id} references unknown ${requirement}`)
      requirementsWithAcceptance.add(requirement)
    }
    if (!coveredAcceptance.has(id)) failures.push(`${id} is not named by an automated test`)
  }
  for (const id of registry.requirements.keys()) {
    if (!requirementsWithAcceptance.has(id)) failures.push(`${id} has no acceptance criterion`)
  }
  return failures
}

function databaseSnapshot(sql) {
  const database = new DatabaseSync(':memory:')
  try {
    database.exec('PRAGMA foreign_keys = ON;')
    database.exec(sql)
    const tables = database
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all()
      .map((row) => row.name)
    const result = {}
    for (const table of tables) {
      const quoted = table.replaceAll("'", "''")
      const columns = database
        .prepare(`PRAGMA table_info('${quoted}')`)
        .all()
        .map((column) => ({
          name: column.name,
          type: String(column.type).toUpperCase(),
          notnull: Number(column.notnull),
          default: column.dflt_value,
          pk: Number(column.pk),
        }))
      const foreignKeys = database
        .prepare(`PRAGMA foreign_key_list('${quoted}')`)
        .all()
        .map((foreignKey) => ({
          from: foreignKey.from,
          table: foreignKey.table,
          to: foreignKey.to,
          on_update: foreignKey.on_update,
          on_delete: foreignKey.on_delete,
        }))
        .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
      const indexes = database
        .prepare(`PRAGMA index_list('${quoted}')`)
        .all()
        .map((index) => ({
          unique: Number(index.unique),
          columns: database
            .prepare(`PRAGMA index_info('${String(index.name).replaceAll("'", "''")}')`)
            .all()
            .map((entry) => entry.name),
        }))
        .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
      result[table] = { columns, foreignKeys, indexes }
    }
    return result
  } finally {
    database.close()
  }
}

export async function validateDesignArtifacts() {
  const failures = []
  try {
    const migrationSql = walkFiles(join(repositoryRoot, 'prisma', 'migrations'))
      .filter((path) => path.endsWith('migration.sql'))
      .sort()
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n')
    const design = databaseSnapshot(read('docs/designs/database.sql'))
    const migrations = databaseSnapshot(migrationSql)
    if (JSON.stringify(design) !== JSON.stringify(migrations)) {
      failures.push('docs/designs/database.sql differs semantically from applied migrations')
    }
  } catch (error) {
    failures.push(`database design cannot be executed: ${error.message}`)
  }

  try {
    const { parseDocument } = await import('yaml')
    const document = parseDocument(read('docs/designs/api.yaml'))
    if (document.errors.length) {
      failures.push(`docs/designs/api.yaml is invalid YAML: ${document.errors[0].message}`)
    } else {
      const api = document.toJS()
      if (!String(api?.openapi || '').startsWith('3.')) failures.push('OpenAPI version must be 3.x')
      if (!api?.paths || Object.keys(api.paths).length === 0)
        failures.push('OpenAPI paths are empty')
      for (const [path, operations] of Object.entries(api?.paths || {})) {
        if (!path.startsWith('/')) failures.push(`OpenAPI path must start with /: ${path}`)
        for (const [method, operation] of Object.entries(operations || {})) {
          if (method === 'parameters') continue
          if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method))
            continue
          if (!operation?.responses || Object.keys(operation.responses).length === 0) {
            failures.push(`OpenAPI ${method.toUpperCase()} ${path} has no responses`)
          }
        }
      }
    }
  } catch (error) {
    failures.push(`OpenAPI validation unavailable: ${error.message}`)
  }

  for (const path of ['docs/designs/domain.puml', 'docs/designs/sequence.puml']) {
    if (!existsSync(join(repositoryRoot, path))) {
      failures.push(`missing design artifact: ${path}`)
      continue
    }
    const content = read(path)
    if (
      (content.match(/@startuml/g) || []).length !== 1 ||
      (content.match(/@enduml/g) || []).length !== 1
    ) {
      failures.push(`${path} must contain exactly one PlantUML document`)
    }
  }
  return failures
}

export function validateAgentBridges() {
  const failures = []
  const bridges = [
    'CLAUDE.md',
    '.cursor/rules/ignite.mdc',
    '.opencode/README.md',
    '.github/copilot-instructions.md',
    '.ai/README.md',
  ]
  for (const path of bridges) {
    const absolute = join(repositoryRoot, path)
    if (!existsSync(absolute)) failures.push(`missing AI bridge: ${path}`)
    else if (!readFileSync(absolute, 'utf8').includes('AGENTS.md')) {
      failures.push(`${path} does not point to AGENTS.md`)
    }
  }
  return failures
}

export function validateRuntimeContract() {
  const failures = []
  for (const path of ['.ai/runtime.json', '.node-version', '.gitattributes', '.editorconfig']) {
    if (!existsSync(join(repositoryRoot, path)))
      failures.push(`missing runtime contract file: ${path}`)
  }
  if (failures.length) return failures
  const runtime = JSON.parse(read('.ai/runtime.json'))
  const packageJson = JSON.parse(read('package.json'))
  const nodeVersion = read('.node-version').trim()
  if (runtime.schema !== 1) failures.push('.ai/runtime.json schema must be 1')
  if (runtime.node !== nodeVersion) failures.push('.node-version differs from .ai/runtime.json')
  if (runtime.package_manager !== packageJson.packageManager) {
    failures.push('packageManager differs from .ai/runtime.json')
  }
  if (packageJson.engines?.node !== runtime.node) {
    failures.push('engines.node differs from .ai/runtime.json')
  }
  if (runtime.preferred_environment !== 'wsl-linux') {
    failures.push('preferred_environment must be wsl-linux')
  }
  if (
    !Array.isArray(runtime.supported_platforms) ||
    !runtime.supported_platforms.includes('linux') ||
    !runtime.supported_platforms.includes('win32')
  ) {
    failures.push('supported_platforms must include linux and win32')
  }
  if (
    !Array.isArray(runtime.supported_architectures) ||
    runtime.supported_architectures.length === 0
  ) {
    failures.push('supported_architectures must not be empty')
  }
  if (runtime.shared_node_modules_across_platforms !== false) {
    failures.push('shared_node_modules_across_platforms must be false')
  }
  return failures
}

export function validateGeneratedStatus() {
  const path = join(repositoryRoot, 'docs', 'others', 'ignite-status.md')
  if (!existsSync(path)) return ['generated status file is missing']
  return readFileSync(path, 'utf8') === renderStatus() ? [] : ['generated status file is stale']
}

export function validateCiCompletion() {
  const failures = []
  const currentPlans = listPlans().filter((plan) => plan.metadata?.schema === 2)
  const diffBase = process.env.DIFF_BASE
  const validBase = diffBase && gitCommitExists(diffBase)
  const changedPlanPaths = validBase
    ? new Set(
        runGit(['diff', '--name-only', `${diffBase}...HEAD`, '--', 'docs/plans/'])
          .stdout.trim()
          .split(/\r?\n/),
      )
    : null
  const selectedPlans = changedPlanPaths
    ? currentPlans.filter((plan) => changedPlanPaths.has(plan.relativePath))
    : currentPlans
  for (const plan of selectedPlans) {
    if (!['done', 'cancelled', 'superseded'].includes(plan.metadata.status)) {
      failures.push(
        `CI requires ${plan.metadata.id} to be terminal; current status is ${plan.metadata.status}`,
      )
    }
  }
  for (const { value } of listReleases()) {
    const releasePlans = selectedPlans.filter((plan) => value.plan_ids?.includes(plan.metadata.id))
    if (releasePlans.length === 0) continue
    if (releasePlans.every((plan) => ['cancelled', 'superseded'].includes(plan.metadata.status))) {
      continue
    }
    const release = deriveRelease(value)
    if (release.status !== 'done') {
      failures.push(
        `CI requires release ${release.id} to be done; derived status is ${release.status}`,
      )
    }
  }
  if (diffBase) {
    if (!gitCommitExists(diffBase)) {
      failures.push(`CI DIFF_BASE is not a real commit: ${diffBase}`)
    } else {
      const coveringPlans = currentPlans.filter(
        (plan) =>
          plan.metadata.status === 'done' &&
          plan.metadata.integrated_commit !== diffBase &&
          gitCommitExists(plan.metadata.integrated_commit) &&
          isAncestor(diffBase, plan.metadata.integrated_commit) &&
          isAncestor(plan.metadata.integrated_commit, 'HEAD'),
      )
      const manifests = new Map(listDurableRuns().map(({ value }) => [value.run_id, value]))
      for (const path of changedFilesSince(diffBase)) {
        if (
          !coveringPlans.some((plan) => {
            if (validateWriteScope(plan, [path]).length !== 0) return false
            return plan.metadata.evidence.some((binding) => {
              const testedCommit = manifests.get(binding.run_id)?.commit
              return (
                gitCommitExists(testedCommit) &&
                runGit(['diff', '--quiet', testedCommit, 'HEAD', '--', path], {
                  allowFailure: true,
                }).exitCode === 0
              )
            })
          })
        ) {
          failures.push(`CI change is not covered by a completed Plan write_scope: ${path}`)
        }
      }
    }
  }
  return failures
}
