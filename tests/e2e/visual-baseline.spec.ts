import { expect, test } from '@playwright/test'

test('[AC-PRODUCT-016] presents a readable responsive landing page and persists theme choice', async ({
  page,
}) => {
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 })
    if (width === 1440) await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Ignite' })).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1)
  }

  const themeButton = page.getByRole('button', { name: '选择主题' })
  await expect(themeButton).toBeVisible()
  await themeButton.click()
  const navyTheme = page.getByRole('menuitemradio', { name: '海军蓝' })
  await expect(navyTheme).toBeVisible()
  await navyTheme.click()

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('color-scheme')))
    .toBe('studio-blue')
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--scheme-primary').trim(),
      ),
    )
    .toBe('#315ee8')

  await page.reload()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('color-scheme')))
    .toBe('studio-blue')
})
