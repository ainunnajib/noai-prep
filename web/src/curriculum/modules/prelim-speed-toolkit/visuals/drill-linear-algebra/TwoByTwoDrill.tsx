import { useMemo, useRef, useState, useEffect } from 'react'
import { Figure, Segmented, Button, M, mulberry32 } from '../../../../../kit'
import { AnswerBox, Stats, TimerBar, History, useCountdown, parseNumber, parseNumberList, close, frac, num, avg } from './drillKit'
import d from './drill.module.css'

/*
  2×2 drill: determinant, trace, one entry of the inverse, or both eigenvalues of a random integer
  matrix. Matrices for eigenvalue questions are built as P·diag(λ1, λ2)·P⁻¹ with an integer P of
  determinant ±1, so the eigenvalues are whole numbers. A miss shows the shortcut on the matrix.
*/

type Kind = 'det' | 'trace' | 'inv' | 'eig'
type Mode = 'mixed' | Kind
type Mat = [number, number, number, number] // a b c d

interface Q {
  kind: Kind
  m: Mat
  /** for inverse questions: which entry, 0..3 */
  pos?: number
  answer: number[]
  text: string
}

const LIMIT: Record<Kind, number> = { det: 15, trace: 10, inv: 20, eig: 25 }
const POS_NAME = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
const P_LIST: Mat[] = [
  [1, 1, 0, 1],
  [1, 0, 1, 1],
  [1, -1, 0, 1],
  [1, 0, -1, 1],
  [2, 1, 1, 1],
  [1, 1, 1, 2],
  [1, 2, 0, 1],
  [1, 0, 2, 1],
  [0, 1, 1, 1],
]

const det = (m: Mat) => m[0] * m[3] - m[1] * m[2]
const mul = (x: Mat, y: Mat): Mat => [x[0] * y[0] + x[1] * y[2], x[0] * y[1] + x[1] * y[3], x[2] * y[0] + x[3] * y[2], x[2] * y[1] + x[3] * y[3]]
/** inverse of an integer matrix with det ±1 (stays integer) */
const invUnimodular = (p: Mat): Mat => {
  const dt = det(p)
  return [p[3] * dt, -p[1] * dt, -p[2] * dt, p[0] * dt]
}

function makeQ(seed: number, mode: Mode): Q {
  const r = mulberry32(seed)
  const kinds: Kind[] = ['det', 'trace', 'inv', 'eig']
  const kind = mode === 'mixed' ? kinds[Math.floor(r() * 4)] : mode
  const rint = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
  if (kind === 'det' || kind === 'trace') {
    const m: Mat = [rint(-3, 9), rint(-4, 8), rint(-4, 8), rint(-3, 9)]
    const ans = kind === 'det' ? det(m) : m[0] + m[3]
    return { kind, m, answer: [ans], text: num(ans) }
  }
  if (kind === 'inv') {
    for (let t = 0; t < 500; t++) {
      const m: Mat = [rint(-2, 7), rint(-4, 6), rint(-4, 6), rint(-2, 7)]
      const dt = det(m)
      if (![1, -1, 2, -2, 3, 4, 5].includes(dt)) continue
      const pos = Math.floor(r() * 4)
      const adj: Mat = [m[3], -m[1], -m[2], m[0]]
      return { kind, m, pos, answer: [adj[pos] / dt], text: frac(adj[pos], dt) }
    }
  }
  // eigenvalues
  for (let t = 0; t < 500; t++) {
    const l1 = rint(-3, 7)
    let l2 = rint(-3, 7)
    if (l2 === l1) l2 = l1 + rint(1, 3)
    let m: Mat
    if (r() < 0.25) m = [l1, rint(-4, 5), 0, l2] // triangular: read them off the diagonal
    else {
      const p = P_LIST[Math.floor(r() * P_LIST.length)]
      m = mul(mul(p, [l1, 0, 0, l2]), invUnimodular(p))
    }
    if (m.some((x) => Math.abs(x) > 12)) continue
    const ans = [l1, l2].sort((a, b) => b - a)
    return { kind: 'eig', m, answer: ans, text: `${num(ans[0])} and ${num(ans[1])}` }
  }
  return { kind: 'eig', m: [4, 1, 2, 3], answer: [5, 2], text: '5 and 2' }
}

function prompt(q: Q) {
  if (q.kind === 'det') return 'det A = ?'
  if (q.kind === 'trace') return 'trace A = ?'
  if (q.kind === 'inv') return `The ${POS_NAME[q.pos!]} entry of A⁻¹ = ?`
  return 'Both eigenvalues of A = ? (e.g. 5, 2)'
}

