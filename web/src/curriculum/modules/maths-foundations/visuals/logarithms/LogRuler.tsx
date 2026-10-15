import { useState } from 'react'
import { Figure, Controls, Segmented, Slider, Plot, Path, Arrow, usePlot, M } from '../../../../../kit'

/*
  A log ruler (one half of a slide rule). Every number sits at a distance log₁₀(number) from 1,
  so multiplying two numbers = laying their arrows end to end, dividing = going back,
  and a power aⁿ = n copies of the arrow for a. This is log(ab) = log a + log b made visible.
*/

type Mode = 'mul' | 'div' | 'pow'
const VALUES = [1, 2, 3, 4, 5, 8, 10, 20, 25, 50, 100]
const BASES = [2, 3, 5, 10]
const XMIN = -2
const XMAX = 4
const ROW1 = 2.35
const ROW2 = 1.6
const ROW3 = 0.85
const RULER = 0.15

const L = (v: number) => Math.log10(v)
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (k: number) => String(k).split('').map((ch) => SUP[ch] ?? ch).join('')
const fk = (v: number) => (Math.abs(v) < 5e-4 ? '0.000' : v.toFixed(3))
const f3 = (v: number) => fk(v).replace('-', '−')

function fmtNum(v: number) {
  if (v >= 1000) return v.toLocaleString('en-GB')
  if (Number.isInteger(v)) return String(v)
  const s = v.toPrecision(3)
  return String(Number(s))
}

/** A text label that never runs off the plot: it is clamped (in pixels) inside the drawing area. */
function ClampedLabel({ x, y, text, color, weight = 700 }: { x: number; y: number; text: string; color: string; weight?: number }) {
  const { xs, ys, width, margin } = usePlot()
  const w = text.length * 7.1
  const px = Math.max(margin.left + w / 2, Math.min(width - margin.right - w / 2, xs(x)))
  return (
    <text className="plot-label" x={px} y={ys(y) - 8} textAnchor="middle" style={{ fill: color, fontWeight: weight }}>
      {text}
    </text>
  )
}

function Ruler() {
  const { xs, ys, width } = usePlot()
  const y0 = ys(RULER)
  const ticks: { p: number; major: boolean; m: number; v: number }[] = []
  for (let d = XMIN; d < XMAX; d++) for (let m = 1; m <= 9; m++) ticks.push({ p: d + L(m), major: m === 1, m, v: m * 10 ** d })
  ticks.push({ p: XMAX, major: true, m: 1, v: 10 ** XMAX })
  const roomy = width > 520
  const label = (v: number) => (v >= 1 ? v.toLocaleString('en-GB') : String(Number(v.toPrecision(1))))
  return (
    <g aria-hidden="true">
      <line x1={xs(XMIN)} x2={xs(XMAX)} y1={y0} y2={y0} style={{ stroke: 'var(--viz-axis)', strokeWidth: 2 }} />
      {ticks.map((t) => (
        <line key={t.p} x1={xs(t.p)} x2={xs(t.p)} y1={y0} y2={y0 + (t.major ? 10 : t.m === 5 ? 7 : 4)} style={{ stroke: 'var(--viz-axis)', strokeWidth: t.major ? 1.6 : 1 }} />
      ))}
      {ticks
        .filter((t) => t.major || (roomy && t.v < 400 && (t.m === 2 || t.m === 5)))
        .map((t) => (
          <text key={`l${t.p}`} x={xs(t.p)} y={y0 + 24} textAnchor="middle" style={{ fill: t.major ? 'var(--ink-2)' : 'var(--ink-3)', fontSize: t.major ? 12 : 11, fontWeight: t.major ? 700 : 500, fontVariantNumeric: 'tabular-nums' }}>
            {label(t.v)}
          </text>
        ))}
    </g>
  )
}

