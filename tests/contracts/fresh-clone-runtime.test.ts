import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { makeFixture, repositoryRoot, write } from './ignite-fixture'

it('[AC-METHOD-017] loads Next with the adopted project root beneath another lockfile', () => {
  const fixture = makeFixture()
  try {
    write(fixture.root, 'pnpm-lock.yaml', 'lockfileVersion: 9.0\n')
    const project = join(fixture.root, 'adopted')
    mkdirSync(project)
    write(project, 'pnpm-lock.yaml', 'lockfileVersion: 9.0\n')
    const config = join(repositoryRoot, 'next.config.mjs')
    if (existsSync(config)) copyFileSync(config, join(project, 'next.config.mjs'))
    const loader = join(repositoryRoot, 'node_modules/next/dist/server/config.js')
    const result = spawnSync(
      process.execPath,
      [
        '-e',
        `require(${JSON.stringify(loader)}).default('phase-development-server', ${JSON.stringify(project)}).then(config => console.log(JSON.stringify(config.turbopack.root)))`,
      ],
      {
        cwd: project,
        encoding: 'utf8',
        windowsHide: true,
      },
    )
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect(JSON.parse(result.stdout.trim())).toBe(project)
    expect(result.stderr).not.toContain('inferred your workspace root')
  } finally {
    fixture.cleanup()
  }
})
