import { useMemo, useState } from 'react'
import { Figure, Bars, Button, usePlayer, useNarrow } from '../../../../../kit'
import { SMS, SMS_TOKENS, NEW_SMS, NEW_TOKENS, scoresAfter, messageScore, tokensScore, type Sms } from './smsData'
import r from './rules.module.css'

/*
  Left: the learner writes keyword rules ("spam if it contains any of …").
  Right: a tiny learner reads the 20 labelled messages one by one and keeps a score per word
  (+1 for each spam message it appears in, −1 for each normal one). Both are scored on the same 20 messages,
  where either can reach 20/20, and then (the fair test) on 8 new messages that neither has learned from.
*/

const PALETTE = ['free', 'win', 'prize', 'claim', '$', 'urgent', 'call', 'now', 'txt', 'cash', 'offer', '.com']
const N = SMS.length
const N_NEW = NEW_SMS.length

function Meter({ label, correct, total, color }: { label: string; correct: number; total: number; color: string }) {
  return (
    <div className={r.meter}>
      <div className={r.meterText}>
        <span>{label}</span>
        <span>
          {correct} / {total} correct ({Math.round((100 * correct) / total)}%)
        </span>
      </div>
      <div className={r.meterTrack} role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={correct} aria-label={`${label}: ${correct} of ${total} ${total === N ? 'training' : 'new'} messages correct`}>
        <div className={r.meterFill} style={{ width: `${(100 * correct) / total}%`, background: color }} />
        <div className={r.meterHalf} title="50%: no better than a coin toss" />
      </div>
    </div>
  )
}

function MessageTable({ msgs, rulePred, learnPred, reading, label }: { msgs: { m: Sms; i: number }[]; rulePred: number[]; learnPred: number[]; reading: number; label: string }) {
  return (
    <div className={r.table} role="table" aria-label={label}>
      <div className={`${r.row} ${r.head}`} role="row">
        <span role="columnheader">Message (true label)</span>
        <span role="columnheader" className={r.colHead}>
          Rules
        </span>
        <span role="columnheader" className={r.colHead}>
          Learned
        </span>
      </div>
      {msgs.map(({ m, i }) => (
        <div key={i} className={`${r.row}${i === reading ? ` ${r.reading}` : ''}`} role="row">
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
  )
}

/** 1 (spam) if the message contains any switched-on keyword, else 0 (normal). */
const ruleSays = (rules: string[], text: string) => (rules.some((k) => text.toLowerCase().includes(k.toLowerCase())) ? 1 : 0)
const countRight = (pred: number[], msgs: Sms[]) => pred.reduce<number>((a, p, i) => a + (p === msgs[i].spam ? 1 : 0), 0)

export default function RulesVsExamples() {
  const [palette, setPalette] = useState(PALETTE)
  const [rules, setRules] = useState<string[]>(['free', 'win', 'prize'])
  const [draft, setDraft] = useState('')
  const [tested, setTested] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const player = usePlayer({ steps: N + 1, interval: 520 })
  const read = player.step // number of messages read so far

  const rulePred = useMemo(() => SMS.map((m) => ruleSays(rules, m.text)), [rules])
  const ruleNewPred = useMemo(() => NEW_SMS.map((m) => ruleSays(rules, m.text)), [rules])

  const scores = useMemo(() => scoresAfter(read), [read])
  const learnPred = useMemo(() => SMS.map((_, i) => (messageScore(i, scores) > 0 ? 1 : 0)), [scores])
  const learnNewPred = useMemo(() => NEW_TOKENS.map((t) => (tokensScore(t, scores) > 0 ? 1 : 0)), [scores])

  const ruleCorrect = countRight(rulePred, SMS)
  const learnCorrect = countRight(learnPred, SMS)
  const ruleNew = countRight(ruleNewPred, NEW_SMS)
  const learnNew = countRight(learnNewPred, NEW_SMS)

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

  // The 20 training messages: a short window that follows the message being read, or all of them.
  const WINDOW = narrow ? 5 : 8
  const start = showAll ? 0 : Math.max(0, Math.min(N - WINDOW, last - Math.floor(WINDOW / 2)))
  const shown = SMS.map((m, i) => ({ m, i })).slice(start, showAll ? N : start + WINDOW)

  return (
    <Figure
      title="Write rules, or learn from examples?"
      caption={
        <>
          Try to beat the learner with your own keywords, then press <strong>Learn</strong> and watch each labelled message nudge the word scores. Both
          methods can reach 20/20 on these 20 messages, so that score proves little: the fair test is <em>new</em> messages that neither has learned from.
          When your rules are as good as you can make them, press <strong>Test on new messages</strong>. Notice that nobody gave the learner its clues: it
          found <code>your</code>, <code>$</code> and web links by itself, and turned <code>free</code> into a <em>normal</em>-message clue (friends ask
          “free for lunch?”). Some clues, like <code>a</code>, are flukes of having only 20 messages; real filters learn from millions.
        </>
      }
    >
      <div className={r.wrap} ref={wrapRef}>
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
            <Meter label="Your rules" correct={ruleCorrect} total={N} color="var(--viz-2)" />
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
            <Meter label="Learned scores" correct={learnCorrect} total={N} color="var(--viz-1)" />
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

        <section className={r.test} aria-label="The fair test: new messages">
          <div className={r.panelTitle}>3. The fair test: {N_NEW} new messages</div>
          {!tested ? (
            <div className={r.btnRow} style={{ alignItems: 'center' }}>
              <span className={r.panelText} style={{ flex: '1 1 16rem' }}>
                Neither method has learned from these. Tune your rules and let the computer learn first, then test both.
              </span>
              <Button primary onClick={() => setTested(true)}>
                Test on new messages
              </Button>
            </div>
          ) : (
            <>
              <div className={r.panels}>
                <Meter label="Your rules" correct={ruleNew} total={N_NEW} color="var(--viz-2)" />
                <Meter label="Learned scores" correct={learnNew} total={N_NEW} color="var(--viz-1)" />
              </div>
              <div className={r.panelText} aria-live="polite">
                {read < N
                  ? `The learner has read only ${read} of the ${N} training messages so far. Press Learn to finish, and watch its score on the new messages change.`
                  : learnNew > ruleNew
                    ? `Keyword rules miss scams that avoid the chosen words, and trip on normal messages that happen to use them (“free”, “call”, “cash”, “prize”). The learner weighs many clues at once, so it copes better, though it is not perfect: it learned that “your” is a spam clue, so it flags the lost water bottle.`
                    : `Your rules held up well here. Did you borrow the clues the learner found (such as “your”)? Either way, the learner found its clues without anyone writing a single rule.`}
              </div>
              <MessageTable
                msgs={NEW_SMS.map((m, i) => ({ m, i }))}
                rulePred={ruleNewPred}
                learnPred={learnNewPred}
                reading={-1}
                label={`The ${N_NEW} new messages with each method's verdict`}
              />
            </>
          )}
        </section>

        <div className={r.listHead}>
          <span className={r.clueTitle} style={{ margin: 0 }}>
            The {N} training messages{showAll ? '' : `: ${start + 1} to ${start + shown.length}`}
          </span>
          <Button onClick={() => setShowAll((v) => !v)}>{showAll ? 'Show fewer' : `Show all ${N}`}</Button>
        </div>
        <MessageTable msgs={shown} rulePred={rulePred} learnPred={learnPred} reading={last} label={`The ${N} training messages with each method's verdict`} />
      </div>
    </Figure>
  )
}

function signed(v: number) {
  return v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '0'
}
