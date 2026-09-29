import { expect, test } from '@playwright/test'

test('[AC-PRODUCT-018] auto-signs visitors into the real isolated dashboard and explains capabilities', async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/')

  await expect(page.getByRole('link', { name: '开始使用' })).toHaveAttribute(
    'href',
    'https://github.com/morewhyhan/Ignite',
  )
  await expect(page.getByRole('button', { name: '预览 Demo' })).toBeVisible()
  await expect(page.getByRole('link', { name: '集成能力' })).toHaveAttribute(
    'href',
    '/capabilities',
  )

  const email = `demo-check-${crypto.randomUUID()}@example.com`
  const password = 'demo-check-password-9Q!'
  const signUp = await page.evaluate(
    async ({ email, password }) =>
      fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name: '真实账户验证' }),
      }).then((response) => response.ok),
    { email, password },
  )
  expect(signUp).toBe(true)

  await page.getByRole('button', { name: '预览 Demo' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: '从这里开始扩展' })).toBeVisible()
  await expect(page.getByRole('link', { name: '任务管理' })).toBeVisible()
  await expect(page.getByText('Demo 体验')).toBeVisible()

  const requests: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/tasks')) {
      requests.push(`${request.method()} ${new URL(request.url()).pathname}`)
    }
  })

  await page.getByRole('link', { name: '任务管理' }).click()
  await expect(page).toHaveURL(/\/dashboard\/tasks$/)
  await expect(page.getByRole('heading', { name: '任务清单' })).toBeVisible()
  await expect(page.getByText('准备迭代登录体验')).toBeVisible()

  await page.getByRole('button', { name: '新建任务' }).click()
  await page.getByPlaceholder('要做什么...').fill('只属于这个体验会话的任务')
  await page.getByRole('button', { name: '创建任务' }).click()
  await expect(page.getByText('只属于这个体验会话的任务')).toBeVisible()
  expect(requests).toContain('POST /api/tasks')

  const secondContext = await browser.newContext()
  const secondPage = await secondContext.newPage()
  await secondPage.setViewportSize({ width: 1280, height: 900 })
  await secondPage.goto(new URL('/', page.url()).toString())
  await secondPage.getByRole('button', { name: '预览 Demo' }).click()
  await expect(secondPage).toHaveURL(/\/dashboard$/)
  await secondPage.getByRole('link', { name: '任务管理' }).click()
  await expect(secondPage.getByText('准备迭代登录体验')).toBeVisible()
  await expect(secondPage.getByText('只属于这个体验会话的任务')).toHaveCount(0)
  await secondContext.close()

  await page.getByRole('button', { name: '退出体验' }).click()
  await expect(page).toHaveURL('/')
  await page.goto('/dashboard/settings')
  await expect(page.getByLabel('邮箱')).toHaveValue(email)

  await page.goto('/')
  await page.getByRole('button', { name: '预览 Demo' }).click()
  await page.getByRole('link', { name: '任务管理' }).click()
  await expect(page.getByText('准备迭代登录体验')).toBeVisible()
  await expect(page.getByText('只属于这个体验会话的任务')).toHaveCount(0)
  await page.getByRole('button', { name: '退出体验' }).click()

  await page.goto('/capabilities')
  await expect(page.getByRole('heading', { name: '拿来就能开始，按需继续扩展。' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '已经集成，复制后可以直接使用' })).toBeVisible()
  await expect(page.getByText('Next.js · React · TypeScript · Tailwind CSS')).toBeVisible()
  await expect(page.getByText('Hook → Hono Typed RPC → Hono route → Prisma')).toBeVisible()
  await expect(page.getByText('Tasks 完整 CRUD 参考模块')).toBeVisible()
  await expect(page.getByRole('heading', { name: '刻意留白，按项目需要再接入' })).toBeVisible()
  await expect(page.getByText('不预置支付、邮件发送、云存储或原生 App / 小程序')).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1)
})
