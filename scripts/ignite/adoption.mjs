import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import {
  currentCommit,
  gitCommitExists,
  relativePath,
  repositoryRoot,
  runGit,
  walkFiles,
  writeJson,
  writeTextIfChanged,
} from './core.mjs'
import {
  listDurableRuns,
  listPlans,
  listReleases,
  templateMode,
  writeGeneratedStatus,
} from './state.mjs'

function listTddEvidence(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return listTddEvidence(path)
    return entry.isFile() && entry.name.endsWith('.json') ? [path] : []
  })
}

function linkedDocumentsAfterArchive(files) {
  const archived = new Map(
    files.map((item) => [
      resolve(repositoryRoot, item.source),
      resolve(repositoryRoot, item.archive),
    ]),
  )
  const archivedSources = new Set(archived.keys())
  const markdownFiles = walkFiles(join(repositoryRoot, 'docs')).filter(
    (path) => extname(path).toLowerCase() === '.md' && !archivedSources.has(resolve(path)),
  )
  const linkPattern = /(!?\[[^\]]*]\()([^)]+)(\))/g
  const snapshots = []

  for (const path of markdownFiles) {
    const before = readFileSync(path, 'utf8')
    const after = before.replace(linkPattern, (whole, prefix, rawTarget, suffix) => {
      const trimmed = rawTarget.trim()
      const wrapped = trimmed.startsWith('<') && trimmed.endsWith('>')
      const target = wrapped ? trimmed.slice(1, -1) : trimmed
      if (
        !target ||
        target.startsWith('#') ||
        target.startsWith('/') ||
        /^[a-z][a-z\d+.-]*:/i.test(target)
      )
        return whole
      const suffixIndex = target.search(/[?#]/)
      const targetPath = suffixIndex < 0 ? target : target.slice(0, suffixIndex)
      const targetSuffix = suffixIndex < 0 ? '' : target.slice(suffixIndex)
      let source
      try {
        source = resolve(dirname(path), decodeURIComponent(targetPath))
      } catch {
        return whole
      }
      const destination = archived.get(source)
      if (!destination) return whole
      const nextPath = relative(dirname(path), destination).replaceAll('\\', '/')
      const nextTarget = `${nextPath}${targetSuffix}`
      return `${prefix}${wrapped ? `<${nextTarget}>` : nextTarget}${suffix}`
    })
    if (after !== before) snapshots.push({ path, before, after })
  }
  return snapshots
}

/** Preserve inherited history when GitHub creates a template copy with a new Git history. */
export function adoptHistory({ apply = false } = {}) {
  const plans = listPlans()
  const foreign = plans.filter(
    (plan) => plan.metadata && !gitCommitExists(plan.metadata.base_commit),
  )
  if (foreign.length === 0) return { status: 'unchanged', files: [] }
  if (runGit(['rev-parse', '--is-shallow-repository']).stdout.trim() === 'true')
    throw new Error('fetch full Git history before adopting a shallow clone')
  if (templateMode() !== 'template-baseline') {
    throw new Error(
      'history adoption requires template-baseline; restore missing project commits before continuing an adopted project',
    )
  }
  // An existing project with its own Plans may be a shallow clone. Do not hide
  // that condition by archiving a mixture of local and inherited work.
  if (plans.some((plan) => plan.metadata && gitCommitExists(plan.metadata.base_commit))) {
    throw new Error(
      'mixed local and missing Plan history; fetch the missing Git history before adoption',
    )
  }
  const commit = currentCommit()
  if (!gitCommitExists(commit))
    throw new Error('create an initial Git commit before adopting template history')
  const records = [
    ...plans.map((plan) => plan.path),
    ...listReleases().map((release) => release.path),
    ...listDurableRuns().map((run) => run.path),
    ...listTddEvidence(join(repositoryRoot, 'docs', 'others', 'evidence', 'tdd')),
  ]
  const archiveRoot = join(repositoryRoot, 'docs', 'others', 'template-history', commit)
  const files = records.map((path) => ({
    source: relativePath(path),
    archive: relativePath(join(archiveRoot, `${relativePath(path)}.txt`)),
  }))
  if (!apply) return { status: 'preview', files }
  if (existsSync(archiveRoot))
    throw new Error('archive destination already exists; inspect it before retrying')
  // Inspect every input and destination before moving the first record.
  for (const item of files) readFileSync(join(repositoryRoot, item.source))
  const rewrittenDocuments = linkedDocumentsAfterArchive(files)
  const moved = []
  try {
    for (const item of files) {
      const destination = join(repositoryRoot, item.archive)
      mkdirSync(dirname(destination), { recursive: true })
      renameSync(join(repositoryRoot, item.source), destination)
      moved.push(item)
    }
    for (const document of rewrittenDocuments) writeTextIfChanged(document.path, document.after)
    writeJson(join(archiveRoot, 'index.json'), {
      schema: 1,
      reason: 'template copy has a new Git history',
      baseline_commit: commit,
      files,
    })
  } catch (error) {
    const rollbackErrors = []
    for (const document of [...rewrittenDocuments].reverse()) {
      try {
        writeTextIfChanged(document.path, document.before)
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }
    for (const item of moved.reverse()) {
      try {
        const source = join(repositoryRoot, item.source)
        mkdirSync(dirname(source), { recursive: true })
        renameSync(join(repositoryRoot, item.archive), source)
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError)
      }
    }
    try {
      rmSync(archiveRoot, { recursive: true, force: true })
    } catch (rollbackError) {
      rollbackErrors.push(rollbackError)
    }
    if (rollbackErrors.length)
      throw new AggregateError(
        [error, ...rollbackErrors],
        'history adoption failed and rollback was incomplete',
      )
    throw error
  }
  writeGeneratedStatus()
  return { status: 'archived', files }
}
