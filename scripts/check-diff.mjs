#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const repositoryRoot = resolve(process.env.IGNITE_ROOT || process.cwd())
const baseIndex = process.argv.indexOf('--base')
let baseCommit = baseIndex >= 0 ? process.argv[baseIndex + 1] : null
const checks = []

if (baseCommit) {
  const validBase = spawnSync('git', ['cat-file', '-e', `${baseCommit}^{commit}`], {
    cwd: repositoryRoot,
    windowsHide: true,
  })
  if (validBase.status !== 0) {
    const parent = spawnSync('git', ['rev-parse', 'HEAD^'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      windowsHide: true,
    })
    baseCommit = parent.status === 0 ? parent.stdout.trim() : null
  }
}

if (baseCommit) checks.push(['diff', '--check', `${baseCommit}...HEAD`])
checks.push(['diff', '--check'])
checks.push(['diff', '--cached', '--check'])

for (const args of checks) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exitCode = 1
}

if (!process.exitCode) console.log('Git diff checks passed.')
