import { useMemo, useState, type ReactElement } from 'react'
import { Figure, Controls, Slider, Segmented, Plot, usePlot, DraggablePoint, useContainerWidth, M } from '../../../../../kit'
import { ConfusionMatrix, type CellKey } from './ConfusionMatrix'
import { MetricBars } from './MetricBars'
import { ScoreDot } from './ScoreDot'
import { metricsOf, normalQuantiles, sigmoid, type Counts } from './evalMath'
import s from './eval.module.css'

/*
  100 people take a screening test. The model gives each a score between 0 and 1 (its estimated
  probability of being sick). Healthy people (actual 0) are stacked upwards from the middle line,
  sick people (actual 1) downwards, in bins 0.05 wide. The threshold splits the picture into four
  regions which are exactly the four cells of the confusion matrix:
      top-left TN | top-right FP
      bottom-left FN | bottom-right TP
  Scores: z = Φ⁻¹((i + 0.5)/n) ∓ d/2 (an evenly spread normal sample), score = sigmoid(z).
*/

const N = 100
const BINS = 20
const SHARES = [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5]
const NEG_C = 'var(--viz-1)'
const POS_C = 'var(--viz-2)'
const CAP = 700
const M_L = 12
const M_R = 12
const M_T = 26
const M_B = 30

type Focus = 'accuracy' | 'precision' | 'recall' | 'f1'

function binsFor(n: number, shift: number): number[] {
  const out = new Array(BINS).fill(0)
  for (const z of normalQuantiles(n)) out[Math.min(BINS - 1, Math.floor(sigmoid(z + shift) * BINS))]++
  return out
}

interface Layout {
  cols: number
  r: number
  pitch: number
  rowPitch: number
  halfH: number
  height: number
}

/**
 * Dots sit in 1 column per bin on phones and 2 on wider screens. The plot height is fixed per
 * width; if a stack is taller than the room available, rows are squeezed closer together.
 */
function layoutFor(width: number, maxStack: number): Layout {
  const binW = (width - M_L - M_R) / BINS
  const cols = binW >= 22 ? 2 : 1
  const pitch = binW / cols
  const r = Math.max(2.6, Math.min(4.6, pitch / 2 - 1))
  const natural = 2 * r + 1.4
  const capacity = cols === 2 ? 8 : 10
  const halfH = capacity * natural + 8
  const rowsNeeded = Math.ceil(maxStack / cols)
  const rowPitch = rowsNeeded > capacity ? (halfH - 8) / rowsNeeded : natural
  return { cols, r, pitch, rowPitch, halfH, height: Math.round(M_T + 2 * halfH + M_B) }
}

