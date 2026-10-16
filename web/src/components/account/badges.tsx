import { ACCOUNTS_ENABLED, hasFullAccess, isAccessPending, useAccount } from '../../lib/accounts'
import { LockIcon } from './icons'

/**
 * Whether to mark free and locked content (course map, module pages, past papers): accounts are on, this person
 * doesn't have full access, and that is settled (no lock flashes up while sign-in is still being restored).
 */
export function useShowLocks(): boolean {
  const s = useAccount()
  return ACCOUNTS_ENABLED && !hasFullAccess(s) && !isAccessPending(s)
}

/** A small lock for cards, lesson rows and links; screen readers hear "Locked". */
export function LockMark() {
  return (
    <span className="lock-mark">
      <LockIcon />
      <span className="sr-only">Locked</span>
    </span>
  )
}

/** Marks one of the free modules. */
export function FreeChip() {
  return <span className="chip chip-free">Free</span>
}
