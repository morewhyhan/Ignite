import { randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  realpathSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'

function git(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true })
  if (result.error || result.status !== 0)
    throw new Error(result.error?.message || result.stderr.trim() || `git ${args[0]} failed`)
  return result.stdout.trim()
}

function inside(root, path) {
  const part = relative(root, path)
  return (
    part !== '' &&
    !isAbsolute(part) &&
    part !== '..' &&
    !part.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
  )
}

function restorePath(path, scopes) {
  if (
    typeof path !== 'string' ||
    !path ||
    path.startsWith('-') ||
    isAbsolute(path) ||
    /[\\\0\r\n]/.test(path) ||
    path.split('/').some((part) => part === '..' || part === '.')
  )
    throw new Error(`Invalid recovery path ${path}`)
  if (
    /^(?:\.git|\.ignite|\.env|node_modules|docs\/plans|docs\/features|docs\/others\/evidence|tests)(?:[/.]|$)/.test(
      path,
    )
  )
    throw new Error(`Recovery preserves specifications, tests, environments and evidence: ${path}`)
  if (!scopes.some((scope) => (scope.endsWith('/') ? path.startsWith(scope) : path === scope)))
    throw new Error(`Recovery path ${path} is outside the matching implementation scope`)
  return path
}

export function prepareTddRecovery({ root, plan, acceptanceId, from, restore }) {
  if (!['active', 'verifying', 'blocked'].includes(plan.metadata.status))
    throw new Error('Prepare TDD recovery only after starting or restarting an unfinished Plan')
  if (!/^[a-f0-9]{40}$/i.test(from || ''))
    throw new Error('Recovery requires an explicit full historical commit')
  git(root, ['cat-file', '-e', `${from}^{commit}`])
  git(root, ['merge-base', '--is-ancestor', from, 'HEAD'])
  if (!plan.metadata.acceptance.some((item) => item.id === acceptanceId))
    throw new Error(`unknown acceptance ${acceptanceId}`)
  if ((plan.metadata.tdd_evidence || []).some((item) => item.acceptance_id === acceptanceId))
    throw new Error('Restart this AC first; recovery does not silently revoke an existing proof')
  const firstRedBaseline =
    plan.metadata.task_contract === 2 && !(plan.metadata.tdd_evidence || []).length
  const scopes = (plan.metadata.tasks || [])
    .filter(
      (task) =>
        task.phase === 'implement' && (firstRedBaseline || task.acceptance?.includes(acceptanceId)),
    )
    .flatMap((task) => task.scope || [])
    .filter((scope) =>
      (plan.metadata.write_scope || []).some((allowed) =>
        allowed.endsWith('/') ? scope.startsWith(allowed) : scope === allowed,
      ),
    )
  if (!Array.isArray(restore) || !restore.length)
    throw new Error('Recovery requires explicit --restore repository paths')
  const paths = restore.map((path) => restorePath(path, scopes))
  const realRoot = realpathSync(root)
  const recoveryBase = join(root, '.ignite', 'recovery')
  mkdirSync(recoveryBase, { recursive: true })
  if (!inside(realRoot, realpathSync(recoveryBase)))
    throw new Error('Recovery directory escapes the project')
  const workspace = join(recoveryBase, randomBytes(8).toString('hex'))
  git(root, ['worktree', 'add', '--detach', workspace, 'HEAD'])
  try {
    git(workspace, ['restore', '--source', from, '--staged', '--worktree', '--', ...paths])
    if (!git(workspace, ['diff', '--cached', '--name-only']))
      throw new Error(
        'The selected historical paths have no implementation difference; no failure was manufactured',
      )
    copyFileSync(join(root, plan.relativePath), join(workspace, plan.relativePath))
    git(workspace, ['add', '--', plan.relativePath])
    git(workspace, [
      '-c',
      'user.name=Ignite TDD Recovery',
      '-c',
      'user.email=ignite-recovery@example.com',
      'commit',
      '-m',
      `Restore ${plan.metadata.id} ${acceptanceId} behavior from ${from}`,
    ])
    const recoveryCommit = git(workspace, ['rev-parse', 'HEAD'])
    mkdirSync(join(workspace, '.ignite'), { recursive: true })
    writeFileSync(
      join(workspace, '.ignite', 'recovery-context.json'),
      `${JSON.stringify({ plan_id: plan.metadata.id, acceptance_id: acceptanceId, source_commit: from, recovery_commit: recoveryCommit, restore_paths: paths }, null, 2)}\n`,
      'utf8',
    )
    return {
      purpose: 'isolated-tdd-recovery',
      plan_id: plan.metadata.id,
      acceptance_id: acceptanceId,
      workspace,
      source_commit: from,
      recovery_commit: recoveryCommit,
      restore_paths: paths,
      first_red_baseline: firstRedBaseline,
      evidence_created: false,
      next_commands: [
        { cwd: workspace, command: ['pnpm', 'install', '--frozen-lockfile'] },
        {
          cwd: workspace,
          command: [
            'pnpm',
            'ignite',
            'tdd',
            'red',
            '--plan',
            plan.metadata.id,
            '--ac',
            acceptanceId,
          ],
        },
      ],
      next_action:
        'Use the declared runtime and this workspace own dependencies. Only native red may create proof. Commit its receipt, then import with tdd recover --import. Keep this worktree until the record is integrated.',
    }
  } catch (error) {
    throw new Error(`${error.message}. Recovery worktree preserved for inspection: ${workspace}`)
  }
}

