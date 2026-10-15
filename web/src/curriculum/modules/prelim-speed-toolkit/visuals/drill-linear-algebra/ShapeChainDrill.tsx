import { useMemo, useRef, useState, useEffect } from 'react'
import { Figure, Segmented, Button, mulberry32 } from '../../../../../kit'
import { AnswerBox, Stats, TimerBar, History, useCountdown, avg } from './drillKit'
import d from './drill.module.css'

/*
  Shape-chain drill: a random product of 2–4 matrices (some transposed). Type the shape of the
  result, e.g. "3x1", or "invalid". 10 seconds each. Feedback lines up the dominoes after the
  transposes, colours the inner pairs (match / clash) and the outer pair that survives.
*/

type Level = 'two' | 'chain' | 'transpose'
interface Mat {
  /** effective shape after any transpose */
  r: number
  c: number
  /** shown to the learner as (c × r)ᵀ */
  t: boolean
}
interface Chain {
  mats: Mat[]
  /** index i where mats[i-1].c !== mats[i].r, or -1 if valid */
  bad: number
}

const LIMIT = 10
const NAMES = ['A', 'B', 'C', 'D']
const SMALL = [1, 2, 3, 4, 5, 6, 7, 8]
const NET = [10, 16, 32, 64, 128, 256, 784]

function makeChain(seed: number, level: Level): Chain {
  const r = mulberry32(seed)
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]
  const k = level === 'two' ? 2 : r() < 0.5 ? 3 : 4
  const net = level !== 'two' && r() < 0.25
  const e = Array.from({ length: k + 1 }, () => (net ? pick(NET) : pick(SMALL)))
  if (net) e[0] = pick([1, 8, 16, 32, 64])
  // avoid accidental all-same chains, which make every answer look the same
  if (e.every((x) => x === e[0])) e[k] = e[0] === 1 ? 3 : 1
  const mats: Mat[] = Array.from({ length: k }, (_, i) => ({ r: e[i], c: e[i + 1], t: false }))
  let bad = -1
  if (r() < 0.32) {
    const i = 1 + Math.floor(r() * (k - 1))
    const trap = r()
    if (k === 2 && trap < 0.5 && mats[0].r !== mats[0].c) {
      // classic trap: the same non-square shape twice, e.g. (3×2)(3×2)
      mats[1] = { r: mats[0].r, c: mats[0].c, t: false }
    } else {
      let v = mats[i].r
      while (v === mats[i - 1].c) v = net ? pick(NET) : pick(SMALL)
      mats[i] = { ...mats[i], r: v }
    }
    bad = mats.findIndex((m, j) => j > 0 && mats[j - 1].c !== m.r)
  }
  if (level === 'transpose') {
    let any = false
    mats.forEach((m) => {
      if (r() < 0.45 && m.r !== m.c) {
        m.t = true
        any = true
      }
    })
    if (!any) {
      const m = mats.find((x) => x.r !== x.c)
      if (m) m.t = true
    }
  }
  return { mats, bad }
}

const answerOf = (ch: Chain): string => (ch.bad >= 0 ? 'invalid' : `${ch.mats[0].r}x${ch.mats[ch.mats.length - 1].c}`)

