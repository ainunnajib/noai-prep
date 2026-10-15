import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Segmented, Button, Plot, DraggablePoint, M, usePlot, useNarrow, mulberry32 } from '../../../../../kit'
import { AnswerBox, parseNumber } from '../drill-linear-algebra/drillKit'
import d from '../drill-linear-algebra/drill.module.css'

/*
  A two-scale "slide rule": the same position read on two scales, e.g. x on top and ln x below.
  Explore: drag the cursor or tap an anchor chip. Challenge: estimate a value from the anchors,
  get points for closeness and speed, then see where it sits on the rule and the recipe.
*/

type ModeId = 'ln' | 'exp' | 'log2' | 'sig' | 'sqrt'

interface Scale {
  name: string
  toP: (v: number) => number
  fromP: (p: number) => number
  ticks: number[]
  narrowTicks?: number[]
  fmt: (v: number) => string
}
interface Anchor {
  /** position on the shared axis */
  p: number
  label: string
}
interface Challenge {
  q: string
  answer: number
  recipe: string
}
interface ModeDef {
  label: string
  range: [number, number]
  top: Scale
  bottom: Scale
  anchors: Anchor[]
  challenges: Challenge[]
}

const LN2 = Math.log(2)
const LN10 = Math.log(10)
const sig = (z: number) => 1 / (1 + Math.exp(-z))
const logit = (s: number) => Math.log(s / (1 - s))
const f2 = (v: number) => {
  const a = Math.abs(v)
  const s = a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : v.toFixed(2)
  return s.replace('-', '−')
}
const tickFmt = (v: number) => (Number.isInteger(v) ? String(v) : String(v)).replace('-', '−')

const LOG_X: Scale = { name: 'x', toP: Math.log, fromP: Math.exp, ticks: [0.1, 0.2, 0.5, 1, 2, 3, 5, 10, 20, 50, 100], narrowTicks: [0.1, 0.5, 1, 2, 5, 10, 100], fmt: f2 }
const LIN_LN: Scale = { name: 'ln x', toP: (v) => v, fromP: (p) => p, ticks: [-2, -1, 0, 1, 2, 3, 4], fmt: f2 }

