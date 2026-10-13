import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import {
  isBehaviorAssertionFailure,
  matchingPlaywrightCases,
  matchingVitestCases,
  summarizeTddFailures,
} from '../../scripts/ignite/tdd.mjs'
import {
  acceptanceTestAssertionLocations,
  configuredBrowserSetupPaths,
} from '../../scripts/ignite/source-analysis.mjs'

describe('TDD red evidence attribution', () => {
  const source = `import { it, expect } from 'vitest'
beforeEach(() => { expect(true).toBe(true) })
it('[AC-TEST-001] target', () => {
  expect(prerequisite).toBe(true)
  expect(result, '[AC-TEST-001] target').toBe('expected')
})`
  const locations = acceptanceTestAssertionLocations(source, 'AC-TEST-001')
  const targetLocations = acceptanceTestAssertionLocations(source, 'AC-TEST-001', null, {
    requireTargetMarker: true,
  })

  it('[AC-EXECUTION-026] [AC-EXECUTION-044] rejects assertion-looking errors without target provenance', () => {
    expect(isBehaviorAssertionFailure('AssertionError: expected false to be true')).toBe(false)
    expect(
      acceptanceTestAssertionLocations(
        source.replace(", '[AC-TEST-001] target'", ''),
        'AC-TEST-001',
        null,
        { requireTargetMarker: true },
      ),
    ).toEqual([])
    expect(
      isBehaviorAssertionFailure(
        'AssertionError: expected false to be true\n at tests/target.test.ts:2:20',
        { assertionLocations: locations, testPath: 'tests/target.test.ts' },
      ),
    ).toBe(false)
  })

  it('[AC-EXECUTION-044] accepts only the marked target assertion after passing prerequisites', () => {
    expect(
      isBehaviorAssertionFailure(
        'AssertionError: expected false to be true\n at tests/target.test.ts:5:3',
        { assertionLocations: targetLocations, testPath: 'tests/target.test.ts' },
      ),
    ).toBe(true)
    expect(
      isBehaviorAssertionFailure(
        'AssertionError: expected false to be true\n at tests/target.test.ts:4:3',
        { assertionLocations: targetLocations, testPath: 'tests/target.test.ts' },
      ),
    ).toBe(false)
  })

  it('[AC-EXECUTION-044] keeps source locations from Vitest JSON failureMessages', () => {
    const cases = matchingVitestCases(
      {
        testResults: [
          {
            assertionResults: [
              {
                fullName: '[AC-TEST-001] target',
                status: 'failed',
                failureMessages: ['AssertionError: expected value\n at tests/target.test.ts:5:3'],
              },
            ],
          },
        ],
      },
      'AC-TEST-001',
    )
    expect(cases).toHaveLength(1)
    expect(
      isBehaviorAssertionFailure(cases[0].failures.join('\n'), {
        assertionLocations: targetLocations,
        testPath: 'tests/target.test.ts',
      }),
    ).toBe(true)
  })

  it('[AC-EXECUTION-044] keeps source locations from Playwright JSON error stacks and locations', () => {
    const cases = matchingPlaywrightCases(
      {
        suites: [
          {
            specs: [
              {
                title: '[AC-TEST-001] target',
                tests: [
                  {
                    results: [
                      {
                        status: 'failed',
                        error: {
                          message: 'expect(locator).toBeVisible()',
                          stack:
                            'Error: expect(locator).toBeVisible()\n at tests/target.test.ts:5:3',
                          location: { file: 'tests/target.test.ts', line: 5, column: 3 },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      'AC-TEST-001',
    )
    expect(cases).toHaveLength(1)
    expect(
      isBehaviorAssertionFailure(cases[0].failures.join('\n'), {
        assertionLocations: targetLocations,
        testPath: 'tests/target.test.ts',
      }),
    ).toBe(true)
  })

  it('[AC-EXECUTION-044] tracks configured browser global setup files', () => {
    expect(
      configuredBrowserSetupPaths((path) =>
        path === 'playwright.config.ts'
          ? `export default defineConfig({ globalSetup: './tests/e2e/global-setup.ts' })`
          : null,
      ),
    ).toEqual(['tests/e2e/global-setup.ts'])
  })

  it('[AC-EXECUTION-044] keeps compact matched failures and verifiable digests', () => {
    const failures = [
      { failures: ['AssertionError: expected value\n at tests/target.test.ts:4:3'] },
    ]
    const evidence = summarizeTddFailures(failures)
    expect(evidence.failure_summary).toEqual([
      'AssertionError: expected value at tests/target.test.ts:4:3',
    ])
    expect(evidence.failure_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(evidence.failure_summary_sha256).toBe(
      createHash('sha256').update(JSON.stringify(evidence.failure_summary)).digest('hex'),
    )
    expect(summarizeTddFailures([{ failures: ['changed failure'] }]).failure_sha256).not.toBe(
      evidence.failure_sha256,
    )
  })
})
