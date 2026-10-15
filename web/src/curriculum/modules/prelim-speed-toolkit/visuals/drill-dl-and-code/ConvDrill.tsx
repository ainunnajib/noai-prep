import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Segmented, Button, mulberry32, useContainerWidth } from '../../../../../kit'
import { AnswerBox, History, Stats, TimerBar, avg, fmtInt, parseNum, useCountdown } from './ddKit'
import s from './dd.module.css'

/*
  Conv arithmetic drill. Random Conv2d / MaxPool2d layers; the learner types either the output
  height (= width) or the number of learnable parameters. 20 seconds each. A miss shows the
  formula worked through with these numbers, names the slip if the wrong answer matches a classic
  one, and (for small inputs) draws the padded row with every place the window fits.
*/

type Mode = 'size' | 'params' | 'mixed'

interface Q {
  kind: 'size' | 'params'
  layer: 'conv' | 'pool'
  N: number
  n: number
  cin: number
  cout: number
  k: number
  st: number
  p: number
  bias: boolean
  /** how the pool layer was written, for the code line */
  poolStyle?: 'short' | 'full'
  answer: number
}

const LIMIT = 20
const floorDiv = (a: number, b: number) => Math.floor(a / b)
const outSize = (n: number, k: number, p: number, st: number) => floorDiv(n + 2 * p - k, st) + 1
const convParams = (k: number, cin: number, cout: number, bias: boolean) => (k * k * cin + (bias ? 1 : 0)) * cout

function makeQ(seed: number, mode: Mode): Q {
  const r = mulberry32(seed)
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]
  const kind: Q['kind'] = mode === 'mixed' ? (r() < 0.5 ? 'size' : 'params') : mode
  const N = pick([1, 8, 16, 32, 64])
  if (kind === 'size') {
    const v = r()
    if (v < 0.2) {
      // pooling
      const style = pick(['two', 'two', 'three', 'resnet'] as const)
      const n = style === 'resnet' ? 112 : pick([6, 7, 8, 13, 14, 28, 55, 56, 64])
      const c = pick([16, 32, 64])
      const [k, st, p] = style === 'two' ? [2, 2, 0] : style === 'three' ? [3, 2, 0] : [3, 2, 1]
      return { kind, layer: 'pool', N, n, cin: c, cout: c, k, st, p, bias: false, poolStyle: style === 'two' ? 'short' : 'full', answer: outSize(n, k, p, st) }
    }
    const cin = pick([1, 3, 3, 16, 32, 64])
    const cout = pick([8, 16, 32, 64, 128])
    if (v < 0.45) {
      // "same"-style padding p = (k − 1)/2
      const k = pick([3, 3, 5, 7])
      const p = (k - 1) / 2
      const st = pick([1, 1, 2])
      const n = pick([7, 9, 14, 15, 28, 32, 56, 64, 112, 224])
      return { kind, layer: 'conv', N, n, cin, cout, k, st, p, bias: true, answer: outSize(n, k, p, st) }
    }
    if (v < 0.75) {
      // small enough to draw
      for (;;) {
        const n = 5 + Math.floor(r() * 9)
        const k = pick([2, 3, 3, 4, 5])
        const p = pick([0, 0, 1, 2])
        const st = pick([1, 2, 2, 3])
        if (p < k && n + 2 * p >= k + st) return { kind, layer: 'conv', N, n, cin, cout, k, st, p, bias: true, answer: outSize(n, k, p, st) }
      }
    }
    for (;;) {
      const n = pick([28, 32, 64, 96, 128, 224, 227])
      const k = pick([3, 5, 7, 11])
      const p = pick([0, 0, 1, 2, 3])
      const st = pick([1, 2, 2, 4])
      if (p < k) return { kind, layer: 'conv', N, n, cin, cout, k, st, p, bias: true, answer: outSize(n, k, p, st) }
    }
  }
  // parameters
  const v = r()
  if (v < 0.1) {
    const c = pick([16, 32, 64])
    return { kind, layer: 'pool', N, n: 32, cin: c, cout: c, k: 2, st: 2, p: 0, bias: false, poolStyle: 'short', answer: 0 }
  }
  const k = pick([1, 3, 3, 3, 5])
  const cin = pick([1, 3, 3, 8, 16, 32, 64])
  const cout = pick([4, 8, 10, 16, 32, 64])
  const bias = v > 0.25
  return { kind, layer: 'conv', N, n: pick([28, 32, 64]), cin, cout, k, st: 1, p: k === 1 ? 0 : (k - 1) / 2, bias, answer: convParams(k, cin, cout, bias) }
}

