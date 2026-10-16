/*
  The Unlock button, rendered on its own. Run: npx vitest run tests/accounts
*/
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// the browser leaves for Stripe: startCheckout resolves and the page goes away (here: stays, as if it came back)
vi.mock('../../src/lib/accounts', () => ({
  PRICE_LABEL: 'S$10',
  hasFullAccess: () => false,
  account: {
    startCheckout: async () => {},
    get: () => ({ status: 'signed-in', error: null, access: 'none', accessKnown: true }),
  },
}))

const { UnlockButton } = await import('../../src/components/account/UnlockButton')

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
let host: HTMLDivElement
let root: Root
beforeEach(() => {
  host = document.body.appendChild(document.createElement('div'))
  root = createRoot(host)
})
afterEach(() => {
  act(() => root.unmount())
  host.remove()
})

describe('UnlockButton', () => {
  it('is ready again when the page comes back from the back/forward cache (Back pressed on the payment page)', async () => {
    act(() =>
      root.render(
        <MemoryRouter>
          <UnlockButton />
        </MemoryRouter>,
      ),
    )
    const button = host.querySelector('button')!
    expect(button.textContent).toBe('Unlock for S$10')
    await act(async () => button.click())
    expect(button.textContent).toBe('Opening the payment page…')
    expect(button.disabled).toBe(true)
    // an ordinary pageshow (a first load) changes nothing
    act(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false })))
    expect(button.disabled).toBe(true)
    act(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })))
    expect(button.textContent).toBe('Unlock for S$10')
    expect(button.disabled).toBe(false)
  })
})
