import { describe, expect, it } from 'vitest'
import { acceptanceTestHasScaffoldFailure } from '../../scripts/ignite/source-analysis.mjs'
import { tddTestFingerprint } from '../../scripts/ignite/tdd.mjs'

describe('source-aware acceptance validation', () => {
  it('[AC-METHOD-018] accepts conditional test guards while rejecting unconditional scaffold failures', () => {
    const guarded = `import { test, expect } from '@playwright/test'
test('[AC-TEST-001] checks the user workflow', async ({ page }) => {
  const browser = page.context().browser()
  if (!browser) throw new Error('Browser unavailable')
  await expect(page.getByRole('heading')).toBeVisible()
})`
    expect(acceptanceTestHasScaffoldFailure(guarded, 'AC-TEST-001')).toBe(false)
    expect(
      acceptanceTestHasScaffoldFailure(
        `import { it } from 'vitest'
it('[AC-TEST-001] unfinished', () => { throw new Error('unfinished behavior') })`,
        'AC-TEST-001',
      ),
    ).toBe(true)
    expect(
      acceptanceTestHasScaffoldFailure(
        `import { it, expect } from 'vitest'
it('[AC-TEST-001] unfinished', () => { expect.fail('unfinished behavior') })`,
        'AC-TEST-001',
      ),
    ).toBe(true)
  })
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

  it('writes schema 2 TDD fingerprints for the selected behavior case', () => {
    const source = `import { it, expect } from 'vitest'
it('[AC-TEST-001] checks the target behavior', () => expect(result).toBe('expected'))
`
    const original = tddTestFingerprint(source, 'AC-TEST-001')
    expect(original).toMatchObject({ schema: 2, test_scope: 'acceptance-case' })
    expect(tddTestFingerprint(source, 'AC-TEST-001', '[AC-TEST-001]')?.test_sha256).toBe(
      original?.test_sha256,
    )
    expect(original?.test_sha256).toBe(
      tddTestFingerprint(
        `${source}it('[AC-TEST-002] checks a sibling', () => expect(true).toBe(true))\n`,
        'AC-TEST-001',
      )?.test_sha256,
    )
    expect(
      tddTestFingerprint(source.replace('expected', 'changed'), 'AC-TEST-001')?.test_sha256,
    ).not.toBe(original?.test_sha256)

    const multipleCases = `${source}it('[AC-TEST-001] checks a second behavior', () => expect(result).toBe('second'))\n`
    expect(
      tddTestFingerprint(multipleCases, 'AC-TEST-001', '[AC-TEST-001] checks a second behavior')
        ?.test_sha256,
    ).not.toBe(original?.test_sha256)
  })

  it('[AC-EXECUTION-044] changes the fingerprint when an applicable beforeEach hook changes', () => {
    const source = `import { it, expect } from 'vitest'
describe('outer', () => {
  beforeEach(() => prepare())
  it('[AC-TEST-001] target', () => expect(true).toBe(true))
})`
    const changedHook = source.replace('prepare())', 'prepare(2))')
    const fingerprint = (content: string) =>
      tddTestFingerprint(content, 'AC-TEST-001', null, {
        entryPath: 'tests/target.test.ts',
        readFile: (path: string) => (path === 'tests/target.test.ts' ? content : null),
      })
    expect(fingerprint(changedHook)?.context_sha256).not.toBe(fingerprint(source)?.context_sha256)
  })

  it('[AC-EXECUTION-044] fingerprints applicable hooks and only referenced transitive test helpers', () => {
    const files = new Map([
      [
        '/repo/tests/target.test.ts',
        `import { it, expect } from 'vitest'
import { prepare as prepareForTest } from './test-support/prepare'
import initialize from './test-support/default-setup'
import * as setupHelpers from './test-support/helpers'
function setup() { initialize(); setupHelpers.prepare(); return prepareForTest() }
describe('outer', () => {
  beforeEach(() => setup())
  it('[AC-TEST-001] target', () => expect(true).toBe(true))
  it('[AC-TEST-002] sibling', () => expect(true).toBe(true))
})`,
      ],
      [
        '/repo/tests/test-support/prepare.ts',
        `import { build as buildStep } from './build'
export function prepare() { return buildStep() }
export function unused() { return 'v1' }`,
      ],
      ['/repo/tests/test-support/build.ts', `export function build() { return 'v1' }`],
      [
        '/repo/tests/test-support/default-setup.ts',
        `export default function initialize() { return 'default' }`,
      ],
      ['/repo/tests/test-support/helpers.ts', `export function prepare() { return 'namespace' }`],
    ])
    const readFile = (path: string) => files.get(path) ?? null
    const fingerprint = (acceptanceId: string) =>
      tddTestFingerprint(files.get('/repo/tests/target.test.ts')!, acceptanceId, null, {
        entryPath: '/repo/tests/target.test.ts',
        readFile,
      })
    const target = fingerprint('AC-TEST-001')
    expect(target?.context_sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(target?.context_files).toEqual([
      '/repo/tests/target.test.ts',
      '/repo/tests/test-support/build.ts',
      '/repo/tests/test-support/default-setup.ts',
      '/repo/tests/test-support/helpers.ts',
      '/repo/tests/test-support/prepare.ts',
    ])
    const initial = target?.context_sha256
    files.set('/repo/tests/test-support/build.ts', `export function build() { return 'v2' }`)
    expect(fingerprint('AC-TEST-001')?.context_sha256).not.toBe(initial)
    const helperChange = fingerprint('AC-TEST-001')?.context_sha256
    files.set(
      '/repo/tests/test-support/prepare.ts',
      `import { build as buildStep } from './build'
export function prepare() { return buildStep() }
export function unused() { return 'v2' }`,
    )
    expect(fingerprint('AC-TEST-001')?.context_sha256).toBe(helperChange)
    const withHook = fingerprint('AC-TEST-001')?.context_sha256
    files.set(
      '/repo/tests/target.test.ts',
      files.get('/repo/tests/target.test.ts')!.replace('setup())', 'setup(2))'),
    )
    expect(fingerprint('AC-TEST-001')?.context_sha256).not.toBe(withHook)
    const targetBeforeSiblingEdit = fingerprint('AC-TEST-001')?.context_sha256
    files.set(
      '/repo/tests/target.test.ts',
      files
        .get('/repo/tests/target.test.ts')!
        .replace(
          "it('[AC-TEST-002] sibling', () => expect(true).toBe(true))",
          "it('[AC-TEST-002] sibling', () => expect(false).toBe(true))",
        ),
    )
    expect(fingerprint('AC-TEST-001')?.context_sha256).toBe(targetBeforeSiblingEdit)

    const fixtureSource = `import { it, expect } from 'vitest'
import { setupFixture } from './ignite-fixture'
it('[AC-TEST-003] fixture-backed behavior', () => expect(setupFixture()).toBe('ready'))`
    files.set('/repo/tests/contracts/fixture.test.ts', fixtureSource)
    files.set(
      '/repo/tests/contracts/ignite-fixture.ts',
      `export function setupFixture() { return 'ready' }`,
    )
    const fixtureFingerprint = tddTestFingerprint(fixtureSource, 'AC-TEST-003', null, {
      entryPath: '/repo/tests/contracts/fixture.test.ts',
      readFile,
    })
    expect(fixtureFingerprint?.context_files).toContain('/repo/tests/contracts/ignite-fixture.ts')

    const browserSource = `import { test, expect } from '@playwright/test'
test.describe('browser suite', () => {
  test.beforeEach(() => setupBrowser())
  test('[AC-EXECUTION-044] browser target', async () => expect(true).toBe(true))
})`
    const browserFingerprint = (content: string) =>
      tddTestFingerprint(content, 'AC-EXECUTION-044', null, {
        entryPath: 'tests/e2e/sample.spec.ts',
        readFile: (path: string) => (path === 'tests/e2e/sample.spec.ts' ? content : null),
      })
    const changedBrowserSource = browserSource.replace('setupBrowser())', 'setupBrowser(2))')
    expect(browserFingerprint(changedBrowserSource)?.context_sha256).not.toBe(
      browserFingerprint(browserSource)?.context_sha256,
    )
  })
})