function codeLine(q: Q): string {
  if (q.layer === 'pool') {
    if (q.poolStyle === 'short') return `nn.MaxPool2d(${q.k})`
    return `nn.MaxPool2d(kernel_size=${q.k}, stride=${q.st}${q.p ? `, padding=${q.p}` : ''})`
  }
  if (q.kind === 'params') {
    const extra = q.k === 1 ? '' : q.p ? `, padding=${q.p}` : ''
    return `nn.Conv2d(${q.cin}, ${q.cout}, kernel_size=${q.k}${extra}${q.bias ? '' : ', bias=False'})`
  }
  return `nn.Conv2d(${q.cin}, ${q.cout}, kernel_size=${q.k}, stride=${q.st}, padding=${q.p})`
}

/** Split a × b into easy pieces: 145 × 32 = 145 × 30 + 145 × 2 = 4,350 + 290 = 4,640. */
function mentalProduct(a: number, b: number): string {
  const [x, y] = a >= b ? [a, b] : [b, a]
  if (y < 10 || y % 10 === 0 || x < 10) return `${fmtInt(x)} × ${fmtInt(y)} = ${fmtInt(x * y)}`
  const t = y - (y % 10)
  const u = y % 10
  return `${fmtInt(x)} × ${y} = ${fmtInt(x)} × ${t} + ${fmtInt(x)} × ${u} = ${fmtInt(x * t)} + ${fmtInt(x * u)} = ${fmtInt(x * y)}`
}

/** If a wrong answer matches a classic slip, name it. */
function diagnose(q: Q, given: number): string | null {
  if (q.kind === 'size') {
    const { n, k, p, st, answer } = q
    const cands: [number, string][] = [
      [answer - 1, 'You forgot the + 1. The formula counts the jumps and then adds the starting position.'],
      [Math.ceil((n + 2 * p - k) / st) + 1, 'You rounded up. The floor ⌊ ⌋ always rounds down: a jump that would push the window past the edge is not taken.'],
      [floorDiv(n - k, st) + 1, 'You left out the padding. Add 2p to n before subtracting k.'],
      [floorDiv(n + p - k, st) + 1, 'You padded only one side. Padding goes on both sides, so it adds 2p, not p.'],
      [n + 2 * p - k + 1, 'You ignored the stride. Divide by s before adding 1.'],
      [n, 'You assumed the size is unchanged. That is only true for "same" padding with stride 1.'],
      [Math.floor(n / 2), 'Halving is the shortcut for MaxPool2d(2) only; this layer needs the full formula.'],
    ]
    const hit = cands.find(([v]) => v === given && v !== answer)
    return hit ? hit[1] : null
  }
  const { k, cin, cout, bias, answer, layer } = q
  if (layer === 'pool') return given !== 0 ? 'Pooling just takes a max or an average. There is nothing to learn, so it has 0 parameters.' : null
  const cands: [number, string][] = [
    [k * k * cin * cout, 'You forgot the biases: one per filter, so + C_out.'],
    [(k * k * cin + 1) * cout, 'This layer has bias=False, so there are no bias terms at all.'],
    [(k * k + 1) * cout, 'You forgot C_in. Each filter is k × k × C_in: it covers every input channel.'],
    [k * k * cout + cout, 'You forgot C_in. Each filter is k × k × C_in: it covers every input channel.'],
    [k * k * cin * cout + cin, 'Biases are one per filter (output channel), not one per input channel.'],
    [(k * cin + (bias ? 1 : 0)) * cout, 'A k × k kernel has k² weights per channel, not k.'],
    [k * k * cin * cout * q.n * q.n, 'Weights are shared across the image, so the image size never enters the count.'],
  ]
  const hit = cands.find(([v]) => v === given && v !== answer)
  return hit ? hit[1] : null
}