export default function LogRuler() {
  const [mode, setMode] = useState<Mode>('mul')
  const [ai, setAi] = useState(3) // 4
  const [bi, setBi] = useState(8) // 25
  const [base, setBase] = useState(2)
  const [n, setN] = useState(5)

  const nMax = Math.min(8, Math.floor(XMAX / L(base) + 1e-9))
  const nMin = Math.max(-3, Math.ceil(XMIN / L(base) - 1e-9))
  const nn = Math.max(nMin, Math.min(nMax, n))

  const a = mode === 'pow' ? base : VALUES[ai]
  const b = VALUES[bi]
  const la = L(a)
  const lb = L(b)
  let result: number
  let lr: number
  if (mode === 'mul') {
    result = a * b
    lr = la + lb
  } else if (mode === 'div') {
    result = a / b
    lr = la - lb
  } else {
    result = a ** nn
    lr = nn * la
  }

  const drop = (x: number, y: number, color: string) => <Path points={[[x, y], [x, RULER]]} color={color} width={1.2} dash="3 4" opacity={0.8} />

  let story: string[]
  if (mode === 'mul') story = [`\\log_{10}(${a} \\times ${b})`, `= \\log_{10} ${a} + \\log_{10} ${b}`, `= ${fk(la)} + ${fk(lb)}`, `= ${fk(lr)}`]
  else if (mode === 'div') story = [`\\log_{10}\\left(\\tfrac{${a}}{${b}}\\right)`, `= \\log_{10} ${a} - \\log_{10} ${b}`, `= ${fk(la)} - ${fk(lb)}`, `= ${fk(lr)}`]
  else story = [`\\log_{10}(${a}^{${nn}})`, `= ${nn} \\times \\log_{10} ${a}`, `= ${nn} \\times ${fk(la)}`, `= ${fk(lr)}`]
  const resultTex = mode === 'mul' ? `${a} \\times ${b} = ${fmtNum(result)}` : mode === 'div' ? `${a} \\div ${b} = ${fmtNum(result)}` : `${a}^{${nn}} = ${fmtNum(result)}`

  return (
    <Figure
      title="On a log ruler, multiplying is adding lengths"
      caption={
        <>
          Every number sits at a distance <M>{'\\log_{10}(\\text{number})'}</M> from 1, so 1, 10, 100 and 1,000 are evenly spaced. Choose two numbers:
          their arrows laid end to end land exactly on their product, because <M>{'\\log(ab) = \\log a + \\log b'}</M>. Switch to <strong>÷</strong> to
          walk backwards (numbers below 1 have negative logs), and to <strong>power</strong> to lay the same arrow down <M>{'n'}</M> times. This
          is also why learning rates are plotted on log axes: 0.01, 0.1 and 1 get equal space.
        </>
      }
    >
      <Plot x={[XMIN - 0.15, XMAX + 0.15]} y={[-0.75, 2.95]} width={560} height={230} minHeight={235} margin={{ left: 14, right: 14, top: 8, bottom: 6 }} ariaLabel={`Log ruler showing ${fmtNum(a)} and ${mode === 'pow' ? `${nn} copies` : fmtNum(b)} combining to ${fmtNum(result)}.`}>
        <Ruler />
        {/* the answer, measured from 1 */}
        {drop(lr, mode !== 'pow' ? ROW2 : nn === 0 ? ROW1 : ROW1 - 0.32 * ((Math.abs(nn) - 1) % 2), 'var(--viz-3)')}
        {Math.abs(lr) > 1e-9 && <Arrow from={[0, ROW3]} to={[lr, ROW3]} color="var(--viz-3)" width={3} />}
        <ClampedLabel x={lr / 2} y={ROW3} text={`${mode === 'pow' ? `log₁₀ ${fmtNum(a)}${sup(nn)}` : `log₁₀ ${fmtNum(result)}`} = ${f3(lr)}`} color="var(--viz-3)" />
        {mode !== 'pow' ? (
          <>
            {drop(0, ROW1, 'var(--viz-muted)')}
            <Path points={[[la, ROW1], [la, ROW2]]} color="var(--viz-1)" width={1.2} dash="3 4" opacity={0.8} />
            {la > 1e-9 && <Arrow from={[0, ROW1]} to={[la, ROW1]} color="var(--viz-1)" width={3} />}
            <ClampedLabel x={la / 2} y={ROW1} text={`log₁₀ ${a} = ${f3(la)}`} color="var(--viz-1)" />
            {lb > 1e-9 && <Arrow from={[la, ROW2]} to={[lr, ROW2]} color="var(--viz-2)" width={3} />}
            <ClampedLabel x={(la + lr) / 2} y={ROW2} text={`${mode === 'mul' ? '+' : '−'} log₁₀ ${b} = ${f3(lb)}`} color="var(--viz-2)" />
          </>
        ) : (
          <>
            {drop(0, ROW1, 'var(--viz-muted)')}
            {Array.from({ length: Math.abs(nn) }).map((_, k) => {
              const s = Math.sign(nn)
              const x0 = s * k * la
              const x1 = s * (k + 1) * la
              return (
                <g key={k}>
                  <Arrow from={[x0, ROW1 - (k % 2) * 0.32]} to={[x1, ROW1 - (k % 2) * 0.32]} color={k % 2 ? 'var(--viz-2)' : 'var(--viz-1)'} width={3} head={7} />
                </g>
              )
            })}
            <ClampedLabel x={lr / 2} y={ROW1 + 0.05} text={nn === 0 ? `no arrows: ${a}⁰ = 1` : `${Math.abs(nn)} arrow${Math.abs(nn) > 1 ? 's' : ''} of ${nn < 0 ? '−' : ''}log₁₀ ${a} = ${nn < 0 ? '−' : ''}${f3(la)}`} color="var(--viz-1)" />
          </>
        )}
        <ResultDot x={lr} />
      </Plot>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.15rem 0.5rem', fontSize: '1.05rem' }}>
        {story.map((s, i) => (
          <M key={i}>{s}</M>
        ))}
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--viz-3)' }}>
        so <M>{resultTex}</M>
      </div>
      <Controls>
        <Segmented
          label="Operation"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'mul', label: 'a × b' },
            { value: 'div', label: 'a ÷ b' },
            { value: 'pow', label: 'power aⁿ' },
          ]}
        />
        {mode !== 'pow' ? (
          <>
            <Slider label="a" value={ai} min={0} max={VALUES.length - 1} step={1} onChange={setAi} format={(i) => String(VALUES[i])} />
            <Slider label="b" value={bi} min={0} max={VALUES.length - 1} step={1} onChange={setBi} format={(i) => String(VALUES[i])} />
          </>
        ) : (
          <>
            <Segmented label="a" value={base} onChange={setBase} options={BASES.map((v) => ({ value: v, label: String(v) }))} />
            <Slider label="power n" value={nn} min={nMin} max={nMax} step={1} onChange={setN} />
          </>
        )}
      </Controls>
    </Figure>
  )
}

function ResultDot({ x }: { x: number }) {
  const { xs, ys } = usePlot()
  return <circle cx={xs(x)} cy={ys(RULER)} r={6} style={{ fill: 'var(--viz-3)', stroke: 'var(--surface)', strokeWidth: 2 }} />
}
