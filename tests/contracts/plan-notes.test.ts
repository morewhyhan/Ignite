import { describe, expect, it } from 'vitest'
import { makeFixture, planContent, read, runCli, write } from './ignite-fixture'

describe('Plan execution notes', () => {
  it('[AC-EXECUTION-046] appends execution notes without changing draft approval', () => {
    const fixture = makeFixture()
    try {
      const before = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
      expect(before.status, before.stderr).toBe(0)
      const note = runCli(
        fixture.root,
        'plan',
        'note',
        'IGT-900',
        '--text',
        'API implementation handed back; browser verification remains pending.',
      )
      expect(note.status, note.stderr).toBe(0)
      const after = runCli(fixture.root, 'review', 'context', 'IGT-900', 'draft')
      expect(after.status, after.stderr).toBe(0)
      expect(JSON.parse(after.stdout).subject_fingerprint).toBe(
        JSON.parse(before.stdout).subject_fingerprint,
      )
      expect(read(fixture.root, 'docs/plans/fixture.md')).toContain(
        'API implementation handed back; browser verification remains pending.',
      )
      expect(read(fixture.root, 'docs/plans/fixture.md')).toContain('## 状态记录')
      const invalid = runCli(
        fixture.root,
        'plan',
        'note',
        'IGT-900',
        '--text',
        '<!-- ignite-plan -->',
      )
      expect(invalid.status).not.toBe(0)
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, { status: 'done' }),
      )
      const completed = read(fixture.root, 'docs/plans/fixture.md')
      const rejected = runCli(
        fixture.root,
        'plan',
        'note',
        'IGT-900',
        '--text',
        'Rewrite completed history',
      )
      expect(rejected.status).not.toBe(0)
      expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(completed)
    } finally {
      fixture.cleanup()
    }
  })
})
