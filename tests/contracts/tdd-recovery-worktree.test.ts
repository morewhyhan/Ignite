import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { tddTestFingerprint } from '../../scripts/ignite/tdd.mjs'
import { commitAll, git, makeFixture, planContent, read, write, runCli } from './ignite-fixture'

const recoveryTest = 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'

function recoveryFixture() {
  const fixture = makeFixture()
  write(fixture.root, 'src/example.txt', 'before implementation\n')
  const before = commitAll(fixture.root, 'before implementation')
  write(fixture.root, 'src/example.txt', 'implemented\n')
  write(
    fixture.root,
    'docs/plans/fixture.md',
    planContent(fixture.baseCommit, {
      verification_contract: 2,
      write_scope: ['src/', 'tests/', 'docs/'],
      acceptance: [
        {
          id: 'AC-TEST-001',
          tests: [recoveryTest],
          required_layers: ['unit'],
          checks: [{ test: recoveryTest, layer: 'unit' }],
        },
      ],
      tasks: [
        { id: 'implement', phase: 'implement', acceptance: ['AC-TEST-001'], scope: ['src/'] },
      ],
      tdd_evidence: [],
    }),
  )
  commitAll(fixture.root, 'implemented')
  const prepared = runCli(
    fixture.root,
    'tdd',
    'recover',
    '--plan',
    'IGT-900',
    '--ac',
    'AC-TEST-001',
    '--from',
    before,
    '--restore',
    'src/example.txt',
  )
  expect(prepared.status, prepared.stderr).toBe(0)
  const workspace: string = JSON.parse(prepared.stdout).workspace
  const recoveryCommit = git(workspace, 'rev-parse', 'HEAD')
  const fingerprint = tddTestFingerprint(
    read(workspace, 'tests/contracts/sample.test.ts'),
    'AC-TEST-001',
    '[AC-TEST-001] validates current evidence',
  )
  if (!fingerprint) throw new Error('Fixture requires a real acceptance case.')
  // Synthetic receipt tests import validation only; it is never project red evidence.
  const record = {
    ...fingerprint,
    run_id: 'tdd-20261013000000-abcdef',
    plan_id: 'IGT-900',
    acceptance_id: 'AC-TEST-001',
    test: recoveryTest,
    layer: 'unit',
    status: 'assertion-failed',
    red_commit: recoveryCommit,
    output_sha256: 'a'.repeat(64),
    executor: 'ignite-tdd-runner',
  }
  const receipt = `docs/others/evidence/tdd/IGT-900/${record.run_id}.json`
  return { ...fixture, workspace, record, receipt }
}

