import { expect, FREE_LESSON, LOCKED_LESSON, progressWith, seed, signInFromHeader, STUDENT, stored, test } from './helpers'

/* Progress and the account: merging on sign-in, another device's progress, sign-out, deleting, and the access hint. */

type Progress = ReturnType<typeof progressWith>

const lessonsDone = (page: import('@playwright/test').Page) => page.locator('.roadmap-big').first()

test('progress made before signing in is kept in the account', async ({ page }) => {
  await page.goto(FREE_LESSON)
  await page.getByRole('button', { name: 'Mark lesson complete' }).click()
  await expect(page.getByText('Your progress is saved in this browser.')).toBeVisible()

  await signInFromHeader(page)
  await expect(page.getByText('Your progress is saved to your account.')).toBeVisible()
  await expect
    .poll(async () => Object.keys((await stored<Progress>(page, 'mock-remote-progress:mock-google'))?.lessons ?? {}))
    .toEqual(['start-here/what-is-noai'])

  await page.goto('#/account')
  await expect(page.locator('.account-stat-wide')).toContainText('1 / 184')
  await expect(page.getByText('Synced just now')).toBeVisible()
})

test('progress saved in the account (another device) appears after signing in, merged with this browser', async ({ page }) => {
  await seed(page, {
    'mock-remote-progress:mock-google': progressWith(['start-here/what-is-noai', 'start-here/how-to-study', 'ai-first-look/what-is-ai']),
    'progress-v1': progressWith(['start-here/exam-format-and-strategy']),
  })
  await page.goto('#/learn')
  await expect(lessonsDone(page)).toHaveText('1 / 184 lessons')
  await signInFromHeader(page)
  await expect(lessonsDone(page)).toHaveText('4 / 184 lessons')
  // and the account copy now has this browser's lesson too
  await expect
    .poll(async () => Object.keys((await stored<Progress>(page, 'mock-remote-progress:mock-google'))?.lessons ?? {}).length)
    .toBe(4)
})

test('signing out clears this browser, and signing back in brings the progress back', async ({ page }) => {
  const saved = progressWith(['start-here/what-is-noai', 'start-here/how-to-study'])
  await seed(page, { 'mock-auth': STUDENT, 'progress-v1': saved, 'mock-remote-progress:mock-google': saved, 'mock-current': { formatId: 'sprint' } })
  await page.goto('#/account')
  await expect(page.locator('.account-stat-wide')).toContainText('2 / 184')
  await page.getByRole('button', { name: 'Sign out' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible()
  await expect(page.locator('.site-header').getByRole('button', { name: 'Sign in' })).toBeVisible()
  expect(await stored(page, 'progress-v1')).toBeNull()
  expect(await stored(page, 'mock-current')).toBeNull()
  expect(await stored(page, 'mock-auth')).toBeNull()
  expect(await stored(page, 'access-hint')).toBeNull()
  await page.goto('#/learn')
  await expect(lessonsDone(page)).toHaveText('0 / 184 lessons')

  await signInFromHeader(page)
  await expect(lessonsDone(page)).toHaveText('2 / 184 lessons')
})

test('deleting saved progress empties the account copy and this browser', async ({ page }) => {
  const saved = progressWith(['start-here/what-is-noai'], {
    exams: [{ id: 'e1', date: '2026-10-02T09:00:00.000Z', mode: 'sprint', total: 30, correct: 21, seconds: 900, byDomain: {} }],
    answers: { 'bank.q1': [true], 'bank.q2': [false] },
  })
  await seed(page, { 'mock-auth': STUDENT, 'progress-v1': saved, 'mock-remote-progress:mock-google': saved })
  await page.goto('#/account')
  await expect(page.locator('.account-stat-wide')).toContainText('1 / 184')
  await expect(page.getByRole('table')).toContainText('Sprint')
  await expect(page.getByRole('table')).toContainText('21/30 (70%)')

  // Cancel puts keyboard focus back on the button that opened the question
  await page.getByRole('button', { name: 'Delete my saved progress' }).click()
  await page.getByRole('group', { name: 'Confirm deleting your progress' }).getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('button', { name: 'Delete my saved progress' })).toBeFocused()

  await page.getByRole('button', { name: 'Delete my saved progress' }).click()
  await page.getByRole('button', { name: 'Delete my progress' }).click()
  await expect(page.getByText('Your saved progress has been deleted')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Delete my saved progress' })).toBeFocused()
  await expect(page.locator('.account-stat-wide')).toContainText('0 / 184')
  await expect(page.getByText('No mock exams yet.')).toBeVisible()
  await expect.poll(() => stored(page, 'mock-remote-progress:mock-google')).toBeNull()
})

test('deleting the account signs you out and warns about a paid unlock first', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT, 'mock-entitlements': { 'mock-google': 'paid' }, 'mock-remote-progress:mock-google': progressWith(['start-here/what-is-noai']) })
  await page.goto('#/account')
  await expect(page.getByText('Full access: paid')).toBeVisible()
  await page.getByRole('button', { name: 'Delete my account' }).click()
  await expect(page.getByRole('group', { name: 'Confirm deleting your account' })).toContainText('Your S$10 unlock belongs to this account')
  await page.getByRole('group', { name: 'Confirm deleting your account' }).getByRole('button', { name: 'Delete my account' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible()
  const note = page.getByRole('status').filter({ hasText: 'Your account has been deleted' })
  await expect(note).toBeVisible()
  // shown from the top (not left under the sticky header at the old scroll position), with focus on it
  await expect(note).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await expect(note).toBeInViewport({ ratio: 1 })
  expect(await stored(page, 'mock-auth')).toBeNull()
  expect(await stored(page, 'mock-remote-progress:mock-google')).toBeNull()
})

/** Records whether the lock ever appeared on the page, from the very first render. */
async function watchForLock(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { sawLock: boolean }
    w.sawLock = false
    // every added node is checked, so even a lock that is gone again before the next paint counts
    new MutationObserver((records) => {
      for (const r of records)
        for (const n of r.addedNodes) if (n instanceof Element && (n.matches('.lock-panel') || n.querySelector('.lock-panel'))) w.sawLock = true
    }).observe(document, { childList: true, subtree: true })
  })
}

