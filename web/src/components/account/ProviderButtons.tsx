import { useState } from 'react'
import { account, type SignInProvider } from '../../lib/accounts'
import { AppleLogo, GoogleLogo } from './icons'

const NAME: Record<SignInProvider, string> = { google: 'Google', apple: 'Apple' }

/**
 * "Continue with Google" and "Continue with Apple", styled the way each company asks.
 * Each opens the provider's pop-up straight from the click (browsers block pop-ups opened any later).
 * A failed sign-in shows its message here; closing the pop-up shows nothing. `onStart` runs as a sign-in begins.
 */
export function ProviderButtons({ onStart }: { onStart?: () => void } = {}) {
  const [busy, setBusy] = useState<SignInProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const go = (p: SignInProvider) => {
    onStart?.()
    setBusy(p)
    setError(null)
    void account.signIn(p).then(() => {
      const s = account.get()
      setBusy(null)
      setError(s.status === 'signed-in' ? null : s.error)
    })
  }

  return (
    <div className="provider-buttons">
      <button type="button" className="provider-btn provider-google" onClick={() => go('google')} aria-busy={busy === 'google' || undefined}>
        <GoogleLogo />
        <span>Continue with Google</span>
      </button>
      <button type="button" className="provider-btn provider-apple" onClick={() => go('apple')} aria-busy={busy === 'apple' || undefined}>
        <AppleLogo />
        <span>Continue with Apple</span>
      </button>
      <p className="provider-status" role="status">
        {busy ? `Carry on in the ${NAME[busy]} window that just opened.` : ''}
      </p>
      {error && (
        <p className="account-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
