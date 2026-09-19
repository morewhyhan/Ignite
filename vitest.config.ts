import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

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
    include: ['tests/{api,contracts}/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
