import { useState } from 'react'
import { Figure, Segmented, Button, useNarrow } from '../../../../../kit'
import { loadLocal, saveLocal } from '../drill-kit/ddKit'
import m from './mp.module.css'

/*
  Error-log sorter. Twelve mistakes from one student's mock, each with the student's own note on
  what happened. Sort each into a bin (tap a bin, or drag the card onto it): knowledge gap,
  misread, calculation slip or time pressure. Every sort is checked and explained; at the end a
  domain × error-type table and a fix plan show that different mistakes need different fixes.
  A second tab keeps the learner's own log in this browser.
*/

type ErrType = 'gap' | 'misread' | 'slip' | 'time'
type Dom = 'Maths' | 'Computing' | 'AI/ML/DL' | 'GenAI' | 'Problem solving'

const TYPES: { id: ErrType; title: string; hint: string; colour: string; fix: string }[] = [
  { id: 'gap', title: 'Knowledge gap', hint: 'Still stuck untimed, with no notes', colour: 'var(--viz-1)', fix: 'Study the lesson behind it, then re-test yourself on it after 3 days and again after a week.' },
  { id: 'misread', title: 'Misread', hint: 'Knew it, answered a different question', colour: 'var(--viz-5)', fix: 'Read the question line first; circle NOT, EXCEPT, maximum and units; re-read the stem before you click.' },
  { id: 'slip', title: 'Calculation slip', hint: 'Right method, wrong arithmetic', colour: 'var(--viz-2)', fix: 'Do the speed drills, and write every intermediate number on scrap paper; check signs and the +1s.' },
  { id: 'time', title: 'Time pressure', hint: 'Rushed it, or never reached it', colour: 'var(--viz-4)', fix: 'Pacing: check the clock every 15 minutes; cap hard questions at about 30 s, guess and flag them.' },
]
const DOMS: Dom[] = ['Maths', 'Computing', 'AI/ML/DL', 'GenAI', 'Problem solving']
const typeOf = (id: ErrType) => TYPES.find((t) => t.id === id)!
const article = (title: string) => `${/^[AEIOU]/i.test(title) ? 'an' : 'a'} ${title.toLowerCase()}`

interface Card {
  n: number
  dom: Dom
  q: string
  you: string
  ans: string
  note: string
  type: ErrType
  why: string
  link?: [string, string]
}

