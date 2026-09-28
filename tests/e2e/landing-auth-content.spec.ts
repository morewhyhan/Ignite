import { expect, test } from '@playwright/test'

test('[AC-PRODUCT-017] explains Ignite value and document system before a responsive sign-in panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: '真正省下的，是从想法到持续修改的距离' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: '更快开始' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AI 有章可循' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '完成有依据' })).toBeVisible()

  const documentsHeading = page.getByRole('heading', {
    name: '文档不是堆在一起，而是各自回答一个问题',
  })
  await documentsHeading.scrollIntoViewIfNeeded()
  await expect(documentsHeading).toBeVisible()

  for (const path of [
    'docs/standards/',
    'docs/features/',
    'docs/plans/',
    'docs/designs/',
    'docs/others/',
  ]) {
    await expect(page.getByText(path, { exact: true })).toBeVisible()
  }

  await page.setViewportSize({ width: 390, height: 844 })
  const pageDimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(pageDimensions.content).toBeLessThanOrEqual(pageDimensions.viewport + 1)

  await page.getByRole('button', { name: '开始使用' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: '欢迎回来' })).toBeVisible()
  await expect(dialog.getByLabel('邮箱')).toBeVisible()
  await expect(dialog.getByLabel('密码')).toBeVisible()

  const loginBounds = await dialog.boundingBox()
  expect(loginBounds).not.toBeNull()
  expect(loginBounds!.x).toBeGreaterThanOrEqual(0)
  expect(loginBounds!.x + loginBounds!.width).toBeLessThanOrEqual(391)

  await dialog.getByRole('button', { name: '注册', exact: true }).click()
  await expect(dialog.getByRole('heading', { name: '创建账户' })).toBeVisible()
  await expect(dialog.getByLabel('用户名')).toBeVisible()

  const registrationBounds = await dialog.boundingBox()
  expect(registrationBounds).not.toBeNull()
  expect(registrationBounds!.x).toBeGreaterThanOrEqual(0)
  expect(registrationBounds!.x + registrationBounds!.width).toBeLessThanOrEqual(391)
  expect(registrationBounds!.height).toBeLessThanOrEqual(844)
})
