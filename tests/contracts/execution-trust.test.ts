import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { commandsForLevel, planCheck } from '../../scripts/ignite/checks.mjs'
import {
  validateDataContract,
  validateReleaseScope,
} from '../../scripts/ignite/execution-contract.mjs'
import {
  findPlan,
  validateAllPlans,
  validateReleaseAcceptanceCoverage,
} from '../../scripts/ignite/state.mjs'
import { isBehaviorAssertionFailure } from '../../scripts/ignite/tdd.mjs'
import { summarizeVerification } from '../../scripts/ignite/verification-summary.mjs'
import { checkScaffoldWorktree } from '../../scripts/scaffold-preflight.mjs'
import { isExecutionStatePath } from '../../scripts/ignite/core.mjs'
import { acceptanceFailures } from '../../scripts/testing/acceptance-results.mjs'
import { makeFixture, planContent, read, runCli, write } from './ignite-fixture'

const planFor = (acceptance: Record<string, unknown>[]) => ({
  metadata: {
    id: 'IGT-900',
    status: 'active',
    verification_contract: 2,
    execution_contract: 1,
    risk: 'feature',
    acceptance,
  },
})

describe('AI execution trust', () => {
  it('[AC-TRUST-001] reports engineering gates, Plan behavior and Release separately', () => {
    const plan = planFor([
      {
        id: 'AC-TRUST-001',
        required_layers: ['unit'],
        checks: [{ test: 'tests/contracts/sample.test.ts::[AC-TRUST-001]', layer: 'unit' }],
      },
    ])
    const summary = summarizeVerification(
      {
        status: 'passed',
        evidence_id: 'check-integration',
        commands: [
          { label: 'typecheck', status: 'passed', exit_code: 0 },
          { label: 'targeted-tests', status: 'passed', exit_code: 0 },
        ],
        acceptance_results: [
          {
            plan_id: 'IGT-900',
            criterion: 'AC-TRUST-001',
            test: 'tests/contracts/sample.test.ts::[AC-TRUST-001]',
            layer: 'unit',
            passed: true,
            cases: 1,
          },
        ],
      },
      plan,
    )

    expect(summary.engineering_gates.status).toBe('passed')
    expect(summary.plan_acceptance.status).toBe('passed')
    expect(summary.release_acceptance.status).toBe('not-run')
    expect(summary.next_action).toContain('does not complete the Plan')

    const legacyCommands = commandsForLevel(
      'integration',
      [],
      {
        metadata: {
          execution_contract: 1,
          verification_contract: 1,
          acceptance: [{ tests: ['tests/contracts/legacy.test.ts::legacy case'] }],
        },
      },
      5,
      { fileExists: () => false },
    )
    expect(legacyCommands.find((command) => command.label === 'tests')?.args).toEqual([
      'pnpm',
      'test',
    ])
  })

  it('[AC-TRUST-002] [AC-EXECUTION-013] blocks active Release scope when a Feature acceptance is unaccounted for', () => {
    const release = JSON.parse(
      readFileSync(
        resolve(process.cwd(), 'docs/plans/releases/ai-execution-trust-v1.json'),
        'utf8',
      ),
    )
    const plans = new Map(
      release.plan_ids.map((id: string) => {
        const plan = findPlan(id)
        plan.metadata.status = 'active'
        return [plan.metadata.id, plan] as const
      }),
    )

    expect(validateReleaseAcceptanceCoverage(release, plans)).toEqual([])

    const omittedPlanId = release.plan_ids.at(-1)
    const partialPlans = new Map(
      release.plan_ids.slice(0, -1).map((id: string) => {
        const plan = findPlan(id)
        plan.metadata.status = 'active'
        return [plan.metadata.id, plan] as const
      }),
    )
    expect(validateReleaseAcceptanceCoverage(release, partialPlans)).toContain(
      `release references missing Plan ${omittedPlanId}`,
    )

    release.scope[0].acceptance = release.scope[0].acceptance.filter(
      (id: string) => id !== 'AC-TRUST-001',
    )
    expect(validateReleaseAcceptanceCoverage(release, plans).join('\n')).toContain(
      'AC-TRUST-001 is not included, deferred or explicitly excluded',
    )
  })

  it('[AC-TRUST-003] runs mapped browser acceptance at Plan integration, not only at Release', () => {
    const test = 'tests/e2e/responsive.spec.ts::[AC-TRUST-003]'
    const plan = planFor([
      {
        id: 'AC-TRUST-003',
        tests: ['tests/contracts/execution-trust.test.ts::[AC-TRUST-003]', test],
        required_layers: ['unit', 'browser'],
        checks: [
          {
            test: 'tests/contracts/execution-trust.test.ts::[AC-TRUST-003]',
            layer: 'unit',
          },
          { test, layer: 'browser' },
        ],
      },
    ])
    const check = planCheck({
      plan,
      requestedLevel: 'integration',
      explicitFiles: ['src/modules/sample/components/sample-screen.tsx'],
      dryRun: true,
    })

    expect(check.commands.some((command) => command.label === 'targeted-browser-tests')).toBe(true)
    expect(check.commands.some((command) => command.label === 'e2e-production')).toBe(false)
    expect(commandsForLevel('release', [], plan).map((command) => command.label)).toContain(
      'e2e-production',
    )
  })

  it('[AC-TRUST-004] accepts behavior assertions as red evidence but rejects setup failures', () => {
    expect(isBehaviorAssertionFailure('AssertionError: expected false to be true')).toBe(true)
    expect(isBehaviorAssertionFailure('Error: expect(page).toHaveScreenshot timed out')).toBe(true)
    expect(isBehaviorAssertionFailure("Error: Cannot find module 'playwright'")).toBe(false)
    expect(isBehaviorAssertionFailure('browserType.launch: Failed to launch')).toBe(false)
  })

  it('[AC-TRUST-005] protects existing changes before scaffold writes and keeps dry-run read-only', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'unrelated.txt', 'keep this change\n')
      expect(() => checkScaffoldWorktree(fixture.root)).toThrow(/dirty worktree/)
      expect(checkScaffoldWorktree(fixture.root, { dryRun: true })).toHaveLength(1)
      expect(readFileSync(resolve(fixture.root, 'unrelated.txt'), 'utf8')).toBe(
        'keep this change\n',
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-TRUST-008] keeps architectural authorization separate from deferred scope', () => {
    const plan = {
      metadata: {
        status: 'ready',
        risk: 'database',
        write_scope: ['prisma/'],
        data_contract: {
          access_scope: 'shared',
          access_rationale: 'Records are shared across the organization.',
          migration_impact: 'destructive',
          rollback: 'Restore the retained snapshot before deploying the previous app.',
          destructive_authorization: null,
        },
      },
    }
    expect(validateDataContract(plan).join('\n')).toContain('explicit user authorization')
    plan.metadata.data_contract.migration_impact = 'backfill'
    expect(validateDataContract(plan)).toEqual([])

    const release = {
      coverage_version: 2,
      plan_ids: [],
      scope: [
        {
          id: 'GOAL-001',
          text: 'Remove existing customer data',
          source: 'User request',
          requirements: [],
          acceptance: [],
          plan_ids: [],
          disposition: 'excluded',
          reason: '',
          authorization: '',
        },
      ],
    }
    expect(validateReleaseScope(release, new Map()).join('\n')).toContain(
      'exclusions need the user authorization source and reason',
    )
  })

  it('[AC-TRUST-009] only reports Release acceptance after its final production E2E passes', () => {
    const plan = planFor([])
    const summary = summarizeVerification(
      {
        status: 'passed',
        release_id: 'sample-v1',
        evidence_id: 'check-release',
        level: 'release',
        commit: 'a'.repeat(40),
        release_identity: { package_version: '0.2.0', tags: ['v0.2.0'] },
        commands: [
          { label: 'build', status: 'passed', exit_code: 0 },
          { label: 'e2e-production', status: 'passed', exit_code: 0 },
        ],
      },
      plan,
      { planEvidencePassed: true },
    )

    expect(summary.engineering_gates.status).toBe('passed')
    expect(summary.plan_acceptance.status).toBe('passed-before-release')
    expect(summary.release_acceptance).toEqual({
      status: 'passed',
      release_id: 'sample-v1',
      integrated_commit: 'a'.repeat(40),
      package_version: '0.2.0',
      tags: ['v0.2.0'],
    })

    const failedBuildSummary = summarizeVerification(
      {
        status: 'failed',
        release_id: 'sample-v1',
        evidence_id: 'check-release',
        level: 'release',
        commit: 'a'.repeat(40),
        release_identity: { package_version: '0.2.0', tags: ['v0.2.0'] },
        commands: [
          { label: 'build', status: 'failed', exit_code: 1 },
          { label: 'e2e-production', status: 'passed', exit_code: 0 },
        ],
      },
      plan,
      { planEvidencePassed: true },
    )
    expect(failedBuildSummary.engineering_gates.status).toBe('failed')
    expect(failedBuildSummary.release_acceptance.status).toBe('failed')
  })

  it('[AC-TRUST-010] pairs new verification contracts while preserving the legacy Plan/Release pair', () => {
    const versionFailures = validateAllPlans().filter((failure) =>
      /requires (?:Release|release coverage)/i.test(failure),
    )

    expect(versionFailures).toEqual([])
  }, 90_000)

  it('[AC-TRUST-011] never recommends ready when the linked Release contract is invalid', () => {
    const fixture = makeFixture()
    try {
      const test = 'tests/contracts/sample.test.ts::[AC-TEST-001]'
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          status: 'draft',
          execution_contract: 1,
          verification_contract: 2,
          verification_requirements: ['unit'],
          tasks: [{ id: 'T1', title: 'Implement behavior', status: 'todo' }],
          dependency_contracts: [],
          shared_files: [],
          required_evidence: ['check-integration'],
          handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: [test],
              required_layers: ['unit'],
              checks: [{ test, layer: 'unit' }],
            },
          ],
        }),
      )
      const release = JSON.parse(read(fixture.root, 'docs/plans/releases/fixture-v1.json'))
      release.coverage_version = 1
      release.verification_contract = 1
      release.must_pass = ['check-integration']
      write(
        fixture.root,
        'docs/plans/releases/fixture-v1.json',
        `${JSON.stringify(release, null, 2)}\n`,
      )

      const result = runCli(fixture.root, 'next', '--plan', 'IGT-900')
      expect(result.status, result.stderr).toBe(0)
      const output = JSON.parse(result.stdout)
      expect(output.next_action).toMatchObject({
        kind: 'repair-input',
        reason: expect.arrayContaining([
          expect.stringContaining(
            'verification_contract 2 requires Release verification_contract 2',
          ),
        ]),
        files: ['docs/plans/fixture.md', 'docs/plans/releases/fixture-v1.json'],
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-TRUST-012] points Release status to the unfinished Plan that blocks it', () => {
    const fixture = makeFixture()
    try {
      const result = runCli(fixture.root, 'release', 'status', 'fixture-v1')
      expect(result.status, result.stderr).toBe(0)
      const [release] = JSON.parse(result.stdout)
      expect(release.next_action).toMatchObject({
        kind: 'continue-plan',
        command: 'pnpm ignite next --plan IGT-900',
      })
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-TRUST-013] keeps default Plan and Release status concise and offers verbose context', () => {
    const fixture = makeFixture()
    try {
      const summary = runCli(fixture.root, 'next', '--plan', 'IGT-900')
      expect(summary.status, summary.stderr).toBe(0)
      const next = JSON.parse(summary.stdout)
      expect(next).toMatchObject({ plan_id: 'IGT-900', status: 'active' })
      expect(next).toHaveProperty('plan_path')
      expect(next).toHaveProperty('next_action')
      expect(next).not.toHaveProperty('context')

      const verbose = runCli(fixture.root, 'next', '--plan', 'IGT-900', '--verbose')
      expect(verbose.status, verbose.stderr).toBe(0)
      expect(JSON.parse(verbose.stdout)).toHaveProperty('context.acceptance')

      const releaseSummary = runCli(fixture.root, 'release', 'status', 'fixture-v1')
      expect(releaseSummary.status, releaseSummary.stderr).toBe(0)
      expect(JSON.parse(releaseSummary.stdout)[0]).not.toHaveProperty('scope')
      const releaseVerbose = runCli(fixture.root, 'release', 'status', 'fixture-v1', '--verbose')
      expect(releaseVerbose.status, releaseVerbose.stderr).toBe(0)
      expect(JSON.parse(releaseVerbose.stdout)[0]).toHaveProperty('scope')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-TRUST-014] explains how to recover from a Node version mismatch without switching it', () => {
    const fixture = makeFixture()
    try {
      const runtime = JSON.parse(read(fixture.root, '.ai/runtime.json'))
      runtime.node = '20.20.2'
      write(fixture.root, '.ai/runtime.json', `${JSON.stringify(runtime, null, 2)}\n`)

      const result = spawnSync(
        process.execPath,
        [resolve(process.cwd(), 'scripts/runtime-doctor.mjs'), '--preflight'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          env: { ...process.env, IGNITE_ROOT: fixture.root },
        },
      )
      const output = `${result.stdout}\n${result.stderr}`
      expect(result.status).not.toBe(0)
      expect(output).toContain('Node 20.20.2 is required')
      expect(output).toContain('nvm use 20.20.2')
      expect(output).toContain('node scripts/runtime-doctor.mjs --preflight')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-TRUST-015] ignores non-target ACs filtered out of a TDD red run', () => {
    const previousPlanId = process.env.IGNITE_PLAN_ID
    process.env.IGNITE_PLAN_ID = 'IGT-006'
    try {
      const file = resolve(process.cwd(), 'tests/contracts/execution-trust.test.ts')
      const failures = acceptanceFailures(
        [
          { file, title: '[AC-TRUST-010] targeted behavior is red', passed: false },
          { file, title: '[AC-TRUST-011] another AC was filtered out', passed: false },
        ],
        'vitest',
        { acceptanceId: 'AC-TRUST-010', planId: 'IGT-006' },
      )

      expect(failures).toContain(
        'AC-TRUST-010 has no passing result in tests/contracts/execution-trust.test.ts::[AC-TRUST-010]',
      )
      expect(failures.some((failure) => failure.includes('AC-TRUST-011'))).toBe(false)
    } finally {
      if (previousPlanId === undefined) delete process.env.IGNITE_PLAN_ID
      else process.env.IGNITE_PLAN_ID = previousPlanId
    }
  })

  it('[AC-TRUST-016] treats TDD proof records as execution state for batched red runs', () => {
    expect(isExecutionStatePath('docs/others/evidence/tdd/IGT-900/tdd-20260926.json')).toBe(true)
  })
})
