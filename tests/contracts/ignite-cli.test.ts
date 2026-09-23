import { spawnSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
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

function makePassedEvidence(root: string, baseCommit: string, policyVersion = 2, overrides = {}) {
  const coreUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/core.mjs')).href
  const stateUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/state.mjs')).href
  const checksUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/checks.mjs')).href
  const script = `
    const core = await import(${JSON.stringify(coreUrl)})
    const state = await import(${JSON.stringify(stateUrl)})
    const checks = await import(${JSON.stringify(checksUrl)})
    const plan = state.findPlan('IGT-900')
    const environment = core.environmentIdentity(core.makeSafeTestEnvironment())
    const files = core.changedFilesForPlan(plan)
    process.stdout.write(JSON.stringify({
      commit: core.currentCommit(),
      fingerprint: core.computeInputFingerprint(plan),
      environment,
      commands: Object.fromEntries(['integration', 'release'].map((level) => [
        level,
        checks.commandsForLevel(level, files, plan, ${policyVersion}).map((item) => ({
          label: item.label,
          command: [item.command, ...item.args],
          status: 'passed',
          exit_code: 0,
          duration_ms: 1,
        })),
      ])),
    }))
  `
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, APP_ENV: 'test', IGNITE_ROOT: root },
    windowsHide: true,
  })
  expect(result.status, result.stderr).toBe(0)
  const run = JSON.parse(result.stdout) as {
    commit: string
    fingerprint: string
    environment: { fingerprint: string; summary: Record<string, unknown> }
    commands: Record<string, unknown[]>
  }
  const timestamp = '2026-09-06T00:00:00.000Z'
  for (const level of ['integration', 'release']) {
    const runId = `run-${level}`
    write(
      root,
      `docs/others/evidence/runs/${runId}.json`,
      `${JSON.stringify(
        {
          schema: 2,
          run_id: runId,
          check_policy_version: policyVersion,
          plan_id: 'IGT-900',
          evidence_id: `check-${level}`,
          level,
          status: 'passed',
          exit_code: 0,
          started_at: timestamp,
          ended_at: timestamp,
          commit: run.commit,
          input_fingerprint: run.fingerprint,
          environment_fingerprint: run.environment.fingerprint,
          environment: run.environment.summary,
          workspace_clean: true,
          commands: run.commands[level],
          log_sha256: 'a'.repeat(64),
        },
        null,
        2,
      )}\n`,
    )
  }
  write(
    root,
    'docs/plans/fixture.md',
    planContent(baseCommit, {
      ...overrides,
      status: 'done',
      evidence: [
        { id: 'check-integration', run_id: 'run-integration' },
        { id: 'check-release', run_id: 'run-release' },
      ],
      integrated_commit: run.commit,
    }),
  )
  return run.commit
}

