import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

/** Module and lesson slugs, read from the module folders (one test per module keeps each test short). */
const MODULES_DIR = join(process.cwd(), 'src', 'curriculum', 'modules') // tests run from web/
const COURSE = readdirSync(MODULES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => {
    const index = readFileSync(join(MODULES_DIR, d.name, 'index.ts'), 'utf8')
    const lessons = [...index.matchAll(/^\s+slug: "([^"]+)",\n\s+title:/gm)].map((m) => m[1])
    return { slug: d.name, lessons }
  })

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
  await expect(page.locator('.loading-block')).toHaveCount(0, { timeout: 30_000 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, `${route} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1)
  await expect(page.locator('text=Something on this page failed to load')).toHaveCount(0)
  expect(errors, `${route} console errors`).toEqual([])
}

const STATIC = ['/', '/learn', '/exam', '/practice', '/mock', '/papers', '/papers/prelim2026', '/papers/final2026', '/papers/noai2025', '/plan', '/about']

test('static pages render cleanly', async ({ page }) => {
  const errors = watch(page)
  for (const r of STATIC) await check(page, r, errors)
})

for (const m of COURSE) {
  test(`module ${m.slug} and its lessons render cleanly`, async ({ page }) => {
    const errors = watch(page)
    await check(page, `/learn/${m.slug}`, errors)
    expect(m.lessons.length).toBeGreaterThan(0)
    for (const l of m.lessons) {
      await check(page, `/learn/${m.slug}/${l}`, errors)
      await expect(page.locator('.prose')).not.toBeEmpty()
    }
  })
}

test('the course map links to every module', async ({ page }) => {
  await page.goto('./#/learn')
  await page.waitForLoadState('networkidle')
  const linked = await page.locator('a.roadmap-card').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash.replace('#/learn/', '')))
  expect(new Set(linked)).toEqual(new Set(COURSE.map((m) => m.slug)))
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
