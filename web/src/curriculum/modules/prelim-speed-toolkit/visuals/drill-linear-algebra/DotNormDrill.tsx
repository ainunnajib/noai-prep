import { useMemo, useRef, useState, useEffect } from 'react'
import { Figure, Segmented, Button, mulberry32 } from '../../../../../kit'
import { AnswerBox, Stats, TimerBar, useCountdown, parseNumber, close, frac, num, gcd } from './drillKit'
import d from './drill.module.css'

/*
  60-second drill: dot products, L1 norms, L2 norms and cosine similarities of small integer
  vectors. The L2 and cosine vectors are built so that every length is a whole number
  (Pythagorean triples and quadruples), so everything is doable without a calculator.
  A miss shows the running-total working and the triple hidden in the vector.
*/

type Kind = 'dot' | 'l1' | 'l2' | 'cos'
type Mode = 'mixed' | Kind
type Diff = 'easy' | 'hard'

interface Q {
  kind: Kind
  a: number[]
  b?: number[]
  answer: number
  /** exact answer text */
  text: string
}

const ROUND = 60

/** All vectors with 0 ≤ x1 ≤ x2 ≤ … ≤ max whose length is a whole number ≤ maxNorm (at most one zero). */
function integerNormVectors(dim: number, max: number, maxNorm: number): { v: number[]; n: number }[] {
  const out: { v: number[]; n: number }[] = []
  const rec = (pre: number[], from: number) => {
    if (pre.length === dim) {
      const ss = pre.reduce((s, x) => s + x * x, 0)
      const n = Math.round(Math.sqrt(ss))
      if (n * n === ss && n <= maxNorm && pre.filter((x) => x === 0).length <= 1 && pre.some((x) => x > 1)) out.push({ v: pre, n })
      return
    }
    for (let x = from; x <= max; x++) rec([...pre, x], x)
  }
  rec([], 0)
  return out
}

const NORM3 = integerNormVectors(3, 12, 17)
const NORM4 = integerNormVectors(4, 8, 13)

function permute(v: number[], r: () => number) {
  const a = v.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const signs = (v: number[], r: () => number) => v.map((x) => (r() < 0.4 ? -x : x))
const dotp = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)
const l2 = (a: number[]) => Math.sqrt(a.reduce((s, x) => s + x * x, 0))

function makeQ(seed: number, mode: Mode, diff: Diff): Q {
  const r = mulberry32(seed)
  const kinds: Kind[] = ['dot', 'l1', 'l2', 'cos']
  const kind = mode === 'mixed' ? kinds[Math.floor(r() * 4)] : mode
  const dim = diff === 'easy' ? 3 : r() < 0.5 ? 3 : 4
  const pool = dim === 3 ? NORM3 : NORM4
  const rint = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
  if (kind === 'dot') {
    const lo = diff === 'easy' ? 0 : -6
    const hi = diff === 'easy' ? 6 : 9
    const a = Array.from({ length: dim }, () => rint(lo, hi))
    const b = Array.from({ length: dim }, () => rint(lo, hi))
    const ans = dotp(a, b)
    return { kind, a, b, answer: ans, text: num(ans) }
  }
  if (kind === 'l1') {
    const a = Array.from({ length: dim }, () => (diff === 'easy' ? rint(0, 9) : rint(-9, 9)))
    const ans = a.reduce((s, x) => s + Math.abs(x), 0)
    return { kind, a, answer: ans, text: String(ans) }
  }
  if (kind === 'l2') {
    const base = pool[Math.floor(r() * pool.length)]
    let a = permute(base.v, r)
    if (diff === 'hard') {
      a = signs(a, r)
      if (r() < 0.3 && base.n <= 9) a = a.map((x) => 2 * x)
    }
    const ans = Math.round(l2(a))
    return { kind, a, answer: ans, text: String(ans) }
  }
  // cosine: both vectors have whole-number lengths (at most 9, so the fractions stay small);
  // about a third of the time they are orthogonal
  const small = pool.filter((x) => x.n <= 9)
  for (let tries = 0; tries < 400; tries++) {
    const A = small[Math.floor(r() * small.length)]
    const a = diff === 'hard' ? signs(permute(A.v, r), r) : permute(A.v, r)
    const wantOrth = r() < 0.35
    let b: number[] | null = null
    if (wantOrth) {
      for (let t = 0; t < 300 && !b; t++) {
        const B = small[Math.floor(r() * small.length)]
        const cand = signs(permute(B.v, r), r)
        if (dotp(a, cand) === 0) b = cand
      }
    }
    if (!b) {
      const B = small[Math.floor(r() * small.length)]
      b = diff === 'hard' ? signs(permute(B.v, r), r) : permute(B.v, r)
    }
    const na = Math.round(l2(a))
    const nb = Math.round(l2(b))
    const dp = dotp(a, b)
    if (!wantOrth && dp === 0) continue
    if (Math.abs(dp) === na * nb && tries < 399) continue // parallel pairs are too easy
    return { kind: 'cos', a, b, answer: dp / (na * nb), text: frac(dp, na * nb) }
  }
  return { kind: 'cos', a: [1, 2, 2], b: [2, 3, 6], answer: 20 / 21, text: '20/21' }
}

