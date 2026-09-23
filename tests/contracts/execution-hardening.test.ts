import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { format } from 'prettier'
import { acceptanceLayerResults } from '../../scripts/testing/acceptance-results.mjs'
import { stablePlanContract } from '../../scripts/ignite/core.mjs'
import {
  calculateEvidenceCoverage,
  renderPlanProgress,
  renderPlanProgressContent,
  validateExecutionContract,
  validateReleaseScope,
} from '../../scripts/ignite/execution-contract.mjs'
import { loadMigrationProbeFixture } from '../../scripts/testing/migration-probe.mjs'
import { exampleRemovalPlan } from '../../scripts/ignite/examples.mjs'
import { repositoryRoot, git, commitAll, makeFixture, write } from './ignite-fixture'

const testPath = 'tests/contracts/execution-hardening.test.ts'

function contractPlan(overrides: Record<string, unknown> = {}) {
  const metadata = {
    contract_version: 2,
    execution_contract: 1,
    status: 'active',
    owner: 'integrator',
    risk: 'feature',
    verification_requirements: ['unit'],
    tasks: [{ id: 'T1', title: 'Implement the behavior', status: 'doing' }],
    remaining_work: [],
    acceptance: [
      {
        id: 'AC-EXECUTION-002',
        tests: [`${testPath}::[AC-EXECUTION-002]`],
        required_layers: ['unit'],
        checks: [{ test: `${testPath}::[AC-EXECUTION-002]`, layer: 'unit' }],
      },
    ],
    depends_on: [],
    dependency_contracts: [],
    shared_files: [{ path: 'src/server/api/index.ts', owner: 'integrator', mode: 'integrator' }],
    handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
    write_scope: ['tests/', 'src/server/api/index.ts'],
    ...overrides,
  }
  return { metadata, content: renderPlanProgress(metadata) }
}

function runModule(root: string, source: string) {
  return spawnSync(process.execPath, ['--input-type=module', '--eval', source], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, IGNITE_ROOT: root },
    windowsHide: true,
  })
}

