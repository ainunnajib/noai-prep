import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, expectNoSidewaysScroll, FREE_LESSON, INVITED, LOCKED_LESSON, LOCKED_LESSON_TITLE, seed, STUDENT, stored, test } from './helpers'

/* What is open and what is locked, signed out, signed in without access, and with full access. */

const MODULE_COUNT = readdirSync(join(process.cwd(), 'src', 'curriculum', 'modules'), { withFileTypes: true }).filter(
  (d) => d.isDirectory() && !d.name.startsWith('_'),
).length

test('a free lesson opens without signing in', async ({ page }) => {
  await page.goto(FREE_LESSON)
  await expect(page.locator('.prose')).not.toBeEmpty()
  await expect(page.locator('.lock-panel')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Mark lesson complete' })).toBeVisible()
  // only the first two modules are free, so the page description (search results, link previews) doesn't say "free"
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^A step-by-step course/)
})

test('a locked lesson asks you to sign in, inside the lesson frame', async ({ page }) => {
  await page.goto(LOCKED_LESSON)
  const panel = page.locator('.lock-panel')
  await expect(panel.getByRole('heading', { name: 'Sign in to keep going' })).toBeVisible()
  // the lesson keeps its title, breadcrumb and pager, so you can still find your way around
  await expect(page.getByRole('heading', { level: 1, name: LOCKED_LESSON_TITLE })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Lesson navigation' })).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Continue with Apple' })).toBeVisible()
  await expect(panel).toContainText('The first two modules are free')
  await expect(panel).toContainText('Full access is a one-time S$10')
  await expect(page.locator('.prose')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Mark lesson complete' })).toHaveCount(0)
  await expect(page).toHaveTitle(new RegExp(LOCKED_LESSON_TITLE.replace(/[()]/g, '\\$&')))
})

test('practice, mock exams and past papers are locked when signed out', async ({ page }) => {
  for (const [route, heading] of [
    ['#/practice', 'Practise by topic'],
    ['#/mock', 'Sit a timed mock exam'],
    ['#/papers/prelim2026', 'NOAI 2026 Preliminary Round'],
  ]) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect(page.locator('.lock-panel').getByRole('heading', { name: 'Sign in to keep going' })).toBeVisible()
    await expect(page.locator('.qcard')).toHaveCount(0)
    await expect(page.locator('.toolbar')).toHaveCount(0)
  }
})

test('signed in without access: the tools offer the unlock instead', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT })
  for (const [route, heading] of [
    ['#/practice', 'Practise by topic'],
    ['#/mock', 'Sit a timed mock exam'],
    ['#/papers/final2026', 'NOAI 2026 Final — Section 1'],
    [LOCKED_LESSON, LOCKED_LESSON_TITLE],
  ]) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    const panel = page.locator('.lock-panel')
    await expect(panel.getByRole('heading', { name: 'Unlock the full course' })).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Unlock for S$10' })).toBeVisible()
    await expect(panel).toContainText('S$10 one-time. No subscription.')
    await expect(panel).toContainText('Payments are handled securely by Stripe.')
    await expect(panel).toContainText('Were you given free access?')
    await expect(page.locator('.qcard')).toHaveCount(0)
  }
})

test('the course map, module pages and past papers mark what is free and what is locked', async ({ page }) => {
  await page.goto('#/learn')
  await expect(page.locator('.roadmap-card .chip-free')).toHaveCount(2)
  await expect(page.locator('.roadmap-card .lock-mark')).toHaveCount(MODULE_COUNT - 2)
  await expect(page.getByRole('link', { name: /Python from zero.*Locked/ })).toBeVisible()

  await page.goto('#/learn/python-basics')
  const rows = page.locator('.module-lesson')
  await expect(rows.first()).toBeVisible()
  await expect(page.locator('.module-lesson .lock-mark')).toHaveCount(await rows.count())
  await expect(page.locator('.lock-note')).toContainText('part of the full course')

  await page.goto('#/learn/start-here')
  await expect(page.locator('.lesson-meta .chip-free')).toBeVisible()
  await expect(page.locator('.module-lesson .lock-mark')).toHaveCount(0)

  await page.goto('#/papers')
  await expect(page.locator('.paper-card .lock-mark')).toHaveCount(3)
})

test('an invited (whitelisted) account has full access, with no locks anywhere', async ({ page }) => {
  await seed(page, { 'mock-auth': INVITED })
  await page.goto(LOCKED_LESSON)
  await expect(page.locator('.prose')).not.toBeEmpty()
  await expect(page.locator('.lock-panel')).toHaveCount(0)
  expect(await stored(page, 'mock-entitlements')).toEqual({ 'mock-invited': 'whitelist' })

  await page.goto('#/practice')
  await expect(page.locator('.practice-wrap .qcard')).toBeVisible({ timeout: 30_000 })
  await page.goto('#/learn')
  await expect(page.locator('.roadmap-card').first()).toBeVisible()
  await expect(page.locator('.lock-mark, .chip-free')).toHaveCount(0)
  await page.goto('#/account')
  await expect(page.getByText('Full access: invited')).toBeVisible()
})

