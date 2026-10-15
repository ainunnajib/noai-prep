import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Axes, Grid, Rect, Label, usePlot, M } from '../../../../../kit'
import { RUNS } from './gradNormData'
import s from './nan.module.css'

/*
  Per-layer gradient norms of a 10-layer network, from real PyTorch runs (see gradNormData.ts):
  the first mini-batch (outlined, see-through bars) and the average over epoch 50 (solid bars), on a log scale.
  Pick a problem (vanishing: deep sigmoid net; exploding: oversized weights) and one fix at a time.
  Aha: the shape of the profile tells you the disease; each fix reshapes it, and some "fixes" do nothing
  (clipping cannot cure vanishing; residual connections make exploding worse).
*/

type Problem = 'vanish' | 'explode'
type Fix = 'none' | 'he' | 'bn' | 'res' | 'clip'

const LOG_LO = -9
const LOG_HI = 5
const layers = Array.from({ length: 10 }, (_, i) => i + 1)

function sci(v: number): string {
  if (!Number.isFinite(v)) return 'nan'
  if (v >= 0.01 && v < 1e5) return Number(v.toPrecision(2)).toLocaleString('en-GB')
  const e = Math.floor(Math.log10(v))
  const m = v / 10 ** e
  const sup = String(e).replace(/[-0-9]/g, (c) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)])
  return `${Number(m.toPrecision(2))}×10${sup}`
}
function power(v: number): ReactNode {
  if (!Number.isFinite(v)) return 'nan'
  if (v >= 0.01 && v < 1000) return String(Number(v.toPrecision(2)))
  const e = Math.floor(Math.log10(v))
  const m = Number((v / 10 ** e).toPrecision(2))
  return <M>{`${m}\\times 10^{${e}}`}</M>
}

function NanBar({ x, w, color }: { x: number; w: number; color: string }) {
  const { xs, ys } = usePlot()
  const x0 = xs(x - w / 2)
  const x1 = xs(x + w / 2)
  const y0 = ys(LOG_LO)
  const y1 = ys(LOG_HI)
  return (
    <g>
      <rect x={x0} y={y1} width={x1 - x0} height={y0 - y1} style={{ fill: 'color-mix(in srgb, var(--viz-neg) 14%, var(--surface))', stroke: color, strokeWidth: 1.5, strokeDasharray: '3 3' }} />
    </g>
  )
}

