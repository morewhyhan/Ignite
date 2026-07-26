import { defineConfig, devices } from '@playwright/test'

const e2ePort = Number.parseInt(process.env.E2E_PORT ?? '3100', 10)

if (!Number.isInteger(e2ePort) || e2ePort < 1 || e2ePort > 65_535) {
  throw new Error('E2E_PORT must be a valid TCP port.')
}

const baseURL = `http://127.0.0.1:${e2ePort}`
const isCI = process.env.CI === 'true'
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    launchOptions: executablePath ? { executablePath } : undefined,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `corepack pnpm exec next dev --hostname 127.0.0.1 --port ${e2ePort}`,
    env: {
      ...(process.platform === 'win32' ? { RUST_LOG: 'info' } : {}),
      APP_ENV: 'test',
      APP_URL: baseURL,
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ?? 'playwright-only-secret-with-at-least-32-characters',
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? 'file:./playwright.db',
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: `${baseURL}/api/health`,
  },
})