export function recoveredTddRecord(root, plan, acceptanceId, workspace) {
  const base = realpathSync(join(root, '.ignite', 'recovery'))
  const actual = realpathSync(workspace)
  if (!inside(base, actual))
    throw new Error('Import only a recovery worktree created under this project .ignite/recovery')
  const common = (cwd) => realpathSync(resolve(cwd, git(cwd, ['rev-parse', '--git-common-dir'])))
  if (common(root) !== common(actual))
    throw new Error('Recovery must share this project Git object history')
  const context = JSON.parse(readFileSync(join(actual, '.ignite', 'recovery-context.json'), 'utf8'))
  if (
    context.plan_id !== plan.metadata.id ||
    context.acceptance_id !== acceptanceId ||
    !/^[a-f0-9]{40}$/.test(context.recovery_commit || '')
  )
    throw new Error('Recovery ownership context does not match this Plan and acceptance')
  const directory = join(actual, 'docs', 'others', 'evidence', 'tdd', plan.metadata.id)
  if (!existsSync(directory)) throw new Error('Recovery has no native red record')
  const candidates = readdirSync(directory)
    .filter((file) => /^tdd-\d{14}-[a-f0-9]{6}\.json$/.test(file))
    .map((file) => {
      const path = `docs/others/evidence/tdd/${plan.metadata.id}/${file}`
      let text
      try {
        text = git(actual, ['show', `HEAD:${path}`])
      } catch {
        return null
      }
      const record = JSON.parse(text)
      if (record.acceptance_id !== acceptanceId) return null
      try {
        git(actual, ['merge-base', '--is-ancestor', context.recovery_commit, record.red_commit])
      } catch {
        return null
      }
      return { record, path, text }
    })
    .filter(Boolean)
    .sort((a, b) => b.record.run_id.localeCompare(a.record.run_id))
  if (!candidates.length)
    throw new Error(
      'Commit the actual native red receipt in the recovery worktree before importing',
    )
  const recovered = candidates[0]
  if (
    recovered.record.plan_id !== plan.metadata.id ||
    recovered.record.status !== 'assertion-failed' ||
    recovered.record.executor !== 'ignite-tdd-runner'
  )
    throw new Error('Import requires an actual matching native assertion-failed record')
  git(actual, ['merge-base', '--is-ancestor', recovered.record.red_commit, 'HEAD'])
  return { ...recovered, workspace: actual, commit: git(actual, ['rev-parse', 'HEAD']) }
}

export function preserveRecoveryAncestry(root, recovered) {
  git(root, [
    '-c',
    'user.name=Ignite TDD Recovery',
    '-c',
    'user.email=ignite-recovery@example.com',
    'merge',
    '--no-ff',
    '--strategy=ours',
    recovered.commit,
    '-m',
    `Preserve actual TDD recovery ${recovered.record.run_id}; keep current implementation`,
  ])
}
