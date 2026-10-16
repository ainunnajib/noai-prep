import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { account, hasFullAccess, PRICE_LABEL } from '../../lib/accounts'

/** sessionStorage key: the page the unlock started from, so the "You're in!" banner can send the student back there */
export const UNLOCK_FROM_KEY = 'noai-prep:unlock-from'

/**
 * "Unlock for S$10": sends the browser to Stripe's checkout page. Stays busy while the browser leaves, and is ready
 * again if the page comes back from the back/forward cache (Back pressed on Stripe's page); shows the error if the
 * payment page couldn't be opened.
 */
export function UnlockButton({ small = false }: { small?: boolean }) {
  const { pathname } = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // pressing Back on Stripe's page can bring this page back from the back/forward cache with the button still busy
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setBusy(false)
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const unlock = async () => {
    setBusy(true)
    setError(null)
    // sessionStorage survives the same-tab round trip to Stripe
    try {
      if (pathname !== '/account') sessionStorage.setItem(UNLOCK_FROM_KEY, pathname)
      else sessionStorage.removeItem(UNLOCK_FROM_KEY)
    } catch {
      /* storage blocked: the banner falls back to the next lesson */
    }
    await account.startCheckout()
    const s = account.get()
    // still here: it failed, the account turned out to be unlocked already, or the person was signed out meanwhile
    if (s.error || hasFullAccess(s) || s.status !== 'signed-in') {
      setError(s.error)
      setBusy(false)
    }
  }

  return (
    <div className="unlock-action">
      <button type="button" className={`btn btn-primary${small ? ' btn-small' : ''}`} onClick={unlock} disabled={busy} aria-busy={busy || undefined}>
        {busy ? 'Opening the payment page…' : `Unlock for ${PRICE_LABEL}`}
      </button>
      {error && (
        <p className="account-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
