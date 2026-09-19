import { spawnSync } from 'node:child_process'
import { currentCommit, repositoryRoot } from './core.mjs'

function git(args) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    timeout: 8_000,
    windowsHide: true,
  })
  return { ok: result.status === 0, output: result.stdout?.trim() || '' }
}

export function verifyRemoteDelivery() {
  const branch = git(['symbolic-ref', '--quiet', '--short', 'HEAD'])
  if (!branch.ok) return { remote_sync: 'branch_unknown', branch: null, remote_commit: null }

  const remote = git(['remote', 'get-url', '--push', '--all', 'origin'])
  if (!remote.ok)
    return { remote_sync: 'not_configured', branch: branch.output, remote_commit: null }

  const pushUrls = remote.output.split(/\r?\n/).filter(Boolean)
  if (pushUrls.length === 0)
    return { remote_sync: 'not_configured', branch: branch.output, remote_commit: null }
  const remoteCommits = []
  for (const url of pushUrls) {
    const target = git(['ls-remote', '--heads', url, `refs/heads/${branch.output}`])
    if (!target.ok)
      return { remote_sync: 'unreachable', branch: branch.output, remote_commit: null }
    remoteCommits.push(target.output.match(/^([0-9a-f]{40})\s+refs\/heads\//)?.[1] || null)
  }
  if (remoteCommits.some((commit) => !commit))
    return { remote_sync: 'pending_first_push', branch: branch.output, remote_commit: null }
  const remoteCommit = remoteCommits[0]
  if (remoteCommits.some((commit) => commit !== remoteCommit)) {
    return { remote_sync: 'diverged_or_unknown', branch: branch.output, remote_commit: null }
  }

  const localCommit = currentCommit()
  if (remoteCommit === localCommit)
    return { remote_sync: 'verified', branch: branch.output, remote_commit: remoteCommit }
  if (git(['merge-base', '--is-ancestor', remoteCommit, localCommit]).ok) {
    return { remote_sync: 'pending_push', branch: branch.output, remote_commit: remoteCommit }
  }
  if (git(['merge-base', '--is-ancestor', localCommit, remoteCommit]).ok) {
    return { remote_sync: 'behind_remote', branch: branch.output, remote_commit: remoteCommit }
  }
  return { remote_sync: 'diverged_or_unknown', branch: branch.output, remote_commit: remoteCommit }
}