test('the home page offers the unlock only to people without full access', async ({ page }) => {
  await page.goto('#/')
  await expect(page.locator('.hero-free')).toHaveText('The first two modules are free, no sign-in needed. Full access to everything is a one-time S$10.')
  await seed(page, { 'mock-auth': STUDENT, 'mock-entitlements': { 'mock-google': 'paid' } })
  await page.reload() // (the seed runs on the next load)
  await expect(page.getByRole('link', { name: 'Your account' })).toBeVisible()
  await page.waitForTimeout(500) // past the access check
  await expect(page.locator('.hero-free')).toHaveCount(0)
})

test('a paid account opens practice, mock exams and past papers', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT, 'mock-entitlements': { 'mock-google': 'paid' } })
  await page.goto('#/practice')
  await expect(page.locator('.practice-wrap .qcard')).toBeVisible({ timeout: 30_000 })
  await page.goto('#/mock')
  await expect(page.getByRole('button', { name: 'Start the clock' })).toBeVisible()
  await page.goto('#/papers/noai2025')
  await expect(page.locator('.paper-q').first()).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.lock-panel')).toHaveCount(0)
})

/** The web fonts never arrive (a network that blocks them): the page uses its fallback fonts throughout. */
const noWebFonts = (page: import('@playwright/test').Page) =>
  page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))

test("the header doesn't jump while sign-in is restored for a signed-out visitor", async ({ page }) => {
  await noWebFonts(page) // the same fonts from first paint to last
  await page.addInitScript(() => {
    const w = window as unknown as { xs: Record<string, number[]>; sawLoading: boolean }
    w.xs = { nav: [], menu: [] }
    w.sawLoading = false
    const poll = () => {
      if (document.querySelector('.site-header .signin-btn[aria-hidden="true"]')) w.sawLoading = true // the stand-in while loading
      for (const [k, sel] of [['nav', '.site-nav'], ['menu', '.menu-btn']] as const) {
        const r = document.querySelector(sel)?.getBoundingClientRect()
        if (r && r.width > 0 && w.xs[k].at(-1) !== Math.round(r.x)) w.xs[k].push(Math.round(r.x))
      }
      requestAnimationFrame(poll)
    }
    requestAnimationFrame(poll)
  })
  await page.goto('#/learn')
  await expect(page.locator('.site-header').getByRole('button', { name: 'Sign in' })).toBeVisible()
  await page.waitForTimeout(300)
  const { xs, sawLoading } = await page.evaluate(() => {
    const w = window as unknown as { xs: Record<string, number[]>; sawLoading: boolean }
    return { xs: w.xs, sawLoading: w.sawLoading }
  })
  expect(sawLoading).toBe(true)
  expect(xs.nav.length + xs.menu.length).toBeGreaterThan(0)
  expect(xs.nav.length, `nav moved: ${xs.nav}`).toBeLessThanOrEqual(1)
  expect(xs.menu.length, `menu button moved: ${xs.menu}`).toBeLessThanOrEqual(1)
})

test('the signed-out header fits just above the phone menu width, even before the web fonts arrive', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'a desktop width')
  await noWebFonts(page)
  for (const width of [881, 884, 887, 900, 950, 1000]) {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('#/')
    await expect(page.locator('.site-header').getByRole('button', { name: 'Sign in' })).toBeVisible()
    await expectNoSidewaysScroll(page, `the home page at ${width}px (signed out, fallback fonts)`)
  }
})

test('pages fit the screen, signed out and signed in', async ({ page }) => {
  const routes = ['#/', '#/learn', '#/learn/python-basics', LOCKED_LESSON, '#/practice', '#/mock', '#/papers', '#/papers/prelim2026', '#/account', '#/about']
  for (const r of routes) {
    await page.goto(r)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('.loading-block')).toHaveCount(0, { timeout: 30_000 })
    await expectNoSidewaysScroll(page, `${r} (signed out)`)
  }
  // the header's sign-in dialog fits too
  await page.locator('.site-header').getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoSidewaysScroll(page, 'sign-in dialog')
  await page.getByRole('dialog').getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page.getByRole('link', { name: 'Your account' })).toBeVisible()
  for (const r of routes) {
    await page.goto(r)
    await expect(page.locator('.loading-block')).toHaveCount(0, { timeout: 30_000 })
    await expectNoSidewaysScroll(page, `${r} (signed in)`)
  }
})
