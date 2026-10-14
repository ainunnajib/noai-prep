import { useMemo, useState } from 'react'
import { Figure, Bars, Button, usePlayer } from '../../../../../kit'
import { SMS, SMS_TOKENS, scoresAfter, messageScore } from './smsData'
import r from './rules.module.css'

/*
  Left: the learner writes keyword rules ("spam if it contains any of …").
  Right: a tiny learner reads the 20 labelled messages one by one and keeps a score per word
  (+1 for each spam message it appears in, −1 for each normal one). Both are checked on the same 20 messages.
*/

const PALETTE = ['free', 'win', 'prize', 'claim', '$', 'urgent', 'call', 'now', 'txt', 'cash', 'offer', '.com']
const N = SMS.length

function Meter({ label, correct, color }: { label: string; correct: number; color: string }) {
  return (
    <div className={r.meter}>
      <div className={r.meterText}>
        <span>{label}</span>
        <span>
          {correct} / {N} correct ({Math.round((100 * correct) / N)}%)
        </span>
      </div>
      <div className={r.meterTrack} role="meter" aria-valuemin={0} aria-valuemax={N} aria-valuenow={correct} aria-label={`${label}: ${correct} of ${N} correct`}>
        <div className={r.meterFill} style={{ width: `${(100 * correct) / N}%`, background: color }} />
        <div className={r.meterHalf} title="50%: no better than a coin toss" />
      </div>
    </div>
  )
}

const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '0')

