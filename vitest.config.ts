import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'

const ownershipFaultTests = 'tests/contracts/mutation-guards.test.ts'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    allowOnly: false,
    reporters: ['default', './scripts/testing/vitest-acceptance-reporter.mjs'],
    clearMocks: true,
    environment: 'node',
    fileParallelism: true,
    maxWorkers: 2,
    projects: [
      {
        extends: true,
        test: {
          name: 'behavior',
          include: ['tests/{api,contracts}/**/*.test.{ts,tsx}'],
          exclude: [...configDefaults.exclude, ownershipFaultTests],
          sequence: { groupOrder: 0 },
        },
      },
      {
        extends: true,
        test: {
          name: 'ownership-faults',
          include: [ownershipFaultTests],
          fileParallelism: false,
          sequence: { groupOrder: 1 },
        },
      },
    ],
    restoreMocks: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
