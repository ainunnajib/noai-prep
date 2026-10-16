import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FACTS_CHECKED_ON, LINKS } from '../data/facts'
import { ACCOUNTS_ENABLED, EXPECT_SIGNED_IN, useAccount } from '../lib/accounts'
import { progress } from '../lib/progress'

/** "Your data" with accounts on: what is kept, where, and how to delete it. */
function AccountData() {
  return (
    <>
      <p>Before you sign in, your lesson progress, answers and mock-exam scores are stored only in this browser (local storage).</p>
      <p>When you sign in with Google or Apple, we keep:</p>
      <ul>
        <li>your name, email address and profile picture link, as your sign-in provider shares them;</li>
        <li>your progress (lessons done, checkpoint scores, practice answers and mock-exam results), so it follows you between devices;</li>
        <li>whether you have unlocked the full course and, if you paid, Stripe's reference for the payment.</li>
      </ul>
      <p>
        These are stored with Google Firebase, the sign-in and storage service the site uses. Payments go through Stripe: your card details never reach us. You can
        delete your saved progress, or your whole account, at any time from the <Link to="/account">Account page</Link>. Deleting your account removes your sign-in and
        your saved progress. The record of your unlock or payment, with the email address it was made with, is kept so payments can be accounted for.
      </p>
    </>
  )
}

export default function About() {
  const { status } = useAccount()
  // (while sign-in is being restored, a Reset of the signed-in person's progress reaches their account too)
  const signedIn = status === 'signed-in' || (status === 'loading' && EXPECT_SIGNED_IN)
  const [confirm, setConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)
  useEffect(() => {
    document.title = 'About · NOAI Prep'
    return () => {
      document.title = 'NOAI Prep'
    }
  }, [])
  return (
    <div className="page page-narrow">
      <div className="page-head">
        <span className="eyebrow">About</span>
        <h1>About NOAI Prep</h1>
        <p className="page-lede">
          NOAI Prep is {ACCOUNTS_ENABLED ? 'an independent' : 'a free, independent'} course for students preparing for Singapore's National Olympiad in Artificial Intelligence. It is not affiliated with AI Singapore,
          NTU or the IOAI.
        </p>
      </div>
      <div className="prose">
        <h2>How the content was made</h2>
        <p>
          The course follows AI Singapore's official assessment areas for NOAI 2027 and the IOAI syllabus that NOAI points students to. Exam facts were checked against the official
          NOAI pages on {FACTS_CHECKED_ON}. Past-paper answers were worked out independently by two solvers, reconciled, and then checked against AI Singapore's official answers (they match on 297 of 300 Preliminary Round questions; disagreements are noted on the question).
          The question bank was re-solved and its explanations rewritten for beginners.
        </p>
        <p>
          If something looks wrong, trust the official sources below and tell us by <a href={LINKS.siteIssues}>opening an issue on GitHub</a>: say which page, what it says and what
          you think is right.
        </p>
        <h2>Official sources</h2>
        <ul>
          <li>
            <a href={LINKS.noai2027}>NOAI 2027</a>, <a href={LINKS.faqs}>NOAI FAQs</a>, <a href={LINKS.resources}>NOAI learning resources</a>
          </li>
          <li>
            <a href={LINKS.prelim2026Pdf}>NOAI 2026 Preliminary Round paper</a> and <a href={LINKS.final2026Pdf}>2026 Final Section 1</a>
          </li>
          <li>
            <a href={LINKS.final2026Repo}>NOAI 2026 Final programming tasks</a> and <a href={LINKS.noai2025Repo}>NOAI 2025 tasks</a>
          </li>
          <li>
            <a href={LINKS.ioaiSyllabus}>IOAI 2026 syllabus</a> and <a href={LINKS.ioaiGithub}>IOAI past tasks</a>
          </li>
        </ul>
        <h2>Your data</h2>
        {ACCOUNTS_ENABLED ? (
          <AccountData />
        ) : (
          <p>Lesson progress, answers and mock-exam scores are stored only in this browser (local storage). Nothing is sent anywhere.</p>
        )}
      </div>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
        {!confirm ? (
          <button type="button" className="btn" onClick={() => setConfirm(true)}>
            Reset my progress
          </button>
        ) : (
          <div className="confirm-box">
            <strong>Erase all lesson progress, answers and mock-exam history from {signedIn ? 'this browser and your account' : 'this browser'}?</strong>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => {
                  progress.reset()
                  setConfirm(false)
                  setCleared(true)
                }}
              >
                Erase everything
              </button>
              <button type="button" className="btn btn-small" onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {cleared && <p role="status">Your progress has been erased.</p>}
      </div>
    </div>
  )
}
