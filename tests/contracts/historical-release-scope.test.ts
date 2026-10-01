import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'
import { commitAll, makeFixture, repositoryRoot, write } from './ignite-fixture'

it('[AC-EXECUTION-038] validates completed Release coverage at its tested specification and rejects gaps and unfinished snapshots', () => {
  const fixture = makeFixture()
  try {
    write(
      fixture.root,
      'docs/features/product.md',
      `# Fixture
## 背景与目标
Historical capabilities.
## 业务规则
- R1（REQ-TEST-001）：The original result has two independent boundaries.
## 验收标准
- AC-TEST-001（REQ-TEST-001）：Given an original task When it runs Then its result exists.
- AC-TEST-002（REQ-TEST-001）：Given an original task When it runs Then its boundary holds.
`,
    )
    const tested = commitAll(fixture.root, 'Capture the historical specification')
    write(
      fixture.root,
      'docs/features/product.md',
      `# Fixture
## 背景与目标
Replacement capability.
## 业务规则
- R1（REQ-CURRENT-001）：Current behavior replaces the original capability.
## 验收标准
- AC-CURRENT-001（REQ-CURRENT-001）：Given a new task When it runs Then the new behavior holds.
`,
    )
    const acceptance = ['AC-TEST-001', 'AC-TEST-002']
    const release = {
      coverage_version: 2,
      plan_ids: ['IGT-900'],
      integrated_commit: tested,
      scope: [
        {
          id: 'GOAL-001',
          requirements: ['REQ-TEST-001'],
          acceptance,
          disposition: 'included',
          plan_ids: ['IGT-900'],
        },
      ],
    }
    const metadata = {
      id: 'IGT-900',
      status: 'done',
      integrated_commit: tested,
      requirements: ['REQ-TEST-001'],
      acceptance: acceptance.map((id) => ({ id })),
    }
    const moduleUrl = pathToFileURL(join(repositoryRoot, 'scripts/ignite/state.mjs')).href
    const source = `import { validateReleaseAcceptanceCoverage } from ${JSON.stringify(moduleUrl)};
const { release, plans } = JSON.parse(process.argv[1]);
console.log(JSON.stringify(validateReleaseAcceptanceCoverage(release, new Map(plans))));`
    function validate(
      value: Omit<typeof release, 'integrated_commit'> & { integrated_commit: string | null },
      state = metadata,
      missing = false,
    ) {
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          source,
          JSON.stringify({
            release: value,
            plans: missing ? [] : [['IGT-900', { metadata: state }]],
          }),
        ],
        {
          cwd: fixture.root,
          encoding: 'utf8',
          windowsHide: true,
          env: { ...process.env, IGNITE_ROOT: fixture.root },
        },
      )
      expect(result.status, result.stderr || result.stdout).toBe(0)
      return JSON.parse(result.stdout) as string[]
    }
    expect(validate(release)).toEqual([])
    expect(
      validate({ ...release, scope: [{ ...release.scope[0], acceptance: ['AC-TEST-001'] }] }),
    ).toContain('REQ-TEST-001: AC-TEST-002 is not included, deferred or explicitly excluded')
    expect(
      validate({
        ...release,
        scope: [
          {
            ...release.scope[0],
            requirements: ['REQ-MISSING-001'],
            acceptance: ['AC-MISSING-001'],
          },
        ],
      }),
    ).toContain('GOAL-001: unknown acceptance criterion AC-MISSING-001')
    expect(validate(release, { ...metadata, status: 'active' })).toContain(
      'release scope references unknown requirement REQ-TEST-001',
    )
    expect(validate({ ...release, integrated_commit: null })).toContain(
      'release scope references unknown requirement REQ-TEST-001',
    )
    expect(validate(release, metadata, true)).toEqual(['release references missing Plan IGT-900'])
  } finally {
    fixture.cleanup()
  }
})