const CARDS: Card[] = [
  {
    n: 14,
    dom: 'Maths',
    q: 'What is the maximum possible rank of a 100 × 50 matrix?',
    you: '100',
    ans: '50',
    note: 'I know rank ≤ min(rows, columns). I saw 100 first and clicked it.',
    type: 'misread',
    why: 'The rule was known; it just was not applied to what was asked. More study would not have helped; reading the question line carefully would.',
  },
  {
    n: 41,
    dom: 'Computing',
    q: 'With the default index, how many rows does df.loc[1:3] return?',
    you: '2',
    ans: '3',
    note: 'I thought loc slices like a Python list. I did not know it includes the end label.',
    type: 'gap',
    why: 'The fact itself was missing: loc slices by label and includes the end. That needs studying, not speed.',
    link: ['pandas selection', '#/learn/pandas-and-plotting/dataframes-and-selection'],
  },
  {
    n: 5,
    dom: 'Maths',
    q: 'What is the dot product of [2, −1, 3] and [4, 0, −2]?',
    you: '14',
    ans: '2',
    note: 'I did 8 + 0 + 6. The last term is 3 × (−2) = −6: I dropped the minus sign.',
    type: 'slip',
    why: 'The method (multiply and add) was right; one sign went wrong. Drills and written intermediate steps fix this.',
  },
  {
    n: 83,
    dom: 'AI/ML/DL',
    q: 'A cancer screening test must miss as few cancers as possible. Which metric matters most?',
    you: 'Precision',
    ans: 'Recall',
    note: 'I was 9 questions behind at the 45:00 checkpoint and clicked within 5 seconds. With time I would have got it.',
    type: 'time',
    why: 'The knowledge was there; the clock forced a guess. The fix is pacing earlier in the paper, not more content.',
  },
  {
    n: 97,
    dom: 'GenAI',
    q: 'What does LoRA train when it fine-tunes a large model?',
    you: 'All the weights, with a small learning rate',
    ans: 'Small low-rank matrices added to the frozen weights',
    note: 'I had never heard of low-rank adapters.',
    type: 'gap',
    why: 'A concept never learnt is a knowledge gap. Study it, then re-test it a few days later.',
    link: ['fine-tuning and LoRA', '#/learn/large-language-models/fine-tuning-and-lora'],
  },
  {
    n: 131,
    dom: 'Problem solving',
    q: 'Which of these is NOT a sign of overfitting?',
    you: 'Validation loss rising while training loss falls',
    ans: 'Training and validation loss both high and flat',
    note: 'I did not see the NOT. I picked the clearest sign of overfitting.',
    type: 'misread',
    why: 'The chosen option shows the student understood overfitting perfectly. Missing the NOT is a reading error.',
  },
  {
    n: 22,
    dom: 'Maths',
    q: 'For L = (wx − y)², what is ∂L/∂w?',
    you: '2(wx − y)',
    ans: '2(wx − y)·x',
    note: 'I know the chain rule. I just stopped one step early and lost the × x.',
    type: 'slip',
    why: 'The method was known and one step was dropped. Writing the chain out (outer derivative × inner derivative) catches it.',
  },
  {
    n: 146,
    dom: 'Problem solving',
    q: 'Loss turns to NaN after 200 steps with a learning rate of 0.5. What do you try first?',
    you: 'Collect more data',
    ans: 'Lower the learning rate',
    note: 'I spent 4 minutes on Q140 and had to rush the last ten questions. I know this one.',
    type: 'time',
    why: 'Four minutes on one question cost the end of the paper. The fix is to cap and flag, not to study NaNs again.',
  },
  {
    n: 109,
    dom: 'GenAI',
    q: 'What does sampling from an LLM at temperature 0 do?',
    you: 'Picks tokens uniformly at random',
    ans: 'Always picks the most likely token',
    note: 'Even now, with time and no pressure, I am not sure what temperature does.',
    type: 'gap',
    why: 'Untimed and calm, still unsure: that is the test for a knowledge gap.',
    link: ['decoding and sampling', '#/learn/large-language-models/decoding-and-sampling'],
  },
  {
    n: 70,
    dom: 'AI/ML/DL',
    q: 'Training accuracy is 62% and validation accuracy is 60%. What is the most likely problem?',
    you: 'Overfitting',
    ans: 'Underfitting',
    note: 'I saw two numbers with a gap and jumped to overfitting, without noticing that both were low.',
    type: 'misread',
    why: 'A 2-point gap with both scores low is underfitting, and the student knows the two signatures. The stem was skimmed, not read.',
  },
  {
    n: 52,
    dom: 'Computing',
    q: 'How many parameters does nn.Conv2d(16, 32, kernel_size=3) have?',
    you: '4,608',
    ans: '4,640',
    note: 'I know it is (k·k·C_in + 1)·C_out, but I multiplied 144 × 32 and forgot the + 1.',
    type: 'slip',
    why: 'The right formula, carried out wrongly: a slip. The conv drill trains exactly this.',
  },
  {
    n: 148,
    dom: 'Problem solving',
    q: 'A long scenario about a GPU running out of memory during training.',
    you: '(guessed in the final sweep)',
    ans: 'Reduce the batch size or use gradient accumulation',
    note: 'I never read it. I put in a guess in the last 20 seconds.',
    type: 'time',
    why: 'An unread question is lost to the clock, whatever you know. It shows up as a cluster of misses at the end of the paper.',
  },
]

interface Entry {
  n?: number
  dom: Dom
  type: ErrType
  text?: string
  link?: [string, string]
}

const domColour = (d: Dom) => `var(--viz-${DOMS.indexOf(d) + 1})`