const KIND_NAME: Record<Kind, string> = { dot: 'dot product', l1: 'L1 norm', l2: 'L2 norm (length)', cos: 'cosine similarity' }

/** Running-total working for a dot product, e.g. "1×4 = 4 → +2×5 = 14 → +3×6 = 32". */
function runningDot(a: number[], b: number[]) {
  let t = 0
  return a
    .map((x, i) => {
      const p = x * b[i]
      t += p
      return `${i === 0 ? '' : '+ '}${num(x)}×${num(b[i])} → ${num(t)}`
    })
    .join('   ')
}

/** Look for a Pythagorean triple hidden in a vector, e.g. [3, 12, 4]: 3, 4 → 5, then 5, 12 → 13. */
function hiddenTriple(a: number[]): string | null {
  const v = a.map(Math.abs)
  const g = v.reduce((p, x) => gcd(p, x), 0)
  if (g > 1 && v.some((x) => x !== 0)) {
    const w = v.map((x) => x / g)
    const inner = Math.round(l2(w))
    if (inner * inner === w.reduce((s, x) => s + x * x, 0)) return `Every entry shares the factor ${g}: ‖a‖ = ${g} × ‖[${w.join(', ')}]‖ = ${g} × ${inner} = ${g * inner}.`
  }
  for (let i = 0; i < v.length; i++)
    for (let j = i + 1; j < v.length; j++) {
      if (!v[i] || !v[j]) continue
      const s2 = v[i] * v[i] + v[j] * v[j]
      const s = Math.round(Math.sqrt(s2))
      if (s * s !== s2) continue
      const rest = v.filter((_, k) => k !== i && k !== j)
      if (rest.length === 1) {
        return `Hidden triples: ${v[i]}, ${v[j]} → ${s} (a ${Math.min(v[i], v[j])}-${Math.max(v[i], v[j])}-${s} triangle), then ${s}, ${rest[0]} → ${Math.round(l2([s, rest[0]]))}.`
      }
      const r2 = rest.reduce((p, x) => p + x * x, 0)
      const rr = Math.round(Math.sqrt(r2))
      if (rr * rr === r2 && rest.every((x) => x)) return `Hidden triples: ${v[i]}, ${v[j]} → ${s}; ${rest.join(', ')} → ${rr}; then ${s}, ${rr} → ${Math.round(l2([s, rr]))}.`
    }
  return null
}

