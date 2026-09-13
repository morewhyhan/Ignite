import { existsSync, mkdirSync, readFileSync, renameSync } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  currentCommit,
  gitCommitExists,
  relativePath,
  repositoryRoot,
  runGit,
  writeJson,
} from './core.mjs'
import {
  listDurableRuns,
  listPlans,
  listReleases,
  templateMode,
  writeGeneratedStatus,
} from './state.mjs'

/** Preserve inherited history when GitHub creates a template copy with a new Git history. */
export function adoptHistory({ apply = false } = {}) {
  const plans = listPlans()
  const foreign = plans.filter(
    (plan) => plan.metadata && !gitCommitExists(plan.metadata.base_commit),
  )
  if (foreign.length === 0) return { status: 'unchanged', files: [] }
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
  if (runGit(['rev-parse', '--is-shallow-repository']).stdout.trim() === 'true')
    throw new Error('fetch full Git history before adopting a shallow clone')
  const commit = currentCommit()
  if (!gitCommitExists(commit))
    throw new Error('create an initial Git commit before adopting template history')
  const records = [
    ...plans.map((plan) => plan.path),
    ...listReleases().map((release) => release.path),
    ...listDurableRuns().map((run) => run.path),
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
  const moved = []
  try {
    for (const item of files) {
      const destination = join(repositoryRoot, item.archive)
      mkdirSync(dirname(destination), { recursive: true })
      renameSync(join(repositoryRoot, item.source), destination)
      moved.push(item)
    }
    writeJson(join(archiveRoot, 'index.json'), {
      schema: 1,
      reason: 'template copy has a new Git history',
      baseline_commit: commit,
      files,
    })
  } catch (error) {
    for (const item of moved.reverse()) {
      const source = join(repositoryRoot, item.source)
      mkdirSync(dirname(source), { recursive: true })
      renameSync(join(repositoryRoot, item.archive), source)
    }
    throw error
  }
  writeGeneratedStatus()
  return { status: 'archived', files }
}