function Summary({ entries }: { entries: Entry[] }) {
  if (!entries.length) return null
  const count = (d: Dom | null, t: ErrType | null) => entries.filter((e) => (d === null || e.dom === d) && (t === null || e.type === t)).length
  const max = Math.max(1, ...DOMS.flatMap((d) => TYPES.map((t) => count(d, t.id))))
  const byType = TYPES.map((t) => ({ t, k: count(null, t.id) })).filter((x) => x.k > 0).sort((a, b) => b.k - a.k)
  const domTotals = DOMS.map((d) => ({ d, k: count(d, null) })).sort((a, b) => b.k - a.k)
  const hot = domTotals.filter((x) => x.k === domTotals[0].k && x.k > 0).map((x) => x.d)
  return (
    <div className={m.wrap}>
      <table className={m.heat} aria-label="Mistakes by domain and error type">
        <thead>
          <tr>
            <th scope="col" style={{ width: '24%' }} />
            {TYPES.map((t) => (
              <th key={t.id} scope="col" style={{ color: t.colour }}>
                {t.title}
              </th>
            ))}
            <th scope="col">total</th>
          </tr>
        </thead>
        <tbody>
          {DOMS.map((d) => (
            <tr key={d}>
              <th scope="row">{d}</th>
              {TYPES.map((t) => {
                const k = count(d, t.id)
                return (
                  <td key={t.id} style={{ background: k ? `color-mix(in srgb, ${t.colour} ${Math.round(18 + (52 * k) / max)}%, var(--surface))` : 'var(--surface-2)', color: k ? 'var(--ink)' : 'var(--ink-3)' }}>
                    {k || '·'}
                  </td>
                )
              })}
              <td style={{ background: 'var(--surface-2)' }}>{count(d, null)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className={m.plan} style={{ paddingLeft: 0, marginLeft: 0 }}>
        {byType.map(({ t, k }) => {
          const items = entries.filter((e) => e.type === t.id)
          const links = items.filter((e) => e.link).map((e) => e.link!)
          return (
            <li key={t.id} className={m.planItem} style={{ borderLeft: `4px solid ${t.colour}` }}>
              <strong>
                {t.title} × {k}
              </strong>
              {items.some((e) => e.n) && <> ({items.filter((e) => e.n).map((e) => `Q${e.n}`).join(', ')})</>}: {t.fix}
              {links.length > 0 && (
                <>
                  {' '}
                  Lessons:{' '}
                  {links.map(([label, href], i) => (
                    <span key={href}>
                      {i ? ', ' : ''}
                      <a href={href}>{label}</a>
                    </span>
                  ))}
                  .
                </>
              )}
            </li>
          )
        })}
      </ul>
      <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
        Most misses: <strong>{hot.join(' and ')}</strong> ({domTotals[0].k}). Look at the row before you plan: a domain full of slips needs drills, a domain full of gaps needs lessons.
      </div>
    </div>
  )
}

function Bins({ onPick, disabled, placed, narrow, onDropCard }: { onPick: (t: ErrType) => void; disabled: boolean; placed: Record<ErrType, Entry[]>; narrow: boolean; onDropCard: (t: ErrType) => void }) {
  const [over, setOver] = useState<ErrType | null>(null)
  return (
    <div className={`${m.bins} ${narrow ? m.binsNarrow : ''}`}>
      {TYPES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`${m.bin} ${!disabled ? m.binActive : ''} ${over === t.id ? m.binOver : ''}`}
          style={{ borderColor: over === t.id ? undefined : `color-mix(in srgb, ${t.colour} 55%, var(--rule))` }}
          onClick={() => onPick(t.id)}
          disabled={disabled}
          onDragOver={(e) => {
            if (disabled) return
            e.preventDefault()
            setOver(t.id)
          }}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(null)
            if (!disabled) onDropCard(t.id)
          }}
        >
          <span className={m.binTitle} style={{ color: t.colour }}>
            {t.title}
          </span>
          <span className={m.binHint}>{t.hint}</span>
          <span className={m.binChips}>
            {placed[t.id].map((e, i) => (
              <span key={i} className={m.binChip} style={{ background: `color-mix(in srgb, ${domColour(e.dom)} 30%, var(--surface))` }} title={e.dom}>
                Q{e.n}
              </span>
            ))}
          </span>
        </button>
      ))}
    </div>
  )
}

const STORE = 'noai-prep:error-log-v1'

