import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getModule, lessonSequence, moduleHref, modules } from '../../curriculum/registry'
import { canUseGatedTools, canViewLesson, FREE_MODULES, isAccessPending, PRICE_LABEL, useAccount } from '../../lib/accounts'
import { PageSkeleton } from '../layout/AppShell'
import { LockIcon } from './icons'
import { ProviderButtons } from './ProviderButtons'
import { UnlockButton } from './UnlockButton'

/*
  The in-app lock on the paid parts of the course: lessons outside the free modules, Practice, Mock exam and the
  individual past papers. With accounts off, or with full access, it simply shows its children.
*/

export type GateKind = 'lesson' | 'practice' | 'mock' | 'paper'

/** open: show the content; pending: access isn't settled yet, show a placeholder (never the lock); locked: show the lock. */
export type GateState = 'open' | 'pending' | 'locked'

export function useGate(kind: GateKind, moduleSlug = ''): GateState {
  const s = useAccount()
  const allowed = kind === 'lesson' ? canViewLesson(s, moduleSlug) : canUseGatedTools(s)
  if (allowed) return 'open'
  return isAccessPending(s) ? 'pending' : 'locked'
}

const WHAT: Record<GateKind, string> = {
  lesson: 'This lesson is part of the full course.',
  practice: 'The practice question bank is part of the full course.',
  mock: 'Timed mock exams are part of the full course.',
  paper: 'The solved past papers are part of the full course.',
}

/** The free modules as links: "<first> and <second>". */
function FreeModuleLinks() {
  const free = FREE_MODULES.map((slug) => getModule(slug)).filter((m) => m !== undefined)
  return (
    <>
      {free.map((m, i) => (
        <span key={m.slug}>
          {i > 0 && (i === free.length - 1 ? ' and ' : ', ')}
          <Link to={moduleHref(m.slug)}>{m.title}</Link>
        </span>
      ))}
    </>
  )
}

/**
 * Set as a sign-in starts from a lock panel. While access is checked the gate shows a placeholder, so the lock that
 * comes back is a new panel: it takes focus (the button that had it is gone) and clears this.
 */
let focusNextLock = false

/** Signed out: sign in to carry on. Signed in without access: what the one-time unlock gives. */
export function LockedPanel({ kind }: { kind: GateKind }) {
  const s = useAccount()
  const titleId = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const signedIn = s.status === 'signed-in'

  // signing in from a lock panel swaps it for a placeholder and then a new panel: keep keyboard and screen-reader
  // users in place (on the new heading)
  useEffect(() => {
    if (!signedIn) return
    if (focusNextLock && (document.activeElement === document.body || !document.activeElement)) heading.current?.focus()
    focusNextLock = false
  }, [signedIn])

  if (!signedIn)
    return (
      <section className="lock-panel card" aria-labelledby={titleId}>
        <span className="lock-badge" aria-hidden="true">
          <LockIcon />
        </span>
        <h2 id={titleId}>Sign in to keep going</h2>
        <p>
          {WHAT[kind]} The first two modules are free to everyone: <FreeModuleLinks />.
        </p>
        <ProviderButtons
          onStart={() => {
            focusNextLock = true
          }}
        />
        <p className="fineprint">Signing in also saves your progress to your account. Full access is a one-time {PRICE_LABEL}.</p>
      </section>
    )

  return (
    <section className="lock-panel card" aria-labelledby={titleId}>
      <span className="lock-badge" aria-hidden="true">
        <LockIcon />
      </span>
      <h2 id={titleId} ref={heading} tabIndex={-1}>
        Unlock the full course
      </h2>
      <p>{WHAT[kind]} One payment unlocks all of it:</p>
      <ul className="unlock-list">
        <li>
          All {modules.length} modules and {lessonSequence.length} lessons, each with its checkpoint questions
        </li>
        <li>The practice question bank, by topic and difficulty</li>
        <li>Timed mock exams in the Preliminary Round format</li>
        <li>Every official past paper, solved and explained</li>
      </ul>
      <p className="unlock-price">
        <strong>{PRICE_LABEL} one-time.</strong> No subscription.
      </p>
      <UnlockButton />
      <p className="fineprint">Payments are handled securely by Stripe.</p>
      <p className="fineprint">
        Were you given free access? Sign in with the email address you were invited with.
        {s.user?.email && (
          <>
            {' '}
            You're signed in as <strong className="nowrap-email">{s.user.email}</strong>.
          </>
        )}
      </p>
    </section>
  )
}

/** Sets the tab title while the lock (or its placeholder) stands in for a page whose own code would normally set it. */
function useStandInTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return
    document.title = `${title} · NOAI Prep`
    return () => {
      document.title = 'NOAI Prep'
    }
  }, [title])
}

interface GateProps {
  kind: GateKind
  /** lessons: the lesson's module (the free modules stay open) */
  moduleSlug?: string
  /** pages: the page's heading (eyebrow, title, lede), kept above the lock so the page still says where you are */
  head?: ReactNode
  /** pages: the tab title while locked */
  title?: string
  children: ReactNode
}

/**
 * Shows its children when this person may see them. Otherwise a placeholder while access is being checked, then the
 * lock. For a lesson the lock goes inside the lesson's own frame (the page keeps its title, breadcrumb and pager);
 * for a page it comes with the page's heading.
 */
export function AccessGate({ kind, moduleSlug, head, title, children }: GateProps) {
  const gate = useGate(kind, moduleSlug)
  useStandInTitle(gate === 'open' || kind === 'lesson' ? undefined : title)
  if (gate === 'open') return <>{children}</>
  if (kind === 'lesson') return gate === 'pending' ? <div className="loading-block">Loading lesson…</div> : <LockedPanel kind={kind} />
  if (gate === 'pending') return <PageSkeleton />
  return (
    <div className="page page-narrow">
      {head && <div className="page-head">{head}</div>}
      <LockedPanel kind={kind} />
    </div>
  )
}
