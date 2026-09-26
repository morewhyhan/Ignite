import { spawnSync } from 'node:child_process'

export function checkScaffoldWorktree(root, { dryRun = false } = {}) {
  const result = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.status !== 0) throw new Error('Could not inspect Git worktree before scaffolding.')
  const changes = (result.stdout || '').split(/\r?\n/).filter(Boolean)
  if (changes.length && !dryRun) {
    throw new Error(
      [
        'Refusing to create a new Plan in a dirty worktree; existing changes could be mixed into its scope.',
        ...changes.map((change) => `  ${change}`),
        'Finish the existing Plan or create an isolated Git worktree, then retry.',
        'Use --dry-run to preview without writing files.',
      ].join('\n'),
    )
  }
  return changes
}
