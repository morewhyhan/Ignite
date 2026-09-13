import { beforeAll, describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import {
  validateAgentBridges,
  validateDesignArtifacts,
  validateRuntimeContract,
  validateTraceability,
} from '../../scripts/ignite/governance.mjs'
import { specificationRegistry, validateAllPlans } from '../../scripts/ignite/state.mjs'
import { acceptanceTestTitles } from '../../scripts/ignite/source-analysis.mjs'
import { repositoryRoot } from '../../scripts/ignite/core.mjs'
import { join } from 'node:path'

const eslint = new ESLint({ cwd: repositoryRoot })
async function architectureErrors(source: string, path: string) {
  const results = await eslint.lintText(source, { filePath: join(repositoryRoot, path) })
  expect(results.flatMap((result) => result.messages).filter((message) => message.fatal)).toEqual(
    [],
  )
  return results
    .flatMap((result) => result.messages)
    .filter((message) =>
      ['no-restricted-imports', 'no-restricted-syntax', 'no-restricted-globals'].includes(
        message.ruleId || '',
      ),
    )
}

describe('documentation traceability', () => {
  // Loading Next's ESLint plugins can be slow on a cold WSL-mounted filesystem.
  // Isolate that one-time setup from the behavior assertions below.
  beforeAll(async () => {
    await eslint.calculateConfigForFile(
      join(repositoryRoot, 'src/modules/example/hooks/use-example.ts'),
    )
  }, 90_000)

  it('[AC-PRODUCT-010] links every REQ to an AC, a tagged test, and a valid Plan mapping', async () => {
    const registry = specificationRegistry()
    expect(registry.requirements.size).toBeGreaterThan(0)
    expect(registry.acceptance.size).toBeGreaterThan(0)
    expect(validateTraceability()).toEqual([])
    expect(validateAllPlans()).toEqual([])
    expect(await validateDesignArtifacts()).toEqual([])
  })

  it('keeps AI bridges and runtime truth connected to their single sources', () => {
    expect(validateAgentBridges()).toEqual([])
    expect(validateRuntimeContract()).toEqual([])
  })

  it('[AC-PRODUCT-010] counts active test declarations without treating comments or examples as evidence', () => {
    const source = `
      import { test as verify, describe as suite } from 'vitest'
      // it('[AC-FAKE-001] commented out', () => {})
      const sample = "test('[AC-FAKE-002] string example', () => {})"
      function unusedHelper() { it('[AC-FAKE-003] never registered', () => {}) }
      suite('enabled', () => {
        verify(
          '[AC-REAL-001] multiline title [AC-REAL-002]',
          () => {},
        )
        it.each([1, 2])('[AC-REAL-003] handles %i', () => {})
        verify('[AC-REAL-005] explicit timeout', () => {}, 90_000)
        it.each([])('[AC-FAKE-004] zero cases', () => {})
        test.todo('[AC-FAKE-005] no body')
      })
      test.describe('browser', () => {
        test('[AC-REAL-004] browser test', async () => {})
        test.step('[AC-FAKE-006] a step is not a test', async () => {})
      })
    `
    expect(acceptanceTestTitles(source)).toEqual(
      new Set(['AC-REAL-001', 'AC-REAL-002', 'AC-REAL-003', 'AC-REAL-004', 'AC-REAL-005']),
    )
  })

  it('[AC-PRODUCT-010] excludes disabled or focused tests and their containing suites', () => {
    const source = `
      it.skip('[AC-FAKE-001] disabled', () => {})
      test.only('[AC-FAKE-002] focused', () => {})
      describe.skip('disabled suite', () => { it('[AC-FAKE-003] nested', () => {}) })
      describe.only('focused suite', () => { test('[AC-FAKE-004] nested', () => {}) })
      test.describe.skip('disabled browser suite', () => { test('[AC-FAKE-005] nested', () => {}) })
      describe.skipIf(true)('conditional', () => { it('[AC-FAKE-006] nested', () => {}) })
      test.runIf(process.env.ENABLED)('[AC-FAKE-007] runtime dependent', () => {})
      test.fails('[AC-FAKE-008] expected failure', () => {})
    `
    expect(acceptanceTestTitles(source)).toEqual(new Set())
    expect(
      acceptanceTestTitles(`
      describe.runIf(true)('enabled', () => {
        it.skipIf(false)('[AC-REAL-001] enabled', () => {})
      })
    `),
    ).toEqual(new Set(['AC-REAL-001']))
  })

  it('[AC-PRODUCT-010] uses ESLint to permit type-only imports, module Hooks and ordinary route helpers', async () => {
    const fixtures = [
      {
        path: 'src/modules/example/hooks/use-example.ts',
        source: `
          import type { AppType } from '@/server/api'
          import type { User } from '@prisma/client'
          import { apiClient } from '@/lib/api-client'
          export type Example = AppType | User
          export const useExample = () => apiClient
        `,
      },
      {
        path: 'src/modules/example/components/example.tsx',
        source: `
          'use client'
          // fetch('/api/example') is documentation, not an executed request.
          export function Example() {
            const query = { refetch: () => null }
            return query.refetch()
          }
        `,
      },
      {
        path: 'src/server/api/routes/example/helpers.ts',
        source: 'export const normalizeTitle = (value: string) => value.trim()',
      },
    ]
    for (const { source, path } of fixtures)
      expect(await architectureErrors(source, path)).toEqual([])
  })

  it('[AC-PRODUCT-010] uses the shipped ESLint rules to reject actual architecture bypasses', async () => {
    const errors = await architectureErrors(
      `
      'use client'
      import { prisma } from '@/server/database/client'
      import { apiClient } from '@/lib/api-client'
      import { hc } from 'hono/client'
      import { Internal } from '@/modules/tasks/components/internal'
      export const value = { prisma, apiClient, client: hc('/'), Internal }
      export const request = () => fetch('/api/example')
    `,
      'src/modules/example/components/bypass.tsx',
    )
    expect(errors.map((error) => error.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Client-safe code may only import server modules'),
        expect.stringContaining('Screens and components must access remote business data'),
        expect.stringContaining('Create the Hono client only'),
        expect.stringContaining('Import another module through its public index'),
        expect.stringContaining('Client business data must use a module Hook'),
      ]),
    )
    const routeErrors = await architectureErrors(
      `
      import { zValidator } from '@hono/zod-validator'
      export { zValidator }
    `,
      'src/server/api/routes/example/index.ts',
    )
    expect(routeErrors.map((error) => error.message)).toContain(
      'Routes must use the project zValidator wrapper from src/server/api/validator.ts.',
    )
  })
})
