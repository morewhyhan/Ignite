import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderPlanProgressContent } from '../../scripts/ignite/execution-contract.mjs'
import {
  commitAll,
  makeFixture,
  planContent,
  read,
  repositoryRoot,
  runCli,
  write,
} from './ignite-fixture'

function focusedPlan(root: string, baseCommit: string, overrides: Record<string, unknown> = {}) {
  const resolvedOverrides =
    typeof overrides.blocker === 'string'
      ? {
          ...overrides,
          blocker: {
            id: 'BLOCKER-001',
            owner: 'fixture',
            reason: overrides.blocker,
            resume_action: 'Provide the required external account',
          },
        }
      : overrides
  const content = planContent(baseCommit, {
    contract_version: 2,
    execution_contract: 1,
    verification_contract: 1,
    goals: [{ text: 'Data survives a reload', requirements: ['REQ-TEST-001'] }],
    constraints: ['Keep existing ownership checks'],
    non_goals: ['Redesign the layout'],
    authorization: { source: 'Implement the requested persistence fix' },
    deliverables: ['A persistent user operation'],
    remaining_work: [],
    verification_requirements: ['unit'],
    acceptance: [
      {
        id: 'AC-TEST-001',
        tests: ['tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence'],
        required_layers: ['unit'],
        checks: [
          {
            test: 'tests/contracts/sample.test.ts::[AC-TEST-001] validates current evidence',
            layer: 'unit',
          },
        ],
      },
    ],
    tasks: [
      { id: 'T1', title: 'Check the write and reload path', status: 'doing' },
      { id: 'T2', title: 'Verify the persistence result', status: 'todo' },
    ],
    dependency_contracts: [],
    shared_files: [],
    handoff: { interfaces: [], migrations: [], tests: [], remaining: [] },
    ...resolvedOverrides,
  })
  const metadata = JSON.parse(content.match(/<!-- ignite-plan\s*([\s\S]*?)-->/)![1])
  write(root, 'docs/plans/fixture.md', renderPlanProgressContent(content, metadata))
  const release = JSON.parse(read(root, 'docs/plans/releases/fixture-v1.json'))
  release.coverage_version = 1
  release.scope = [
    {
      id: 'GOAL-001',
      text: 'Data survives a reload',
      source: 'Implement the requested persistence fix',
      requirements: ['REQ-TEST-001'],
      plan_ids: ['IGT-900'],
      disposition: 'included',
    },
  ]
  write(root, 'docs/plans/releases/fixture-v1.json', `${JSON.stringify(release, null, 2)}\n`)
  return metadata
}

function next(root: string, ...args: string[]) {
  const result = runCli(root, 'next', '--plan', 'IGT-900', ...args)
  expect(result.status, result.stderr || result.stdout).toBe(0)
  return JSON.parse(result.stdout)
}

describe('Whole-task context and focused execution', () => {
  it('[AC-EXECUTION-031] preserves goals, constraints and all task states in the compact resume context', () => {
    const fixture = makeFixture()
    try {
      const metadata = focusedPlan(fixture.root, fixture.baseCommit)
      const summary = next(fixture.root)
      expect(summary.goals).toEqual(metadata.goals)
      expect(summary.constraints).toEqual(metadata.constraints)
      expect(summary.non_goals).toEqual(metadata.non_goals)
      expect(summary.tasks).toEqual(metadata.tasks)
      expect(summary).not.toHaveProperty('context')
      expect(summary.plan_path).toBe('docs/plans/fixture.md')
      const verbose = next(fixture.root, '--verbose')
      expect(verbose.tasks).toEqual(summary.tasks)
      expect(verbose.context.acceptance).toEqual(metadata.acceptance)
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-032] resumes unfinished work before offering checks and retains gap, blocker and legacy precedence', () => {
    const fixture = makeFixture()
    try {
      focusedPlan(fixture.root, fixture.baseCommit)
      expect(next(fixture.root).next_action).toMatchObject({
        kind: 'continue-task',
        task_ids: ['T1'],
        command: null,
      })
      focusedPlan(fixture.root, fixture.baseCommit, {
        tasks: [
          { id: 'T1', title: 'Check the write path', status: 'todo' },
          { id: 'T2', title: 'Check the reload path', status: 'todo' },
        ],
      })
      expect(next(fixture.root).next_action.task_ids).toEqual(['T1', 'T2'])
      focusedPlan(fixture.root, fixture.baseCommit, {
        remaining_work: ['The real reload behavior is still unverified'],
      })
      expect(next(fixture.root).next_action.kind).toBe('address-acceptance-gap')
      focusedPlan(fixture.root, fixture.baseCommit, {
        status: 'blocked',
        blocker: 'Need the external account',
      })
      expect(next(fixture.root).next_action.kind).toBe('wait-for-blocker')
      focusedPlan(fixture.root, fixture.baseCommit, {
        tasks: [{ id: 'T1', title: 'Complete the implementation', status: 'done' }],
      })
      expect(next(fixture.root).next_action).toMatchObject({
        kind: 'implement-and-check',
        command: 'pnpm ignite check --plan IGT-900 --level auto',
      })
      write(fixture.root, 'docs/plans/fixture.md', planContent(fixture.baseCommit))
      expect(next(fixture.root).next_action.kind).toBe('implement-and-check')
    } finally {
      fixture.cleanup()
    }
  })

  it('[AC-EXECUTION-033] generates module and change drafts with a whole-task review and no completion evidence', () => {
    for (const script of ['create-change.mjs', 'create-module.mjs']) {
      const fixture = makeFixture()
      try {
        for (const path of ['docs/plans/_template.md', 'docs/others/test-cases/_template.md']) {
          write(fixture.root, path, read(repositoryRoot, path))
        }
        commitAll(fixture.root, 'Install draft templates')
        const result = spawnSync(
          process.execPath,
          [join(repositoryRoot, 'scripts', script), 'focus-example'],
          {
            cwd: fixture.root,
            encoding: 'utf8',
            windowsHide: true,
            env: { ...process.env, IGNITE_ROOT: fixture.root },
          },
        )
        expect(result.status, result.stderr || result.stdout).toBe(0)
        const path = readdirSync(join(fixture.root, 'docs/plans')).find((name) =>
          name.endsWith('-focus-example.md'),
        )!
        const draft = read(fixture.root, `docs/plans/${path}`)
        expect(draft).toContain('## 整体判断与推进顺序')
        expect(draft).toContain('./README.md#整体判断与推进顺序')
        const metadata = JSON.parse(draft.match(/<!-- ignite-plan\s*([\s\S]*?)-->/)![1])
        expect(metadata.status).toBe('draft')
        expect(metadata.evidence).toEqual([])
        expect(metadata.tdd_evidence).toEqual([])
      } finally {
        fixture.cleanup()
      }
    }
  })
})
