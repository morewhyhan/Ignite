import { expect, test } from '@playwright/test'

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content, `page overflow at ${dimensions.viewport}px`).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  )
}

test('[AC-TRUST-003] [AC-TRUST-006] keeps first-use and Tasks flows usable across common viewports', async ({
  page,
}) => {
  const landingWidths = [1440, 768, 390, 360]

  for (const width of landingWidths) {
    await page.setViewportSize({ width, height: 900 })
    if (width === landingWidths[0]) await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expectNoHorizontalOverflow(page)
    const start = page.getByRole('button', { name: '预览应用', exact: true }).first()
    await expect(start).toBeEnabled()
    await start.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const bounds = await dialog.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
    expect(bounds!.y).toBeGreaterThanOrEqual(0)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900 + 1)
    await expectNoHorizontalOverflow(page)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  }

  // A compact phone viewport catches a modal that fits horizontally but is
  // vertically clipped, hiding the registration controls below the fold.
  await page.setViewportSize({ width: 360, height: 568 })
  await page.getByRole('button', { name: '预览应用', exact: true }).first().click()
  await page.getByRole('button', { name: '注册', exact: true }).click()
  const registrationDialog = page.getByRole('dialog')
  await expect(registrationDialog).toBeVisible()
  const registrationBounds = await registrationDialog.boundingBox()
  expect(registrationBounds).not.toBeNull()
  expect(registrationBounds!.y).toBeGreaterThanOrEqual(0)
  expect(registrationBounds!.y + registrationBounds!.height).toBeLessThanOrEqual(569)
  const createAccount = page.getByRole('button', { name: '创建账户' })
  await createAccount.scrollIntoViewIfNeeded()
  const createAccountBounds = await createAccount.boundingBox()
  expect(createAccountBounds).not.toBeNull()
  expect(createAccountBounds!.y).toBeGreaterThanOrEqual(registrationBounds!.y)
  expect(createAccountBounds!.y + createAccountBounds!.height).toBeLessThanOrEqual(
    registrationBounds!.y + registrationBounds!.height,
  )
  await page.keyboard.press('Escape')

  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await page.getByRole('button', { name: '预览应用', exact: true }).first().click()
  await page.getByRole('button', { name: '注册', exact: true }).click()
  await page.getByPlaceholder('你的用户名').fill(`Responsive ${runId}`)
  await page.getByLabel('邮箱', { exact: true }).fill(`responsive-${runId}@example.com`)
  const passwords = page.locator('input[type="password"]')
  await passwords.nth(0).fill('Responsive!123456')
  await passwords.nth(1).fill('Responsive!123456')
  await page.getByRole('button', { name: '创建账户' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  for (const width of [768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/dashboard/tasks')
    await expect(page.getByRole('heading', { name: '任务清单' })).toBeVisible()
    const createTask = page.getByRole('button', { name: '新建任务' })
    await expect(createTask).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await createTask.click()
    const editor = page.getByRole('dialog')
    await expect(editor).toBeVisible()
    const editorBounds = await editor.boundingBox()
    expect(editorBounds).not.toBeNull()
    expect(editorBounds!.x).toBeGreaterThanOrEqual(0)
    expect(editorBounds!.x + editorBounds!.width).toBeLessThanOrEqual(width + 1)
    expect(editorBounds!.y).toBeGreaterThanOrEqual(0)
    expect(editorBounds!.y + editorBounds!.height).toBeLessThanOrEqual(900 + 1)
    await page.keyboard.press('Escape')
  }
})
