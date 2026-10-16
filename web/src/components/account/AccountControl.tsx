import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount, type AccountUser } from '../../lib/accounts'
import { PersonIcon } from './icons'
import { openSignIn } from './signInStore'

/** A round picture of the person: their sign-in photo, or the first letter of their name or email. */
export function Avatar({ user, large = false }: { user: AccountUser; large?: boolean }) {
  const [broken, setBroken] = useState(false)
  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()
  return (
    <span className={`avatar${large ? ' avatar-large' : ''}`} aria-hidden="true">
      {user.photoURL && !broken ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} /> : initial}
    </span>
  )
}

/** The header's account control: Sign in, or the signed-in person's avatar linking to the account page. */
export function AccountControl() {
  const s = useAccount()
  // restoring sign-in: hold the avatar's place so the header doesn't jump
  if (s.status === 'loading') return <span className="account-placeholder" aria-hidden="true" />
  if (s.status === 'signed-in' && s.user)
    return (
      <Link to="/account" className="account-link" aria-label="Your account" title={s.user.name || s.user.email || 'Your account'}>
        <Avatar user={s.user} />
      </Link>
    )
  return (
    <button type="button" className="btn btn-small signin-btn" onClick={openSignIn}>
      <PersonIcon />
      <span className="signin-label">Sign in</span>
    </button>
  )
}