/** The padded row of one side of the input, with every place the window fits (only for small inputs). */
function WindowStrip({ q }: { q: Q }) {
  const [ref, width] = useContainerWidth<HTMLDivElement>(480)
  const L = q.n + 2 * q.p
  const out = q.answer
  const rows = Math.min(out, Math.ceil(q.k / q.st))
  const cell = Math.max(10, Math.min(26, Math.floor((width - 8) / L)))
  const W = cell * L + 8
  const top = 16
  const rowH = 15
  const H = top + cell + 8 + rows * rowH + 18
  const lastEnd = (out - 1) * q.st + q.k
  const x0 = 4
  return (
    <div ref={ref} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.3rem' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`A row of ${L} cells (${q.n} input plus ${q.p} padding on each side); the window of ${q.k} fits in ${out} places with stride ${q.st}.`} style={{ maxWidth: '100%' }}>
        <text x={x0} y={11} style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
          one side: {q.n} + 2×{q.p} = {L} cells
        </text>
        {Array.from({ length: L }, (_, i) => {
          const pad = i < q.p || i >= q.p + q.n
          const left = i >= lastEnd
          const fill = left ? 'color-mix(in srgb, var(--viz-neg) 30%, var(--surface))' : pad ? 'var(--surface-3)' : 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))'
          return <rect key={i} x={x0 + i * cell} y={top} width={cell - 1.5} height={cell} rx={2} style={{ fill, stroke: pad ? 'var(--viz-muted)' : 'var(--viz-axis)', strokeWidth: 1, strokeDasharray: pad ? '3 2' : undefined }} />
        })}
        {Array.from({ length: out }, (_, j) => {
          const row = j % rows
          const x = x0 + j * q.st * cell
          const y = top + cell + 8 + row * rowH
          const w = q.k * cell - 1.5
          return (
            <g key={j}>
              <rect x={x} y={y} width={w} height={rowH - 4} rx={4} style={{ fill: 'color-mix(in srgb, var(--viz-2) 22%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: 1.5 }} />
              {w > 16 && (
                <text x={x + w / 2} y={y + rowH - 7} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 10, fontWeight: 700 }}>
                  {j + 1}
                </text>
              )}
            </g>
          )
        })}
        <text x={x0} y={H - 4} style={{ fill: 'var(--ink-2)', fontSize: 11 }}>
          {out} window position{out === 1 ? '' : 's'}
          {lastEnd < L ? ` · ${L - lastEnd} cell${L - lastEnd === 1 ? '' : 's'} left over (the floor)` : ''}
        </text>
      </svg>
      <div className={s.legend}>
        <span>
          <span className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))' }} />
          input
        </span>
        <span>
          <span className={s.swatch} style={{ background: 'var(--surface-3)', borderStyle: 'dashed' }} />
          padding
        </span>
        <span>
          <span className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-2) 22%, var(--surface))', borderColor: 'var(--viz-2)' }} />
          window, numbered
        </span>
      </div>
    </div>
  )
}

function Working({ q }: { q: Q }) {
  if (q.kind === 'size') {
    const { n, k, p, st, answer } = q
    const inner = n + 2 * p - k
    const isPoolShort = q.layer === 'pool' && q.poolStyle === 'short'
    return (
      <div className={s.working}>
        {isPoolShort && <div>MaxPool2d(2) means k = 2, stride = 2 (stride defaults to the kernel size), p = 0.</div>}
        <div>
          n + 2p − k = {n} + 2×{p} − {k} = {inner}
        </div>
        <div>
          ⌊{inner} ÷ {st}⌋ = ⌊{Number.isInteger(inner / st) ? inner / st : Number((inner / st).toFixed(2))}⌋ = {floorDiv(inner, st)}
        </div>
        <div>
          {floorDiv(inner, st)} + 1 = <strong>{answer}</strong>
        </div>
        {q.layer === 'conv' && 2 * p === k - 1 && (
          <div style={{ color: 'var(--ink-2)' }}>Shortcut: p = (k − 1)/2, so the answer is n ÷ s rounded up: ⌈{n} ÷ {st}⌉ = {Math.ceil(n / st)}.</div>
        )}
      </div>
    )
  }
  if (q.layer === 'pool') return <div className={s.working}>MaxPool2d takes the largest value in each window. No weights, no bias: <strong>0</strong> parameters.</div>
  const per = q.k * q.k * q.cin
  return (
    <div className={s.working}>
      <div>
        one filter: k × k × C_in = {q.k} × {q.k} × {q.cin} = {fmtInt(per)} weights{q.bias ? ` + 1 bias = ${fmtInt(per + 1)}` : ' (bias=False: no bias)'}
      </div>
      <div>
        × C_out = {q.cout} filters: {mentalProduct(per + (q.bias ? 1 : 0), q.cout)}
      </div>
      <div>
        answer: <strong>{fmtInt(q.answer)}</strong> (the image size never appears)
      </div>
    </div>
  )
}

