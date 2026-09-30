import { expect, test } from '@playwright/test'

test('[AC-PRODUCT-017] explains Ignite value and document system before a responsive sign-in panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: '把一个问题，做成能用、能验证、还能继续改的产品',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: '一个可以开始、可以验证，也可以继续演进的产品起点。' }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: '不用从空白工程起步' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '更早拿到可验证的版本' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '首版之后仍然接得下去' })).toBeVisible()
  await expect(page.getByText('你说明目标和取舍，AI 按项目约定执行并验证')).toBeVisible()

  const documentsHeading = page.getByRole('heading', {
    name: '让 AI 看得懂项目，也让每次修改都有据可循',
  })
  await documentsHeading.scrollIntoViewIfNeeded()
  await expect(documentsHeading).toBeVisible()
  await expect(page.getByRole('heading', { name: '目录结构', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '规则只维护一份' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '每类文档各司其职' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '每轮都能接着做' })).toBeVisible()

  const documentTree = page.getByRole('list', { name: 'Ignite 项目文档目录' })
  for (const path of [
    'Ignite/',
    'AGENTS.md',
    '.ai/',
    'docs/',
    'README.md',
    'standards/',
    'features/',
    'plans/',
    'designs/',
    'others/',
  ]) {
    await expect(documentTree.getByText(path, { exact: true })).toBeVisible()
  }

  const startLinks = page.getByRole('link', { name: '开始使用', exact: true })
  await expect(startLinks).toHaveCount(2)
  for (const link of await startLinks.all()) {
    await expect(link).toHaveAttribute('href', 'https://github.com/morewhyhan/Ignite')
  }
  await expect(page.getByRole('heading', { name: '别让想法卡在技术准备上。' })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  const pageDimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(pageDimensions.content).toBeLessThanOrEqual(pageDimensions.viewport + 1)

  await page.getByRole('button', { name: '预览应用', exact: true }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: '创建账户' })).toBeVisible()
  await expect(dialog.getByLabel('用户名')).toBeVisible()
  await expect(dialog.getByLabel('邮箱')).toBeVisible()
  await expect(dialog.getByLabel('密码', { exact: true })).toBeVisible()

  const registrationBounds = await dialog.boundingBox()
  expect(registrationBounds).not.toBeNull()
  expect(registrationBounds!.x).toBeGreaterThanOrEqual(0)
  expect(registrationBounds!.x + registrationBounds!.width).toBeLessThanOrEqual(391)
  expect(registrationBounds!.height).toBeLessThanOrEqual(844)

  await dialog
    .getByRole('group', { name: '登录或注册' })
    .getByRole('button', { name: '登录', exact: true })
    .click()
  await expect(dialog.getByRole('heading', { name: '欢迎回来' })).toBeVisible()
  await expect(dialog.getByLabel('邮箱')).toBeVisible()
  await expect(dialog.getByLabel('密码')).toBeVisible()

  const loginBounds = await dialog.boundingBox()
  expect(loginBounds).not.toBeNull()
  expect(loginBounds!.x).toBeGreaterThanOrEqual(0)
  expect(loginBounds!.x + loginBounds!.width).toBeLessThanOrEqual(391)
})