function DotLayer({ neg, pos, k, L }: { neg: number[]; pos: number[]; k: number; L: Layout }) {
  const { xs, width } = usePlot()
  const x0 = xs(0)
  const x1 = xs(1)
  const xt = xs(k / BINS)
  const mid = M_T + L.halfH
  const top = M_T
  const bottom = mid + L.halfH
  const tint = (c: string) => `color-mix(in srgb, ${c} 9%, transparent)`
  const dots: ReactElement[] = []
  const place = (bins: number[], up: boolean, color: string) =>
    bins.forEach((count, b) => {
      for (let j = 0; j < count; j++) {
        const col = j % L.cols
        const row = Math.floor(j / L.cols)
        const cx = xs(b / BINS) + (col + 0.5) * L.pitch
        const cy = up ? mid - 4 - (row + 0.5) * L.rowPitch : mid + 4 + (row + 0.5) * L.rowPitch
        const predPos = b >= k
        const wrong = up ? predPos : !predPos
        dots.push(<ScoreDot key={`${up ? 'n' : 'p'}${b}-${j}`} cx={cx} cy={cy} r={L.r} color={color} wrong={wrong} />)
      }
    })
  place(neg, true, NEG_C)
  place(pos, false, POS_C)

  const c = {
    tn: neg.slice(0, k).reduce((a, b) => a + b, 0),
    fp: neg.slice(k).reduce((a, b) => a + b, 0),
    fn: pos.slice(0, k).reduce((a, b) => a + b, 0),
    tp: pos.slice(k).reduce((a, b) => a + b, 0),
  }
  const quadLabel = (key: CellKey, x: number, y: number, anchor: 'start' | 'end', show: boolean) =>
    show ? (
      <text className="plot-label" x={x} y={y} textAnchor={anchor} style={{ fontSize: 12 }}>
        {key.toUpperCase()} = {c[key]}
      </text>
    ) : null
  const leftW = xt - x0
  const rightW = x1 - xt
  const tickVals = [0, 0.25, 0.5, 0.75, 1]
  return (
    <g>
      {/* four regions = four cells */}
      <rect x={x0} y={top} width={leftW} height={L.halfH} style={{ fill: tint('var(--viz-pos)') }} />
      <rect x={xt} y={top} width={rightW} height={L.halfH} style={{ fill: tint('var(--viz-neg)') }} />
      <rect x={x0} y={mid} width={leftW} height={L.halfH} style={{ fill: tint('var(--viz-neg)') }} />
      <rect x={xt} y={mid} width={rightW} height={L.halfH} style={{ fill: tint('var(--viz-pos)') }} />
      <line x1={x0} x2={x1} y1={mid} y2={mid} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.25 }} />
      {dots}
      {quadLabel('tn', x0 + 4, top + 14, 'start', leftW > 62)}
      {quadLabel('fp', x1 - 4, top + 14, 'end', rightW > 62)}
      {quadLabel('fn', x0 + 4, bottom - 6, 'start', leftW > 62)}
      {quadLabel('tp', x1 - 4, bottom - 6, 'end', rightW > 62)}
      {/* score axis */}
      <g className="plot-axes">
        <line x1={x0} x2={x1} y1={bottom} y2={bottom} />
        {tickVals.map((v) => (
          <g key={v} transform={`translate(${xs(v)},${bottom})`}>
            <line y2={5} />
            <text y={17} textAnchor={v === 0 ? 'start' : v === 1 ? 'end' : 'middle'}>
              {v}
            </text>
          </g>
        ))}
        <text className="plot-axis-label" x={(x0 + x1) / 2} y={Math.min(bottom + 29, M_T + 2 * L.halfH + M_B - 1)} textAnchor="middle" style={{ fontSize: 12 }}>
          {width < 420 ? 'model score' : 'model score (estimated probability of being sick)'}
        </text>
      </g>
      {/* threshold */}
      <line x1={xt} x2={xt} y1={top - 6} y2={bottom} style={{ stroke: 'var(--viz-ink)', strokeWidth: 2.2 }} />
      <text className="plot-label" x={xt + (k > BINS - 5 ? -14 : 14)} y={top - 9} textAnchor={k > BINS - 5 ? 'end' : 'start'} style={{ fontSize: 12 }}>
        threshold {(k / BINS).toFixed(2)}
      </text>
    </g>
  )
}