function working(q: Q): string[] {
  if (q.kind === 'dot') return [runningDot(q.a, q.b!), `So a·b = ${q.text}.`]
  if (q.kind === 'l1') return [`|${q.a.map(num).join('| + |')}| = ${q.a.map((x) => Math.abs(x)).join(' + ')} = ${q.text}.`, 'Add the sizes, ignoring signs. No squares, no root.']
  if (q.kind === 'l2') {
    const sq = q.a.map((x) => x * x)
    const lines = [`${q.a.map((x) => (x < 0 ? `(${num(x)})²` : `${x}²`)).join(' + ')} = ${sq.join(' + ')} = ${sq.reduce((s, x) => s + x, 0)} = ${q.text}², so ‖a‖ = ${q.text}.`]
    const h = hiddenTriple(q.a)
    if (h) lines.push(h)
    return lines
  }
  const dp = dotp(q.a, q.b!)
  const na = Math.round(l2(q.a))
  const nb = Math.round(l2(q.b!))
  if (dp === 0) return [runningDot(q.a, q.b!), 'The dot product is 0, so the vectors are orthogonal and cos θ = 0. No lengths needed.']
  return [runningDot(q.a, q.b!), `‖a‖ = ${na}, ‖b‖ = ${nb}, so cos θ = ${num(dp)} / (${na} × ${nb}) = ${q.text} ≈ ${q.answer.toFixed(2)}.`]
}

function VecView({ v, name }: { v: number[]; name: string }) {
  return (
    <span className={d.vec} aria-label={`${name} = [${v.join(', ')}]`}>
      <span className={d.muted} style={{ marginRight: '0.35rem' }}>
        {name} =
      </span>
      [
      {v.map((x, i) => (
        <span key={i} className={d.vecEl}>
          {num(x)}
          {i < v.length - 1 ? ',' : ''}
        </span>
      ))}
      ]
    </span>
  )
}