describe('execution contract hardening', () => {
  it('[AC-EXECUTION-001] traces original goals and blocks a silent partial Release upgrade', () => {
    const release = {
      coverage_version: 1,
      plan_ids: ['IGT-900', 'IGT-901'],
      excluded: [],
      scope: [
        {
          id: 'GOAL-001',
          text: 'Deliver the accepted behavior',
          source: 'User request, item one',
          requirements: ['REQ-EXECUTION-001'],
          plan_ids: ['IGT-900'],
          disposition: 'included',
        },
        {
          id: 'GOAL-002',
          text: 'Enable the later provider integration',
          source: 'User request, item two',
          requirements: [],
          plan_ids: [],
          disposition: 'deferred',
          reason: 'Provider credentials are not available yet',
        },
        {
          id: 'GOAL-003',
          text: 'Add another module in a later task',
          source: 'A separate upcoming request',
          requirements: [],
          plan_ids: ['IGT-901'],
          disposition: 'included',
        },
      ],
    }
    const plans = new Map([
      ['IGT-900', { metadata: { status: 'active', requirements: ['REQ-EXECUTION-001'] } }],
      ['IGT-901', { metadata: { status: 'draft', requirements: [] } }],
    ])
    expect(validateReleaseScope(release, plans)).toEqual([])
    release.scope[1].disposition = 'excluded'
    expect(validateReleaseScope(release, plans).join('\n')).toContain(
      'authorization source and reason',
    )

    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/_template.md',
        readFileSync(join(repositoryRoot, 'docs/plans/_template.md'), 'utf8'),
      )
      const result = spawnSync(
        process.execPath,
        [join(repositoryRoot, 'scripts/create-module.mjs'), 'invoices', '--release', 'fixture-v1'],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          env: { ...process.env, IGNITE_ROOT: fixture.root },
          windowsHide: true,
        },
      )
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('Map its existing scope first')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-002] requires explicit behavior layers and real database fixtures', () => {
    const path = `${testPath}::[AC-EXECUTION-002]`
    const plan = contractPlan({
      verification_requirements: ['unit', 'database'],
      acceptance: [
        {
          id: 'AC-EXECUTION-002',
          tests: [path],
          required_layers: ['unit', 'database'],
          checks: [
            { test: path, layer: 'unit' },
            { test: path, layer: 'database' },
          ],
        },
      ],
    })
    const validSource = 'const db = databaseTestAdapter.openMemory()'
    expect(validateExecutionContract(plan, () => validSource)).toEqual([])
    const databaseResults = acceptanceLayerResults({
      planId: 'IGT-900',
      criterion: 'AC-EXECUTION-002',
      test: path,
      checks: plan.metadata.acceptance[0].checks,
      runner: 'vitest',
      passed: true,
      cases: 1,
    })
    expect(databaseResults.map((result) => result.layer)).toEqual(['unit', 'database'])
    const mockCall = 'vi.' + 'mock("database")'
    const invalidSource = `${mockCall}; const db = new PrismaClient()`
    expect(validateExecutionContract(plan, () => invalidSource).join('\n')).toContain(
      'database test must use real boundaries',
    )
    const noBrowser = contractPlan({
      verification_requirements: ['browser'],
      acceptance: [
        {
          id: 'AC-EXECUTION-002',
          tests: [path],
          required_layers: ['browser'],
          checks: [{ test: path, layer: 'browser' }],
        },
      ],
    })
    expect(validateExecutionContract(noBrowser, () => validSource).join('\n')).toContain(
      'browser evidence requires a Playwright spec',
    )
  })

  it('[AC-EXECUTION-003] reports each Plan evidence requirement as missing, stale or current', () => {
    const plan = {
      metadata: {
        id: 'IGT-900',
        status: 'active',
        required_evidence: ['check-integration', 'check-release', 'check-dev'],
        evidence: [
          { id: 'check-integration', run_id: 'run-1' },
          { id: 'check-release', run_id: 'run-2' },
        ],
      },
    }
    const coverage = calculateEvidenceCoverage({
      plan,
      manifests: new Map([
        [
          'run-1',
          {
            plan_id: 'IGT-900',
            evidence_id: 'check-integration',
            status: 'passed',
            exit_code: 0,
            input_fingerprint: 'old-input',
            check_policy_version: 4,
          },
        ],
        [
          'run-2',
          {
            plan_id: 'IGT-900',
            evidence_id: 'check-release',
            status: 'passed',
            exit_code: 0,
            input_fingerprint: 'current-input',
            check_policy_version: 5,
          },
        ],
      ]),
      validationFailures: [],
      currentFingerprint: 'current-input',
      currentPolicyVersion: 5,
    })
    expect(coverage).toEqual([
      expect.objectContaining({
        evidence_id: 'check-integration',
        status: 'stale',
        reason: 'repository or Plan inputs changed after this run',
      }),
      expect.objectContaining({ evidence_id: 'check-release', status: 'passed' }),
      expect.objectContaining({ evidence_id: 'check-dev', status: 'missing' }),
    ])
  })

  it('[AC-EXECUTION-004] keeps task state machine-owned without invalidating a stable contract', async () => {
    const plan = contractPlan()
    const before = stablePlanContract(plan.metadata)
    const updated = {
      ...plan.metadata,
      tasks: [{ ...plan.metadata.tasks[0], status: 'done' }],
      remaining_work: ['A later, separately tracked gap'],
    }
    expect(stablePlanContract(updated)).toEqual(before)
    expect(renderPlanProgress(updated)).toContain('- [x] T1 · Implement the behavior · done')
    expect(renderPlanProgressContent(plan.content, updated)).toBe(renderPlanProgress(updated))
    const generated = `${renderPlanProgress(updated)}\n`
    expect(await format(generated, { parser: 'markdown' })).toBe(generated)
    expect(
      validateExecutionContract(
        { ...plan, content: '# Plan without generated progress\n' },
        () => '',
      ),
    ).toContain('Plan must contain exactly one generated ignite-progress block')
  })

  it('[AC-EXECUTION-005] accepts an exact committed interface snapshot and rejects drift', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'src/contracts/public-api.ts', 'export type Result = string\n')
      const commit = commitAll(fixture.root, 'publish dependency interface')
      const url = pathToFileURL(join(repositoryRoot, 'scripts/ignite/execution-contract.mjs')).href
      const source = `const { dependencyContractIsCurrent } = await import(${JSON.stringify(url)})
        const plan = { metadata: { dependency_contracts: [{ plan_id: 'IGT-800', commit: ${JSON.stringify(commit)}, paths: ['src/contracts/public-api.ts'] }] } }
        console.log(dependencyContractIsCurrent(plan, 'IGT-800'))`
      expect(runModule(fixture.root, source).stdout.trim()).toBe('true')
      write(fixture.root, 'src/contracts/public-api.ts', 'export type Result = string  \n')
      expect(runModule(fixture.root, source).stdout.trim()).toBe('false')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-006] rejects an undeclared shared-file owner and malformed handoff', () => {
    const plan = contractPlan({ shared_files: [] })
    expect(validateExecutionContract(plan, () => '')).toContain(
      'declare shared_files owner for src/server/api/index.ts',
    )
    const malformed = contractPlan({ handoff: { interfaces: [] } })
    expect(validateExecutionContract(malformed, () => '')).toContain(
      'handoff requires interfaces, migrations, tests and remaining arrays',
    )
  })

  it('[AC-EXECUTION-007] loads scalar migration values and inventories Tasks removal safely', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ignite-migration-fixture-'))
    try {
      const fixturePath = join(directory, 'values.json')
      mkdirSync(directory, { recursive: true })
      writeFileSync(
        fixturePath,
        JSON.stringify({ schema: 1, tables: { invoice: { status: 'PENDING', quantity: 2 } } }),
      )
      expect(loadMigrationProbeFixture(fixturePath)).toEqual({
        schema: 1,
        tables: { invoice: { status: 'PENDING', quantity: 2 } },
      })
      expect(
        exampleRemovalPlan('tasks', repositoryRoot).historicalMigrations.every((entry) =>
          entry.action.includes('preserve'),
        ),
      ).toBe(true)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('[AC-EXECUTION-008] fingerprints text by Git line-ending rules and preserves binary bytes', () => {
    const fixture = makeFixture()
    try {
      const moduleUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/core.mjs')).href
      const source = `const { computeInputFingerprint } = await import(${JSON.stringify(moduleUrl)})
        console.log(computeInputFingerprint({ metadata: null }))`
      write(fixture.root, 'src/input.txt', 'first\nsecond\n')
      const binaryPath = join(fixture.root, 'assets', 'image.png')
      mkdirSync(join(fixture.root, 'assets'), { recursive: true })
      writeFileSync(binaryPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x81, 0xff]))
      git(fixture.root, 'add', '.')
      const lf = runModule(fixture.root, source).stdout.trim()
      write(fixture.root, 'src/input.txt', 'first\r\nsecond\r\n')
      const crlf = runModule(fixture.root, source).stdout.trim()
      expect(crlf).toBe(lf)
      writeFileSync(binaryPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x82, 0xff]))
      expect(runModule(fixture.root, source).stdout.trim()).not.toBe(lf)
    } finally {
      fixture.cleanup()
    }
  })
})
