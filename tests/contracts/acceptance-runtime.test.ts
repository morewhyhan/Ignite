import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { makeFixture, planContent, repositoryRoot, write } from './ignite-fixture'

describe('runtime acceptance evidence', () => {
  it.each(['vitest', 'playwright'])(
    '[AC-PRODUCT-010] %s rejects skips, expected failures, flaky tests and missing results',
    (runner) => {
      const fixture = makeFixture()
      try {
        const browser = runner === 'playwright'
        const testFile = browser ? 'tests/e2e/sample.spec.ts' : 'tests/contracts/sample.test.ts'
        const library = join(
          repositoryRoot,
          browser ? 'node_modules/@playwright/test/index.mjs' : 'node_modules/vitest/dist/index.js',
        )
        const executable = join(
          repositoryRoot,
          browser ? 'node_modules/@playwright/test/cli.js' : 'node_modules/vitest/vitest.mjs',
        )
        const reporter = join(repositoryRoot, `scripts/testing/${runner}-acceptance-reporter.mjs`)
        const config = join(fixture.root, 'runner.config.mjs')
        write(
          fixture.root,
          'runner.config.mjs',
          `export default ${JSON.stringify(
            browser
              ? {
                  testDir: './tests/e2e',
                  reporter: [[reporter]],
                  workers: 1,
                  forbidOnly: true,
                  retries: 1,
                }
              : {
                  test: {
                    include: ['tests/contracts/**/*.test.ts'],
                    reporters: [reporter],
                    allowOnly: false,
                    retry: 1,
                  },
                },
          )}\n`,
        )
        write(
          fixture.root,
          'docs/plans/fixture.md',
          planContent(fixture.baseCommit, {
            acceptance: [{ id: 'AC-TEST-001', tests: [testFile] }],
          }),
        )
        const sources = {
          passed: `test('[AC-TEST-001] works', () => {})`,
          skipped: browser
            ? `test('[AC-TEST-001] skips', () => { test.skip(true, 'not implemented') })`
            : `test('[AC-TEST-001] skips', (ctx) => { ctx.skip() })`,
          expectedFailure: browser
            ? `test('[AC-TEST-001] expected failure', () => { test.fail(); throw new Error('missing behavior') })`
            : `test.fails('[AC-TEST-001] expected failure', () => { throw new Error('missing behavior') })`,
          missing: `test('[AC-OTHER-001] unrelated test', () => {})`,
          flaky: browser
            ? `test('[AC-TEST-001] flaky', ({}, info) => { if (info.retry === 0) throw new Error('first attempt') })`
            : `let attempts = 0; test('[AC-TEST-001] flaky', () => { if (attempts++ === 0) throw new Error('first attempt') })`,
        }
        for (const [scenario, source] of Object.entries(sources)) {
          write(
            fixture.root,
            testFile,
            `import { test } from ${JSON.stringify(library)}\n${source}\n`,
          )
          const result = spawnSync(
            process.execPath,
            [executable, browser ? 'test' : 'run', '--config', config],
            {
              cwd: fixture.root,
              encoding: 'utf8',
              windowsHide: true,
              env: { ...process.env, IGNITE_ROOT: fixture.root, IGNITE_PLAN_ID: 'IGT-900' },
            },
          )
          const output = `${result.stdout}\n${result.stderr}`
          if (scenario === 'passed') expect(result.status, output).toBe(0)
          else {
            expect(result.status, `${scenario}: ${output}`).not.toBe(0)
            expect(output, scenario).toContain('Ignite acceptance failed')
          }
        }
      } finally {
        fixture.cleanup()
      }
    },
    90_000,
  )
})