export default function RulesVsExamples() {
  const [palette, setPalette] = useState(PALETTE)
  const [rules, setRules] = useState<string[]>(['free', 'win', 'prize'])
  const [draft, setDraft] = useState('')
  const player = usePlayer({ steps: N + 1, interval: 520 })
  const read = player.step // number of messages read so far

  const rulePred = useMemo(() => SMS.map((m) => (rules.some((k) => m.text.toLowerCase().includes(k.toLowerCase())) ? 1 : 0)), [rules])
  const ruleCorrect = rulePred.reduce<number>((a, p, i) => a + (p === SMS[i].spam ? 1 : 0), 0)

  const scores = useMemo(() => scoresAfter(read), [read])
  const learnPred = useMemo(() => SMS.map((_, i) => (messageScore(i, scores) > 0 ? 1 : 0)), [scores])
  const learnCorrect = learnPred.reduce<number>((a, p, i) => a + (p === SMS[i].spam ? 1 : 0), 0)

  const ranked = useMemo(() => [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), [scores])
  const spamClues = ranked.filter(([, v]) => v > 0).slice(0, 5)
  const okClues = [...ranked]
    .filter(([, v]) => v < 0)
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)

  const toggle = (k: string) => setRules((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))
  const add = () => {
    const k = draft.trim().toLowerCase().slice(0, 20)
    if (!k) return
    if (!palette.includes(k)) setPalette((p) => [...p, k])
    setRules((cur) => (cur.includes(k) ? cur : [...cur, k]))
    setDraft('')
  }

  const last = read > 0 ? read - 1 : -1
  const ruleWords = rules.filter((k) => /^[a-z]+$/.test(k) || k === '$')

  return (
    <Figure
      title="Write rules, or learn from examples?"
      caption={
        <>
          Try to beat the learner with your own keywords, then press <strong>Learn</strong> and watch each labelled message nudge the word scores. It ends up
          trusting <code>your</code>, <code>$</code> and web links, while <code>free</code> becomes a <em>normal</em>-message clue (friends ask “free for
          lunch?”). Some clues, like <code>a</code>, are flukes of having only 20 messages: real filters learn from millions, and are judged on <em>new</em>{' '}
          messages, an idea you will meet later in this module.
        </>
      }
    >
      <div className={r.wrap}>
        <div className={r.panels}>
          <section className={r.panel} aria-label="Your keyword rules">
            <div className={r.panelTitle}>1. You write the rules</div>
            <div className={r.panelText}>Call a message spam if it contains any word you switch on:</div>
            <div className={r.kw}>
              {palette.map((k) => (
                <button key={k} type="button" className={r.kwBtn} aria-pressed={rules.includes(k)} onClick={() => toggle(k)}>
                  {k}
                </button>
              ))}
            </div>
            <form
              className={r.addRow}
              onSubmit={(e) => {
                e.preventDefault()
                add()
              }}
            >
              <input className={r.addInput} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="add your own word" aria-label="Add your own keyword" maxLength={20} />
              <button type="submit" className={r.addBtn}>
                Add
              </button>
            </form>
            <Meter label="Your rules" correct={ruleCorrect} color="var(--viz-2)" />
          </section>

          <section className={r.panel} aria-label="Learning from labelled examples">
            <div className={r.panelTitle}>2. The computer learns from examples</div>
            <div className={r.panelText}>
              It reads the labelled messages one at a time. Every word in a spam message gets <strong>+1</strong>; every word in a normal message gets{' '}
              <strong>−1</strong>. A message whose word scores add up to more than 0 is called spam.
            </div>
            <div className={r.btnRow}>
              <Button primary onClick={player.toggle}>
                {player.playing ? 'Pause' : read >= N ? 'Learn again' : read > 0 ? 'Keep learning' : 'Learn'}
              </Button>
              <Button onClick={player.next} disabled={read >= N}>
                Read one message
              </Button>
              <Button onClick={player.reset} disabled={read === 0}>
                Forget all
              </Button>
            </div>
            <div className={r.status} aria-live="polite">
              {read === 0 ? (
                <>Nothing learned yet: every word scores 0, so it calls every message normal.</>
              ) : (
                <>
                  Read {read} of {N}. Message {read} was <strong>{SMS[last].spam ? 'spam' : 'normal'}</strong>, so {SMS_TOKENS[last].length} words got{' '}
                  {SMS[last].spam ? '+1' : '−1'}: <code>{SMS_TOKENS[last].slice(0, 6).join(' ')}</code>
                  {SMS_TOKENS[last].length > 6 ? ' …' : ''}
                </>
              )}
            </div>
            <Meter label="Learned scores" correct={learnCorrect} color="var(--viz-1)" />
          </section>
        </div>

        <div className={r.clues}>
          <div>
            <div className={r.clueTitle}>Strongest spam clues it found</div>
            {spamClues.length ? (
              <Bars data={spamClues.map(([w, v]) => ({ label: <code>{w}</code>, value: v, color: 'var(--viz-neg)' }))} max={5} format={signed} ariaLabel="Words with the highest spam scores" />
            ) : (
              <div className={r.empty}>Press Learn to see what it finds.</div>
            )}
          </div>
          <div>
            <div className={r.clueTitle}>Strongest normal-message clues</div>
            {okClues.length ? (
              <Bars data={okClues.map(([w, v]) => ({ label: <code>{w}</code>, value: v, color: 'var(--viz-pos)' }))} max={5} format={signed} ariaLabel="Words with the lowest (most normal) scores" />
            ) : (
              <div className={r.empty}>{read === 0 ? 'Nothing yet.' : 'None yet: it has only read spam so far.'}</div>
            )}
          </div>
        </div>
        {ruleWords.length > 0 && (
          <div className={r.yourWords}>
            Your rule words, as the learner scores them{read < N ? ` after ${read} message${read === 1 ? '' : 's'}` : ''}:{' '}
            {ruleWords.map((k, i) => (
              <span key={k}>
                {i > 0 && ' · '}
                <code>{k}</code> {signed(scores.get(k) ?? 0)}
              </span>
            ))}
          </div>
        )}

        <div className={r.table} role="table" aria-label="The 20 messages with each method's verdict">
          <div className={`${r.row} ${r.head}`} role="row">
            <span role="columnheader">Message (true label)</span>
            <span role="columnheader" className={r.colHead}>
              Rules
            </span>
            <span role="columnheader" className={r.colHead}>
              Learned
            </span>
          </div>
          {SMS.map((m, i) => (
            <div key={i} className={`${r.row}${i === last ? ` ${r.reading}` : ''}`} role="row">
              <span className={r.msg} role="cell">
                <span className={`${r.truth} ${m.spam ? r.truthSpam : r.truthOk}`}>{m.spam ? 'spam' : 'normal'}</span>
                {m.text}
              </span>
              <span role="cell" className={`${r.verdict} ${rulePred[i] === m.spam ? r.right : r.wrong}`}>
                {rulePred[i] === m.spam ? '✓ ' : '✗ '}
                {rulePred[i] ? 'spam' : 'normal'}
              </span>
              <span role="cell" className={`${r.verdict} ${learnPred[i] === m.spam ? r.right : r.wrong}`}>
                {learnPred[i] === m.spam ? '✓ ' : '✗ '}
                {learnPred[i] ? 'spam' : 'normal'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Figure>
  )
}
