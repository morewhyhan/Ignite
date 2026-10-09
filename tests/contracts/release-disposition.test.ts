import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { makeFixture, planContent, repositoryRoot, write } from './ignite-fixture'

type Disposition = 'included' | 'deferred' | 'excluded'

const diagnostics = z.object({ scope: z.array(z.string()), coverage: z.array(z.string()) })
const stateUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/state.mjs')).href
const contractUrl = pathToFileURL(
  join(repositoryRoot, 'scripts/ignite/execution-contract.mjs'),
).href

function releaseFor(disposition: Disposition) {
  return {
    schema: 2,
    id: 'fixture-v1',
    coverage_version: 2,
    verification_contract: 2,
    plan_ids: ['IGT-900', 'IGT-901'],
    excluded: [],
    scope: [
      {
        id: 'GOAL-PRIMARY',
        text: 'Deliver the current execution result',
        source: 'User request: deliver the result and account for the remaining boundary',
        requirements: ['REQ-TEST-001'],
        acceptance: ['AC-TEST-001'],
        plan_ids: ['IGT-900'],
        disposition: 'included',
        reason: '',
        authorization: '',
      },
      {
        id: 'GOAL-BOUNDARY',
        text: 'Deliver the independent execution boundary',
        source: 'User request: deliver the result and account for the remaining boundary',
        requirements: ['REQ-TEST-001'],
        acceptance: ['AC-TEST-002'],
        plan_ids: disposition === 'included' ? ['IGT-900'] : [],
        disposition,
        reason:
          disposition === 'deferred'
            ? 'The external account is unavailable'
            : 'User reduced the scope',
        authorization:
          disposition === 'excluded'
            ? 'User explicitly removed the boundary from this release'
            : '',
      },
    ],
  }
}

function fixtureFor(disposition: Disposition) {
  const fixture = makeFixture()
  write(
    fixture.root,
    'docs/features/product.md',
    `# Execution result
## 背景与目标
Deliver a result with an independently accountable boundary.
## 业务规则
- R1（REQ-TEST-001）：The result and its boundary must both be accounted for.
- R2（REQ-OTHER-001）：The unrelated result has its own owner.
## 验收标准
- AC-TEST-001（REQ-TEST-001）：Given a request When it executes Then the result exists.
- AC-TEST-002（REQ-TEST-001）：Given a request When its boundary executes Then the boundary holds.
- AC-OTHER-001（REQ-OTHER-001）：Given an unrelated request When it executes Then its result exists.
`,
  )
  write(
    fixture.root,
    'docs/plans/fixture.md',
    planContent(fixture.baseCommit, {
      acceptance: (disposition === 'included'
        ? ['AC-TEST-001', 'AC-TEST-002']
        : ['AC-TEST-001']
      ).map((id) => ({ id })),
    }),
  )
  write(
    fixture.root,
    'docs/plans/unrelated.md',
    planContent(fixture.baseCommit, {
      id: 'IGT-901',
      status: 'draft',
      requirements: ['REQ-OTHER-001'],
      acceptance: [{ id: 'AC-OTHER-001' }],
    }),
  )
  return fixture
}

function validate(root: string, release: ReturnType<typeof releaseFor>) {
  write(root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release, null, 2))
  const source = `import { readFileSync } from 'node:fs';
import { listPlans, validateReleaseAcceptanceCoverage } from ${JSON.stringify(stateUrl)};
import { validateReleaseScope } from ${JSON.stringify(contractUrl)};
const release = JSON.parse(readFileSync('docs/plans/releases/fixture-v1.json', 'utf8'));
const plans = new Map(listPlans().map(plan => [plan.metadata.id, plan]));
console.log(JSON.stringify({ scope: validateReleaseScope(release, plans), coverage: validateReleaseAcceptanceCoverage(release, plans) }));`
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
    env: { ...process.env, IGNITE_ROOT: root },
  })
  expect(result.status, result.stderr || result.stdout).toBe(0)
  return diagnostics.parse(JSON.parse(result.stdout))
}

describe('Release acceptance dispositions', () => {
  it.each<Disposition>(['included', 'deferred', 'excluded'])(
    '[AC-EXECUTION-001] accepts complete %s scope and rejects unknown, misplaced and omitted acceptance',
    (disposition) => {
      const fixture = fixtureFor(disposition)
      try {
        const release = releaseFor(disposition)
        expect(validate(fixture.root, release)).toEqual({ scope: [], coverage: [] })

        const unknown = releaseFor(disposition)
        unknown.scope[1].acceptance = ['AC-UNKNOWN-001']
        expect(validate(fixture.root, unknown).coverage).toContain(
          'GOAL-BOUNDARY: unknown acceptance criterion AC-UNKNOWN-001',
        )

        const omitted = releaseFor(disposition)
        omitted.scope.pop()
        expect(validate(fixture.root, omitted).coverage).toContain(
          'REQ-TEST-001: AC-TEST-002 is not included, deferred or explicitly excluded',
        )

        const misplaced = releaseFor(disposition)
        misplaced.scope[1].plan_ids = ['IGT-901']
        const misplacedResult = validate(fixture.root, misplaced)
        if (disposition === 'included') {
          expect(misplacedResult.scope).toContain(
            'GOAL-BOUNDARY: AC-TEST-002 has no assigned Plan acceptance',
          )
          expect(misplacedResult.coverage).toContain(
            'GOAL-BOUNDARY: AC-TEST-002 has no assigned Plan acceptance',
          )
        } else {
          expect(misplacedResult.coverage).toContain(
            'GOAL-BOUNDARY: deferred or excluded acceptance cannot be assigned to a Plan',
          )
        }

        if (disposition === 'excluded') {
          const unauthorized = releaseFor(disposition)
          unauthorized.scope[1].authorization = ''
          expect(validate(fixture.root, unauthorized).scope).toContain(
            'GOAL-BOUNDARY: exclusions need the user authorization source and reason',
          )
        }
        if (disposition === 'deferred') {
          const unexplained = releaseFor(disposition)
          unexplained.scope[1].reason = ''
          expect(validate(fixture.root, unexplained).scope).toContain(
            'GOAL-BOUNDARY: deferred goals need a reason and remain outstanding',
          )
        }
      } finally {
        fixture.cleanup()
      }
    },
  )
})