/** The matrix drawn in SVG, with the shortcut overlaid when `show` is set. */
function MatrixPic({ q, show }: { q: Q; show: boolean }) {
  const [a, b, c, dd] = q.m
  const W = 182
  const H = 104
  const X = [76, 132]
  const Y = [36, 80]
  const vals = [a, b, c, dd]
  const at = (i: number): [number, number] => [X[i % 2], Y[Math.floor(i / 2)]]
  const bracket = (x: number, dir: 1 | -1) => `M${x + 8 * dir},12 L${x},12 L${x},${H - 8} L${x + 8 * dir},${H - 8}`
  const hl = (i: number): string | undefined => {
    if (!show) return undefined
    if (q.kind === 'trace' || q.kind === 'eig') return i === 0 || i === 3 ? 'var(--viz-1)' : undefined
    if (q.kind === 'inv') return i === q.pos ? 'var(--viz-4)' : undefined
    return undefined
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`A = [[${a}, ${b}], [${c}, ${dd}]]`} style={{ maxWidth: '100%' }}>
      <text x={4} y={H / 2 + 7} style={{ fill: 'var(--ink-2)', fontSize: 20, fontWeight: 700 }}>
        A =
      </text>
      <path d={bracket(52, 1)} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
      <path d={bracket(156, -1)} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
      {show && q.kind === 'det' && (
        <>
          <line x1={X[0] - 10} y1={Y[0] - 14} x2={X[1] + 10} y2={Y[1] + 6} style={{ stroke: 'var(--viz-pos)', strokeWidth: 3, opacity: 0.8 }} />
          <line x1={X[1] + 10} y1={Y[0] - 14} x2={X[0] - 10} y2={Y[1] + 6} style={{ stroke: 'var(--viz-neg)', strokeWidth: 3, opacity: 0.8 }} />
        </>
      )}
      {vals.map((v, i) => {
        const [x, y] = at(i)
        const c2 = hl(i)
        return (
          <g key={i}>
            {c2 && <rect x={x - 19} y={y - 21} width={38} height={30} rx={6} style={{ fill: `color-mix(in srgb, ${c2} 22%, transparent)`, stroke: c2, strokeWidth: 1.5 }} />}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              style={{ fill: 'var(--viz-ink)', fontSize: 21, fontWeight: 750, fontVariantNumeric: 'tabular-nums', paintOrder: 'stroke', stroke: 'var(--surface-2)', strokeWidth: 6, strokeLinejoin: 'round' }}
            >
              {num(v)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Shortcut({ q }: { q: Q }) {
  const [a, b, c, dd] = q.m
  const p = (x: number) => (x < 0 ? `(${x})` : String(x))
  const pu = (x: number) => (x < 0 ? `(${num(x)})` : String(x))
  if (q.kind === 'det')
    return (
      <>
        <M>{`\\det A = ad - bc = ${p(a)}\\times${p(dd)} - ${p(b)}\\times${p(c)} = ${a * dd} - ${p(b * c)} = ${det(q.m)}`}</M>. Green diagonal minus red diagonal.
      </>
    )
  if (q.kind === 'trace')
    return (
      <>
        <M>{`\\operatorname{tr} A = a + d = ${a} + ${p(dd)} = ${a + dd}`}</M>: add the main diagonal only.
      </>
    )
  if (q.kind === 'inv') {
    const dt = det(q.m)
    return (
      <>
        <M>{`A^{-1} = \\frac{1}{${dt}}\\begin{bmatrix} ${dd} & ${-b} \\\\ ${-c} & ${a} \\end{bmatrix}`}</M>: swap the diagonal, flip the signs of the other two, divide by{' '}
        <M>{`\\det A = ${p(a)}\\times${p(dd)} - ${p(b)}\\times${p(c)} = ${dt}`}</M>. The {POS_NAME[q.pos!]} entry is <M>{`\\tfrac{${[dd, -b, -c, a][q.pos!]}}{${dt}} = ${q.text.replace('−', '-')}`}</M>.
      </>
    )
  }
  const T = a + dd
  const D = det(q.m)
  return (
    <>
      <M>{`\\lambda_1 + \\lambda_2 = \\operatorname{tr} A = ${T}`}</M> and <M>{`\\lambda_1 \\lambda_2 = \\det A = ${D}`}</M>. Two numbers that add to {num(T)} and multiply to {num(D)}:{' '}
      <strong>{q.text}</strong>.{' '}
      {b === 0 || c === 0
        ? 'The matrix is triangular (a zero off the diagonal), so they sit on the diagonal already.'
        : `Check: ${num(q.answer[0])} + ${pu(q.answer[1])} = ${num(T)} and ${num(q.answer[0])} × ${pu(q.answer[1])} = ${num(D)}.`}
    </>
  )
}

export default function TwoByTwoDrill() {
  const [mode, setMode] = useState<Mode>('mixed')
  const [round, setRound] = useState(0)
  const [running, setRunning] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; given: string; timeUp?: boolean }>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [times, setTimes] = useState<number[]>([])
  const started = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)

  const q = useMemo(() => makeQ(15485863 + 7907 * round + ['mixed', 'det', 'trace', 'inv', 'eig'].indexOf(mode), mode), [round, mode])
  const limit = LIMIT[q.kind]

  const finish = (given: string, timeUp = false) => {
    let ok = false
    if (!timeUp) {
      if (q.kind === 'eig') {
        const xs = parseNumberList(given)
        ok = !!xs && xs.length === 2 && [...xs].sort((p1, p2) => p2 - p1).every((x, i) => x === q.answer[i])
      } else {
        const v = parseNumber(given)
        ok = v !== null && close(v, q.answer[0], q.kind === 'inv' ? 0.011 : 1e-9)
      }
    }
    setResult({ ok, given, timeUp })
    setMarks((m) => [...m, ok])
    if (ok) setTimes((t) => [...t, (performance.now() - started.current) / 1000])
  }
  const left = useCountdown(limit, running && !result, () => finish('', true), `${round}-${mode}`)

  const next = () => {
    setRound((x) => x + 1)
    setInput('')
    setResult(null)
    setRunning(true)
  }
  useEffect(() => {
    if (running && !result) {
      started.current = performance.now()
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [round, running, result, mode])
  useEffect(() => {
    if (!result) return
    if (result.ok) {
      const id = window.setTimeout(next, 1400)
      return () => window.clearTimeout(id)
    }
    nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const submit = () => {
    if (!input.trim()) return
    if (q.kind === 'eig' ? !parseNumberList(input) : parseNumber(input) === null) return
    finish(input)
  }

  return (
    <Figure
      title="2×2 shortcuts: determinant, trace, inverse, eigenvalues"
      caption={
        <>
          Answer before the bar runs out; a miss draws the shortcut on the matrix. For eigenvalues, do not solve a quadratic first: find two numbers that <strong>add to the trace</strong>{' '}
          and <strong>multiply to the determinant</strong>. Inverse entries can be typed as fractions, like <code>-3/2</code>.
        </>
      }
    >
      <div className={d.wrap}>
        <Segmented
          label="Ask for"
          value={mode}
          onChange={(v) => {
            setMode(v)
            setResult(null)
            setInput('')
          }}
          options={[
            { value: 'mixed', label: 'Mixed' },
            { value: 'det', label: 'det' },
            { value: 'trace', label: 'trace' },
            { value: 'inv', label: 'A⁻¹' },
            { value: 'eig', label: 'λ' },
          ]}
        />
        <div className={d.stage}>
          <div className={d.spread} style={{ width: '100%' }}>
            <span className={d.label}>Matrix {round + 1}</span>
            <span className={`${d.small} tabular`}>{running && !result ? `${Math.ceil(left)} s` : `${limit} s`}</span>
          </div>
          <TimerBar left={running && !result ? left : limit} limit={limit} />
          <MatrixPic q={q} show={!!result} />
          <div className={`${d.prompt} ${d.big}`}>{prompt(q)}</div>
          {running ? (
            <AnswerBox value={input} onChange={setInput} onSubmit={submit} placeholder={q.kind === 'eig' ? 'e.g. 5, 2' : q.kind === 'inv' ? 'e.g. -3/2' : 'number'} disabled={!!result} inputRef={inputRef} label="Your answer" />
          ) : (
            <Button primary onClick={() => setRunning(true)}>
              Start the drill
            </Button>
          )}
          {result && (
            <div className={`${d.feedback} ${result.ok ? d.ok : d.miss}`} aria-live="polite">
              <div>
                {result.ok ? (
                  <span className={d.okText}>Right: {q.text}.</span>
                ) : (
                  <span className={d.missText}>
                    {result.timeUp ? 'Time is up.' : `Not ${result.given}.`} The answer is {q.text}.
                  </span>
                )}
              </div>
              <div className={d.small}>
                <Shortcut q={q} />
              </div>
              {!result.ok && (
                <div ref={nextRef}>
                  <Button primary onClick={next}>
                    Next matrix
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
            ['average time', times.length ? `${avg(times).toFixed(1)} s` : '–'],
          ]}
        />
        <History marks={marks} />
      </div>
    </Figure>
  )
}