function parseShape(raw: string): string | null {
  const t = raw.trim().toLowerCase()
  if (!t) return null
  if (/^(invalid|inv|no|none|undefined|cannot|can't|cant|x|error|n\/a|-)$/.test(t)) return 'invalid'
  const m = t.match(/^\(?\s*(\d+)\s*(?:x|×|\*|,|by|\s)\s*(\d+)\s*\)?$/)
  return m ? `${Number(m[1])}x${Number(m[2])}` : null
}

export default function ShapeChainDrill() {
  const [level, setLevel] = useState<Level>('chain')
  const [round, setRound] = useState(0)
  const [running, setRunning] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; given: string; timeUp?: boolean }>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [times, setTimes] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const started = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)

  const chain = useMemo(() => makeChain(7919 * (round + 1) + (level === 'two' ? 1 : level === 'chain' ? 2 : 3), level), [round, level])
  const answer = answerOf(chain)

  const finish = (given: string, timeUp = false) => {
    const ok = !timeUp && given === answer
    setResult({ ok, given, timeUp })
    setMarks((m) => [...m, ok])
    if (ok) {
      setTimes((t) => [...t, (performance.now() - started.current) / 1000])
      setStreak((s) => {
        const n = s + 1
        setBest((b) => Math.max(b, n))
        return n
      })
    } else setStreak(0)
  }

  const left = useCountdown(LIMIT, running && !result, () => finish('', true), `${round}-${level}`)

  const next = () => {
    setRound((x) => x + 1)
    setInput('')
    setResult(null)
    setRunning(true)
    started.current = performance.now()
  }

  useEffect(() => {
    if (running && !result) {
      started.current = performance.now()
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [round, running, result, level])

  // a correct answer moves on by itself; a miss waits so you can read the feedback
  useEffect(() => {
    if (!result) return
    if (result.ok) {
      const id = window.setTimeout(next, 900)
      return () => window.clearTimeout(id)
    }
    nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const submit = () => {
    const g = parseShape(input)
    if (!g) return
    finish(g)
  }

  const show = !!result
  return (
    <Figure
      title="Shape-chain drill: 10 seconds a chain"
      caption={
        <>
          Type the shape of the product, like <code>3x4</code>, or <code>invalid</code> if it cannot be multiplied. Do not multiply anything: line the shapes up, check that each
          pair of touching inner numbers match, and keep the two outer numbers. A dashed tile with a <strong>T</strong> is transposed, so flip it first. Aim for a streak of ten.
        </>
      }
    >
      <div className={d.wrap}>
        <Segmented
          label="Level"
          value={level}
          onChange={(v) => {
            setLevel(v)
            setResult(null)
            setInput('')
          }}
          options={[
            { value: 'two', label: '2 matrices' },
            { value: 'chain', label: '3–4 matrices' },
            { value: 'transpose', label: '+ transposes' },
          ]}
        />
        <div className={d.stage}>
          <div className={d.spread} style={{ width: '100%' }}>
            <span className={d.label}>Chain {round + 1}</span>
            <span className={`${d.small} tabular`}>{running && !result ? `${Math.ceil(left)} s` : show ? '' : `${LIMIT} s each`}</span>
          </div>
          <TimerBar left={running && !result ? left : LIMIT} limit={LIMIT} />
          <div className={d.prompt}>What is the shape of {chain.mats.map((m, i) => NAMES[i] + (m.t ? 'ᵀ' : '')).join('')}?</div>
          <ChainView chain={chain} reveal={false} />
          {running ? (
            <AnswerBox value={input} onChange={setInput} onSubmit={submit} placeholder="e.g. 3x4" disabled={show} inputRef={inputRef} label="Shape of the product, or invalid">
              <button
                type="button"
                className="btn btn-small"
                disabled={show}
                onClick={() => {
                  finish('invalid')
                }}
              >
                Invalid
              </button>
            </AnswerBox>
          ) : (
            <Button primary onClick={() => setRunning(true)}>
              Start the drill
            </Button>
          )}
          {show && (
            <div className={`${d.feedback} ${result.ok ? d.ok : d.miss}`} aria-live="polite">
              <div>
                {result.ok ? (
                  <span className={d.okText}>Right: {answer === 'invalid' ? 'invalid' : answer.replace('x', ' × ')}.</span>
                ) : (
                  <span className={d.missText}>
                    {result.timeUp ? 'Time is up.' : `Not ${result.given === 'invalid' ? '“invalid”' : result.given.replace('x', ' × ')}.`} The answer is{' '}
                    {answer === 'invalid' ? 'invalid' : answer.replace('x', ' × ')}.
                  </span>
                )}
              </div>
              <ChainView chain={chain} reveal />
              <div className={d.small}>
                <Explain chain={chain} />
              </div>
              {!result.ok && (
                <div ref={nextRef}>
                  <Button primary onClick={next}>
                    Next chain
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <Stats
          items={[
            ['answered', marks.length],
            ['right', marks.filter(Boolean).length],
            ['streak', streak],
            ['best streak', best],
            ['average time', times.length ? `${avg(times).toFixed(1)} s` : '–'],
          ]}
        />
        <History marks={marks} />
      </div>
    </Figure>
  )
}

/** The chain as dominoes. With `reveal`, transposes are applied and the touching numbers are coloured. */
function ChainView({ chain, reveal }: { chain: Chain; reveal: boolean }) {
  const k = chain.mats.length
  return (
    <div className={d.chain} aria-label={chain.mats.map((m, i) => `${NAMES[i]}: ${m.t ? `${m.c} by ${m.r}, transposed` : `${m.r} by ${m.c}`}`).join('; ')}>
      {chain.mats.map((m, i) => {
        const showR = reveal || !m.t ? m.r : m.c
        const showC = reveal || !m.t ? m.c : m.r
        const leftCls = reveal ? (i === 0 ? d.outer : chain.mats[i - 1].c === m.r ? d.match : d.clash) : ''
        const rightCls = reveal ? (i === k - 1 ? d.outer : chain.mats[i + 1].r === m.c ? d.match : d.clash) : ''
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ display: 'inline-grid', justifyItems: 'center', gap: '0.1rem' }}>
              <span className={`${d.domino}${m.t && !reveal ? ` ${d.dominoT}` : ''}`}>
                {m.t && !reveal && <span className={d.times}>(</span>}
                <span className={`${d.dimBox} ${leftCls}`}>{showR}</span>
                <span className={d.times}>×</span>
                <span className={`${d.dimBox} ${rightCls}`}>{showC}</span>
                {m.t && !reveal && (
                  <>
                    <span className={d.times}>)</span>
                    <sup className={d.supT}>T</sup>
                  </>
                )}
              </span>
              <span className={d.muted} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {NAMES[i]}
                {m.t ? 'ᵀ' : ''}
              </span>
            </span>
          </span>
        )
      })}
      {reveal && (
        <span className={d.dot} style={{ fontSize: '1.05rem' }}>
          → {chain.bad >= 0 ? 'undefined' : `${chain.mats[0].r} × ${chain.mats[k - 1].c}`}
        </span>
      )}
    </div>
  )
}

function Explain({ chain }: { chain: Chain }) {
  const k = chain.mats.length
  const flips = chain.mats.map((m, i) => (m.t ? `${NAMES[i]} is written (${m.c} × ${m.r})ᵀ, which is ${m.r} × ${m.c}` : null)).filter(Boolean)
  const pairs = chain.mats.slice(1).map((m, j) => `${chain.mats[j].c} ${chain.mats[j].c === m.r ? '=' : '≠'} ${m.r}`)
  return (
    <>
      {flips.length > 0 && <>Flip the transposes first: {flips.join('; ')}. </>}
      {chain.bad >= 0 ? (
        <>
          Touching numbers: {pairs.join(', ')}. {NAMES[chain.bad - 1]} and {NAMES[chain.bad]} meet at {chain.mats[chain.bad - 1].c} ≠ {chain.mats[chain.bad].r}, so the product is
          not defined, whatever the other numbers are.
        </>
      ) : (
        <>
          Touching numbers: {pairs.join(', ')}: they match and drop out. The outer numbers {chain.mats[0].r} and {chain.mats[k - 1].c} survive: {chain.mats[0].r} × {chain.mats[k - 1].c}.
        </>
      )}
    </>
  )
}
