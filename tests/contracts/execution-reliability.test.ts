import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  commitAll,
  git,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  runCli,
  write,
} from './ignite-fixture'

function runModule(root: string, script: string) {
  return spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, IGNITE_ROOT: root, APP_ENV: 'test' },
    windowsHide: true,
  })
}

describe('execution reliability', () => {
  it('[AC-PRODUCT-013] refuses an empty acceptance test even when it carries a valid AC label', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'docs/plans/fixture.md', planContent(fixture.baseCommit))
      const populated = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(populated.status, populated.stderr).toBe(0)
      write(fixture.root, 'tests/contracts/sample.test.ts', "it('[AC-TEST-001] no-op', () => {})\n")
      const empty = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(empty.status).not.toBe(0)
      expect(empty.stderr).toContain('is not tagged inside')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] scaffolds an existing-feature change as an incomplete draft', () => {
    const fixture = makeFixture()
    try {
      const created = spawnSync(
        process.execPath,
        [join(repositoryRoot, 'scripts/create-change.mjs'), 'rename-existing-screen'],
        { cwd: fixture.root, encoding: 'utf8', env: { ...process.env, IGNITE_ROOT: fixture.root } },
      )
      expect(created.status, created.stderr).toBe(0)
      const filename = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
        name.endsWith('-rename-existing-screen.md'),
      )
      expect(filename).toBeDefined()
      const plan = read(fixture.root, `docs/plans/${filename}`)
      expect(plan).toContain('"change_type": "存量改动"')
      expect(plan).toContain('"status": "draft"')
      expect(read(fixture.root, 'docs/plans/releases/rename-existing-screen-v1.json')).toContain(
        '"plan_ids"',
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-011] gives an install action before dependencies exist', () => {
    const fixture = makeFixture()
    try {
      const doctor = spawnSync(
        process.execPath,
        [join(repositoryRoot, 'scripts/runtime-doctor.mjs'), '--preflight'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          env: { ...process.env, IGNITE_ROOT: fixture.root },
          windowsHide: true,
        },
      )
      expect(doctor.status, doctor.stderr).toBe(0)
      expect(JSON.parse(doctor.stdout)).toMatchObject({
        dependencies: 'install-required',
        browser: 'install-dependencies-first',
        database: 'run-pnpm-db-setup-after-env',
        next_command: 'corepack pnpm install --frozen-lockfile',
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-011] reads equivalent configuration syntax and refuses a shared adopted secret', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'docs/features/product.md', '- 状态：`adopted`\n')
      write(fixture.root, 'package.json', '{"name":"my-project"}\n')
      write(fixture.root, 'AGENTS.md', '# Rules\n')
      write(fixture.root, 'docs/standards/workflow.md', '# Workflow\n')
      write(fixture.root, 'docs/plans/_template.md', '# Plan\n')
      write(fixture.root, 'src/config/navigation.ts', 'export const navigation = []\n')
      write(
        fixture.root,
        'src/config/site.ts',
        'export const siteConfig = { name: "My Project", slug: "my-project" } as const\n',
      )
      write(
        fixture.root,
        '.env',
        "APP_ENV='development'\nAPP_URL=http://localhost:3000\nDATABASE_URL=file:./local.db\nBETTER_AUTH_SECRET='ignite-development-only-secret-change-before-deploying'\n",
      )
      const doctor = () =>
        spawnSync(process.execPath, [join(repositoryRoot, 'scripts/template-doctor.mjs')], {
          cwd: fixture.root,
          encoding: 'utf8',
          windowsHide: true,
        })
      const shared = doctor()
      expect(shared.status).not.toBe(0)
      expect(shared.stderr).toContain('unique BETTER_AUTH_SECRET')
      write(
        fixture.root,
        '.env',
        read(fixture.root, '.env').replace(
          'ignite-development-only-secret-change-before-deploying',
          'a-unique-local-project-secret-with-enough-length',
        ),
      )
      const adopted = doctor()
      expect(adopted.status, adopted.stderr).toBe(0)
      write(
        fixture.root,
        '.env',
        read(fixture.root, '.env').replace('http://localhost:3000', 'http://localhost:3000/path'),
      )
      const invalidOrigin = doctor()
      expect(invalidOrigin.status).not.toBe(0)
      expect(invalidOrigin.stderr).toContain('APP_URL must be an origin only')
      write(
        fixture.root,
        '.env',
        read(fixture.root, '.env').replace('http://localhost:3000/path', 'http://localhost:3000'),
      )
      git(fixture.root, 'remote', 'add', 'origin', 'git@github.com:morewhyhan/Ignite.git')
      const unsafeRemote = doctor()
      expect(unsafeRemote.status).not.toBe(0)
      expect(unsafeRemote.stderr).toContain('still pushes to the Ignite template repository')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-011] reads project identity from structured data after product prose changes', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'docs/features/product.md', '# Product\n\nA newly worded introduction.\n')
      write(
        fixture.root,
        '.ai/project.json',
        JSON.stringify({
          schema: 1,
          mode: 'adopted',
          source_repository: 'git@github.com:morewhyhan/Ignite.git',
          project_repository: null,
        }),
      )
      const result = runCli(fixture.root, 'status', '--json')
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout).template_mode).toBe('adopted')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] reports dependency cycles before a Plan can become active', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, { status: 'draft', depends_on: ['IGT-901'] }),
      )
      write(
        fixture.root,
        'docs/plans/second.md',
        planContent(fixture.baseCommit, {
          id: 'IGT-901',
          status: 'draft',
          depends_on: ['IGT-900'],
        }),
      )
      const releasePath = 'docs/plans/releases/fixture-v1.json'
      const release = JSON.parse(read(fixture.root, releasePath))
      release.plan_ids.push('IGT-901')
      write(fixture.root, releasePath, JSON.stringify(release))
      const validation = runCli(fixture.root, 'status', '--json')
      expect(validation.status, validation.stderr).toBe(0)
      expect(JSON.parse(validation.stdout).failures.join('\n')).toMatch(
        /dependency cycle|IGT-900.*IGT-901.*IGT-900/,
      )
      const ready = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'ready')
      expect(ready.status).not.toBe(0)
      expect(ready.stderr).toMatch(/dependency cycle|IGT-901/)
      expect(JSON.parse(runCli(fixture.root, 'status', '--json').stdout).plans[0].status).toBe(
        'draft',
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] gives a current task next action without claiming remote delivery', () => {
    const fixture = makeFixture()
    try {
      const result = runCli(fixture.root, 'next', '--plan', 'IGT-900')
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toMatchObject({
        plan_id: 'IGT-900',
        next_action: { kind: 'implement-and-check' },
        delivery: { remote_sync: 'not_verified', deployed_url: null },
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] keeps other runs visible when one local run record is corrupt', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, '.ignite/runs/corrupt.json', '{not-json')
      const result = runCli(fixture.root, 'run', 'status')
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual(
        expect.arrayContaining([expect.objectContaining({ run_id: 'corrupt', status: 'corrupt' })]),
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] requests cancellation for its exact live run without signalling a PID', () => {
    const fixture = makeFixture()
    try {
      const result = runModule(
        fixture.root,
        `const fs = await import('node:fs')
         const path = await import('node:path')
         const core = await import(${JSON.stringify(join(repositoryRoot, 'scripts/ignite/core.mjs'))})
         const runs = await import(${JSON.stringify(join(repositoryRoot, 'scripts/ignite/runs.mjs'))})
         const id = 'run-20260917000000-abcdef'
         const dir = path.join(${JSON.stringify(fixture.root)}, '.ignite', 'runs')
         fs.mkdirSync(dir, { recursive: true })
         fs.writeFileSync(path.join(dir, id + '.json'), JSON.stringify({
           run_id: id, status: 'running', started_at: new Date().toISOString(),
           heartbeat_at: new Date().toISOString(), runner: core.runnerIdentity()
         }))
         const requested = runs.requestRunCancellation(id)
         process.stdout.write(JSON.stringify({ requested, marker: fs.existsSync(path.join(dir, id + '.cancel')) }))`,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toMatchObject({
        requested: { status: 'cancellation-requested' },
        marker: true,
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] cancels a real quiet child without publishing success', async () => {
    const fixture = makeFixture()
    const runsFile = join(repositoryRoot, 'scripts/ignite/runs.mjs')
    const stateFile = join(repositoryRoot, 'scripts/ignite/state.mjs')
    const workerScript = `const state = await import(${JSON.stringify(stateFile)})
      const runs = await import(${JSON.stringify(runsFile)})
      const result = await runs.executeCheckPlan({
        plan: state.findPlan('IGT-900'),
        checkPlan: { level: 'integration', changedFiles: [], commands: [{
          label: 'quiet-fixture', command: process.execPath,
          args: ['--eval', 'setTimeout(() => {}, 12000)'],
        }] },
      })
      process.stdout.write(JSON.stringify({ status: result.status, exitCode: result.exitCode }))`
    const worker = spawn(process.execPath, ['--input-type=module', '--eval', workerScript], {
      cwd: fixture.root,
      env: { ...process.env, IGNITE_ROOT: fixture.root, APP_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    let errors = ''
    worker.stdout.on('data', (chunk) => {
      output += chunk.toString()
    })
    worker.stderr.on('data', (chunk) => {
      errors += chunk.toString()
    })
    try {
      const directory = join(fixture.root, '.ignite/runs')
      let runId = ''
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const file = existsSync(directory)
          ? readdirSync(directory).find((name) => name.endsWith('.json'))
          : null
        if (file) {
          try {
            const record = JSON.parse(readFileSync(join(directory, file), 'utf8'))
            if (record.child_pid) {
              runId = record.run_id
              break
            }
          } catch {
            /* writer may be replacing this record */
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      expect(runId).not.toBe('')
      const cancellation = runModule(
        fixture.root,
        `const runs = await import(${JSON.stringify(runsFile)})
         process.stdout.write(JSON.stringify(runs.requestRunCancellation(${JSON.stringify(runId)})))`,
      )
      expect(cancellation.status, cancellation.stderr).toBe(0)
      const code = await new Promise<number | null>((resolve) => worker.once('close', resolve))
      expect(code, errors).toBe(0)
      expect(JSON.parse(output)).toMatchObject({ status: 'cancelled', exitCode: 130 })
      expect(existsSync(join(fixture.root, 'docs/others/evidence/runs'))).toBe(false)
    } finally {
      worker.kill('SIGTERM')
      fixture.cleanup()
    }
  }, 20_000)

  it('[AC-PRODUCT-012] lets an unrelated draft stay incomplete but blocks its promotion', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/future.md',
        planContent(fixture.baseCommit, {
          id: 'IGT-901',
          status: 'draft',
          requirements: ['REQ-FUTURE-001'],
          acceptance: [{ id: 'AC-FUTURE-001', tests: ['tests/contracts/future.test.ts'] }],
        }),
      )
      const draft = runCli(fixture.root, 'plan', 'validate')
      expect(draft.status, draft.stderr).toBe(0)
      const promotion = runCli(fixture.root, 'plan', 'set-status', 'IGT-901', 'ready')
      expect(promotion.status).not.toBe(0)
      expect(promotion.stderr).toMatch(/unknown requirement|missing test/)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] permits a prose-only README change without a business Plan', () => {
    const fixture = makeFixture()
    try {
      const before = git(fixture.root, 'rev-parse', 'HEAD')
      write(fixture.root, 'README.md', '# corrected prose\n')
      commitAll(fixture.root, 'Correct prose')
      const script = `process.env.DIFF_BASE = ${JSON.stringify(before)}
        const governance = await import(${JSON.stringify(join(repositoryRoot, 'scripts/ignite/governance.mjs'))})
        process.stdout.write(JSON.stringify(governance.validateCiCompletion()))`
      const result = runModule(fixture.root, script)
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual([])
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] does not assign another Plan tagged commit to the current task', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          contract_version: 2,
          goals: [{ text: 'Own A', requirements: ['REQ-TEST-001'] }],
          constraints: [],
          non_goals: [],
          authorization: { source: 'fixture' },
          deliverables: ['A'],
          write_scope: ['src/a.txt', 'docs/', 'tests/', '.ai/', 'README.md'],
        }),
      )
      write(fixture.root, 'src/a.txt', 'A\n')
      commitAll(fixture.root, 'Implement A\n\nIgnite-Plan: IGT-900')
      write(fixture.root, 'src/b.txt', 'B\n')
      commitAll(fixture.root, 'Implement B\n\nIgnite-Plan: IGT-901')
      const core = join(repositoryRoot, 'scripts/ignite/core.mjs')
      const state = join(repositoryRoot, 'scripts/ignite/state.mjs')
      const result = runModule(
        fixture.root,
        `const core = await import(${JSON.stringify(core)})
         const state = await import(${JSON.stringify(state)})
         process.stdout.write(JSON.stringify(core.changedFilesForPlan(state.findPlan('IGT-900'))))`,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toContain('src/a.txt')
      expect(JSON.parse(result.stdout)).not.toContain('src/b.txt')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-013] invalidates evidence when the selected browser changes', () => {
    const core = join(repositoryRoot, 'scripts/ignite/core.mjs')
    const result = runModule(
      repositoryRoot,
      `const { environmentIdentity } = await import(${JSON.stringify(core)})
       const first = { APP_ENV: 'test', DATABASE_URL: 'file:./check.db', PLAYWRIGHT_EXECUTABLE_PATH: '/browser/a' }
       const second = { ...first, PLAYWRIGHT_EXECUTABLE_PATH: '/browser/b' }
       process.stdout.write(String(environmentIdentity(first).fingerprint !== environmentIdentity(second).fingerprint))`,
    )
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toBe('true')
  })

  it('[AC-PRODUCT-013] invalidates evidence when a user constraint changes', () => {
    const fixture = makeFixture()
    try {
      const core = join(repositoryRoot, 'scripts/ignite/core.mjs')
      const state = join(repositoryRoot, 'scripts/ignite/state.mjs')
      const initialPlan = planContent(fixture.baseCommit, {
        contract_version: 2,
        goals: [{ text: 'Keep records', requirements: ['REQ-TEST-001'] }],
        constraints: ['Keep all existing records'],
        non_goals: [],
        authorization: { source: 'user request' },
        deliverables: ['verified records'],
      })
      write(fixture.root, 'docs/plans/fixture.md', initialPlan)
      const result = runModule(
        fixture.root,
        `const core = await import(${JSON.stringify(core)})
         const state = await import(${JSON.stringify(state)})
         const before = core.computeInputFingerprint(state.findPlan('IGT-900'))
         const { readFileSync, writeFileSync } = await import('node:fs')
         const path = ${JSON.stringify(join(fixture.root, 'docs/plans/fixture.md'))}
         writeFileSync(path, readFileSync(path, 'utf8').replace('Keep all existing records', 'Keep only active records'))
         const after = core.computeInputFingerprint(state.findPlan('IGT-900'))
         process.stdout.write(String(before !== after))`,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toBe('true')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-013] never recommends completion while declared acceptance gaps remain', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          contract_version: 2,
          goals: [{ text: 'Deliver result', requirements: ['REQ-TEST-001'] }],
          constraints: [],
          non_goals: [],
          authorization: { source: 'fixture' },
          deliverables: ['result'],
          remaining_work: ['Verify a real cold-start journey'],
          status: 'active',
        }),
      )
      const next = runCli(fixture.root, 'next', '--plan', 'IGT-900')
      expect(next.status, next.stderr).toBe(0)
      expect(JSON.parse(next.stdout).next_action.reason).toContain('real cold-start')
      const state = join(repositoryRoot, 'scripts/ignite/state.mjs')
      const checkDone = runModule(
        fixture.root,
        `const state = await import(${JSON.stringify(state)})
         const plan = state.findPlan('IGT-900')
         process.stdout.write(JSON.stringify(state.validatePlan({ ...plan, metadata: { ...plan.metadata, status: 'done' } })))`,
      )
      expect(checkDone.status, checkDone.stderr).toBe(0)
      expect(JSON.parse(checkDone.stdout).join('\n')).toContain('unverified work')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-013] requires the exact Plan test title to have run', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: ['tests/contracts/sample.test.ts::[AC-TEST-001] required behavior'],
            },
          ],
        }),
      )
      const acceptance = join(repositoryRoot, 'scripts/testing/acceptance-results.mjs')
      const result = runModule(
        fixture.root,
        `process.env.IGNITE_PLAN_ID = 'IGT-900'
         const { acceptanceFailures } = await import(${JSON.stringify(acceptance)})
         const failures = acceptanceFailures([{ file: ${JSON.stringify(join(fixture.root, 'tests/contracts/sample.test.ts'))}, title: '[AC-TEST-001] unrelated passing behavior', passed: true }], 'vitest')
         process.stdout.write(JSON.stringify(failures))`,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual(
        expect.arrayContaining([expect.stringMatching(/required behavior/)]),
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-013] checks changed Plan acceptance in CI without a manually supplied Plan ID', () => {
    const fixture = makeFixture()
    try {
      const acceptance = join(repositoryRoot, 'scripts/testing/acceptance-results.mjs')
      const result = runModule(
        fixture.root,
        `process.env.CI = 'true'
         process.env.DIFF_BASE = ${JSON.stringify(fixture.baseCommit)}
         delete process.env.IGNITE_PLAN_ID
         const { acceptanceFailures } = await import(${JSON.stringify(acceptance)})
         process.stdout.write(JSON.stringify(acceptanceFailures([], 'vitest')))`,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual(
        expect.arrayContaining([expect.stringMatching(/AC-TEST-001/)]),
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-013] refuses a receipt without its local execution record and log', () => {
    const fixture = makeFixture()
    try {
      const core = join(repositoryRoot, 'scripts/ignite/core.mjs')
      const state = join(repositoryRoot, 'scripts/ignite/state.mjs')
      const checks = join(repositoryRoot, 'scripts/ignite/checks.mjs')
      const result = runModule(
        fixture.root,
        `const core = await import(${JSON.stringify(core)})
         const state = await import(${JSON.stringify(state)})
         const checks = await import(${JSON.stringify(checks)})
         const { writeFileSync, mkdirSync } = await import('node:fs')
         const { join } = await import('node:path')
         const plan = state.findPlan('IGT-900')
         const commit = core.currentCommit()
         const environment = core.environmentIdentity(core.makeSafeTestEnvironment())
         const files = core.changedFilesForPlan(plan)
         mkdirSync(core.durableRunsDirectory, { recursive: true })
         for (const level of ['integration', 'release']) {
           const runId = 'fake-' + level
           const manifest = {
             schema: 2, run_id: runId, check_policy_version: 3,
             plan_id: 'IGT-900', evidence_id: 'check-' + level, level,
             status: 'passed', exit_code: 0,
             started_at: '2026-09-17T00:00:00.000Z', ended_at: '2026-09-17T00:00:01.000Z',
             commit, input_fingerprint: core.computeInputFingerprint(plan),
             environment_fingerprint: environment.fingerprint, environment: environment.summary,
             workspace_clean: true, execution_source: 'ignite-runner-local',
             log_sha256: 'a'.repeat(64),
             commands: checks.commandsForLevel(level, files, plan, 3).map((item) => ({
               label: item.label, command: [item.command, ...item.args],
               status: 'passed', exit_code: 0, duration_ms: 1,
             })),
           }
           writeFileSync(join(core.durableRunsDirectory, runId + '.json'), JSON.stringify(manifest))
         }
         process.stdout.write(commit)`,
      )
      expect(result.status, result.stderr).toBe(0)
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'verifying',
          integrated_commit: result.stdout,
          evidence: [
            { id: 'check-integration', run_id: 'fake-integration' },
            { id: 'check-release', run_id: 'fake-release' },
          ],
        }),
      )
      const done = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'done')
      expect(done.status).not.toBe(0)
      expect(done.stderr).toContain('no readable local execution record and log')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-014] detects a migration that drops existing rows even if the schema is restored', () => {
    const fixture = makeFixture()
    try {
      const ddl = 'CREATE TABLE records (id INTEGER PRIMARY KEY, title TEXT NOT NULL);'
      write(fixture.root, 'prisma/migrations/001_init/migration.sql', ddl)
      write(
        fixture.root,
        'prisma/migrations/002_upgrade/migration.sql',
        `DROP TABLE records;\n${ddl}`,
      )
      write(fixture.root, 'docs/designs/database.sql', ddl)
      write(
        fixture.root,
        'docs/designs/api.yaml',
        'openapi: 3.0.0\npaths:\n  /health:\n    get:\n      responses:\n        "200": {description: healthy}\n',
      )
      write(fixture.root, 'docs/designs/domain.puml', '@startuml\n@enduml\n')
      write(fixture.root, 'docs/designs/sequence.puml', '@startuml\n@enduml\n')
      const governance = join(repositoryRoot, 'scripts/ignite/governance.mjs')
      const result = runModule(
        fixture.root,
        `const { validateDesignArtifacts } = await import(${JSON.stringify(governance)})
         process.stdout.write(JSON.stringify(await validateDesignArtifacts()))`,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual(
        expect.arrayContaining([expect.stringMatching(/data|drop|destructive/i)]),
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-014] refuses a provider switch until isolated test capabilities are adapted', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'prisma/schema.prisma', 'datasource db { provider = "postgresql" }\n')
      const result = runModule(
        fixture.root,
        `const adapter = await import(${JSON.stringify(join(repositoryRoot, 'scripts/testing/database-adapter.mjs'))})
         adapter.databaseTestAdapter.assertSchema(${JSON.stringify(join(fixture.root, 'prisma/schema.prisma'))})`,
      )
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('supports SQLite only')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-014] treats a first push as an initial snapshot, not an invalid commit', () => {
    const fixture = makeFixture()
    try {
      const governance = join(repositoryRoot, 'scripts/ignite/governance.mjs')
      const result = runModule(
        fixture.root,
        `process.env.DIFF_BASE = '0'.repeat(40)
         const { validateCiCompletion } = await import(${JSON.stringify(governance)})
         process.stdout.write(JSON.stringify(validateCiCompletion()))`,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).not.toEqual(
        expect.arrayContaining([expect.stringMatching(/DIFF_BASE is not a real commit/)]),
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-014] reopens a squashed Plan for verification on the merged commit', () => {
    const fixture = makeFixture()
    try {
      const baseBranch = git(fixture.root, 'branch', '--show-current')
      git(fixture.root, 'checkout', '-b', 'feature')
      write(fixture.root, 'src/a.txt', 'new behavior\n')
      const sourceCommit = commitAll(fixture.root, 'Implement feature')
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'verifying',
          integrated_commit: sourceCommit,
        }),
      )
      commitAll(fixture.root, 'Record feature verification state')
      git(fixture.root, 'checkout', baseBranch)
      git(fixture.root, 'merge', '--squash', 'feature')
      commitAll(fixture.root, 'Integrate feature as a squash commit')
      const failed = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(failed.status).not.toBe(0)
      expect(failed.stderr).toContain('integrated_commit must be an ancestor of HEAD')
      const repair = runCli(fixture.root, 'plan', 'reintegrate', 'IGT-900')
      expect(repair.status, repair.stderr).toBe(0)
      const plan = JSON.parse(
        read(fixture.root, 'docs/plans/fixture.md').match(
          /<!-- ignite-plan\s*([\s\S]*?)\s*-->/,
        )![1],
      )
      expect(plan).toMatchObject({
        status: 'active',
        integrated_commit: null,
        evidence: [],
      })
      expect(plan.integration_history[0].source_commit).toBe(sourceCommit)
    } finally {
      fixture.cleanup()
    }
  })
})
