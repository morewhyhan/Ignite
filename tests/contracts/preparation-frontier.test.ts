import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { planningDiagnostics } from '../../scripts/ignite/preparation.mjs'
import { makeFixture, planContent, read, runCli, repositoryRoot, write } from './ignite-fixture'

function planBody() {
  const template = readFileSync(join(repositoryRoot, 'docs/plans/_template.md'), 'utf8')
  return [...template.matchAll(/^## .+$/gm)]
    .map(([heading]) => `${heading}\n\nFixture preparation.\n`)
    .join('\n')
}

it('[AC-EXECUTION-053] checks Feature headings and local links for every declared REQ during preparation', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/plans/_template.md',
      readFileSync(join(repositoryRoot, 'docs/plans/_template.md'), 'utf8'),
    )
    write(
      fixture.root,
      'docs/features/product.md',
      `# Product\n\n## 业务规则\n\n- R1（REQ-TEST-001）：The execution result is current.\n\n## 验收标准\n\n- AC-TEST-001（REQ-TEST-001）：Given a Plan When it is validated Then stale evidence is rejected.\n\nSee [missing guide](./missing-guide.md).\n`,
    )
    const metadata = {
      schema: 2,
      id: 'IGT-900',
      release: 'fixture-v1',
      status: 'draft',
      outcome: 'Prepare the execution contract.',
      contract_version: 2,
      verification_contract: 2,
      change_type: '存量改动',
      base_commit: fixture.baseCommit,
      goals: [{ text: 'Prepare the execution contract.', requirements: ['REQ-TEST-001'] }],
      constraints: ['Keep preparation read-only.'],
      non_goals: ['Implementation.'],
      authorization: { source: 'Fixture request.' },
      deliverables: ['A prepared Plan.'],
      remaining_work: [],
      requirements: ['REQ-TEST-001'],
      acceptance: [
        {
          id: 'AC-TEST-001',
          tests: ['tests/contracts/missing.test.ts::[AC-TEST-001]'],
          required_layers: ['unit'],
          checks: [
            {
              test: 'tests/contracts/missing.test.ts::[AC-TEST-001]',
              layer: 'unit',
            },
          ],
        },
      ],
      verification_requirements: ['unit'],
      write_scope: ['docs/', 'tests/'],
      depends_on: [],
      dependency_contracts: [],
      shared_files: [],
      handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
      tasks: [],
      tdd_evidence: [],
      required_evidence: ['check-integration'],
      evidence: [],
      open_questions: [],
      updated_at: '2026-10-13',
    }
    write(
      fixture.root,
      'docs/plans/fixture.md',
      planContent(fixture.baseCommit, metadata) + planBody(),
    )
    write(
      fixture.root,
      'docs/plans/releases/fixture-v1.json',
      JSON.stringify({
        schema: 2,
        id: 'fixture-v1',
        coverage_version: 2,
        verification_contract: 2,
        plan_ids: ['IGT-900'],
        scope: [
          {
            id: 'GOAL-1',
            text: 'Prepare the execution contract.',
            source: 'Fixture request.',
            requirements: ['REQ-TEST-001'],
            acceptance: ['AC-TEST-001'],
            plan_ids: ['IGT-900'],
            disposition: 'included',
            reason: '',
            authorization: '',
          },
        ],
        must_pass: ['check-release'],
        evidence: [],
        integrated_commit: null,
        excluded: [],
        updated_at: '2026-10-13',
      }),
    )

    const result = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(result.status).not.toBe(0)
    const invalidReport = JSON.parse(result.stdout)
    expect(invalidReport.failures).toContain(
      'docs/features/product.md: missing heading "## 背景与目标"',
    )
    expect(invalidReport.failures).toContain(
      'docs/features/product.md: broken local link ./missing-guide.md',
    )

    write(fixture.root, 'docs/features/guide.md', '# Feature guide\n')
    write(
      fixture.root,
      'docs/features/product.md',
      `# Product\n\n## 背景与目标\n\nFixture.\n\n## 业务规则\n\n- R1（REQ-TEST-001）：The execution result is current.\n\n## 验收标准\n\n- AC-TEST-001（REQ-TEST-001）：Given a Plan When it is validated Then stale evidence is rejected.\n\nSee [guide](./guide.md).\n`,
    )
    const validFeature = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(validFeature.status, validFeature.stdout + validFeature.stderr).toBe(0)
    expect(JSON.parse(validFeature.stdout).failures).toEqual([])
  } finally {
    fixture.cleanup()
  }
})

