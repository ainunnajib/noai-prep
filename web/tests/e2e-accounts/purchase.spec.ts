import { expect, LOCKED_LESSON, seed, signInFromHeader, STUDENT, stored, test } from './helpers'

/* Signing in, paying (the mock "Stripe" sends the browser straight back as paid), and coming back from checkout. */

test('sign in with Google, pay, and the course unlocks', async ({ page }) => {
  await page.goto(LOCKED_LESSON)
  const panel = page.locator('.lock-panel')
  await panel.getByRole('button', { name: 'Continue with Google' }).click()

  // signed in, but not paid: still locked, now with the unlock offer (and keyboard focus on its heading)
  await expect(page.getByRole('link', { name: 'Your account' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: 'Unlock the full course' })).toBeVisible()
  await expect(panel.getByRole('heading', { name: 'Unlock the full course' })).toBeFocused()
  await expect(page.locator('.prose')).toHaveCount(0)

  await panel.getByRole('button', { name: 'Unlock for S$10' }).click()
  await expect(page.getByText("You're in! Everything is unlocked.")).toBeVisible({ timeout: 25_000 })
  // Stripe's query string is tidied away, the page stays on #/account
  await expect.poll(() => page.evaluate(() => location.search)).toBe('')
  expect(await page.evaluate(() => location.hash)).toBe('#/account')
  await expect(page.getByText('Full access: paid')).toBeVisible()
  expect(await stored(page, 'mock-entitlements')).toEqual({ 'mock-google': 'paid' })

  // back to the lesson the unlock started from
  await page.getByRole('link', { name: 'Carry on where you were' }).click()
  await expect(page).toHaveURL(/#\/learn\/python-basics\/first-program$/)
  await expect(page.locator('.prose')).not.toBeEmpty()

  await page.goto(LOCKED_LESSON)
  await expect(page.locator('.prose')).not.toBeEmpty()
  await expect(page.locator('.lock-panel')).toHaveCount(0)
  await page.goto('#/learn')
  await expect(page.locator('.roadmap-card').first()).toBeVisible()
  await expect(page.locator('.lock-mark, .chip-free')).toHaveCount(0)
})

test('unlocking from the account page works too', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT })
  await page.goto('#/account')
  await expect(page.getByText('Free preview')).toBeVisible()
  await page.getByRole('button', { name: 'Unlock for S$10' }).click()
  await expect(page.getByText("You're in! Everything is unlocked.")).toBeVisible({ timeout: 25_000 })
  await expect(page.getByText('Full access: paid')).toBeVisible()
  // started from this page, so the banner offers the course
  await expect(page.getByRole('link', { name: 'Continue the course' })).toBeVisible()
})

test('a cancelled payment says so, and charges nothing', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT })
  await page.goto('./?checkout=cancelled#/account')
  await expect(page.getByText("Payment cancelled. You haven't been charged.")).toBeVisible()
  await expect(page.getByText('Free preview')).toBeVisible()
  await expect.poll(() => page.evaluate(() => location.search)).toBe('')
  expect(await stored(page, 'mock-entitlements')).toBeNull()
})

test('a payment that has not gone through does not unlock', async ({ page }) => {
  await seed(page, { 'mock-auth': STUDENT, 'mock-checkout-fail': true })
  await page.goto('./?checkout=success&session_id=cs_test_mock#/account')
  await expect(page.getByText('Payment received — unlocking…')).toBeVisible()
  // while the payment is being confirmed, no second "Unlock" button to pay again with
  await expect(page.getByText('Confirming your payment…')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unlock for S$10' })).toHaveCount(0)
  // the page waits about 20 s for the unlock before saying it is still being confirmed
  await expect(page.getByText('Your payment is still being confirmed.')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText("There's no need to pay again.")).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unlock for S$10' })).toHaveCount(0)
  // after a refresh (the return from Stripe is over) the unlock offer is back, for someone who really wasn't charged
  await page.reload()
  await expect(page.getByText('Free preview')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unlock for S$10' })).toBeVisible()
})

test('coming back from checkout signed out asks you to sign in, then unlocks', async ({ page }) => {
  await page.goto('./?checkout=success&session_id=cs_test_mock#/account')
  await expect(page.getByText('Sign in with the account you paid with to finish unlocking.')).toBeVisible()
  await page.locator('main').getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page.getByText("You're in! Everything is unlocked.")).toBeVisible({ timeout: 25_000 })
})

test('the sign-in dialog: opens from the header, Escape closes it, focus comes back', async ({ page }) => {
  await page.goto('#/')
  const opener = page.locator('.site-header').getByRole('button', { name: 'Sign in' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Sign in to NOAI Prep' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Save your progress across your devices, and unlock the full course.')
  await expect(dialog.getByRole('button', { name: 'Continue with Google' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()

  await opener.click()
  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()

  await signInFromHeader(page, 'Apple')
  await page.getByRole('link', { name: 'Your account' }).click()
  await expect(page.getByText('Signed in with Apple')).toBeVisible()
})

test('a blocked pop-up shows a helpful message', async ({ page }) => {
  await seed(page, { 'mock-signin-error': 'auth/popup-blocked' })
  await page.goto('#/')
  await page.locator('.site-header').getByRole('button', { name: 'Sign in' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Continue with Google' }).click()
  await expect(dialog.getByRole('alert')).toHaveText('Your browser blocked the sign-in window. Allow pop-ups for this site and try again.')
  await expect(page.locator('.site-header').getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('a closed pop-up shows nothing', async ({ page }) => {
  await seed(page, { 'mock-signin-error': 'auth/popup-closed-by-user' })
  await page.goto(LOCKED_LESSON)
  await page.locator('.lock-panel').getByRole('button', { name: 'Continue with Apple' }).click()
  await expect(page.locator('.lock-panel [aria-busy]')).toHaveCount(0)
  await expect(page.locator('.account-error')).toHaveCount(0)
})
