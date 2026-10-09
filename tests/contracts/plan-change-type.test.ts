import { spawnSync } from 'node:child_process'
import { appendFileSync, readdirSync, symlinkSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { git, makeFixture, read, repositoryRoot, write } from './ignite-fixture'

it('[AC-METHOD-005] accepts a structured Plan with one change-type source and still rejects invalid metadata', () => {
  const fixture = makeFixture()
  try {
    const target = join(fixture.root, 'template')
    git(fixture.root, 'clone', '--no-hardlinks', repositoryRoot, target)
    symlinkSync(join(repositoryRoot, 'node_modules'), join(target, 'node_modules'), 'dir')
    appendFileSync(join(target, '.git/info/exclude'), '\n/node_modules\n')
    const generated = spawnSync(
      process.execPath,
      [join(target, 'scripts/create-change.mjs'), 'type-example'],
      { cwd: target, env: { ...process.env, IGNITE_ROOT: target }, encoding: 'utf8' },
    )
    expect(generated.status, generated.stderr).toBe(0)
    const planFile = readdirSync(join(target, 'docs/plans')).find((name) =>
      /^\d{8}-type-example\.md$/.test(name),
    )
    expect(planFile).toBeDefined()
    const planPath = `docs/plans/${planFile}`
    const withoutDuplicate = read(target, planPath).replace(/^- 类型：`[^`]+`\r?\n/gm, '')
    write(target, planPath, withoutDuplicate)
    const check = () =>
      spawnSync(process.execPath, [join(target, 'scripts/check-docs.mjs')], {
        cwd: target,
        env: { ...process.env, IGNITE_ROOT: target },
        encoding: 'utf8',
      })
    const valid = check()
    expect(valid.status, valid.stderr).toBe(0)
    expect(valid.stdout).toContain('Documentation checks passed')

    write(
      target,
      planPath,
      withoutDuplicate.replace('"change_type": "存量改动"', '"change_type": "unknown"'),
    )
    const invalid = check()
    expect(invalid.status).not.toBe(0)
    expect(invalid.stderr).toContain('change_type must be')
  } finally {
    fixture.cleanup()
  }
})
