import { describe, expect, it } from 'vitest'
import { commitAll, makeFixture, runCli, write } from './ignite-fixture'

describe('source-aware acceptance validation', () => {
  it('[AC-EXECUTION-018] scopes scaffold detection to the matching active test', () => {
    const fixture = makeFixture()
    try {
      const exampleText = `${['throw', 'new Error'].join(' ')}('scaffold example')`
      write(
        fixture.root,
        'tests/contracts/sample.test.ts',
        `import { expect, it } from 'vitest'\nconst documentationExample = ${JSON.stringify(exampleText)}\nit('[AC-TEST-001] checks a normal behavior', () => expect(true).toBe(true))\n`,
      )
      commitAll(fixture.root, 'Add a harmless scaffold example string')

      const valid = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(valid.status, valid.stderr).toBe(0)

      write(
        fixture.root,
        'tests/contracts/sample.test.ts',
        `import { it } from 'vitest'\nit('[AC-TEST-001] still contains a scaffold failure', () => { ${[
          'throw',
          'new Error',
        ].join(' ')}('unfinished behavior') })\n`,
      )
      commitAll(fixture.root, 'Add a real scaffold failure to the matching test')
      const invalid = runCli(fixture.root, 'plan', 'validate', 'IGT-900')
      expect(invalid.status).not.toBe(0)
      expect(invalid.stderr).toContain('still contains a scaffold failure placeholder')
    } finally {
      fixture.cleanup()
    }
  })
})