export default function DotNormDrill() {
  const [mode, setMode] = useState<Mode>('mixed')
  const [diff, setDiff] = useState<Diff>('easy')
  const [game, setGame] = useState(0)
  const [idx, setIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [over, setOver] = useState(false)
  const [input, setInput] = useState('')
  const [log, setLog] = useState<{ q: Q; ok: boolean; given: string }[]>([])
  const [flash, setFlash] = useState<null | 'ok' | 'miss'>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const q = useMemo(() => makeQ(104729 * (game + 1) + 31 * idx + (diff === 'hard' ? 7 : 0) + ['mixed', 'dot', 'l1', 'l2', 'cos'].indexOf(mode), mode, diff), [game, idx, mode, diff])
  const left = useCountdown(ROUND, running, () => {
    setRunning(false)
    setOver(true)
  }, `${game}`)

  useEffect(() => {
    if (running) inputRef.current?.focus({ preventScroll: true })
  }, [running, idx])
  useEffect(() => {
    if (!flash) return
    const id = window.setTimeout(() => setFlash(null), 450)
    return () => window.clearTimeout(id)
  }, [flash, idx])

  const start = () => {
    // the question on screen at rest is the first of the first round; later rounds get fresh questions
    if (over || log.length > 0) setGame((g) => g + 1)
    setIdx(0)
    setLog([])
    setInput('')
    setOver(false)
    setRunning(true)
  }
  const submit = () => {
    const v = parseNumber(input)
    if (v === null) return
    const ok = q.kind === 'cos' ? close(v, q.answer) : v === q.answer
    setLog((l) => [...l, { q, ok, given: input.trim() }])
    setFlash(ok ? 'ok' : 'miss')
    setInput('')
    setIdx((i) => i + 1)
  }

  const right = log.filter((x) => x.ok).length
  const misses = log.filter((x) => !x.ok)
  const lastMiss = misses[misses.length - 1]

  return (
    <Figure
      title="Dot products and norms: 60-second drill"
      caption={
        <>
          Press <strong>Start</strong> and answer as many as you can in a minute. Work left to right keeping one running total; for lengths, look for a triple hiding in the vector
          (3-4-5, 5-12-13, 1-2-2-3, 2-3-6-7). For cosine, check the dot product first: if it is 0 you are done. Fractions like <code>20/21</code> or decimals to 2 places are both
          fine.
        </>
      }
    >
      <div className={d.wrap}>
        <div className={d.row}>
          <Segmented
            label="Ask for"
            value={mode}
            onChange={(v) => {
              setMode(v)
              setRunning(false)
              setOver(false)
            }}
            options={[
              { value: 'mixed', label: 'Mixed' },
              { value: 'dot', label: 'Dot' },
              { value: 'l1', label: 'L1' },
              { value: 'l2', label: 'L2' },
              { value: 'cos', label: 'cos' },
            ]}
          />
          <Segmented
            label="Level"
            value={diff}
            onChange={(v) => {
              setDiff(v)
              setRunning(false)
              setOver(false)
            }}
            options={[
              { value: 'easy', label: '3-D, positive' },
              { value: 'hard', label: '3–4-D, signs' },
            ]}
          />
        </div>

        <div className={`${d.stage}${flash === 'ok' ? ` ${d.ok}` : flash === 'miss' ? ` ${d.miss}` : ''}`}>
          <div className={d.spread} style={{ width: '100%' }}>
            <span className={d.label}>{running ? `Question ${idx + 1}` : over ? 'Time!' : 'Ready'}</span>
            <span className={`${d.small} tabular`}>{running ? `${Math.ceil(left)} s left` : `${ROUND} s round`}</span>
          </div>
          <TimerBar left={running ? left : over ? 0 : ROUND} limit={ROUND} />
          {!over && (
            <>
              <div className={d.prompt}>
                {q.kind === 'dot' && 'Compute a · b'}
                {q.kind === 'l1' && 'Compute the L1 norm ‖a‖₁'}
                {q.kind === 'l2' && 'Compute the length ‖a‖₂'}
                {q.kind === 'cos' && 'Compute cos θ between a and b'}
              </div>
              <div style={{ display: 'grid', gap: '0.35rem', justifyItems: 'center' }}>
                <VecView v={q.a} name="a" />
                {q.b && <VecView v={q.b} name="b" />}
              </div>
            </>
          )}
          {running ? (
            <AnswerBox value={input} onChange={setInput} onSubmit={submit} placeholder={q.kind === 'cos' ? 'e.g. 4/9' : 'number'} inputRef={inputRef} label={`Your answer for the ${KIND_NAME[q.kind]}`} />
          ) : (
            <Button primary onClick={start}>
              {over ? 'Play again' : 'Start 60 seconds'}
            </Button>
          )}
          {over && (
            <div className={`${d.feedback} ${right >= log.length * 0.8 && log.length > 0 ? d.ok : ''}`}>
              <div>
                <strong className="tabular">{right}</strong> right out of <strong className="tabular">{log.length}</strong> in {ROUND} seconds.{' '}
                {log.length > 0 && right === log.length ? 'Clean sheet. Try the harder level.' : misses.length > 0 ? 'Your misses, with the working:' : 'Start again and answer a few.'}
              </div>
              {misses.slice(0, 6).map((m, i) => (
                <MissView key={i} m={m} />
              ))}
            </div>
          )}
        </div>

        {running && lastMiss && (
          <div className={`${d.feedback} ${d.miss}`} aria-live="polite">
            <MissView m={lastMiss} />
          </div>
        )}

        <Stats
          items={[
            ['answered', log.length],
            ['right', right],
            ['missed', misses.length],
          ]}
        />
      </div>
    </Figure>
  )
}

function MissView({ m }: { m: { q: Q; ok: boolean; given: string } }) {
  const q = m.q
  return (
    <div style={{ display: 'grid', gap: '0.2rem' }}>
      <div className={d.small}>
        <span className={d.missText}>{KIND_NAME[q.kind]}</span> of [{q.a.map(num).join(', ')}]{q.b ? ` and [${q.b.map(num).join(', ')}]` : ''}: you said {m.given}, answer{' '}
        <strong>{q.text}</strong>
      </div>
      {working(q).map((w, i) => (
        <div key={i} className={d.working}>
          {w}
        </div>
      ))}
    </div>
  )
}
