import { unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { makeFixture, planContent, read, runCli, write } from './ignite-fixture'
import { validateAllPlans } from '../../scripts/ignite/state.mjs'

function planMetadata(root: string) {
  const match = read(root, 'docs/plans/fixture.md').match(/<!-- ignite-plan\s*([\s\S]*?)\s*-->/)
  if (!match) throw new Error('fixture Plan metadata is missing')
  return JSON.parse(match[1])
}

describe('scoped Plan mutations', () => {
  it('[AC-EXECUTION-054] reserves shared writes by unfinished task scopes and keeps legacy scopes conservative', () => {
    const task = (status: string, scope: string[]) => ({
      id: 'I',
      phase: 'implement',
      status,
      scope,
    })
    const current = {
      relativePath: 'current.md',
      metadata: {
        id: 'IGT-900',
        status: 'active',
        execution_contract: 1,
        write_scope: ['src/'],
        tasks: [task('doing', ['src/shared.ts'])],
        shared_files: [{ path: 'src/shared.ts', owner: 'current', mode: 'exclusive' }],
      },
    }
    const peer = {
      relativePath: 'peer.md',
      metadata: {
        id: 'IGT-901',
        status: 'verifying',
        execution_contract: 1,
        write_scope: ['src/'],
        tasks: [
          task('done', ['src/shared.ts']),
          { id: 'V', phase: 'verify', status: 'todo', scope: ['docs/'] },
        ],
        shared_files: [],
      },
    }
    const failures = () =>
      validateAllPlans([current, peer], [], {
        planFailuresById: new Map([
          ['IGT-900', []],
          ['IGT-901', []],
        ]),
      }).filter((error) => error.includes('needs the same explicit owner and mode'))
    expect(failures(), '[AC-EXECUTION-054] target').toEqual([])
    peer.metadata.tasks[0].status = 'doing'
    expect(failures().length).toBeGreaterThan(0)
    peer.metadata.tasks[0].status = 'done'
    peer.metadata.execution_contract = 0
    expect(failures().length).toBeGreaterThan(0)
  })
  it('[AC-EXECUTION-052] updates scoped task, note, and review without scanning unrelated releases', () => {
    const fixture = makeFixture()
    try {
      const statusPath = 'docs/others/ignite-status.md'
      const sentinel = 'existing generated status\n'
      const planPath = 'docs/plans/fixture.md'
      write(
        fixture.root,
        planPath,
        planContent(fixture.baseCommit, {
          execution_contract: 1,
          review_contract: 1,
          owner: 'fixture-owner',
          tasks: [{ id: 'T', title: 'Work', status: 'todo' }],
          reviews: [],
        }),
      )
      write(fixture.root, statusPath, sentinel)
      write(fixture.root, 'docs/plans/releases/unrelated.json', '{"schema":')

      const task = runCli(fixture.root, 'task', 'set-status', 'IGT-900', 'T', 'doing')
      expect(task.status, task.stderr).toBe(0)
      expect(planMetadata(fixture.root).tasks[0].status).toBe('doing')
      expect(read(fixture.root, statusPath)).toBe(sentinel)

      const note = runCli(
        fixture.root,
        'plan',
        'note',
        'IGT-900',
        '--text',
        'The task remains in progress.',
      )
      expect(note.status, note.stderr).toBe(0)
      expect(read(fixture.root, planPath)).toContain('The task remains in progress.')
      expect(read(fixture.root, statusPath)).toBe(sentinel)

      const context = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
      expect(context.status, context.stderr).toBe(0)
      const subject = JSON.parse(context.stdout)
      write(
        fixture.root,
        'review.json',
        JSON.stringify({
          stage: 'draft',
          reviewer: 'independent-reviewer',
          executor: subject.executor,
          source: 'Independent review fixture',
          subject_fingerprint: subject.subject_fingerprint,
          verdict: 'approved',
          findings: [],
        }),
      )
      const review = runCli(
        fixture.root,
        'review',
        'record',
        'IGT-900',
        'draft',
        '--file',
        'review.json',
      )
      expect(review.status, review.stderr).toBe(0)
      expect(planMetadata(fixture.root).reviews.at(-1).reviewer).toBe('independent-reviewer')
      expect(read(fixture.root, statusPath)).toBe(sentinel)

      const refresh = runCli(fixture.root, 'status', '--write')
      expect(refresh.status).not.toBe(0)
      expect(read(fixture.root, statusPath)).toBe(sentinel)
      unlinkSync(join(fixture.root, 'docs/plans/releases/unrelated.json'))
      const refreshed = runCli(fixture.root, 'status', '--write')
      expect(refreshed.status, refreshed.stderr).toBe(0)
      expect(read(fixture.root, statusPath)).not.toBe(sentinel)
    } finally {
      fixture.cleanup()
    }
  })
})
