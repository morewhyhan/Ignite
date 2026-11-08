import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const stamp = new Date().toISOString().slice(0, 10)

async function capture(page: Page, id: string) {
  const dir = join(process.cwd(), 'docs', 'others', 'evidence', id)
  mkdirSync(dir, { recursive: true })
  await page.screenshot({ path: join(dir, stamp + '.png'), fullPage: true })
}

async function signUp(page: Page, email: string, password: string) {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await page.goto('/')
  await page.getByRole('button', { name: '预览应用', exact: true }).first().click()
  await page.getByRole('button', { name: '注册', exact: true }).click()
  await page.getByPlaceholder('你的用户名').fill(`Playwright ${runId}`)
  await page.getByLabel('邮箱', { exact: true }).fill(email)
  const passwords = page.locator('input[type="password"]')
  await passwords.nth(0).fill(password)
  await passwords.nth(1).fill(password)
  await page.getByRole('button', { name: '创建账户' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/')
  await page.getByRole('button', { name: '预览应用', exact: true }).first().click()
  await page
    .getByRole('group', { name: '登录或注册' })
    .getByRole('button', { name: '登录', exact: true })
    .click()
  await page.getByLabel('邮箱', { exact: true }).fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('form').getByRole('button', { name: '登录', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}

test('[AC-AUTH-001] captures the registration result', async ({ page }) => {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await signUp(page, `shot-${runId}@example.com`, 'Playwright!123456')
  await capture(page, 'AC-AUTH-001')
})

test('[AC-AUTH-002] captures the signed-in dashboard', async ({ page }) => {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `shot-${runId}@example.com`
  const password = 'Playwright!123456'
  await signUp(page, email, password)
  await page.goto('/dashboard/settings')
  await page.getByRole('button', { name: '退出登录' }).click()
  await expect(page).toHaveURL('/')
  await signIn(page, email, password)
  await capture(page, 'AC-AUTH-002')
})

test('[AC-AUTH-003] captures the redirect after signing out', async ({ page }) => {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await signUp(page, `shot-${runId}@example.com`, 'Playwright!123456')
  await page.goto('/dashboard/settings')
  await page.getByRole('button', { name: '退出登录' }).click()
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/')
  await capture(page, 'AC-AUTH-003')
})

test('[AC-TASKS-001] captures the redirect for a signed-out visitor', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/')
  await capture(page, 'AC-TASKS-001')
})

test('[AC-TASKS-002] captures the task workflow result', async ({ page }) => {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await signUp(page, `shot-${runId}@example.com`, 'Playwright!123456')
  await page.goto('/dashboard/tasks')
  await expect(page.getByRole('heading', { name: '任务清单' })).toBeVisible()
  await capture(page, 'AC-TASKS-002')
})

test('[AC-AUTH-005] captures the authentication entry used in production', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '预览应用', exact: true }).first().click()
  await page.getByRole('group', { name: '登录或注册' }).waitFor()
  await capture(page, 'AC-AUTH-005')
})