test('a returning paid user never sees the lock while sign-in is restored', async ({ page }) => {
  await seed(page, {
    'mock-auth': STUDENT,
    'mock-entitlements': { 'mock-google': 'paid' },
    'access-hint': { uid: 'mock-google', access: 'paid' },
  })
  await watchForLock(page)
  await page.goto(LOCKED_LESSON)
  await expect(page.locator('.prose')).not.toBeEmpty()
  await page.reload()
  await expect(page.locator('.prose')).not.toBeEmpty()
  await page.waitForTimeout(1000) // past the backend's answers
  expect(await page.evaluate(() => (window as unknown as { sawLock: boolean }).sawLock)).toBe(false)
  await expect(page.locator('.lock-panel')).toHaveCount(0)
})

test('without the hint (a new device), a paid user sees a placeholder, not the lock', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT, 'mock-entitlements': { 'mock-google': 'paid' } })
  await watchForLock(page)
  await page.goto(LOCKED_LESSON)
  await expect(page.locator('.prose')).not.toBeEmpty()
  expect(await page.evaluate(() => (window as unknown as { sawLock: boolean }).sawLock)).toBe(false)
  expect(await stored(page, 'access-hint')).toEqual({ uid: 'mock-google', access: 'paid' })
})

test('a failed save says so, and progress stays on this device', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT, 'mock-sync-fail': true })
  await page.goto(FREE_LESSON)
  await page.getByRole('button', { name: 'Mark lesson complete' }).click()
  await page.goto('#/account')
  await expect(page.getByRole('alert')).toHaveText("Couldn't save your progress to your account. It's still saved on this device.", { timeout: 10_000 })
  await expect(page.locator('.sync-status')).toHaveText('Not saved to your account yet')
  await expect(page.locator('.account-stat-wide')).toContainText('1 / 184')
  // the rest of the page doesn't claim otherwise
  await expect(page.getByText('Your progress is saved in this browser. You can delete it')).toBeVisible()
  await expect(page.getByText("Your latest progress isn't saved to your account yet. Signing out now would clear it from this browser.")).toBeVisible()
})

test("signing out with progress the account doesn't have yet asks first, instead of wiping it", async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT, 'mock-sync-fail': true })
  await page.goto(FREE_LESSON)
  await page.getByRole('button', { name: 'Mark lesson complete' }).click()
  await page.goto('#/account')
  await expect(page.locator('.sync-status')).toHaveText('Not saved to your account yet', { timeout: 10_000 })
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('alert')).toHaveText(/Some of your progress hasn't reached your account yet/, { timeout: 10_000 })
  await expect(page.getByRole('heading', { level: 1, name: 'Your account' })).toBeVisible() // still signed in
  await expect(page.locator('.sync-status')).toHaveText('Not saved to your account yet')
  await expect(page.getByText('Your progress is saved in this browser. You can delete it')).toBeVisible()
  expect(Object.keys((await stored<Progress>(page, 'progress-v1'))?.lessons ?? {})).toEqual(['start-here/what-is-noai'])
  // the person decides
  await page.getByRole('button', { name: 'Sign out anyway' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible()
  expect(await stored(page, 'progress-v1')).toBeNull()
  await expect(page.getByRole('alert')).toHaveCount(0) // no leftover "still saved on this device"
})
