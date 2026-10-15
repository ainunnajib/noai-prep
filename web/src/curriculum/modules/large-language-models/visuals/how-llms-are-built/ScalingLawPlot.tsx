import { useState } from 'react'
import { Figure, Controls, Readout, Plot, usePlot, FnPath, Dots, VLine, DraggablePoint, Bars, Label } from '../../../../../kit'
import s from './built.module.css'

/*
  Illustrative scaling law with the shape of the Chinchilla fit (no irreducible floor, so the frontier
  is an exact straight line on log-log axes):
     L(N, D) = A / N^α + B / D^α,   compute C ≈ 6 N D FLOPs
  With equal exponents the best split of a budget always has D / N = (B / A)^(1/α); B is chosen so
  that this is 20 tokens per parameter (the Chinchilla rule of thumb). Then N* = √(C / 120) and the
  best loss is L* = 2A / N*^α.
  Plot coordinates: x = log10(C), y = log10(L).
*/

const ALPHA = 0.15
const A = 30
const TOKENS_PER_PARAM = 20
const B = A * TOKENS_PER_PARAM ** ALPHA

const loss = (N: number, C: number) => A * N ** -ALPHA + B * (C / (6 * N)) ** -ALPHA
const nStar = (C: number) => Math.sqrt(C / (6 * TOKENS_PER_PARAM))
const lStar = (C: number) => 2 * A * nStar(C) ** -ALPHA

const SIZES = [
  { n: 1e8, label: '100M', color: 'var(--viz-1)' },
  { n: 1e9, label: '1B', color: 'var(--viz-3)' },
  { n: 1e10, label: '10B', color: 'var(--viz-2)' },
  { n: 1e11, label: '100B', color: 'var(--viz-4)' },
  { n: 1e12, label: '1T', color: 'var(--viz-5)' },
]

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
const pow10 = (e: number) => `10${String(e).split('').map((c) => SUP[c] ?? c).join('')}`

function fmtCount(v: number) {
  if (v >= 1e12) return `${+(v / 1e12).toPrecision(2)}T`
  if (v >= 1e9) return `${+(v / 1e9).toPrecision(2)}B`
  if (v >= 1e6) return `${+(v / 1e6).toPrecision(2)}M`
  if (v >= 1e3) return `${+(v / 1e3).toPrecision(2)}k`
  return String(Math.round(v))
}
function fmtSci(v: number) {
  const e = Math.floor(Math.log10(v))
  const m = v / 10 ** e
  return `${m.toFixed(1)} × ${pow10(e)}`
}

const X0 = 17
const X1 = 25
const LOSS_TICKS = [1.5, 2, 3, 4, 6]
const Y0 = Math.log10(1.2)
const Y1 = Math.log10(6.5)

