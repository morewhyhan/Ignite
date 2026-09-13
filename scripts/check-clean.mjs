import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const repositoryRoot = resolve(process.env.IGNITE_ROOT || process.cwd())

const result = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
  windowsHide: true,
})

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'Unable to inspect Git status.')
  process.exitCode = 1
} else if (result.stdout.trim()) {
  console.error('Verification changed tracked files:')
  console.error(result.stdout.trim())
  process.exitCode = 1
} else {
  console.log('Tracked workspace remained clean.')
}