function MyLog() {
  const [log, setLog] = useState<Entry[]>(() => loadLocal<Entry[]>(STORE, []))
  const [n, setN] = useState('')
  const [dom, setDom] = useState<Dom>('Maths')
  const [type, setType] = useState<ErrType>('gap')
  const [text, setText] = useState('')
  const save = (next: Entry[]) => {
    setLog(next)
    saveLocal(STORE, next)
  }
  return (
    <div className={m.wrap}>
      <form
        className={m.form}
        onSubmit={(e) => {
          e.preventDefault()
          const num = parseInt(n, 10)
          save([...log, { n: Number.isFinite(num) ? num : undefined, dom, type, text: text.trim() || undefined }])
          setN('')
          setText('')
        }}
      >
        <div className={m.formRow}>
          <input className={m.field} style={{ width: '5.5rem' }} inputMode="numeric" placeholder="Q no." value={n} onChange={(e) => setN(e.target.value)} aria-label="Question number" />
          <select className={m.field} value={dom} onChange={(e) => setDom(e.target.value as Dom)} aria-label="Domain">
            {DOMS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select className={m.field} value={type} onChange={(e) => setType(e.target.value as ErrType)} aria-label="Error type">
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <div className={m.formRow}>
          <input className={m.field} style={{ flex: '1 1 12rem' }} placeholder="What happened? e.g. forgot loc includes the end" value={text} onChange={(e) => setText(e.target.value)} aria-label="Note" />
          <button type="submit" className="btn btn-primary btn-small">
            Add to log
          </button>
        </div>
      </form>
      {log.length === 0 ? (
        <div style={{ fontSize: '0.9rem', color: 'var(--ink-3)', textAlign: 'center' }}>
          Your log is empty. After your next <a href="#/mock">mock exam</a>, add every wrong or guessed question here. It is saved in this browser only.
        </div>
      ) : (
        <>
          <ul className={m.logList} style={{ paddingLeft: 0, marginLeft: 0 }}>
            {log.map((e, i) => (
              <li key={i} className={m.logItem}>
                <span className={m.logText}>
                  {e.n ? <strong>Q{e.n} </strong> : null}
                  <span className={m.tag} style={{ color: domColour(e.dom) }}>
                    {e.dom}
                  </span>{' '}
                  <span className={m.tag} style={{ color: typeOf(e.type).colour }}>
                    {typeOf(e.type).title}
                  </span>{' '}
                  {e.text}
                </span>
                <button type="button" className={m.linkBtn} onClick={() => save(log.filter((_, j) => j !== i))} aria-label={`Remove entry ${i + 1}`}>
                  remove
                </button>
              </li>
            ))}
          </ul>
          <Summary entries={log} />
        </>
      )}
    </div>
  )
}

export default function ErrorLogSorter() {
  const [tab, setTab] = useState<'sort' | 'mine'>('sort')
  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState<ErrType[]>([])
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const card = CARDS[idx]
  const picked = picks.length > idx ? picks[idx] : null
  const finished = picks.length === CARDS.length && idx === CARDS.length - 1 && picked !== null
  const placed: Record<ErrType, Entry[]> = { gap: [], misread: [], slip: [], time: [] }
  CARDS.slice(0, picks.length).forEach((c) => placed[c.type].push({ n: c.n, dom: c.dom, type: c.type }))

  const choose = (t: ErrType) => {
    if (picked !== null) return
    setPicks((p) => [...p, t])
  }
  const right = picks.filter((p, i) => p === CARDS[i].type).length

  return (
    <Figure
      title="Sort the error log"
      caption={
        <>
          Each card is a real kind of Prelim mistake, with the student’s own note on what happened. Read the note, then tap the bin it belongs in (or drag the card onto it). The four bins need four
          different fixes, which is why “just do more practice” fixes so little: it does nothing for a misread. Switch to <em>My error log</em> to keep your own after each mock.
        </>
      }
    >
      <div className={m.wrap} ref={ref}>
        <Segmented
          label="Mode"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'sort', label: 'Sort sample mistakes' },
            { value: 'mine', label: 'My error log' },
          ]}
        />
        {tab === 'mine' ? (
          <MyLog />
        ) : (
          <>
            <Bins onPick={choose} disabled={picked !== null} placed={placed} narrow={narrow} onDropCard={choose} />
            <div
                className={m.mistake}
                draggable={picked === null}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(card.n))
                  e.dataTransfer.effectAllowed = 'move'
                }}
                aria-label={`Mistake ${idx + 1} of ${CARDS.length}`}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>Q{card.n}</strong>
                    <span className={m.tag} style={{ color: domColour(card.dom) }}>
                      {card.dom}
                    </span>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)' }} className="tabular">
                    mistake {idx + 1} of {CARDS.length}
                  </span>
                </div>
                <div className={m.mistakeQ}>{card.q}</div>
                <div className={m.mistakeRow}>
                  Chose: <span style={{ color: 'var(--viz-neg)', fontWeight: 700 }}>{card.you}</span> · Answer: <span style={{ color: 'var(--viz-pos)', fontWeight: 700 }}>{card.ans}</span>
                </div>
                <div className={m.note}>“{card.note}”</div>
              </div>
            {picked !== null && (
              <div className={`${m.banner} ${picked === card.type ? m.bannerGood : m.bannerBad}`} aria-live="polite">
                <strong>{picked === card.type ? `Yes: ${typeOf(card.type).title.toLowerCase()}.` : `This one is ${article(typeOf(card.type).title)}, not ${article(typeOf(picked).title)}.`}</strong> {card.why}
                {card.link && (
                  <>
                    {' '}
                    Fix: the <a href={card.link[1]}>{card.link[0]}</a> lesson.
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem', gap: '0.4rem' }}>
                  {idx < CARDS.length - 1 ? (
                    <Button primary onClick={() => setIdx((i) => i + 1)}>
                      Next mistake
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
            {finished && (
              <>
                <div className={m.banner}>
                  You sorted <strong>{right} of {CARDS.length}</strong> the way the student’s notes point. Here is the log, by domain and by type, and the plan it gives:
                </div>
                <Summary entries={CARDS.map((c) => ({ n: c.n, dom: c.dom, type: c.type, link: c.link }))} />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    onClick={() => {
                      setIdx(0)
                      setPicks([])
                    }}
                  >
                    Sort them again
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Figure>
  )
}
