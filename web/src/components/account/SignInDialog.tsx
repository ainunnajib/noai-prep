import { useEffect, useLayoutEffect, useRef } from 'react'
import { PRICE_LABEL, useAccount } from '../../lib/accounts'
import { CloseIcon } from './icons'
import { ProviderButtons } from './ProviderButtons'
import { closeSignIn, useSignInOpen } from './signInStore'

/**
 * The sign-in dialog (a native modal <dialog>: the rest of the page is inert while it is open, and Escape closes it).
 * Opened with openSignIn(); closes itself once sign-in works, and gives focus back to whatever opened it.
 */
export function SignInDialog() {
  const open = useSignInOpen()
  const { status } = useAccount()
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  // layout effect: the dialog opens and closes in the same frame as its content appears and goes
  useLayoutEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      d.showModal()
      d.querySelector<HTMLElement>('.provider-btn')?.focus()
    } else if (!open && d.open) d.close()
  }, [open])

  // signed in: nothing left to do here
  useEffect(() => {
    if (open && status === 'signed-in') closeSignIn()
  }, [open, status])

  // fires however it closed (Escape, the close button, a click outside, signing in)
  const onClose = () => {
    closeSignIn()
    // the Sign in button is replaced by the avatar once signed in: focus that instead
    const back = opener.current?.isConnected ? opener.current : document.querySelector<HTMLElement>('.account-link')
    opener.current = null
    back?.focus()
  }

  return (
    <dialog
      ref={ref}
      className="signin-dialog"
      aria-labelledby="signin-title"
      aria-describedby="signin-why"
      aria-modal="true"
      onClose={onClose}
      // a click on the dimmed backdrop lands on the <dialog> itself (its content fills it edge to edge)
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSignIn()
      }}
    >
      {open && (
        <div className="signin-body">
          <h2 id="signin-title">Sign in to NOAI Prep</h2>
          <p id="signin-why">Save your progress across your devices, and unlock the full course.</p>
          <ProviderButtons />
          <p className="fineprint">
            The first two modules are free without signing in. Full access is a one-time {PRICE_LABEL}.
          </p>
          <button type="button" className="dialog-close" aria-label="Close" onClick={closeSignIn}>
            <CloseIcon />
          </button>
        </div>
      )}
    </dialog>
  )
}