describe('Isolated TDD recovery', () => {
  it('[AC-EXECUTION-044] restores the declared first-red baseline across independent implementation slices', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'src/alpha.txt', 'baseline alpha\n')
      write(fixture.root, 'src/beta.txt', 'baseline beta\n')
      const before = commitAll(fixture.root, 'two baseline slices')
      write(fixture.root, 'src/alpha.txt', 'implemented alpha\n')
      write(fixture.root, 'src/beta.txt', 'implemented beta\n')
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          task_contract: 2,
          verification_contract: 2,
          write_scope: ['src/', 'tests/', 'docs/'],
          tdd_evidence: [],
          tasks: [
            { id: 'A', phase: 'implement', acceptance: ['AC-TEST-001'], scope: ['src/alpha.txt'] },
            { id: 'B', phase: 'implement', acceptance: ['AC-TEST-002'], scope: ['src/beta.txt'] },
          ],
        }),
      )
      commitAll(fixture.root, 'implemented two independent slices')
      const recovered = runCli(
        fixture.root,
        'tdd',
        'recover',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--from',
        before,
        '--restore',
        'src/alpha.txt,src/beta.txt',
      )
      expect(recovered.status, '[AC-EXECUTION-044] target').toBe(0)
      const packet = JSON.parse(recovered.stdout)
      expect(packet.first_red_baseline).toBe(true)
      expect(read(packet.workspace, 'src/alpha.txt')).toBe('baseline alpha\n')
      expect(read(packet.workspace, 'src/beta.txt')).toBe('baseline beta\n')
      expect(read(fixture.root, 'src/beta.txt')).toBe('implemented beta\n')
    } finally {
      fixture.cleanup()
    }
  })
  it('[AC-EXECUTION-044] prepares recovery without changing the live checkout', () => {
    const fixture = makeFixture()
    try {
      write(fixture.root, 'src/example.txt', 'before implementation\n')
      const before = commitAll(fixture.root, 'before implementation')
      write(fixture.root, 'src/example.txt', 'implemented\n')
      const metadata = {
        id: 'IGT-900',
        status: 'active',
        base_commit: fixture.baseCommit,
        write_scope: ['src/', 'tests/contracts/sample.test.ts'],
        acceptance: [
          { id: 'AC-TEST-001', tests: ['tests/contracts/sample.test.ts::[AC-TEST-001]'] },
        ],
        tasks: [
          { id: 'implement', phase: 'implement', acceptance: ['AC-TEST-001'], scope: ['src/'] },
        ],
        tdd_evidence: [],
      }
      write(fixture.root, 'docs/plans/fixture.md', planContent(fixture.baseCommit, metadata))
      const current = commitAll(fixture.root, 'implemented')
      const invocation = runCli(
        fixture.root,
        'tdd',
        'recover',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--from',
        before,
        '--restore',
        'src/example.txt',
      )
      expect(invocation.status, invocation.stderr).toBe(0)
      const result = JSON.parse(invocation.stdout)
      expect(read(fixture.root, 'src/example.txt')).toBe('implemented\n')
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(current)
      expect(read(result.workspace, 'src/example.txt')).toBe('before implementation\n')
      expect(read(result.workspace, 'tests/contracts/sample.test.ts')).toBe(
        read(fixture.root, 'tests/contracts/sample.test.ts'),
      )
      expect(result.evidence_created).toBe(false)
      expect(result.source_commit).toBe(before)
      expect(git(result.workspace, 'status', '--porcelain')).toBe('')
      const invalid = runCli(
        fixture.root,
        'tdd',
        'recover',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--from',
        before,
        '--restore',
        '../README.md',
      )
      expect(invalid.status).not.toBe(0)
      git(fixture.root, 'worktree', 'remove', result.workspace)
      expect(git(fixture.root, 'status', '--porcelain')).toBe('')
      expect(join(result.workspace, 'src/example.txt')).not.toBe(
        join(fixture.root, 'src/example.txt'),
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-044] imports a matching receipt while preserving live code and red ancestry', () => {
    const fixture = recoveryFixture()
    try {
      write(fixture.workspace, fixture.receipt, JSON.stringify(fixture.record))
      const receiptCommit = commitAll(fixture.workspace, 'synthetic import fixture')
      const result = runCli(
        fixture.root,
        'tdd',
        'recover',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--import',
        fixture.workspace,
      )
      expect(result.status, result.stderr).toBe(0)
      expect(read(fixture.root, 'src/example.txt')).toBe('implemented\n')
      expect(JSON.parse(read(fixture.root, fixture.receipt))).toEqual(fixture.record)
      expect(read(fixture.root, 'docs/plans/fixture.md')).toContain(fixture.record.run_id)
      expect(git(fixture.root, 'merge-base', '--is-ancestor', receiptCommit, 'HEAD')).toBe('')
      expect(JSON.parse(result.stdout).evidence_created).toBe(false)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-044] rejects a receipt when the live acceptance case has changed', () => {
    const fixture = recoveryFixture()
    try {
      write(fixture.workspace, fixture.receipt, JSON.stringify(fixture.record))
      commitAll(fixture.workspace, 'synthetic import fixture')
      write(
        fixture.root,
        'tests/contracts/sample.test.ts',
        read(fixture.root, 'tests/contracts/sample.test.ts').replace('toBe(true)', 'toBe(false)'),
      )
      const current = commitAll(fixture.root, 'correct acceptance case')
      const result = runCli(
        fixture.root,
        'tdd',
        'recover',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--import',
        fixture.workspace,
      )
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('live acceptance test has changed')
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(current)
      expect(read(fixture.root, 'src/example.txt')).toBe('implemented\n')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-044] rejects receipts from outside the prepared recovery ancestry', () => {
    const fixture = recoveryFixture()
    try {
      write(
        fixture.workspace,
        fixture.receipt,
        JSON.stringify({ ...fixture.record, red_commit: fixture.baseCommit }),
      )
      commitAll(fixture.workspace, 'synthetic invalid import fixture')
      const current = git(fixture.root, 'rev-parse', 'HEAD')
      const result = runCli(
        fixture.root,
        'tdd',
        'recover',
        '--plan',
        'IGT-900',
        '--ac',
        'AC-TEST-001',
        '--import',
        fixture.workspace,
      )
      expect(result.status).not.toBe(0)
      expect(result.stderr).toContain('Commit the actual native red receipt')
      expect(git(fixture.root, 'rev-parse', 'HEAD')).toBe(current)
    } finally {
      fixture.cleanup()
    }
  })
})
