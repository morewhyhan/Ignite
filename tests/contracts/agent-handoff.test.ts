import { describe, expect, it } from 'vitest'
import { makeFixture, planContent, runCli, write } from './ignite-fixture'

describe('Agent task handoff', () => {
  it('[AC-EXECUTION-045] returns an executable handoff from the current Plan', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          owner: 'coordinator',
          tasks: [
            {
              id: 'prepare',
              title: 'Confirm requirements',
              phase: 'prepare',
              status: 'todo',
              result: 'Confirmed specification',
              scope: ['docs/features/product.md'],
              depends_on: [],
              owner: 'reader',
            },
            {
              id: 'implement',
              title: 'Implement result',
              phase: 'implement',
              status: 'todo',
              result: 'User can save a record',
              scope: ['README.md'],
              depends_on: ['prepare'],
              owner: 'developer',
              acceptance: ['AC-TEST-001'],
            },
          ],
          handoff: {
            interfaces: [
              {
                owner: 'coordinator',
                consumer: 'developer',
                contract: 'Preserve the current response shape',
              },
            ],
            migrations: [],
            tests: [],
            remaining: [],
          },
        }),
      )
      const result = runCli(
        fixture.root,
        'next',
        '--plan',
        'IGT-900',
        '--task',
        'implement',
        '--handoff',
      )
      expect(result.status, result.stderr).toBe(0)
      const packet = JSON.parse(result.stdout)
      expect(packet.workspace.root).toBe(fixture.root)
      expect(packet.runtime.node).toBe('24.19.0')
      expect(packet.runtime.package_manager).toBe('pnpm@9.11.0')
      expect(packet.task.owner).toBe('developer')
      expect(packet.task.scope).toEqual(['README.md'])
      expect(packet.task.result).toBe('User can save a record')
      expect(packet.blockers).toContain('dependency prepare is not done')
      expect(packet.interfaces[0].contract).toBe('Preserve the current response shape')
      expect(packet.spawned).toBe(false)
      const missing = runCli(
        fixture.root,
        'next',
        '--plan',
        'IGT-900',
        '--task',
        'unknown',
        '--handoff',
      )
      expect(missing.status).not.toBe(0)
    } finally {
      fixture.cleanup()
    }
  })
})
