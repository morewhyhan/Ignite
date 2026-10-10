import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { makeFixture, repositoryRoot, write } from './ignite-fixture'

it('[AC-METHOD-020] preserves E2E server selection and invalidates evidence across modes', () => {
  const fixture = makeFixture()
  try {
    const core = join(repositoryRoot, 'scripts/ignite/core.mjs')
    const identity = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `
      const core = await import(${JSON.stringify(core)})
      const base = { APP_ENV: 'test', DATABASE_URL: 'file:./test.db' }
      const development = core.environmentIdentity({ ...base, E2E_SERVER_MODE: 'development' })
      const production = core.environmentIdentity({ ...base, E2E_SERVER_MODE: 'production' })
      process.stdout.write(JSON.stringify({
        mode: core.makeSafeTestEnvironment().E2E_SERVER_MODE,
        different: development.fingerprint !== production.fingerprint,
        defaultMatches: development.fingerprint === core.environmentIdentity(base).fingerprint
      }))
    `,
      ],
      {
        cwd: fixture.root,
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, IGNITE_ROOT: fixture.root, E2E_SERVER_MODE: 'production' },
      },
    )
    expect(identity.status, identity.stderr).toBe(0)
    expect(JSON.parse(identity.stdout)).toEqual({
      mode: 'production',
      different: true,
      defaultMatches: true,
    })

    write(fixture.root, 'prisma/schema.prisma', 'datasource db { provider = "sqlite" }')
    write(fixture.root, 'prisma/migrations/fixture/migration.sql', '-- fixture')
    write(fixture.root, 'node_modules/prisma/build/index.js', 'process.exit(0)')
    write(
      fixture.root,
      'node_modules/@playwright/test/cli.js',
      'console.log("E2E_MODE=" + process.env.E2E_SERVER_MODE)',
    )
    for (const mode of ['development', 'production']) {
      const result = spawnSync(process.execPath, [join(repositoryRoot, 'scripts/run-e2e.mjs')], {
        cwd: fixture.root,
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, E2E_SERVER_MODE: mode },
      })
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toContain(`E2E_MODE=${mode}`)
    }
  } finally {
    fixture.cleanup()
  }
})