it('[AC-EXECUTION-049] reports parallel candidates only when declared scopes, ACs, owners and interfaces support them', () => {
  type DiagnosticTask = {
    id: string
    phase: string
    scope?: string[]
    acceptance?: string[]
    owner?: string
    depends_on?: string[]
  }
  type InterfaceContract = { owner: string; consumer: string; contract: string }
  type SharedFile = { path: string; owner: string; mode: 'exclusive' | 'integrator' }
  const implementationTask = (
    id: string,
    scope: string[],
    acceptance: string[],
    owner: string,
    depends_on: string[] = [],
  ) => ({ id, scope, acceptance, owner, depends_on, phase: 'implement' })
  const diagnostics = (
    tasks: DiagnosticTask[],
    interfaces: InterfaceContract[] = [],
    shared_files: SharedFile[] = [],
  ) => planningDiagnostics({ metadata: { tasks, handoff: { interfaces }, shared_files } })

  const candidate = diagnostics(
    [
      implementationTask('A', ['src/modules/alpha/'], ['AC-ALPHA-001'], 'module-worker', ['R']),
      implementationTask('B', ['src/server/routes/beta/'], ['AC-ALPHA-001'], 'api-worker', ['R']),
      { id: 'R', phase: 'red', depends_on: [] },
    ],
    [
      {
        owner: 'module-worker',
        consumer: 'api-worker',
        contract: 'The API input and response shape is agreed.',
      },
    ],
  )
  expect(candidate).toContainEqual(
    expect.objectContaining({
      code: 'parallel-readiness',
      state: 'candidate',
      shared_acceptance: true,
      blocking: false,
    }),
  )
  expect(
    diagnostics([
      implementationTask(
        'CRUD',
        ['src/modules/resource/', 'src/server/api/routes/resource/', 'src/app/resource/'],
        ['AC-RESOURCE-001'],
        'assigned-worker',
      ),
    ]),
  ).toContainEqual(
    expect.objectContaining({
      code: 'scope-split-review',
      task_ids: ['CRUD'],
      blocking: false,
    }),
  )

  const overlapping = diagnostics([
    implementationTask('A', ['src/modules/alpha/'], ['AC-ALPHA-001'], 'module-worker'),
    implementationTask('B', ['src/modules/alpha/detail/'], ['AC-ALPHA-002'], 'detail-worker'),
  ])
  expect(overlapping).toContainEqual(
    expect.objectContaining({ code: 'parallel-readiness', state: 'scope-overlap' }),
  )
  expect(overlapping).not.toContainEqual(expect.objectContaining({ state: 'candidate' }))

  const unknownInterface = diagnostics([
    implementationTask('A', ['src/modules/alpha/'], ['AC-ALPHA-001'], 'module-worker'),
    implementationTask('B', ['src/server/routes/beta/'], ['AC-BETA-001'], 'api-worker'),
  ])
  expect(unknownInterface).toContainEqual(
    expect.objectContaining({ code: 'parallel-readiness', state: 'interface-unknown' }),
  )
  expect(unknownInterface).not.toContainEqual(expect.objectContaining({ state: 'candidate' }))

  expect(
    diagnostics([
      implementationTask('A', ['src/modules/alpha/'], ['AC-ALPHA-001'], 'module-worker', ['B']),
      implementationTask('B', ['src/server/routes/beta/'], ['AC-BETA-001'], 'api-worker'),
    ]),
  ).toEqual([])

  const sharedFileConflict = diagnostics(
    [
      implementationTask('A', ['src/server/api/index.ts'], ['AC-API-001'], 'api-worker'),
      implementationTask('B', ['src/server/api/index.ts'], ['AC-API-001'], 'other-worker'),
    ],
    [{ owner: 'api-worker', consumer: 'other-worker', contract: 'API contract.' }],
    [{ path: 'src/server/api/index.ts', owner: 'integrator', mode: 'integrator' }],
  )
  expect(sharedFileConflict).toContainEqual(
    expect.objectContaining({ code: 'parallel-readiness', state: 'scope-overlap' }),
  )
  expect(sharedFileConflict).not.toContainEqual(expect.objectContaining({ state: 'candidate' }))
})
