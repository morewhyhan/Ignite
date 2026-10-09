import { expect, it } from 'vitest'
import { makeFixture, planContent, read, runCli, write } from './ignite-fixture'

it("[AC-METHOD-012] rejects a goal that borrows another goal's acceptance to cover its requirement", () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/features/product.md',
      read(fixture.root, 'docs/features/product.md').replace(
        '## 验收标准',
        '- R2（REQ-TEST-002）：Saved data survives refresh.\n\n## 验收标准',
      ) + '\n- AC-TEST-002（REQ-TEST-002）：Given saved data When refreshed Then it remains.\n',
    )
    write(
      fixture.root,
      'tests/contracts/sample.test.ts',
      read(fixture.root, 'tests/contracts/sample.test.ts') +
        "it('[AC-TEST-002] persists across refresh', () => { expect(true).toBe(true) })\n",
    )
    write(
      fixture.root,
      'docs/plans/fixture.md',
      planContent(fixture.baseCommit, {
        status: 'draft',
        requirements: ['REQ-TEST-001', 'REQ-TEST-002'],
        acceptance: [
          { id: 'AC-TEST-001', tests: ['tests/contracts/sample.test.ts::[AC-TEST-001]'] },
          { id: 'AC-TEST-002', tests: ['tests/contracts/sample.test.ts::[AC-TEST-002]'] },
        ],
      }),
    )
    const release = {
      schema: 2,
      id: 'fixture-v1',
      coverage_version: 2,
      plan_ids: ['IGT-900'],
      scope: [
        {
          id: 'GOAL-1',
          text: 'Current result and persistence',
          source: 'User',
          requirements: ['REQ-TEST-001', 'REQ-TEST-002'],
          acceptance: ['AC-TEST-001'],
          plan_ids: ['IGT-900'],
          disposition: 'included',
          reason: '',
          authorization: '',
        },
        {
          id: 'GOAL-2',
          text: 'Persistence',
          source: 'User',
          requirements: ['REQ-TEST-002'],
          acceptance: ['AC-TEST-002'],
          plan_ids: ['IGT-900'],
          disposition: 'included',
          reason: '',
          authorization: '',
        },
      ],
      must_pass: ['check-integration', 'check-release'],
      excluded: [],
      updated_at: '2026-09-06',
    }
    write(fixture.root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release))
    const invalid = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(invalid.status, invalid.stdout + invalid.stderr).not.toBe(0)
    expect(invalid.stdout).toContain('GOAL-1: REQ-TEST-002 has no matching acceptance in this goal')
    release.scope[0].requirements = ['REQ-TEST-001']
    write(fixture.root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release))
    const valid = runCli(fixture.root, 'plan', 'validate', 'IGT-900', '--prepare')
    expect(valid.status, valid.stdout + valid.stderr).toBe(0)
    expect(valid.stdout).toContain('"status": "prepared"')
  } finally {
    fixture.cleanup()
  }
})
