import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/account/AccountControl'
import { BreakableEmail } from '../components/account/BreakableEmail'
import { useSavedWhere } from '../components/account/copy'
import { ProviderButtons } from '../components/account/ProviderButtons'
import { UNLOCK_FROM_KEY, UnlockButton } from '../components/account/UnlockButton'
import { PageSkeleton } from '../components/layout/AppShell'
import { lessonHref, lessonSequence, partList } from '../curriculum/registry'
import { MOCK_FORMATS } from '../data/mockFormats'
import { formatDuration, pct, plural } from '../lib/format'
import {
  account,
  ACCOUNTS_ENABLED,
  hasFullAccess,
  PRICE_LABEL,
  useAccount,
  type AccountState,
  type AccountUser,
} from '../lib/accounts'
import { CONFIRM_ERROR, CONFIRM_WRONG_ACCOUNT_ERROR, SIGN_OUT_UNSAVED_ERROR, SYNC_ERROR } from '../lib/accounts/errors'
import { lessonKey, useProgress, type ProgressState } from '../lib/progress'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { nextLesson } from './Roadmap'

/** How long to wait for the unlock after returning from Stripe (the webhook or the payment check may take a moment). */
const UNLOCK_WAIT_MS = 20_000
/** Mock exams listed in the history table (the newest first) */
const EXAMS_SHOWN = 10

// ---------------- coming back from Stripe ----------------

type CheckoutReturn = { kind: 'success'; sessionId: string } | { kind: 'cancelled' } | null
type CheckoutPhase = 'idle' | 'sign-in' | 'confirming' | 'done' | 'slow'

/** What Stripe sent the browser back with: ?checkout=…&session_id=… sits before the #/account hash. */
function readCheckoutReturn(): CheckoutReturn {
  if (!ACCOUNTS_ENABLED) return null
  const q = new URLSearchParams(window.location.search)
  const sessionId = q.get('session_id')
  if (q.get('checkout') === 'success' && sessionId) return { kind: 'success', sessionId }
  if (q.get('checkout') === 'cancelled') return { kind: 'cancelled' }
  return null
}

/** The page the unlock started from (saved by UnlockButton before leaving for Stripe), if any. */
function readUnlockFrom(): string | null {
  try {
    const p = sessionStorage.getItem(UNLOCK_FROM_KEY)
    return p && p.startsWith('/') ? p : null
  } catch {
    return null
  }
}

/** Drops Stripe's query string from the address bar, keeping the page (#/account) and the router's state. */
function clearCheckoutQuery() {
  if (!window.location.search) return
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.hash)
}

/** Resolves true once the account has full access, or false after `ms`. */
function waitForAccess(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (hasFullAccess(account.get())) return resolve(true)
    const timer = setTimeout(() => done(false), ms)
    const unsubscribe = account.subscribe(() => {
      if (hasFullAccess(account.get())) done(true)
    })
    function done(ok: boolean) {
      clearTimeout(timer)
      unsubscribe()
      resolve(ok)
    }
  })
}

