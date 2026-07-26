import { expect, test } from '@playwright/test'

test('signs in and completes the Task CRUD workflow', async ({ page }) => {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `playwright-${runId}@example.com`
  const password = 'Playwright!123456'
  const originalTitle = `Playwright task ${runId}`
  const updatedTitle = `${originalTitle} updated`

  await test.step('create an account, sign out, and sign back in', async () => {
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

  await test.step('create, complete, edit, and delete a task', async () => {
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('heading', { name: '任务清单' })).toBeVisible()

    await page.getByRole('button', { name: '新建任务' }).click()
    await page.getByPlaceholder('要做什么...').fill(originalTitle)
    await page.getByRole('button', { name: '创建任务' }).click()
    await expect(page.getByText(originalTitle, { exact: true })).toBeVisible()

    await page.getByRole('button', { name: `完成任务：${originalTitle}` }).click()
    await expect(page.getByRole('heading', { name: '已完成' })).toBeVisible()

    await page.getByRole('button', { name: `编辑任务：${originalTitle}` }).click()
    await page.getByPlaceholder('任务名称').fill(updatedTitle)
    await page.getByRole('button', { name: '保存修改' }).click()
    await expect(page.getByText(updatedTitle, { exact: true })).toBeVisible()

    await page.getByRole('button', { name: `删除任务：${updatedTitle}` }).click()
    await expect(page.getByText(updatedTitle, { exact: true })).toHaveCount(0)
    await expect(page.getByText('还没有任务')).toBeVisible()
  })
})
