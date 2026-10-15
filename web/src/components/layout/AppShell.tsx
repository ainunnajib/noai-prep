import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { useTheme, type ThemeChoice } from '../../lib/theme'

const NAV = [
  { to: '/learn', label: 'Course' },
  { to: '/exam', label: 'Exam guide' },
  { to: '/practice', label: 'Practice' },
  { to: '/mock', label: 'Mock exam' },
  { to: '/papers', label: 'Past papers' },
  { to: '/plan', label: 'Study plan' },
]

export function BrandMark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" style={{ fill: 'var(--ink)' }} />
      <path d="M0 16h64M0 32h64M0 48h64M16 0v64M32 0v64M48 0v64" style={{ stroke: 'color-mix(in srgb, var(--paper) 16%, transparent)', strokeWidth: 1 }} />
      <path d="M18 44L46 20M18 44H46" style={{ stroke: 'var(--paper)', strokeWidth: 3, strokeLinecap: 'round' }} />
      <circle cx="18" cy="44" r="6" style={{ fill: 'var(--highlight)' }} />
      <circle cx="46" cy="20" r="6" style={{ fill: 'var(--accent)' }} />
      <circle cx="46" cy="44" r="6" style={{ fill: 'var(--accent)' }} />
    </svg>
  )
}

const THEME_LABEL: Record<ThemeChoice, string> = { system: 'Theme: follows your device', light: 'Theme: light', dark: 'Theme: dark' }

/** The theme on screen now: an explicit choice, or the device setting when following the device. */
function shownTheme(t: ThemeChoice): 'light' | 'dark' {
  if (t !== 'system') return t
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Page-shaped placeholder shown inside the layout while a page's code loads. */
export function PageSkeleton() {
  return (
    <div className="page page-skeleton loading-block" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="skel skel-eyebrow" />
      <div className="skel skel-title" />
      <div className="skel skel-line" />
      <div className="skel skel-line" />
      <div className="skel skel-line short" />
    </div>
  )
}

/** Run `fn` on each animation frame until it returns true or about a second has passed (content may still be rendering). */
function retryFrames(fn: () => boolean, frames = 60) {
  let n = 0
  const tick = () => {
    if (fn() || ++n >= frames) return
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function ThemeIcon({ t }: { t: ThemeChoice }) {
  if (t === 'light')
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  if (t === 'dark')
    return (
      <svg viewBox="0 0 24 24">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

export function AppShell() {
  const [theme, setTheme] = useTheme()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const navType = useNavigationType()
  const positions = useRef(new Map<string, number>())
  const first = useRef(true)

  // remember how far down each history entry was scrolled, so Back returns to the same place
  useEffect(() => {
    const save = () => positions.current.set(loc.key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [loc.key])

  useEffect(() => {
    setOpen(false)
    const isFirst = first.current
    first.current = false
    if (loc.hash) {
      // in-page anchors such as /learn#part-vision: the browser cannot jump there itself under hash routing
      const id = decodeURIComponent(loc.hash.slice(1))
      retryFrames(() => {
        const el = document.getElementById(id)
        el?.scrollIntoView({ block: 'start' })
        return Boolean(el)
      })
      return
    }
    if (navType === 'POP' && !isFirst) {
      const y = positions.current.get(loc.key)
      if (y != null) {
        // wait until the page is tall enough to scroll that far (lazy content may still be arriving)
        retryFrames(() => {
          window.scrollTo(0, y)
          return Math.abs(window.scrollY - y) < 2
        })
        return
      }
    }
    window.scrollTo(0, 0)
    // tell keyboard and screen-reader users that a new page has opened
    if (!isFirst) document.getElementById('main')?.focus({ preventScroll: true })
  }, [loc.pathname, loc.hash])

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="brand" aria-label="NOAI Prep home">
            <BrandMark />
            <span className="brand-name">
              NOAI<span>prep</span>
            </span>
          </Link>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="site-nav" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            <svg viewBox="0 0 24 24">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
          <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="theme-btn"
            onClick={() => setTheme(shownTheme(theme) === 'dark' ? 'light' : 'dark')}
            aria-label={`${THEME_LABEL[theme]}. Switch to ${shownTheme(theme) === 'dark' ? 'light' : 'dark'}`}
            title={`${THEME_LABEL[theme]} (click for ${shownTheme(theme) === 'dark' ? 'light' : 'dark'})`}
          >
            <ThemeIcon t={shownTheme(theme)} />
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-links">
            <Link to="/learn">Course</Link>
            <Link to="/exam">Exam guide</Link>
            <Link to="/practice">Practice</Link>
            <Link to="/mock">Mock exam</Link>
            <Link to="/papers">Past papers</Link>
            <Link to="/plan">Study plan</Link>
            <Link to="/about">About &amp; sources</Link>
          </div>
          <p>
            NOAI Prep is an independent, free study resource. It is not affiliated with or endorsed by AI Singapore. Official past papers are © AI Singapore and are
            shown with attribution and links to the originals for study purposes. Your progress is saved only in this browser.
          </p>
        </div>
      </footer>
    </div>
  )
}
