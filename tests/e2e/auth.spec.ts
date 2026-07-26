import { expect, test } from '@playwright/test'

test('redirects an unauthenticated dashboard request to the home page', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('button', { name: '开始使用' })).toBeVisible()
})

test('registers, signs out, and signs back in without depending on the Tasks example', async ({
  page,
}) => {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `playwright-auth-${runId}@example.com`
  const password = 'Playwright!123456'

  await page.goto('/')
  await page.getByRole('button', { name: '开始使用' }).click()
  await page.getByRole('button', { name: '注册', exact: true }).click()

  await page.getByPlaceholder('你的用户名').fill(`Playwright ${runId}`)
  await page.getByPlaceholder('your@email.com').fill(email)
  const registrationPasswords = page.locator('input[type="password"]')
  await registrationPasswords.nth(0).fill(password)
  await registrationPasswords.nth(1).fill(password)
  await page.getByRole('button', { name: '创建账户' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/dashboard/settings')
  await page.getByRole('button', { name: '退出登录' }).click()
  await expect(page).toHaveURL('/')

  await page.getByRole('button', { name: '开始使用' }).click()
  await page.getByPlaceholder('your@email.com').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('form').getByRole('button', { name: '登录', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})
