import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { tddTestFingerprint } from '../../scripts/ignite/tdd.mjs'
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

const execution = {
  execution_contract: 1,
  verification_requirements: ['unit'],
  dependency_contracts: [],
  shared_files: [],
  handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
  acceptance: [
    {
      id: 'AC-TEST-001',
      tests: ['tests/contracts/sample.test.ts::[AC-TEST-001]'],
      required_layers: ['unit'],
      checks: [{ test: 'tests/contracts/sample.test.ts::[AC-TEST-001]', layer: 'unit' }],
    },
  ],
}

describe('Execution continuity', () => {
  it('[AC-EXECUTION-044] preserves an unchanged valid red instead of restarting unrelated work', () => {
    const fixture = makeFixture()
    try {
      const test = 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'
      const redCommit = git(fixture.root, 'rev-parse', 'HEAD')
      const runId = 'tdd-20261013000000-abcdef'
      // This synthetic receipt exercises validation only; it is not project red evidence.
      const record = {
        ...tddTestFingerprint(
          read(fixture.root, 'tests/contracts/sample.test.ts'),
          'AC-TEST-001',
          '[AC-TEST-001] validates current evidence',
        ),
        run_id: runId,
        plan_id: 'IGT-900',
        acceptance_id: 'AC-TEST-001',
        test,
        layer: 'unit',
        status: 'assertion-failed',
        red_commit: redCommit,
        output_sha256: 'a'.repeat(64),
        executor: 'ignite-tdd-runner',
      }
      write(fixture.root, `docs/others/evidence/tdd/IGT-900/${runId}.json`, JSON.stringify(record))
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          ...execution,
          verification_contract: 2,
          required_evidence: ['check-integration'],
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: [test],
              required_layers: ['unit'],
              checks: [{ test, layer: 'unit' }],
            },
          ],
          tasks: [
            {
              id: 'R',
              title: 'Record red',
              phase: 'red',
              status: 'done',
              acceptance: ['AC-TEST-001'],
            },
            {
              id: 'I',
              title: 'Implement',
              phase: 'implement',
              status: 'doing',
              acceptance: ['AC-TEST-001'],
            },
          ],
          tdd_evidence: [{ acceptance_id: 'AC-TEST-001', test, run_id: runId }],
        }),
      )
      runCli(fixture.root, 'plan', 'refresh', 'IGT-900')
      const before = read(fixture.root, 'docs/plans/fixture.md')
      const unchanged = runCli(
        fixture.root,
        'tdd',
        'restart',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--reason',
        'Changed an unrelated browser case',
      )
      expect(unchanged.status, unchanged.stderr).toBe(0)
      expect(JSON.parse(unchanged.stdout).restarted).toBe(false)
      expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
      write(
        fixture.root,
        'tests/contracts/sample.test.ts',
        read(fixture.root, 'tests/contracts/sample.test.ts').replace(
          'expect(true).toBe(true)',
          'expect(2).toBe(3)',
        ),
      )
      const changed = runCli(
        fixture.root,
        'tdd',
        'restart',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--reason',
        'Correct target assertion',
      )
      expect(changed.status, changed.stderr).toBe(0)
      expect(JSON.parse(changed.stdout).restarted).toBe(true)
    } finally {
      fixture.cleanup()
    }
  })
  it('[AC-EXECUTION-048] reviews identical working and committed inputs as the same delivery', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'docs/plans/fixture.md', planContent(fixture.baseCommit))
      write(fixture.root, 'README.md', '# changed behavior\n')
      const commit = commitAll(fixture.root, 'delivery input')
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `
        import {findPlan,planReviewContext} from ${JSON.stringify(join(repositoryRoot, 'scripts/ignite/state.mjs'))};
        const plan=findPlan('IGT-900');
        const current=planReviewContext(plan,'delivery');
        const historical=planReviewContext(plan,'delivery',${JSON.stringify(commit)});
        console.log(JSON.stringify({current,historical}));
      `,
        ],
        { env: { ...process.env, IGNITE_ROOT: fixture.root }, encoding: 'utf8' },
      )
      expect(result.status, result.stderr).toBe(0)
      const { current, historical } = JSON.parse(result.stdout)
      expect(
        historical.inputs.find((entry: { path: string }) => entry.path === 'README.md').identity,
      ).toEqual(expect.stringMatching(/^[0-9a-f]{40}$/))
      expect(historical.subject_fingerprint).toBe(current.subject_fingerprint)
      write(fixture.root, 'README.md', '# later different behavior\n')
      const changed = runCli(fixture.root, 'review', 'context', 'IGT-900', 'delivery')
      expect(JSON.parse(changed.stdout).subject_fingerprint).not.toBe(current.subject_fingerprint)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-049] keeps independent work visible while another task is running', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          ...execution,
          tasks: [
            { id: 'API', title: 'API work', status: 'doing' },
            { id: 'UI', title: 'UI work', status: 'todo' },
          ],
        }),
      )
      const release = JSON.parse(read(fixture.root, 'docs/plans/releases/fixture-v1.json'))
      release.coverage_version = 1
      release.scope = [
        {
          id: 'G1',
          text: 'Execution result is current',
          source: 'fixture request',
          requirements: ['REQ-TEST-001'],
          plan_ids: ['IGT-900'],
          disposition: 'included',
        },
      ]
      write(fixture.root, 'docs/plans/releases/fixture-v1.json', JSON.stringify(release))
      const refreshed = runCli(fixture.root, 'plan', 'refresh', 'IGT-900')
      expect(refreshed.status, refreshed.stderr).toBe(0)
      const result = runCli(fixture.root, 'next', '--plan', 'IGT-900')
      expect(result.status, result.stderr).toBe(0)
      const action = JSON.parse(result.stdout).next_action
      expect(action.kind, JSON.stringify(action)).toBe('continue-task')
      expect(action.task_ids).toEqual(['API', 'UI'])
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-049] carries task source and verification ownership in the handoff', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          tasks: [
            {
              id: 'API',
              title: 'API work',
              phase: 'implement',
              status: 'todo',
              scope: ['src/server/'],
              acceptance: ['AC-TEST-001'],
            },
          ],
        }),
      )
      const result = runCli(fixture.root, 'next', '--plan', 'IGT-900', '--task', 'API', '--handoff')
      expect(result.status, result.stderr).toBe(0)
      const packet = JSON.parse(result.stdout)
      expect(packet.context.features).toEqual(['docs/features/product.md'])
      expect(packet.rules).toContain('docs/standards/testing.md')
      expect(packet.rules).toContain('docs/others/evidence/README.md')
      expect(packet.rules).toContain('docs/designs/README.md')
      expect(packet.coordinator_only).toContain('integration')
      expect(packet.commands.integration).toBeUndefined()
    } finally {
      fixture.cleanup()
    }
  })
})