/** Handles a return from Stripe: confirms the payment once sign-in is restored, then waits for the unlock. */
function useCheckoutReturn(s: AccountState) {
  // read once, before the effect below clears the address bar (and so StrictMode's second run still has it)
  const [ret] = useState(readCheckoutReturn)
  const [from] = useState(() => (ret ? readUnlockFrom() : null))
  const [phase, setPhase] = useState<CheckoutPhase>(ret?.kind === 'success' ? 'confirming' : 'idle')
  const started = useRef(false)

  useEffect(() => {
    clearCheckoutQuery()
    try {
      sessionStorage.removeItem(UNLOCK_FROM_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (ret?.kind !== 'success' || started.current || s.status === 'loading') return
    if (s.status !== 'signed-in') {
      setPhase('sign-in') // paid in another browser, or signed out meanwhile: confirm once they sign in again
      return
    }
    started.current = true
    setPhase('confirming')
    void account
      .confirmCheckout(ret.sessionId)
      .then(() => {
        // The payment check itself failed: say so in the banner now (not under an "unlocking…" spinner), but keep
        // listening, as the webhook may still unlock the account.
        if (isConfirmError(account.get().error)) setPhase('slow')
        return waitForAccess(UNLOCK_WAIT_MS)
      })
      .then((ok) => setPhase(ok ? 'done' : 'slow'))
  }, [ret, s.status])

  // the unlock can land after the wait has timed out (a late webhook): that is done too
  return { ret, phase: phase === 'slow' && hasFullAccess(s) ? 'done' : phase, from }
}

/** The payment check's own messages, shown in the checkout banner rather than as a separate error. */
const isConfirmError = (e: string | null) => e === CONFIRM_ERROR || e === CONFIRM_WRONG_ACCOUNT_ERROR

interface CheckoutBannerProps {
  ret: CheckoutReturn
  phase: CheckoutPhase
  /** the page the unlock started from, to go back to */
  from: string | null
  error: string | null
}

function CheckoutBanner({ ret, phase, from, error }: CheckoutBannerProps) {
  const prog = useProgress()
  if (!ret) return null
  if (ret.kind === 'cancelled')
    return (
      <div className="account-banner" role="status">
        <strong>Payment cancelled.</strong> You haven't been charged.
      </div>
    )
  if (phase === 'done') {
    const nxt = nextLesson(prog)
    return (
      <div className="account-banner is-ok" role="status">
        <strong>You're in! Everything is unlocked.</strong>
        <span>Every module, the practice bank, mock exams and past papers are now open on this account.</span>
        <Link className="btn btn-primary" to={from ?? (nxt ? lessonHref(nxt.module.slug, nxt.lesson.slug) : '/learn')}>
          {from ? 'Carry on where you were' : 'Continue the course'}
        </Link>
      </div>
    )
  }
  if (phase === 'slow')
    return (
      <div className="account-banner is-warn" role="alert">
        <strong>Your payment is still being confirmed.</strong>
        <span>{error ?? "If you were charged, your access will switch on here by itself shortly. You don't need to refresh or pay again."}</span>
      </div>
    )
  if (phase === 'sign-in')
    return (
      <div className="account-banner" role="status">
        <strong>Payment received.</strong> Sign in with the account you paid with to finish unlocking.
      </div>
    )
  return (
    <div className="account-banner" role="status">
      <strong>
        <span className="spinner" aria-hidden="true" />
        Payment received — unlocking…
      </strong>
    </div>
  )
}

// ---------------- progress dashboard ----------------

/** "Synced just now", "Saving…" or "Not saved to your account yet", kept up to date. */
function SyncStatus({ s }: { s: AccountState }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(t)
  }, [])
  // Only the state (saving / not saved / synced / connecting) is announced; the age ticks every minute, so it sits
  // outside the live region.
  // (sign-out held back for unsaved progress replaces the sync error, and means the same here)
  const failed = s.error === SYNC_ERROR || s.error === SIGN_OUT_UNSAVED_ERROR
  let label: string
  let age = ''
  if (s.syncing) label = 'Saving to your account…'
  else if (failed) label = 'Not saved to your account yet'
  else if (s.lastSyncedAt) {
    const mins = Math.floor((now - Date.parse(s.lastSyncedAt)) / 60_000)
    label = 'Synced'
    age =
      mins < 1
        ? 'just now'
        : mins < 60
          ? `${plural(mins, 'minute')} ago`
          : `at ${new Date(s.lastSyncedAt).toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit' })}`
  } else label = 'Connecting to your account…'
  return (
    <p className={`sync-status${s.syncing || failed ? ' is-busy' : ''}`}>
      <span className="sync-dot" aria-hidden="true" />
      <span>
        <span role="status">{label}</span>
        {age && ` ${age}`}
      </span>
    </p>
  )
}

function Meter({ done, total, label }: { done: number; total: number; label: string }) {
  return (
    <div className="meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
      <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  )
}

