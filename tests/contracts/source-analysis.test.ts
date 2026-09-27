import { describe, expect, it } from 'vitest'
import { acceptanceTestHasScaffoldFailure } from '../../scripts/ignite/source-analysis.mjs'

describe('source-aware acceptance validation', () => {
  it('[AC-EXECUTION-018] scopes scaffold detection to the matching active test', () => {
    const failureExample = `${['throw', 'new Error'].join(' ')}('unfinished behavior')`
    const incidentalText = `import { expect, it } from 'vitest'
const documentation = ${JSON.stringify(failureExample)}
it('[AC-TEST-001] checks normal behavior', () => expect(true).toBe(true))
`
    expect(acceptanceTestHasScaffoldFailure(incidentalText, 'AC-TEST-001')).toBe(false)

    const unrelatedFailure = `import { expect, it } from 'vitest'
it('[AC-OTHER-001] throws for its own reason', () => { ${failureExample} })
it('[AC-TEST-001] checks normal behavior', () => expect(true).toBe(true))
`
    expect(acceptanceTestHasScaffoldFailure(unrelatedFailure, 'AC-TEST-001')).toBe(false)

    const matchingFailure = `import { it } from 'vitest'
it('[AC-TEST-001] is still a scaffold', () => { ${failureExample} })
`
    expect(acceptanceTestHasScaffoldFailure(matchingFailure, 'AC-TEST-001')).toBe(true)
  })

  it('[AC-EXECUTION-026] fingerprints one acceptance case independently of sibling cases', async () => {
    const sourceAnalysis = (await import('../../scripts/ignite/source-analysis.mjs')) as Record<
      string,
      unknown
    >
    const selectCase =
      typeof sourceAnalysis.acceptanceTestSource === 'function'
        ? (sourceAnalysis.acceptanceTestSource as (
            content: string,
            acceptanceId: string,
          ) => string | null)
        : () => ''
    const target = `import { it, expect } from 'vitest'
it('[AC-TEST-001] verifies the target behavior', () => {
  expect(result).toBe('expected')
})
`
    const selected = selectCase(target, 'AC-TEST-001')
    expect(selected).toContain('[AC-TEST-001]')
    expect(
      selectCase(
        `${target}it('[AC-TEST-002] verifies a sibling behavior', () => expect(true).toBe(true))\n`,
        'AC-TEST-001',
      ),
    ).toBe(selected)
    expect(selectCase(target.replace('expected', 'changed'), 'AC-TEST-001')).not.toBe(selected)
    expect(selectCase(target, 'AC-TEST-999')).toBeNull()
  })
})
