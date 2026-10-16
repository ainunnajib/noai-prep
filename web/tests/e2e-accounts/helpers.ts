import { expect, test as base, type Page } from '@playwright/test'

/*
  Shared helpers for the accounts end-to-end tests. They run against the pretend account backend (VITE_ACCOUNTS_MOCK=1),
  which keeps everything in localStorage under the site's "noai-prep:" prefix, so a test sets up any situation by
  seeding those keys before the page loads (see src/lib/accounts/mock-adapter.ts for the keys).
*/

export const STUDENT = { uid: 'mock-google', email: 'student@example.com', name: 'Sam Student', provider: 'google' }
export const INVITED = { uid: 'mock-invited', email: 'whitelisted@example.com', name: 'Ivy Invited', provider: 'google' }

export const FREE_LESSON = '#/learn/start-here/what-is-noai'
export const LOCKED_LESSON = '#/learn/python-basics/first-program'
export const LOCKED_LESSON_TITLE = 'Your first program (and your first error)'

/** Every test fails if the page logs an error or throws (missing web fonts aside: the test machine may be offline). */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('console', (m) => {
        if (m.type() === 'error' && !/Failed to load resource.*fonts|fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text())
      })
      page.on('pageerror', (e) => errors.push(e.message))
      await use(errors)
      expect(errors, 'console errors').toEqual([])
    },
    { auto: true },
  ],
})
export { expect }

/** Seeds localStorage once per test, before the site's own code runs (reloads and redirects keep what the test did since). */
export async function seed(page: Page, entries: Record<string, unknown>) {
  await page.addInitScript((entries) => {
    if (sessionStorage.getItem('e2e-seeded')) return
    sessionStorage.setItem('e2e-seeded', '1')
    for (const [k, v] of Object.entries(entries)) localStorage.setItem('noai-prep:' + k, JSON.stringify(v))
  }, entries)
}

/** A stored value (parsed), or null when absent. */
export function stored<T = unknown>(page: Page, key: string): Promise<T | null> {
  return page.evaluate((k) => {
    const raw = localStorage.getItem('noai-prep:' + k)
    return raw == null ? null : JSON.parse(raw)
  }, key)
}

export async function expectNoSidewaysScroll(page: Page, where: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, `${where} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1)
}

/** Opens the header's sign-in dialog and signs in with the given provider. */
export async function signInFromHeader(page: Page, provider: 'Google' | 'Apple' = 'Google') {
  await page.locator('.site-header').getByRole('button', { name: 'Sign in' }).click()
  const dialog = page.getByRole('dialog', { name: 'Sign in to NOAI Prep' })
  await dialog.getByRole('button', { name: `Continue with ${provider}` }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('link', { name: 'Your account' })).toBeVisible()
}

/** A small, valid ProgressState with the given lessons done. */
export function progressWith(lessons: string[], extra: Partial<{ exams: unknown[]; answers: Record<string, boolean[]> }> = {}) {
  const date = '2026-10-01T09:00:00.000Z'
  return {
    lessons: Object.fromEntries(lessons.map((l) => [l, date])),
    checkpoints: {},
    answers: extra.answers ?? {},
    exams: extra.exams ?? [],
  }
}
