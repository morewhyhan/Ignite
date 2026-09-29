import { expect, test } from '@playwright/test'

test('[AC-PRODUCT-018] routes visitors to GitHub or a resettable demo and explains shipped capabilities', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/')

  await expect(page.getByRole('link', { name: '开始使用' })).toHaveAttribute(
    'href',
    'https://github.com/morewhyhan/Ignite',
  )
  await expect(page.getByRole('link', { name: '预览 Demo' })).toHaveAttribute('href', '/demo')
  await expect(page.getByRole('link', { name: '集成能力' })).toHaveAttribute(
    'href',
    '/capabilities',
  )

  const businessApiRequests: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/tasks')) {
      businessApiRequests.push(request.url())
    }
  })

  await page.getByRole('link', { name: '预览 Demo' }).click()
  await expect(page).toHaveURL(/\/demo$/)
  await expect(page.getByRole('heading', { name: 'Demo 工作台' })).toBeVisible()
  await expect(
    page.getByText('演示数据只在本次页面体验中生效；刷新、离开或重置后恢复。'),
  ).toBeVisible()
  await expect(page.getByText('准备迭代登录体验')).toBeVisible()

  await page.getByRole('button', { name: '新建演示任务' }).click()
  await page.getByPlaceholder('要做什么...').fill('本次临时任务')
  await page.getByRole('button', { name: '创建任务' }).click()
  await expect(page.getByText('本次临时任务')).toBeVisible()
  await expect(page.getByRole('button', { name: '重置演示' })).toBeVisible()
  expect(businessApiRequests).toEqual([])

  await page.reload()
  await expect(page.getByText('准备迭代登录体验')).toBeVisible()
  await expect(page.getByText('本次临时任务')).toHaveCount(0)
  expect(businessApiRequests).toEqual([])

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