describe('Ignite Plan and Release contracts', () => {
  it('[AC-EXECUTION-008] keeps historical check commands valid after a module test is removed', () => {
    const fixture = makeFixture()
    try {
      const baseCommit = git(fixture.root, 'rev-parse', 'HEAD')
      const overrides = { write_scope: ['src/', 'tests/', 'docs/'] }
      write(fixture.root, 'docs/plans/fixture.md', planContent(baseCommit, overrides))
      write(
        fixture.root,
        'src/modules/invoices/hooks/use-invoices.ts',
        'export const invoices = []\n',
      )
      write(
        fixture.root,
        'tests/api/invoices.test.ts',
        "it('returns invoices', () => expect([]).toEqual([]))\n",
      )
      commitAll(fixture.root, 'Implement an independent module')
      makePassedEvidence(fixture.root, baseCommit, 2, overrides)
      commitAll(fixture.root, 'Record module acceptance')
      expect(read(fixture.root, 'docs/others/evidence/runs/run-integration.json')).toContain(
        'tests/api/invoices.test.ts',
      )
      rmSync(join(fixture.root, 'tests/api/invoices.test.ts'))
      commitAll(fixture.root, 'Retire the module test in a later change')
      const historical = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(historical.status, historical.stderr).toBe(0)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-012] permits one completed Plan while a future Plan in its Release stays draft', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/future.md',
        planContent(fixture.baseCommit, { id: 'IGT-901', status: 'draft' }),
      )
      const release = JSON.parse(read(fixture.root, 'docs/plans/releases/fixture-v1.json'))
      release.plan_ids.push('IGT-901')
      write(fixture.root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release))
      const diffBase = commitAll(fixture.root, 'Record future task')
      write(
        fixture.root,
        'tests/contracts/sample.test.ts',
        "it('[AC-TEST-001] validates current evidence', () => { expect(1).toBe(1) })\n",
      )
      commitAll(fixture.root, 'Implement independent Plan')
      makePassedEvidence(fixture.root, fixture.baseCommit)
      commitAll(fixture.root, 'Record Plan completion')

      const governance = join(repositoryRoot, 'scripts/ignite/governance.mjs')
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '--eval',
          `const { validateCiCompletion } = await import(${JSON.stringify(governance)}); process.stdout.write(JSON.stringify(validateCiCompletion()))`,
        ],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          env: { ...process.env, APP_ENV: 'test', DIFF_BASE: diffBase, IGNITE_ROOT: fixture.root },
        },
      )
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual([])
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-005] preserves policy 1 receipts but requires the current policy for new completion', () => {
    const fixture = makeFixture()
    try {
      makePassedEvidence(fixture.root, fixture.baseCommit, 1)
      const historical = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(historical.status, historical.stderr).toBe(0)
      write(
        fixture.root,
        'docs/plans/fixture.md',
        read(fixture.root, 'docs/plans/fixture.md').replace(
          '"status": "done"',
          '"status": "verifying"',
        ),
      )
      const completion = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'done')
      expect(completion.status).not.toBe(0)
      expect(completion.stderr).toContain('must use the current check policy')
    } finally {
      fixture.cleanup()
    }
  })

  it.each(['cancelled', 'superseded'])(
    '[AC-PRODUCT-008] excludes a %s Plan without claiming that it was delivered',
    (status) => {
      const fixture = makeFixture()
      try {
        makePassedEvidence(fixture.root, fixture.baseCommit)
        write(
          fixture.root,
          'docs/plans/excluded.md',
          planContent(fixture.baseCommit, {
            id: 'IGT-901',
            status,
            risk: 'docs',
            required_evidence: ['check-dev'],
          }),
        )
        const releasePath = 'docs/plans/releases/fixture-v1.json'
        const release = JSON.parse(read(fixture.root, releasePath))
        release.plan_ids.push('IGT-901')
        release.must_pass.push('check-dev')
        write(fixture.root, releasePath, JSON.stringify(release))
        const result = runCli(fixture.root, 'release', 'status', 'fixture-v1')
        expect(result.status, result.stderr).toBe(0)
        expect(JSON.parse(result.stdout)[0]).toMatchObject({
          status: 'done',
          missing_evidence: [],
          excluded_plans: [{ id: 'IGT-901', status }],
        })
        write(fixture.root, 'docs/features/product.md', '# Retired requirements\n')
        write(fixture.root, 'tests/contracts/sample.test.ts', '// Retired test\n')
        const retired = runCli(fixture.root, 'release', 'status', 'fixture-v1')
        expect(retired.status, retired.stderr).toBe(0)
        expect(JSON.parse(retired.stdout)[0].status).toBe('done')
        write(
          fixture.root,
          'docs/plans/fixture.md',
          planContent(fixture.baseCommit, { status: 'cancelled' }),
        )
        const cancelled = runCli(fixture.root, 'release', 'status', 'fixture-v1')
        expect(cancelled.status, cancelled.stderr).toBe(0)
        expect(JSON.parse(cancelled.stdout)[0].status).toBe('cancelled')
      } finally {
        fixture.cleanup()
      }
    },
  )

  it('[AC-PRODUCT-005] permits editing and retrying a Plan but refuses completion with old evidence', () => {
    const fixture = makeFixture()
    try {
      const testedCommit = makePassedEvidence(fixture.root, fixture.baseCommit)
      const bindings = [
        { id: 'check-integration', run_id: 'run-integration' },
        { id: 'check-release', run_id: 'run-release' },
      ]
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'verifying',
          evidence: bindings,
          integrated_commit: testedCommit,
        }),
      )
      write(fixture.root, 'README.md', '# implementation corrected after testing\n')
      commitAll(fixture.root, 'correct implementation')

      const validation = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(validation.status, validation.stderr).toBe(0)
      const retry = runCli(fixture.root, 'check', '--plan', 'IGT-900', '--dry-run')
      expect(retry.status, retry.stderr).toBe(0)
      const completion = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'done')
      expect(completion.status).not.toBe(0)
      expect(completion.stderr).toContain('stale current evidence')
      expect(read(fixture.root, 'docs/plans/fixture.md')).toContain('"status": "verifying"')
      const resume = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'active')
      expect(resume.status, resume.stderr).toBe(0)
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'active',
          evidence: bindings,
          integrated_commit: testedCommit,
          outcome: 'revised outcome after feedback',
        }),
      )
      const revised = runCli(fixture.root, 'check', '--plan', 'IGT-900', '--dry-run')
      expect(revised.status, revised.stderr).toBe(0)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-008] keeps an active release active while evidence is still pending', () => {
    const fixture = makeFixture()
    try {
      const result = runCli(fixture.root, 'release', 'status', 'fixture-v1')
      expect(result.status, result.stderr).toBe(0)
      expect(JSON.parse(result.stdout)[0]).toMatchObject({
        status: 'active',
        missing_evidence: ['IGT-900:check-integration', 'IGT-900:check-release'],
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-005] rejects missing, stale, and invalid evidence for a done Plan', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'README.md', '# implemented fixture\n')
      const commit = commitAll(fixture.root, 'implementation')
      write(
        fixture.root,
        'docs/others/evidence/runs/forged.json',
        `${JSON.stringify(
          {
            schema: 2,
            run_id: 'forged',
            plan_id: 'IGT-900',
            evidence_id: 'check-integration',
            level: 'integration',
            status: 'passed',
            exit_code: 0,
            commit: '0'.repeat(40),
            input_fingerprint: 'f'.repeat(64),
            environment_fingerprint: 'a'.repeat(64),
            environment: { platform: 'linux', node: '24.19.0', pnpm: '9.11.0' },
            workspace_clean: true,
            commands: [],
            log_sha256: 'b'.repeat(64),
          },
          null,
          2,
        )}\n`,
      )
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'done',
          evidence: [{ id: 'check-integration', run_id: 'forged' }],
          integrated_commit: commit,
        }),
      )

      const result = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      const output = `${result.stdout}\n${result.stderr}`
      expect(result.status).not.toBe(0)
      expect(output).toContain('stale for the current execution input')
      expect(output).toContain('invalid commit')
      expect(output).toContain('required check command set')
      expect(output).toContain('invalid run timestamps')
      expect(output).toContain('missing valid evidence')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-008] derives Release state and rejects a stored status', () => {
    const fixture = makeFixture()
    try {
      const initial = runCli(fixture.root, 'release', 'status', 'fixture-v1')
      expect(initial.status).toBe(0)
      expect(JSON.parse(initial.stdout)[0]).toMatchObject({
        id: 'fixture-v1',
        status: 'active',
        missing_evidence: ['IGT-900:check-integration', 'IGT-900:check-release'],
      })

      const release = JSON.parse(
        read(fixture.root, 'docs/plans/releases/fixture-v1.json'),
      ) as Record<string, unknown>
      release.must_pass = ['check-integration']
      write(
        fixture.root,
        'docs/plans/releases/fixture-v1.json',
        `${JSON.stringify(release, null, 2)}\n`,
      )
      const incomplete = runCli(fixture.root, 'release', 'status', 'fixture-v1')
      expect(incomplete.status).not.toBe(0)
      expect(incomplete.stdout).toContain('release omits required evidence check-release')

      release.status = 'done'
      write(
        fixture.root,
        'docs/plans/releases/fixture-v1.json',
        `${JSON.stringify(release, null, 2)}\n`,
      )

      const invalid = runCli(fixture.root, 'release', 'status', 'fixture-v1')
      expect(invalid.status).not.toBe(0)
      expect(invalid.stdout).toContain('release status is derived and must not be stored')
    } finally {
      fixture.cleanup()
    }
  })

  it('renders deterministic status without mutating the repository on read', () => {
    const fixture = makeFixture()
    try {
      const before = runCli(fixture.root, 'status')
      const after = runCli(fixture.root, 'status')
      expect(before.status).toBe(0)
      expect(after.status).toBe(0)
      expect(after.stdout).toBe(before.stdout)
      const json = runCli(fixture.root, 'status', '--json')
      expect(json.status).toBe(0)
      expect(JSON.parse(json.stdout).template_mode).toBe('unknown')
      expect(runCli(fixture.root, 'status', '--write').status).toBe(0)
      expect(runCli(fixture.root, 'status', '--write').stdout).toContain(
        'Status is already current',
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-005] leaves the Plan untouched when a state transition is invalid', () => {
    const fixture = makeFixture()
    try {
      const before = read(fixture.root, 'docs/plans/fixture.md')
      const result = runCli(fixture.root, 'plan', 'set-status', 'IGT-900', 'verifying')
      expect(result.status).not.toBe(0)
      expect(`${result.stdout}\n${result.stderr}`).toContain('real integrated_commit')
      expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-005] rejects weakened evidence requirements and impossible dates', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          required_evidence: ['check-integration'],
          updated_at: '2026-02-31',
        }),
      )
      const result = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      const output = `${result.stdout}\n${result.stderr}`
      expect(result.status).not.toBe(0)
      expect(output).toContain('infrastructure Plans must require check-release')
      expect(output).toContain('updated_at must be a real YYYY-MM-DD date')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-008] refuses to merge a nonterminal Plan through CI validation', () => {
    const fixture = makeFixture()
    try {
      expect(runCli(fixture.root, 'status', '--write').status).toBe(0)
      const result = runCli(fixture.root, 'validate', '--ci')
      expect(result.status).not.toBe(0)
      expect(`${result.stdout}\n${result.stderr}`).toContain(
        'CI requires IGT-900 to be terminal; current status is active',
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-PRODUCT-005] preserves completed evidence while CI rejects later unplanned code', () => {
    const fixture = makeFixture()
    try {
      makePassedEvidence(fixture.root, fixture.baseCommit)
      commitAll(fixture.root, 'record completed plan')
      write(fixture.root, 'README.md', '# later unplanned change\n')
      write(fixture.root, 'docs/features/product.md', '# New product specifications\n')
      write(fixture.root, 'tests/contracts/sample.test.ts', '// Retired with its feature\n')
      const runtime = JSON.parse(read(fixture.root, '.ai/runtime.json'))
      runtime.node = '26.0.0'
      write(fixture.root, '.ai/runtime.json', JSON.stringify(runtime))
      commitAll(fixture.root, 'unplanned code')

      const historical = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(historical.status, historical.stderr).toBe(0)

      const ci = spawnSync(
        process.execPath,
        [join(repositoryRoot, 'scripts/ignite.mjs'), 'validate', '--ci'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          env: {
            ...process.env,
            APP_ENV: 'test',
            DIFF_BASE: fixture.baseCommit,
            IGNITE_ROOT: fixture.root,
            IGNITE_SKIP_RUNTIME_CHECK: 'true',
          },
          windowsHide: true,
        },
      )
      expect(ci.status).not.toBe(0)
      expect(`${ci.stdout}\n${ci.stderr}`).toContain(
        'CI change is not covered by a completed Plan write_scope: docs/features/product.md',
      )
    } finally {
      fixture.cleanup()
    }
  })
})
