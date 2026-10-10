import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { validateExecutionContract } from '../../scripts/ignite/execution-contract.mjs'
import { acceptanceTestSource } from '../../scripts/ignite/source-analysis.mjs'
import { commitAll, git, makeFixture, planContent, read, runCli, write } from './ignite-fixture'

const acceptanceId = 'AC-TEST-001'
const testReference = 'tests/contracts/sample.test.ts::[AC-TEST-001]'
const orderedTasks = [
  { id: 'prepare', title: 'Confirm scope', phase: 'prepare', status: 'done' },
  {
    id: 'red',
    title: 'Record failing behavior',
    phase: 'red',
    acceptance: [acceptanceId],
    status: 'todo',
  },
  {
    id: 'implement',
    title: 'Implement behavior',
    phase: 'implement',
    acceptance: [acceptanceId],
    status: 'todo',
  },
  { id: 'verify', title: 'Verify result', phase: 'verify', status: 'todo' },
]

function contract(baseCommit: string) {
  return {
    execution_contract: 1,
    verification_contract: 2,
    task_contract: 1,
    status: 'active',
    base_commit: baseCommit,
    goals: [{ text: 'Prove the promised result', requirements: ['REQ-TEST-001'] }],
    constraints: ['Keep the existing behavior'],
    non_goals: ['Change product scope'],
    authorization: { source: 'User requests implementation' },
    deliverables: ['README.md'],
    remaining_work: [],
    open_questions: [],
    tasks: orderedTasks,
    verification_requirements: ['unit'],
    dependency_contracts: [],
    shared_files: [],
    handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
    acceptance: [
      {
        id: acceptanceId,
        tests: [testReference],
        required_layers: ['unit'],
        checks: [{ test: testReference, layer: 'unit' }],
      },
    ],
    tdd_evidence: [],
  }
}

describe('method recovery', () => {
  it('[AC-METHOD-019] rejects changed live red assertions before implementation', () => {
    const fixture = makeFixture()
    try {
      const source = read(fixture.root, 'tests/contracts/sample.test.ts')
      const redCommit = git(fixture.root, 'rev-parse', 'HEAD')
      const runId = 'tdd-20261011000000-112233'
      write(
        fixture.root,
        `docs/others/evidence/tdd/IGT-900/${runId}.json`,
        JSON.stringify({
          schema: 2,
          test_scope: 'acceptance-case',
          run_id: runId,
          plan_id: 'IGT-900',
          acceptance_id: acceptanceId,
          test: testReference,
          red_commit: redCommit,
          status: 'assertion-failed',
          executor: 'ignite-tdd-runner',
          test_sha256: createHash('sha256')
            .update(acceptanceTestSource(source, acceptanceId, '[AC-TEST-001]'))
            .digest('hex'),
          output_sha256: 'a'.repeat(64),
        }),
      )
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          ...contract(fixture.baseCommit),
          tdd_evidence: [{ acceptance_id: acceptanceId, test: testReference, run_id: runId }],
        }),
      )
      const allowed = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'implement', 'doing')
      expect(allowed.status, allowed.stderr).toBe(0)
      write(
        fixture.root,
        'tests/contracts/sample.test.ts',
        source.replace('expect(true)', 'expect(false)'),
      )
      const before = read(fixture.root, 'docs/plans/fixture.md')
      const denied = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'implement', 'done')
      expect(denied.status, denied.stderr).not.toBe(0)
      expect(denied.stderr).toContain('test changed before green')
      expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
      write(fixture.root, 'tests/contracts/sample.test.ts', source)
      const restored = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'implement', 'done')
      expect(restored.status, restored.stderr).toBe(0)
    } finally {
      fixture.cleanup()
    }
  })
  it('[AC-METHOD-001] reads the current project skill after a wrong discovery path and reports a genuinely missing skill', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        '.ai/pstack/skills/technical-writing/SKILL.md',
        '# Local writing method\nUse this project document owner.\n',
      )
      const result = runCli(
        fixture.root,
        'skill',
        'read',
        'technical-writing',
        '--path',
        'C:/Users/why/.codex/skills/r9/technical-writing/SKILL.md',
      )
      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout).toContain('# Local writing method')
      expect(result.stderr).toContain('Recovered')
      const missing = runCli(fixture.root, 'skill', 'read', 'missing-method')
      expect(missing.status).not.toBe(0)
      expect(missing.stderr).toContain('Required skill missing-method is missing')
      expect(read(fixture.root, '.ai/pstack/skills/technical-writing/SKILL.md')).toContain(
        '# Local writing method',
      )
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-METHOD-002] rejects implementation tasks placed before their red tasks without guessing from titles', () => {
    const metadata = contract('a'.repeat(40))
    const bad = {
      ...metadata,
      tasks: [orderedTasks[0], orderedTasks[2], orderedTasks[1], orderedTasks[3]],
    }
    expect(
      validateExecutionContract(
        { metadata: bad, content: '' },
        () => "it('[AC-TEST-001]', () => {})",
      ),
    ).toContain('implement: place a red task covering AC-TEST-001 before implementation')
    expect(
      validateExecutionContract({ metadata, content: '' }, () => "it('[AC-TEST-001]', () => {})"),
    ).not.toContain('implement: place a red task covering AC-TEST-001 before implementation')
    const incomplete = { ...metadata, tasks: orderedTasks.map(({ phase, ...task }) => task) }
    expect(validateExecutionContract({ metadata: incomplete, content: '' }, () => '')).toContain(
      'prepare: task_contract 1 requires phase prepare|red|implement|verify',
    )
  })

  it('[AC-METHOD-003] refuses to start implementation without valid red proof and allows it after matching proof', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, contract(fixture.baseCommit)),
      )
      const before = read(fixture.root, 'docs/plans/fixture.md')
      const denied = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'implement', 'doing')
      expect(denied.status).not.toBe(0)
      expect(denied.stderr).toContain('requires valid red evidence before implementation')
      expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
      const redCommit = commitAll(fixture.root, 'Record the behavior contract')
      const runId = 'tdd-20261009000000-aabbcc'
      const source = read(fixture.root, 'tests/contracts/sample.test.ts')
      write(
        fixture.root,
        `docs/others/evidence/tdd/IGT-900/${runId}.json`,
        JSON.stringify({
          schema: 1,
          run_id: runId,
          plan_id: 'IGT-900',
          acceptance_id: acceptanceId,
          test: testReference,
          red_commit: redCommit,
          status: 'assertion-failed',
          executor: 'ignite-tdd-runner',
          test_sha256: createHash('sha256').update(source).digest('hex'),
          output_sha256: 'a'.repeat(64),
        }),
      )
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          ...contract(fixture.baseCommit),
          tdd_evidence: [{ acceptance_id: acceptanceId, test: testReference, run_id: runId }],
        }),
      )
      const allowed = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'implement', 'doing')
      expect(allowed.status, allowed.stderr).toBe(0)
      expect(allowed.stdout).toContain('doing')
      write(fixture.root, `docs/others/evidence/tdd/IGT-900/${runId}.json`, '{}')
      const forged = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'implement', 'done')
      expect(forged.status).not.toBe(0)
    } finally {
      fixture.cleanup()
    }
  })
})