const MODES: Record<ModeId, ModeDef> = {
  ln: {
    label: 'ln x',
    range: [Math.log(0.1), Math.log(100)],
    top: LOG_X,
    bottom: LIN_LN,
    anchors: [
      { p: Math.log(0.1), label: 'ln 0.1 ≈ −2.30' },
      { p: -LN2, label: 'ln 0.5 ≈ −0.69' },
      { p: 0, label: 'ln 1 = 0' },
      { p: LN2, label: 'ln 2 ≈ 0.69' },
      { p: 1, label: 'ln e = 1' },
      { p: Math.log(3), label: 'ln 3 ≈ 1.10' },
      { p: LN10, label: 'ln 10 ≈ 2.30' },
    ],
    challenges: [
      { q: '\\ln 4', answer: Math.log(4), recipe: 'ln 4 = 2 ln 2 ≈ 2 × 0.69 = 1.39' },
      { q: '\\ln 8', answer: Math.log(8), recipe: 'ln 8 = 3 ln 2 ≈ 3 × 0.69 = 2.08' },
      { q: '\\ln 5', answer: Math.log(5), recipe: 'ln 5 = ln 10 − ln 2 ≈ 2.30 − 0.69 = 1.61' },
      { q: '-\\ln 0.25', answer: -Math.log(0.25), recipe: '−ln ¼ = ln 4 = 2 ln 2 ≈ 1.39' },
      { q: '-\\ln 0.1', answer: LN10, recipe: '−ln 0.1 = ln 10 ≈ 2.30 (the loss when the right class gets probability 0.1)' },
      { q: '\\ln 20', answer: Math.log(20), recipe: 'ln 20 = ln 2 + ln 10 ≈ 0.69 + 2.30 = 2.99' },
      { q: '\\ln 6', answer: Math.log(6), recipe: 'ln 6 = ln 2 + ln 3 ≈ 0.69 + 1.10 = 1.79' },
      { q: '\\ln 100', answer: Math.log(100), recipe: 'ln 100 = 2 ln 10 ≈ 4.61' },
      { q: '-\\ln 0.5', answer: LN2, recipe: '−ln ½ = ln 2 ≈ 0.69 (the loss of a coin-flip guess)' },
    ],
  },
  exp: {
    label: 'eˣ',
    range: [Math.log(0.1), Math.log(100)],
    top: { ...LIN_LN, name: 'x' },
    bottom: { ...LOG_X, name: 'eˣ' },
    anchors: [
      { p: -1, label: 'e⁻¹ ≈ 0.37' },
      { p: 0, label: 'e⁰ = 1' },
      { p: LN2, label: 'e^0.69 ≈ 2' },
      { p: 1, label: 'e ≈ 2.72' },
      { p: 2, label: 'e² ≈ 7.39' },
      { p: LN10, label: 'e^2.30 ≈ 10' },
    ],
    challenges: [
      { q: 'e^{-1}', answer: Math.exp(-1), recipe: 'e⁻¹ = 1/e ≈ 1/2.72 ≈ 0.37' },
      { q: 'e^{3}', answer: Math.exp(3), recipe: 'e³ = e² × e ≈ 7.39 × 2.72 ≈ 20.1' },
      { q: 'e^{1.39}', answer: Math.exp(1.39), recipe: '1.39 ≈ 2 ln 2 = ln 4, so e^1.39 ≈ 4' },
      { q: 'e^{-2}', answer: Math.exp(-2), recipe: 'e⁻² = 1/e² ≈ 1/7.39 ≈ 0.14' },
      { q: 'e^{0.69}', answer: Math.exp(0.69), recipe: '0.69 ≈ ln 2, so e^0.69 ≈ 2' },
      { q: 'e^{2.3}', answer: Math.exp(2.3), recipe: '2.30 ≈ ln 10, so e^2.3 ≈ 10' },
      { q: 'e^{4.6}', answer: Math.exp(4.6), recipe: '4.6 ≈ 2 ln 10 = ln 100, so ≈ 100' },
    ],
  },
  log2: {
    label: 'log₂',
    range: [-1, 11],
    top: { name: 'x', toP: Math.log2, fromP: (p) => 2 ** p, ticks: [0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024], narrowTicks: [0.5, 1, 4, 16, 64, 256, 1024], fmt: f2 },
    bottom: { name: 'log₂ x', toP: (v) => v, fromP: (p) => p, ticks: [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], narrowTicks: [0, 2, 4, 6, 8, 10], fmt: f2 },
    anchors: [
      { p: 1, label: 'log₂ 2 = 1' },
      { p: 3, label: 'log₂ 8 = 3' },
      { p: Math.log2(10), label: 'log₂ 10 ≈ 3.32' },
      { p: 10, label: 'log₂ 1024 = 10' },
    ],
    challenges: [
      { q: '\\log_2 1024', answer: 10, recipe: '2¹⁰ = 1024, so exactly 10' },
      { q: '\\log_2 1000', answer: Math.log2(1000), recipe: '1000 is just under 1024, so just under 10 (≈ 9.97 = 3 × 3.32)' },
      { q: '\\log_2 10', answer: Math.log2(10), recipe: 'Between 3 (8) and 4 (16): ≈ 3.32' },
      { q: '\\log_2 100', answer: Math.log2(100), recipe: 'log₂ 100 = 2 log₂ 10 ≈ 6.64' },
      { q: '\\log_2 0.5', answer: -1, recipe: '½ = 2⁻¹, so −1' },
      { q: '\\text{bits for 64 equally likely outcomes}', answer: 6, recipe: 'Entropy of 64 equal outcomes = log₂ 64 = 6 bits' },
    ],
  },
  sig: {
    label: 'σ(z)',
    range: [-5, 5],
    top: { name: 'z', toP: (v) => v, fromP: (p) => p, ticks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], narrowTicks: [-4, -2, 0, 2, 4], fmt: f2 },
    bottom: { name: 'σ(z)', toP: logit, fromP: sig, ticks: [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99], narrowTicks: [0.01, 0.1, 0.5, 0.9, 0.99], fmt: f2 },
    anchors: [
      { p: -2, label: 'σ(−2) ≈ 0.12' },
      { p: 0, label: 'σ(0) = 0.5' },
      { p: 1, label: 'σ(1) ≈ 0.73' },
      { p: 2, label: 'σ(2) ≈ 0.88' },
      { p: Math.log(3), label: 'σ(ln 3) = 0.75' },
    ],
    challenges: [
      { q: '\\sigma(0)', answer: 0.5, recipe: 'σ(0) = 1/(1 + 1) = 0.5 exactly' },
      { q: '\\sigma(2)', answer: sig(2), recipe: 'An anchor: σ(2) ≈ 0.88' },
      { q: '\\sigma(-2)', answer: sig(-2), recipe: 'σ(−z) = 1 − σ(z), so 1 − 0.88 = 0.12' },
      { q: '\\sigma(-1)', answer: sig(-1), recipe: '1 − σ(1) ≈ 1 − 0.73 = 0.27' },
      { q: '\\sigma(\\ln 3)', answer: 0.75, recipe: 'e^(−ln 3) = 1/3, so σ = 1/(1 + 1/3) = 3/4' },
      { q: '\\sigma(5)', answer: sig(5), recipe: 'Far right of the S-curve: almost 1 (≈ 0.993)' },
    ],
  },
  sqrt: {
    label: '√x',
    range: [0, 10],
    top: { name: 'x', toP: Math.sqrt, fromP: (p) => p * p, ticks: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100], narrowTicks: [0, 1, 4, 9, 25, 49, 100], fmt: f2 },
    bottom: { name: '√x', toP: (v) => v, fromP: (p) => p, ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], narrowTicks: [0, 2, 4, 6, 8, 10], fmt: f2 },
    anchors: [
      { p: Math.SQRT2, label: '√2 ≈ 1.41' },
      { p: Math.sqrt(3), label: '√3 ≈ 1.73' },
      { p: Math.sqrt(8), label: '√8 = 2√2 ≈ 2.83' },
      { p: Math.sqrt(50), label: '√50 = 5√2 ≈ 7.07' },
    ],
    challenges: [
      { q: '\\sqrt{2}', answer: Math.SQRT2, recipe: 'An anchor: √2 ≈ 1.41' },
      { q: '\\sqrt{8}', answer: Math.sqrt(8), recipe: '√8 = √4 × √2 = 2√2 ≈ 2.83' },
      { q: '\\sqrt{18}', answer: Math.sqrt(18), recipe: '√18 = 3√2 ≈ 4.24' },
      { q: '\\sqrt{50}', answer: Math.sqrt(50), recipe: '√50 = 5√2 ≈ 7.07' },
      { q: '\\sqrt{12}', answer: Math.sqrt(12), recipe: '√12 = 2√3 ≈ 2 × 1.73 = 3.46' },
      { q: '1/\\sqrt{2}', answer: Math.SQRT1_2, recipe: '1/√2 = √2/2 ≈ 0.71' },
    ],
  },
}