export default function ConfusionThreshold() {
  const [k, setK] = useState(10) // threshold = k / 20
  const [d, setD] = useState(2)
  const [shareIdx, setShareIdx] = useState(4)
  const [focus, setFocus] = useState<Focus>('precision')
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(200, Math.min(CAP, measured))

  const share = SHARES[shareIdx]
  const nPos = Math.round(N * share)
  const nNeg = N - nPos
  const neg = useMemo(() => binsFor(nNeg, -d / 2), [nNeg, d])
  const pos = useMemo(() => binsFor(nPos, d / 2), [nPos, d])
  const L = layoutFor(W, Math.max(...neg, ...pos))
  const counts: Counts = {
    tn: neg.slice(0, k).reduce((a, b) => a + b, 0),
    fp: neg.slice(k).reduce((a, b) => a + b, 0),
    fn: pos.slice(0, k).reduce((a, b) => a + b, 0),
    tp: pos.slice(k).reduce((a, b) => a + b, 0),
  }
  const m = metricsOf(counts)
  const { tp, fp, fn, tn } = counts

  const focusCells: Record<Focus, CellKey[]> = {
    accuracy: ['tn', 'fp', 'fn', 'tp'],
    precision: ['fp', 'tp'],
    recall: ['fn', 'tp'],
    f1: ['fp', 'fn', 'tp'],
  }
  const val = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : '\\text{undefined}')
  const formula: Record<Focus, string> = {
    accuracy: `\\text{accuracy} = \\frac{TP + TN}{\\text{all}} = \\frac{${tp} + ${tn}}{${N}} = ${val(m.accuracy)}`,
    precision: `\\text{precision} = \\frac{TP}{TP + FP} = \\frac{${tp}}{${tp} + ${fp}} = ${val(m.precision)}`,
    recall: `\\text{recall} = \\frac{TP}{TP + FN} = \\frac{${tp}}{${tp} + ${fn}} = ${val(m.recall)}`,
    f1: `F_1 = \\frac{2\\,TP}{2\\,TP + FP + FN} = \\frac{${2 * tp}}{${2 * tp} + ${fp} + ${fn}} = ${val(m.f1)}`,
  }

  return (
    <Figure
      wide
      title="Slide the threshold: four counts, four metrics"
      caption={
        <>
          Drag the threshold right: FP falls and precision rises, but FN grows and recall falls. Then set sick people to <b>5 of 100</b> and push the threshold
          to 1.00: accuracy 0.95, recall 0.
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap}>
        <Plot
          x={[0, 1]}
          y={[0, 1]}
          width={W}
          height={L.height}
          maxWidth={CAP}
          margin={{ left: M_L, right: M_R, top: M_T, bottom: M_B }}
          ariaLabel={`Dot plot of ${nNeg} healthy and ${nPos} sick people by model score, threshold ${(k / BINS).toFixed(2)}: TN ${tn}, FP ${fp}, FN ${fn}, TP ${tp}`}
        >
          <DotLayer neg={neg} pos={pos} k={k} L={L} />
          <DraggablePoint
            x={k / BINS}
            y={1}
            lockY
            color="var(--viz-ink)"
            r={8}
            onChange={(x) => setK(Math.max(0, Math.min(BINS, Math.round(x * BINS))))}
          />
        </Plot>
      </div>
      <div className={s.legend}>
        <span>
          <span className={s.swatch} style={{ background: NEG_C }} />
          healthy (actual 0), stacked up
        </span>
        <span>
          <span className={s.swatch} style={{ background: POS_C }} />
          sick (actual 1), stacked down
        </span>
        <span>
          <span className={s.swatch} style={{ background: 'var(--surface)', border: '2px solid var(--viz-neg)' }} />
          ring = wrong prediction
        </span>
      </div>
      <Controls>
        <Slider label="threshold" value={k} min={0} max={BINS} step={1} onChange={setK} format={(v) => (v / BINS).toFixed(2)} />
        <Slider label="model quality (class separation)" value={d} min={0} max={4} step={0.5} onChange={setD} format={(v) => v.toFixed(1)} />
        <Slider
          label="sick people"
          value={shareIdx}
          min={0}
          max={SHARES.length - 1}
          step={1}
          onChange={setShareIdx}
          format={() => `${nPos} of ${N}`}
        />
      </Controls>
      <div className={s.panels}>
        <div>
          <ConfusionMatrix counts={counts} negLabel="healthy" posLabel="sick" focus={focusCells[focus]} />
        </div>
        <div>
          <MetricBars
            ariaLabel="Metrics at this threshold"
            data={[
              { label: 'accuracy', value: m.accuracy, color: 'var(--viz-axis)' },
              { label: 'precision', value: m.precision, color: 'var(--viz-5)', undefinedText: 'no one predicted sick' },
              { label: 'recall', value: m.recall, color: 'var(--viz-4)' },
              { label: 'F1', value: m.f1, color: 'var(--viz-6)' },
            ]}
          />
        </div>
      </div>
      <Segmented<Focus>
        label="Show the cells used by"
        value={focus}
        onChange={setFocus}
        options={[
          { value: 'accuracy', label: 'accuracy' },
          { value: 'precision', label: 'precision' },
          { value: 'recall', label: 'recall' },
          { value: 'f1', label: 'F1' },
        ]}
      />
      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <M>{formula[focus]}</M>
      </div>
    </Figure>
  )
}