export default function ConvDrill() {
  const [mode, setMode] = useState<Mode>('mixed')
  const [round, setRound] = useState(0)
  const [running, setRunning] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; given: number | null; timeUp?: boolean }>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [times, setTimes] = useState<number[]>([])
  const [streak, setStreak] = useState(0)
  const started = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)

  const q = useMemo(() => makeQ(1009 * (round + 3) + (mode === 'size' ? 11 : mode === 'params' ? 22 : 33), mode), [round, mode])

  const finish = (given: number | null, timeUp = false) => {
    const ok = !timeUp && given === q.answer
    setResult({ ok, given, timeUp })
    setMarks((m) => [...m, ok])
    if (ok) {
      setTimes((t) => [...t, (performance.now() - started.current) / 1000])
      setStreak((x) => x + 1)
    } else setStreak(0)
  }

  const left = useCountdown(LIMIT, running && !result, () => finish(null, true), `${round}-${mode}`)

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
  }, [round, running, result, mode])

  useEffect(() => {
    if (!result) return
    if (result.ok) {
      const id = window.setTimeout(next, 1100)
      return () => window.clearTimeout(id)
    }
    nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const submit = () => {
    const v = parseNum(input)
    if (v === null) return
    finish(v)
  }

  const slip = result && !result.ok && result.given !== null ? diagnose(q, result.given) : null
  const showStrip = q.kind === 'size' && q.n + 2 * q.p <= 34
  const hits = marks.filter(Boolean).length

  return (
    <Figure
      title="Conv drill: 20 seconds a layer"
      caption={
        <>
          Type a whole number. Output size: <code>⌊(n + 2p − k)/s⌋ + 1</code>. Parameters: <code>(k·k·C_in + 1)·C_out</code>. A miss shows the working, names your slip if it is a classic one, and for
          small inputs draws every place the window fits, so you can see where the floor and the + 1 come from. Aim for ten in a row, each under 20 s.
        </>
      }
    >
      <div className={s.wrap}>
        <Segmented
          label="Ask me for"
          value={mode}
          onChange={(v) => {
            setMode(v)
            setResult(null)
            setInput('')
          }}
          options={[
            { value: 'size', label: 'Output size' },
            { value: 'params', label: 'Parameters' },
            { value: 'mixed', label: 'Mixed' },
          ]}
        />
        <div className={s.stage}>
          <div className={s.spread}>
            <span className={s.label}>Layer {round + 1}</span>
            <span className={`${s.small} tabular`}>{running && !result ? `${Math.ceil(left)} s` : result ? '' : `${LIMIT} s each`}</span>
          </div>
          <TimerBar left={running && !result ? left : LIMIT} limit={LIMIT} />
          <div className={`${s.code} ${s.codeWrap}`}>
            {q.kind === 'size' ? `x.shape = (${q.N}, ${q.cin}, ${q.n}, ${q.n})\n` : ''}
            {`layer = ${codeLine(q)}`}
          </div>
          <div className={s.prompt}>{q.kind === 'size' ? 'What is the output height (= width)?' : 'How many learnable parameters does the layer have?'}</div>
          {running ? (
            <AnswerBox value={input} onChange={setInput} onSubmit={submit} placeholder={q.kind === 'size' ? 'e.g. 28' : 'e.g. 1216'} disabled={!!result} inputRef={inputRef} label="Your answer" inputMode="numeric" />
          ) : (
            <Button
              primary
              onClick={() => {
                setRunning(true)
                started.current = performance.now()
              }}
            >
              Start the drill
            </Button>
          )}
          {result && (
            <div className={`${s.feedback} ${result.ok ? s.ok : s.miss}`} aria-live="polite">
              <div>
                {result.ok ? (
                  <span className={s.okText}>Right: {fmtInt(q.answer)}.</span>
                ) : result.timeUp ? (
                  <span className={s.missText}>Time is up. The answer is {fmtInt(q.answer)}.</span>
                ) : (
                  <span className={s.missText}>
                    Not quite: you said {fmtInt(result.given ?? 0)}, the answer is {fmtInt(q.answer)}.
                  </span>
                )}
              </div>
              {slip && <div className={s.slip}>{slip}</div>}
              {!result.ok && <Working q={q} />}
              {!result.ok && showStrip && <WindowStrip q={q} />}
              {!result.ok && (
                <div ref={nextRef} className={s.row} style={{ justifyContent: 'flex-end' }}>
                  <Button primary onClick={next}>
                    Next layer
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={s.spread}>
          <Stats
            items={[
              ['right', `${hits} / ${marks.length}`],
              ['streak', streak],
              ['average time', times.length ? `${avg(times).toFixed(1)} s` : '–'],
            ]}
          />
          <History marks={marks} />
        </div>
      </div>
    </Figure>
  )
}