function points(err: number, secs: number) {
  const base = err <= 0.02 ? 3 : err <= 0.05 ? 2 : err <= 0.1 ? 1 : 0
  return base > 0 && secs <= 10 ? base + 1 : base
}

export default function AnchorSlideRule() {
  const [modeId, setModeId] = useState<ModeId>('ln')
  const mode = MODES[modeId]
  const [p, setP] = useState(LN2)
  const [challenge, setChallenge] = useState(false)
  const [ci, setCi] = useState(0)
  const [input, setInput] = useState('')
  const [res, setRes] = useState<null | { guess: number; err: number; secs: number; pts: number }>(null)
  const [score, setScore] = useState({ pts: 0, n: 0 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const started = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const order = useMemo(() => {
    const r = mulberry32(modeId.length * 97 + 13)
    const idx = mode.challenges.map((_, i) => i)
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[idx[i], idx[j]] = [idx[j], idx[i]]
    }
    return idx
  }, [modeId, mode.challenges])
  const ch = mode.challenges[order[ci % order.length]]

  useEffect(() => {
    if (challenge && !res) {
      started.current = performance.now()
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [challenge, ci, res, modeId])

  const switchMode = (m: ModeId) => {
    setModeId(m)
    const a = MODES[m].anchors
    setP(a[Math.min(2, a.length - 1)].p)
    setCi(0)
    setRes(null)
    setInput('')
  }

  const submit = () => {
    const g = parseNumber(input)
    if (g === null) return
    const secs = (performance.now() - started.current) / 1000
    const err = Math.abs(g - ch.answer) / Math.max(Math.abs(ch.answer), 0.05)
    const pts = points(err, secs)
    setRes({ guess: g, err, secs, pts })
    setScore((s) => ({ pts: s.pts + pts, n: s.n + 1 }))
    // move the cursor to the true value if it is on this rule
    const onBottom = mode.bottom.toP(ch.answer)
    const pos = Number.isFinite(onBottom) && onBottom >= mode.range[0] && onBottom <= mode.range[1] ? onBottom : null
    if (pos !== null) setP(pos)
  }
  const nextChallenge = () => {
    setCi((i) => i + 1)
    setRes(null)
    setInput('')
  }

  const topVal = mode.top.fromP(p)
  const botVal = mode.bottom.fromP(p)

  return (
    <Figure
      title="Anchor slide rule: read one value on two scales"
      caption={
        <>
          The top and bottom scales describe the same position, so the cursor turns a value into its log (or exponential, square root or sigmoid). Drag the cursor or tap an anchor.
          In the ln x view, notice that every doubling on the top scale (1→2, 5→10, 10→20) is the same step of 0.69 on the bottom scale: that is why ln 4 = 2 ln 2
          and ln 5 = ln 10 − ln 2, so most values are a sum or multiple of a few anchors. Then switch on the challenge and estimate without looking.
        </>
      }
    >
      <div className={d.wrap} ref={wrapRef}>
        <Segmented
          label="Scale"
          value={modeId}
          onChange={switchMode}
          options={(Object.keys(MODES) as ModeId[]).map((m) => ({ value: m, label: MODES[m].label }))}
        />
        <Plot x={mode.range} y={[0, 1]} width={560} height={176} minHeight={170} margin={{ left: 22, right: 22, top: 6, bottom: 6 }} ariaLabel={`Slide rule: ${mode.top.name} on top, ${mode.bottom.name} below. Cursor at ${mode.top.name} = ${f2(topVal)}, ${mode.bottom.name} = ${f2(botVal)}.`}>
          <Rule mode={mode} narrow={narrow} />
          <Cursor p={p} />
          <DraggablePoint x={p} y={0.5} lockY onChange={(x) => setP(x)} color="var(--accent)" label={undefined} />
        </Plot>
        <div className={d.spread}>
          <span className={d.stat} style={{ fontSize: '1.05rem' }}>
            <span className={d.muted}>{mode.top.name} =</span> <strong className="tabular">{f2(topVal)}</strong>
          </span>
          <span className={d.stat} style={{ fontSize: '1.05rem' }}>
            <span className={d.muted}>{mode.bottom.name} =</span> <strong className="tabular">{f2(botVal)}</strong>
          </span>
        </div>
        <div className={d.row} role="group" aria-label="Anchor values">
          {mode.anchors.map((a) => (
            <button
              key={a.label}
              type="button"
              className="btn btn-small"
              onClick={() => setP(a.p)}
              aria-pressed={Math.abs(p - a.p) < 1e-6}
              style={Math.abs(p - a.p) < 1e-6 ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className={d.stage} style={{ justifyItems: 'stretch' }}>
          <div className={d.spread}>
            <span className={d.label}>Challenge · estimate from the anchors</span>
            <span className={`${d.small} tabular`}>
              score {score.pts} from {score.n}
            </span>
          </div>
          {!challenge ? (
            <div className={d.row} style={{ justifyContent: 'center' }}>
              <Button primary onClick={() => setChallenge(true)}>
                Start the challenge
              </Button>
              <span className={d.small}>3 points within 2%, 2 within 5%, 1 within 10%, +1 for answering in 10 s.</span>
            </div>
          ) : (
            <>
              <div className={`${d.prompt} ${d.big}`}>
                <M>{`${ch.q} \\approx\\ ?`}</M>
              </div>
              <AnswerBox value={input} onChange={setInput} onSubmit={submit} placeholder="estimate" disabled={!!res} inputRef={inputRef} label="Your estimate" />
              {res && (
                <div className={`${d.feedback} ${res.pts >= 2 ? d.ok : res.pts === 0 ? d.miss : ''}`} aria-live="polite">
                  <div>
                    You said {f2(res.guess)}; the value is <strong>{f2(ch.answer)}</strong> ({(res.err * 100).toFixed(res.err < 0.1 ? 1 : 0)}% off, {res.secs.toFixed(1)} s):{' '}
                    <strong>
                      {res.pts} point{res.pts === 1 ? '' : 's'}
                    </strong>
                    .
                  </div>
                  <div className={d.small}>Recipe: {ch.recipe}</div>
                  <div>
                    <Button primary onClick={nextChallenge}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Figure>
  )
}

/** The two scales, their ticks and the anchor marks. */
function Rule({ mode, narrow }: { mode: ModeDef; narrow: boolean }) {
  const { xs, ys } = usePlot()
  const yTop = ys(0.68)
  const yBot = ys(0.32)
  const [x0, x1] = xs.range()
  const inRange = (q: number) => q >= mode.range[0] - 1e-9 && q <= mode.range[1] + 1e-9
  const ticks = (sc: Scale) => (narrow && sc.narrowTicks ? sc.narrowTicks : sc.ticks).filter((v) => inRange(sc.toP(v)))
  return (
    <g>
      <text x={x0} y={ys(0.97)} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }}>
        {mode.top.name}
      </text>
      <text x={x0} y={ys(0.03)} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }}>
        {mode.bottom.name}
      </text>
      <rect x={x0} y={yTop} width={x1 - x0} height={yBot - yTop} rx={6} style={{ fill: 'color-mix(in srgb, var(--accent) 5%, transparent)' }} />
      <line x1={x0} x2={x1} y1={yTop} y2={yTop} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
      <line x1={x0} x2={x1} y1={yBot} y2={yBot} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
      {ticks(mode.top).map((v) => {
        const x = xs(mode.top.toP(v))
        return (
          <g key={`t${v}`}>
            <line x1={x} x2={x} y1={yTop} y2={yTop - 7} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
            <text x={x} y={yTop - 11} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11.5 }}>
              {tickFmt(v)}
            </text>
          </g>
        )
      })}
      {ticks(mode.bottom).map((v) => {
        const x = xs(mode.bottom.toP(v))
        return (
          <g key={`b${v}`}>
            <line x1={x} x2={x} y1={yBot} y2={yBot + 7} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
            <text x={x} y={yBot + 20} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11.5 }}>
              {tickFmt(v)}
            </text>
          </g>
        )
      })}
      {mode.anchors.map((a) => (
        <g key={a.label}>
          <line x1={xs(a.p)} x2={xs(a.p)} y1={yTop} y2={yBot} style={{ stroke: 'var(--viz-2)', strokeWidth: 1.2, strokeDasharray: '3 3', opacity: 0.8 }} />
          <circle cx={xs(a.p)} cy={yTop} r={3.6} style={{ fill: 'var(--viz-2)' }} />
          <circle cx={xs(a.p)} cy={yBot} r={3.6} style={{ fill: 'var(--viz-2)' }} />
        </g>
      ))}
    </g>
  )
}

function Cursor({ p }: { p: number }) {
  const { xs, ys } = usePlot()
  return <line x1={xs(p)} x2={xs(p)} y1={ys(0.86)} y2={ys(0.14)} style={{ stroke: 'var(--accent)', strokeWidth: 2.5 }} />
}