export default function GradNormBars() {
  const [problem, setProblem] = useState<Problem>('vanish')
  const [fix, setFix] = useState<Fix>('none')
  const run = RUNS[`${problem}-${fix}`]
  const lastNan = run.last.some((v) => !Number.isFinite(v))
  const first = run.first
  const ratio = first[9] / first[0]
  const lo = Math.min(...first)
  const hi = Math.max(...first)

  const heLabel = problem === 'vanish' ? 'ReLU + He init' : 'He init'
  const chance = run.lastAcc <= 0.26

  let verdict: ReactNode
  let tone: 'bad' | 'ok' | 'meh' = 'ok'
  if (problem === 'vanish' && (fix === 'none' || fix === 'clip')) {
    tone = 'bad'
    verdict = (
      <>
        <b>Vanishing gradients.</b> Layer 1 gets about {power(ratio)} times less gradient than layer 10, so the early layers never change.
        After 50 epochs the loss is still {run.lastLoss} ≈ ln 4 and accuracy {Math.round(run.lastAcc * 100)}%: chance level.
        {fix === 'clip' && <> Clipping changed nothing: it only shrinks gradients that are too big; it cannot enlarge tiny ones.</>}
      </>
    )
  } else if (lastNan) {
    tone = 'bad'
    verdict = (
      <>
        <b>Exploding gradients.</b> At the very first step every layer's gradient norm is between {sci(lo)} and {sci(hi)}. The first
        updates throw the weights so far that the loss becomes nan; by epoch 50 every norm is nan.
        {fix === 'res' && <> Residual connections made it worse: adding each layer's output to its input lets oversized signals grow even faster. They cure vanishing, not exploding.</>}
      </>
    )
  } else if (fix === 'clip') {
    tone = 'meh'
    verdict = (
      <>
        <b>Survives, but still sick.</b> Clipping caps the length of each update, so the loss never becomes nan (accuracy{' '}
        {Math.round(run.lastAcc * 100)}% after 50 epochs, loss {run.lastLoss}). The raw norms are still large ({sci(Math.min(...run.last))} to{' '}
        {sci(Math.max(...run.last))}) because the cause, oversized weights, is untouched. Clipping is a seatbelt, not a repair.
      </>
    )
  } else {
    const what: Record<Fix, ReactNode> = {
      none: null,
      he: <>He initialisation starts every layer's weights at the right size (standard deviation <M>{'\\sqrt{2/n}'}</M>), and ReLU's slope is 1, so the gradient keeps its size through the layers.</>,
      bn: <>BatchNorm rescales every layer's output to mean 0 and spread 1, so the size of the weights stops mattering.</>,
      res: <>Each residual layer computes <M>{'x + f(x)'}</M>, so the gradient has a shortcut back to layer 1 that skips the shrinking.</>,
      clip: null,
    }
    verdict = (
      <>
        <b>Balanced.</b> {what[fix]} At the first step every layer gets between {sci(lo)} and {sci(hi)}. After 50 epochs: loss{' '}
        {run.lastLoss}, accuracy {Math.round(run.lastAcc * 100)}%.
      </>
    )
  }

  const w = 0.36
  return (
    <Figure
      title="Gradient norm per layer: the profile tells the story"
      caption={
        <>
          Each pair of bars is one layer: outlined, see-through bars = the first mini-batch, solid bars = the average over epoch 50. The scale is
          logarithmic: each grid line is 100 times the one below (1e−4 means 0.0001). Start with <b>vanishing</b>: the bars fall away towards layer 1 like a staircase. Try each fix.
          Then switch to <b>exploding</b> and try the same fixes. Two of them disappoint: find out which, and why.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented
            label="Problem"
            value={problem}
            onChange={setProblem}
            options={[
              { value: 'vanish', label: 'vanishing (deep sigmoid)' },
              { value: 'explode', label: 'exploding (weights too big)' },
            ]}
          />
          <Segmented
            label="Fix"
            value={fix}
            onChange={setFix}
            options={[
              { value: 'none', label: 'none' },
              { value: 'he', label: heLabel },
              { value: 'bn', label: 'BatchNorm' },
              { value: 'res', label: 'residual' },
              { value: 'clip', label: 'clip at 1' },
            ]}
          />
        </Controls>
        <Plot x={[0.4, 10.6]} y={[LOG_LO, LOG_HI]} width={560} height={300} minHeight={250} margin={{ left: 50, bottom: 40, top: 16, right: 10 }} ariaLabel="Bar chart of gradient norm for each of 10 layers on a log scale">
          <Grid xTicks={0} yTicks={7} />
          {layers.map((L, i) => {
            const a = run.first[i]
            const b = run.last[i]
            return (
              <g key={L}>
                {Number.isFinite(a) ? (
                  <Rect x0={L - w} x1={L} y0={LOG_LO} y1={Math.log10(a)} fill="color-mix(in srgb, var(--viz-1) 16%, transparent)" stroke="var(--viz-1)" />
                ) : (
                  <NanBar x={L - w / 2} w={w} color="var(--viz-neg)" />
                )}
                {Number.isFinite(b) ? (
                  <Rect x0={L} x1={L + w} y0={LOG_LO} y1={Math.log10(b)} fill="var(--viz-1)" />
                ) : (
                  <NanBar x={L + w / 2} w={w} color="var(--viz-neg)" />
                )}
              </g>
            )
          })}
          {lastNan && <NanNote text="epoch 50: every norm is nan" />}
          <Axes xTicks={10} yTicks={7} tickFormat={(v) => String(v)} hideYTicks />
          <YLogTicks />
          <Label x={0.5} y={LOG_HI} dx={4} dy={14} color="var(--ink-2)" size={11}>
            gradient norm (log scale)
          </Label>
          <Label x={10.5} y={LOG_LO} dy={34} anchor="end" color="var(--ink-2)" size={11}>
            layer (1 = input side, 10 = output)
          </Label>
        </Plot>
        <div className={s.legend} aria-hidden="true">
          <span>
            <i className={s.swBox} style={{ background: 'color-mix(in srgb, var(--viz-1) 16%, transparent)', borderColor: 'var(--viz-1)' }} /> first mini-batch (outlined)
          </span>
          <span>
            <i className={s.swBox} style={{ background: 'var(--viz-1)', borderColor: 'var(--viz-1)' }} /> epoch 50 average (solid)
          </span>
          <span>
            <i className={s.swBox} style={{ background: 'color-mix(in srgb, var(--viz-neg) 14%, var(--surface))', borderColor: 'var(--viz-neg)', borderStyle: 'dashed' }} /> nan
          </span>
        </div>
        <Readout
          items={[
            ['layer 10 ÷ layer 1 (first step)', Number.isFinite(ratio) ? sci(ratio) : 'nan'],
            ['loss after 50 epochs', Number.isFinite(run.lastLoss) ? String(run.lastLoss) : 'nan'],
            ['accuracy after 50 epochs', `${Math.round(run.lastAcc * 100)}%${chance ? ' (chance)' : ''}`],
          ]}
        />
        <div className={`${s.verdict} ${tone === 'bad' ? s.verdictBad : tone === 'ok' ? s.verdictOk : s.verdictMeh}`} role="status">
          <span>{verdict}</span>
        </div>
      </div>
    </Figure>
  )
}

/** A boxed note at the top of the plot, drawn over the nan bars. */
function NanNote({ text }: { text: string }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const cx = (x0 + x1) / 2
  const y = ys(LOG_HI - 0.75)
  const w = text.length * 7.2 + 20
  return (
    <g>
      <rect x={cx - w / 2} y={y - 13} width={w} height={24} rx={6} style={{ fill: 'var(--surface)', stroke: 'var(--viz-neg)', strokeWidth: 1.5 }} />
      <text x={cx} y={y} dy="0.32em" textAnchor="middle" style={{ fill: 'var(--viz-neg)', fontSize: 13, fontWeight: 800 }}>
        {text}
      </text>
    </g>
  )
}

/** y-axis labels for a log10 axis: 10^-8, 10^-6, … */
function YLogTicks() {
  const { xs, ys } = usePlot()
  const x = xs.range()[0]
  const ticks = [-8, -6, -4, -2, 0, 2, 4]
  return (
    <g className="plot-axes">
      {ticks.map((t) => (
        <g key={t} transform={`translate(${x},${ys(t)})`}>
          <line x2={-5} />
          <text x={-8} dy="0.32em" textAnchor="end">
            {t === 0 ? '1' : `1e${t}`}
          </text>
        </g>
      ))}
    </g>
  )
}
