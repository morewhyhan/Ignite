import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    environment: 'node',
    fileParallelism: false,
    include: ['tests/{api,contracts}/**/*.test.ts'],
    restoreMocks: true,
    testTimeout: 30_000,
  },
})
