import { expect, test, type Page } from '@playwright/test'

/** Collect console errors and uncaught exceptions on a page. */
function watch(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource.*fonts/.test(m.text())) errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

async function check(page: Page, route: string, errors: string[]) {
  await page.goto('./#' + route)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('main')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, `${route} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1)
  await expect(page.locator('text=Something on this page failed to load')).toHaveCount(0)
  expect(errors, `${route} console errors`).toEqual([])
}

const STATIC = ['/', '/learn', '/exam', '/practice', '/mock', '/papers', '/papers/prelim2026', '/papers/final2026', '/papers/noai2025', '/about']

test('static pages render cleanly', async ({ page }) => {
  const errors = watch(page)
  for (const r of STATIC) await check(page, r, errors)
})

test('every module and lesson renders cleanly', async ({ page }) => {
  const errors = watch(page)
  await page.goto('./#/learn')
  await page.waitForLoadState('networkidle')
  const moduleHrefs = await page.locator('a.roadmap-card').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash.slice(1)))
  expect(moduleHrefs.length).toBeGreaterThan(0)
  for (const m of moduleHrefs) {
    await check(page, m, errors)
    const lessons = await page.locator('a.module-lesson').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash.slice(1)))
    for (const l of lessons) {
      await check(page, l, errors)
      await expect(page.locator('.prose')).not.toBeEmpty()
    }
  }
})

test('practice and mock exam flows work', async ({ page }) => {
  const errors = watch(page)
  await page.goto('./#/practice')
  await expect(page.locator('.qcard')).toBeVisible({ timeout: 30_000 })
  await page.locator('.qopt').first().click()
  await expect(page.locator('.qcard-explain')).toBeVisible()
  await page.goto('./#/mock')
  await page.getByRole('radio', { name: /Sprint/ }).click()
  await page.getByRole('button', { name: 'Start the clock' }).click()
  await expect(page.locator('.mock-timer')).toBeVisible()
  await page.locator('.qopt').first().click()
  await page.getByRole('button', { name: 'Submit' }).click()
  await page.getByRole('button', { name: /Yes, submit/ }).click()
  await expect(page.locator('.result-hero')).toBeVisible()
  expect(errors).toEqual([])
})
