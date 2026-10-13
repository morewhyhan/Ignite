import { describe, expect, it } from 'vitest'
import { makeFixture, planContent, read, runCli, write } from './ignite-fixture'

describe('Development feedback', () => {
  it('[AC-EXECUTION-047] selects focused feedback without publishing acceptance', () => {
    const fixture = makeFixture()
    try {
      write(
        fixture.root,
        'docs/plans/fixture.md',
        planContent(fixture.baseCommit, {
          acceptance: [
            {
              id: 'AC-TEST-001',
              tests: ['tests/contracts/sample.test.ts::[AC-TEST-001]'],
              required_layers: ['unit'],
              checks: [{ test: 'tests/contracts/sample.test.ts::[AC-TEST-001]', layer: 'unit' }],
            },
            {
              id: 'AC-TEST-002',
              tests: ['tests/contracts/other.test.ts::[AC-TEST-002]'],
              required_layers: ['unit'],
              checks: [{ test: 'tests/contracts/other.test.ts::[AC-TEST-002]', layer: 'unit' }],
            },
          ],
        }),
      )
      write(
        fixture.root,
        'tests/contracts/other.test.ts',
        "it('[AC-TEST-002]', () => { expect(1 + 1).toBe(2) })\n",
      )
      const before = read(fixture.root, 'docs/plans/fixture.md')
      const result = runCli(
        fixture.root,
        'check',
        '--plan',
        'IGT-900',
        '--feedback',
        '--ac',
        'AC-TEST-001',
        '--dry-run',
      )
      expect(result.status, result.stderr).toBe(0)
      const feedback = JSON.parse(result.stdout)
      expect(feedback.purpose).toBe('development-feedback')
      expect(feedback.acceptance_evidence).toBe(false)
      expect(feedback.commands.flat()).toContain('tests/contracts/sample.test.ts')
      expect(feedback.commands.flat()).not.toContain('tests/contracts/other.test.ts')
      expect(read(fixture.root, 'docs/plans/fixture.md')).toBe(before)
      const invalid = runCli(
        fixture.root,
        'check',
        '--plan',
        'IGT-900',
        '--feedback',
        '--ac',
        'AC-UNKNOWN-001',
        '--dry-run',
      )
      expect(invalid.status).not.toBe(0)
    } finally {
      fixture.cleanup()
    }
  })
})