/** Log axes drawn by hand: compute ticks at powers of ten, loss ticks at round values. */
function LogAxes() {
  const { xs, ys } = usePlot()
  const [xa, xb] = xs.range()
  const [yb, yt] = ys.range()
  return (
    <g className="plot-axes">
      <line x1={xa} x2={xb} y1={yb} y2={yb} />
      <line x1={xa} x2={xa} y1={yb} y2={yt} />
      {Array.from({ length: X1 - X0 + 1 }, (_, i) => X0 + i).map((e) => (
        <g key={e} transform={`translate(${xs(e)},${yb})`}>
          <line y2={5} />
          {(e - X0) % 2 === 0 && (
            <text y={17} textAnchor="middle">
              {pow10(e)}
            </text>
          )}
        </g>
      ))}
      {LOSS_TICKS.map((v) => (
        <g key={v} transform={`translate(${xa},${ys(Math.log10(v))})`}>
          <line x2={-5} />
          <text x={-8} dy="0.32em" textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      <text className="plot-axis-label" x={xb} y={yb + 30} textAnchor="end">
        compute C (FLOPs, log scale)
      </text>
      <text className="plot-axis-label" x={xa - 30} y={yt - 12} textAnchor="start">
        loss (log scale)
      </text>
    </g>
  )
}

function LogGrid() {
  const { xs, ys } = usePlot()
  const [xa, xb] = xs.range()
  const [yb, yt] = ys.range()
  return (
    <g className="plot-grid" aria-hidden="true">
      {Array.from({ length: X1 - X0 + 1 }, (_, i) => X0 + i).map((e) => (
        <line key={e} x1={xs(e)} x2={xs(e)} y1={yb} y2={yt} />
      ))}
      {LOSS_TICKS.map((v) => (
        <line key={v} x1={xa} x2={xb} y1={ys(Math.log10(v))} y2={ys(Math.log10(v))} />
      ))}
    </g>
  )
}

export default function ScalingLawPlot() {
  const [lc, setLc] = useState(20.1) // log10 of the compute budget
  const C = 10 ** lc
  const N = nStar(C)
  const D = TOKENS_PER_PARAM * N
  const L = lStar(C)
  const atBudget = SIZES.map((z) => ({ ...z, loss: loss(z.n, C), tokens: C / (6 * z.n) }))
  const bestIdx = atBudget.reduce((bi, z, i) => (z.loss < atBudget[bi].loss ? i : bi), 0)
  const snap = (x: number): [number, number] => {
    const xv = Math.round(Math.min(X1 - 0.3, Math.max(X0 + 0.3, x)) * 10) / 10
    return [xv, Math.log10(lStar(10 ** xv))]
  }

  return (
    <Figure
      wide
      title="Scaling laws: drag the compute budget"
      caption={
        <>
          Each coloured curve is one model size trained on more and more tokens: its loss falls, then levels off when the model is too small to
          learn more. The dashed line touches the lowest curve at every budget: the best you can do with that much compute. Drag the dot along it.
          On log–log axes the frontier is a <b>straight line</b>: every 10× more compute multiplies the loss by the same factor (here ×
          {(10 ** (-ALPHA / 2)).toFixed(2)}), so a lab can predict a big run from small ones. The bars show why bigger is not automatically better at a
          fixed budget: a huge model gets too few tokens. (Illustrative curves with the shape of the 2022 Chinchilla fit; real fits also level off
          at a floor.)
        </>
      }
    >
      <div className={s.wrap}>
        <Plot x={[X0, X1]} y={[Y0, Y1]} width={560} height={330} minHeight={300} margin={{ left: 40, right: 14, top: 30, bottom: 40 }} ariaLabel="Loss against compute on log-log axes for five model sizes, with the compute-optimal frontier as a dashed straight line">
          <LogGrid />
          <LogAxes />
          {SIZES.map((z) => (
            <FnPath key={z.label} f={(x) => Math.log10(loss(z.n, 10 ** x))} color={z.color} width={2.4} opacity={0.9} />
          ))}
          <FnPath f={(x) => Math.log10(lStar(10 ** x))} color="var(--viz-ink)" width={2.2} dash="7 5" />
          <VLine x={lc} color="var(--viz-muted)" />
          <Dots
            points={atBudget
              .map((z, i) => ({ x: lc, y: Math.log10(z.loss), color: z.color, r: i === bestIdx ? 5.5 : 4 }))
              .filter((p) => p.y <= Y1)}
          />
          <Label x={lc} y={Y0} dx={lc > 23.5 ? -5 : 5} dy={-6} anchor={lc > 23.5 ? 'end' : 'start'} color="var(--ink-2)" size={12}>
            budget
          </Label>
          <DraggablePoint x={lc} y={Math.log10(L)} onChange={(x) => setLc(snap(x)[0])} constrain={(x) => snap(x)} color="var(--viz-ink)" label={`best: ${fmtCount(N)}`} />
        </Plot>

        <div className={s.legend} aria-hidden="true">
          {SIZES.map((z) => (
            <span key={z.label}>
              <i className={s.swatch} style={{ background: z.color }} /> {z.label} params
            </span>
          ))}
          <span>
            <i className={s.swatchDash} /> best possible
          </span>
        </div>

        <Readout
          items={[
            ['budget C', `${fmtSci(C)} FLOPs`],
            ['best size N', `${fmtCount(N)} params`],
            ['tokens D = 20N', fmtCount(D)],
            ['predicted loss', L.toFixed(2)],
          ]}
        />

        <div>
          <p className={s.subhead}>Same budget, different model sizes (tokens each one gets = C ÷ 6N)</p>
          <Bars
            ariaLabel="Loss each model size reaches with this compute budget"
            max={Math.max(...atBudget.map((z) => Math.min(z.loss, 12)))}
            format={(v) => v.toFixed(2)}
            data={atBudget.map((z, i) => ({
              label: `${z.label} · ${fmtCount(z.tokens)} tok`,
              value: z.loss,
              color: z.color,
              strong: i === bestIdx,
            }))}
          />
        </div>

        <Controls>
          <span className={s.hint} style={{ margin: 0 }}>
            Keyboard: focus the dot and use ← →. Rule of thumb used here: compute ≈ 6 × N × D, best split ≈ 20 tokens per parameter.
          </span>
        </Controls>
      </div>
    </Figure>
  )
}