function ProgressDashboard({ prog }: { prog: ProgressState }) {
  const isDone = (m: string, l: string) => Boolean(prog.lessons[lessonKey(m, l)])
  const done = lessonSequence.filter((r) => isDone(r.module.slug, r.lesson.slug)).length
  const scores = Object.values(prog.checkpoints)
  const checkpointAvg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const histories = Object.values(prog.answers).filter((h) => h.length > 0)
  const latestRight = histories.filter((h) => h[h.length - 1]).length
  const exams = [...prog.exams].reverse()

  return (
    <>
      <div className="account-stats">
        <div className="account-stat account-stat-wide">
          <span className="eyebrow">Lessons done</span>
          <span className="roadmap-big tabular">
            {done}
            <small> / {lessonSequence.length}</small>
          </span>
          <Meter done={done} total={lessonSequence.length} label="Lessons done" />
        </div>
        <div className="account-stat">
          <span className="eyebrow">Checkpoints</span>
          <span className="account-stat-big tabular">{scores.length ? `${Math.round(checkpointAvg * 100)}%` : '—'}</span>
          <span className="account-stat-note">{scores.length ? `average best score over ${plural(scores.length, 'checkpoint')}` : 'none taken yet'}</span>
        </div>
        <div className="account-stat">
          <span className="eyebrow">Practice</span>
          <span className="account-stat-big tabular">{histories.length ? pct(latestRight, histories.length) : '—'}</span>
          <span className="account-stat-note">
            {histories.length ? `right on the latest try, over ${plural(histories.length, 'question')}` : 'no questions answered yet'}
          </span>
        </div>
        <div className="account-stat">
          <span className="eyebrow">Mock exams</span>
          <span className="account-stat-big tabular">{prog.exams.length}</span>
          <span className="account-stat-note">{prog.exams.length === 1 ? 'mock exam finished' : 'mock exams finished'}</span>
        </div>
      </div>

      <h3 className="account-subhead">By part</h3>
      <ol className="part-progress">
        {partList.map((p) => {
          const lessons = p.modules.flatMap((m) => m.lessons.map((l) => isDone(m.slug, l.slug)))
          const n = lessons.filter(Boolean).length
          return (
            <li key={p.id}>
              <Link to={`/learn#part-${p.id}`}>
                <span className="part-progress-num tabular">{p.order}</span>
                <span className="part-progress-title">{p.title}</span>
              </Link>
              <Meter done={n} total={lessons.length} label={`${p.title}: lessons done`} />
              <span className="part-progress-count tabular">
                {n}/{lessons.length}
              </span>
            </li>
          )
        })}
      </ol>

      <h3 className="account-subhead">Mock exam history</h3>
      {exams.length === 0 ? (
        <p className="fineprint">
          No mock exams yet. <Link to="/mock">Sit one</Link> when you're ready: your scores will show up here.
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Format</th>
                <th>Score</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {exams.slice(0, EXAMS_SHOWN).map((e) => (
                <tr key={e.id}>
                  <td className="tabular">{new Date(e.date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{MOCK_FORMATS.find((f) => f.id === e.mode)?.title ?? e.mode}</td>
                  <td className="tabular">
                    {e.correct}/{e.total} ({pct(e.correct, e.total)})
                  </td>
                  <td className="tabular">{formatDuration(e.seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {exams.length > EXAMS_SHOWN && <p className="fineprint">Showing your latest {EXAMS_SHOWN} of {exams.length} mock exams.</p>}
    </>
  )
}

// ---------------- the page ----------------

const PROVIDER: Record<AccountUser['provider'], string> = { google: 'Google', apple: 'Apple', other: 'your sign-in provider' }

/** `confirming`: back from paying, and the payment is still being confirmed (so no second Unlock button). */
function AccessCard({ s, confirming }: { s: AccountState; confirming: boolean }) {
  let body
  if (!s.accessKnown && !hasFullAccess(s)) body = <p className="access-status">Checking your access…</p>
  else if (s.access === 'paid')
    body = (
      <>
        <p className="access-status is-full">Full access: paid</p>
        <p>Thank you for supporting NOAI Prep. Every module, the practice bank, mock exams and past papers are open on this account.</p>
      </>
    )
  else if (s.access === 'whitelist')
    body = (
      <>
        <p className="access-status is-full">Full access: invited</p>
        <p>You were given free access. Every module, the practice bank, mock exams and past papers are open on this account.</p>
      </>
    )
  else if (confirming)
    body = (
      <>
        <p className="access-status">Confirming your payment…</p>
        <p>Your full access will switch on here as soon as Stripe confirms the payment. There's no need to pay again.</p>
      </>
    )
  else
    body = (
      <>
        <p className="access-status">Free preview</p>
        <p>The first two modules are open. A one-time {PRICE_LABEL} unlocks everything else: every module, the practice bank, mock exams and past papers.</p>
        <UnlockButton />
        <p className="fineprint">Payments are handled securely by Stripe. No subscription.</p>
        <p className="fineprint">Were you given free access? Sign in with the email address you were invited with.</p>
      </>
    )
  return (
    <section className="account-card card" aria-labelledby="access-h">
      <h2 id="access-h">Access</h2>
      {body}
    </section>
  )
}

function DangerZone({ s, onAccountDeleted }: { s: AccountState; onAccountDeleted: () => void }) {
  const [confirm, setConfirm] = useState<'progress' | 'account' | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const savedWhere = useSavedWhere()
  const paid = s.access === 'paid'
  const progressBtn = useRef<HTMLButtonElement>(null)
  const accountBtn = useRef<HTMLButtonElement>(null)
  /** the button whose confirm box just closed: focus goes back to it */
  const returnTo = useRef<'progress' | 'account' | null>(null)

  // Only once the button is enabled again (busy false), so after the render that enables it: React batches the
  // state changes made after an await, so the button is still disabled straight after them.
  useEffect(() => {
    if (confirm || busy || !returnTo.current) return
    ;(returnTo.current === 'progress' ? progressBtn : accountBtn).current?.focus()
    returnTo.current = null
  }, [confirm, busy])

  const close = (what: 'progress' | 'account') => {
    returnTo.current = what
    setConfirm(null)
  }

  const run = async (what: 'progress' | 'account') => {
    setBusy(true)
    setDone(null)
    // straight from the click: deleting the account may need a sign-in pop-up first
    await (what === 'progress' ? account.deleteCloudProgress() : account.deleteAccount())
    setBusy(false)
    close(what)
    if (!account.get().error && what === 'progress') setDone('Your saved progress has been deleted, from your account and this browser.')
    if (what === 'account' && !account.get().user) onAccountDeleted() // the store signed us out, so this view is about to unmount
  }

  return (
    <section className="section account-danger" aria-labelledby="data-h">
      <h2 id="data-h">Your data</h2>
      <p>
        Your progress is saved {savedWhere === 'to your account' ? 'in this browser and to your account' : 'in this browser'}. You can delete it,
        or your whole account, at any time.
      </p>
      <div className="account-actions">
        <button type="button" className="btn" ref={progressBtn} onClick={() => setConfirm('progress')} disabled={busy}>
          Delete my saved progress
        </button>
        <button type="button" className="btn" ref={accountBtn} onClick={() => setConfirm('account')} disabled={busy}>
          Delete my account
        </button>
      </div>
      {confirm === 'progress' && (
        <div className="confirm-box" role="group" aria-label="Confirm deleting your progress">
          <strong>Delete all your lesson progress, answers and mock-exam history, from your account and this browser?</strong>
          <span>This can't be undone. Your access to the course stays as it is.</span>
          <div className="confirm-actions">
            <button type="button" className="btn btn-primary btn-small" onClick={() => run('progress')} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete my progress'}
            </button>
            <button type="button" className="btn btn-small" onClick={() => close('progress')} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {confirm === 'account' && (
        <div className="confirm-box" role="group" aria-label="Confirm deleting your account">
          <strong>Delete your account and the progress saved with it?</strong>
          <span>
            {paid
              ? `Your ${PRICE_LABEL} unlock belongs to this account, so it goes too: signing in again later starts a new, locked account. `
              : 'Signing in again later starts a new account. '}
            This can't be undone.
          </span>
          <div className="confirm-actions">
            <button type="button" className="btn btn-primary btn-small" onClick={() => run('account')} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete my account'}
            </button>
            <button type="button" className="btn btn-small" onClick={() => close('account')} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {done && <p role="status">{done}</p>}
    </section>
  )
}

export default function Account() {
  const s = useAccount()
  const prog = useProgress()
  const { ret, phase, from } = useCheckoutReturn(s)
  const [signingOut, setSigningOut] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const deletedRef = useRef<HTMLDivElement>(null)
  useDocumentTitle('Your account')

  // the "account deleted" note is for the sign-out that follows the delete, not a later one
  useEffect(() => {
    if (s.status === 'signed-in') setDeleted(false)
  }, [s.status])

  // The sign-in view that replaces the dashboard is much shorter: show its confirmation from the top, as a page change
  // would (on a phone the old scroll position leaves it under the sticky header).
  useEffect(() => {
    if (!deleted) return
    window.scrollTo(0, 0)
    deletedRef.current?.focus({ preventScroll: true })
  }, [deleted])

  if (!ACCOUNTS_ENABLED)
    return (
      <div className="page page-narrow">
        <div className="page-head">
          <span className="eyebrow">Account</span>
          <h1>No accounts here</h1>
          <p className="page-lede">Accounts aren't switched on for this copy of the site. Everything is open, and your progress is saved in this browser.</p>
        </div>
      </div>
    )

  if (s.status === 'loading') return <PageSkeleton />

  const confirmError = isConfirmError(s.error) ? s.error : null
  const banner = <CheckoutBanner ret={ret} phase={phase} from={from} error={confirmError} />

  if (s.status !== 'signed-in' || !s.user)
    return (
      <div className="page page-narrow">
        <div className="page-head">
          <span className="eyebrow">Account</span>
          <h1>Sign in</h1>
          <p className="page-lede">Sign in to save your progress to your account, so you can carry on from any device, and to unlock the full course.</p>
        </div>
        {banner}
        {deleted && (
          <div ref={deletedRef} tabIndex={-1} className="account-banner is-ok" role="status">
            <strong>Your account has been deleted.</strong>
            <span>The progress saved with it has gone too. You can carry on with the free modules without signing in.</span>
          </div>
        )}
        <section className="account-card card account-signin" aria-label="Sign in">
          <ProviderButtons />
          <p className="fineprint">
            The first two modules are free without signing in. Full access is a one-time {PRICE_LABEL}. See <Link to="/about">About</Link> for what we keep.
          </p>
        </section>
      </div>
    )

  const user = s.user
  const signOut = async (force = false) => {
    setSigningOut(true)
    await account.signOut({ force })
    setSigningOut(false)
  }
  // some progress couldn't be saved to the account, so signing out was held back: the person decides
  const unsavedSignOut = s.error === SIGN_OUT_UNSAVED_ERROR

  return (
    <div className="page page-narrow">
      <div className="page-head">
        <span className="eyebrow">Account</span>
        <h1>Your account</h1>
      </div>
      {banner}

      <div className="account-top">
        <section className="account-card card account-profile" aria-labelledby="profile-h">
          <h2 id="profile-h" className="sr-only">
            Profile
          </h2>
          <div className="account-who">
            <Avatar user={user} large />
            <div className="account-who-text">
              <strong className="account-name">{user.name || (user.email ? <BreakableEmail email={user.email} /> : 'Signed in')}</strong>
              {user.name && user.email && (
                <span className="account-email">
                  <BreakableEmail email={user.email} />
                </span>
              )}
              <span className="fineprint">Signed in with {PROVIDER[user.provider]}</span>
            </div>
          </div>
          <button type="button" className="btn btn-small" onClick={() => signOut()} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {unsavedSignOut ? (
            <div className="confirm-box">
              <p role="alert">{s.error}</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-small" onClick={() => signOut(true)} disabled={signingOut}>
                  Sign out anyway
                </button>
              </div>
            </div>
          ) : (
            <p className="fineprint">
              {s.error === SYNC_ERROR
                ? "Your latest progress isn't saved to your account yet. Signing out now would clear it from this browser."
                : 'Signing out clears your progress from this browser. It stays saved in your account.'}
            </p>
          )}
        </section>
        <AccessCard s={s} confirming={ret?.kind === 'success' && (phase === 'confirming' || phase === 'slow')} />
      </div>

      {/* the payment check's messages are in the checkout banner once it says so; the sign-out one is by its button */}
      {s.error && !(phase === 'slow' && confirmError) && !unsavedSignOut && (
        <p className="account-error" role="alert">
          {s.error}
        </p>
      )}

      <section className="section" aria-labelledby="progress-h">
        <div className="account-section-head">
          <h2 id="progress-h">Your progress</h2>
          <SyncStatus s={s} />
        </div>
        <ProgressDashboard prog={prog} />
      </section>

      <DangerZone s={s} onAccountDeleted={() => setDeleted(true)} />
    </div>
  )
}
