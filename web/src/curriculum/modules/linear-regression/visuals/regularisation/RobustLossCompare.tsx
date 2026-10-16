import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Toggle, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label, Bars, useNarrow } from '../../../../../kit'
import { DragDot } from '../least-squares/DragDot'

/*
  Nine points that follow y ≈ 1 + 0.5x. One of them (pink) can be dragged up and down at x = 8
  (vertical only: a point far to the side has high leverage and can move even the MAE line). Two lines
  are fitted: least squares (minimises MSE) and least absolute deviations (minimises MAE; the best
  line always passes through two of the data points, so we try every pair). Optionally a Huber
  line (δ = 1, by iteratively reweighted least squares). Right: each loss as a function of one
  residual, and how much of each total loss the dragged point is responsible for.
*/

type Pt = [number, number]
const BASE: Pt[] = [
  [0, 1.3],
  [1, 1.3],
  [2, 2.25],
  [3, 2.2],
  [4, 3.1],
  [5, 3.35],
  [6, 4.2],
  [7, 4.25],
]
const START: Pt = [8, 0]
const DELTA = 1

const fitLS = (pts: Pt[], wts?: number[]) => {
  const w = wts ?? pts.map(() => 1)
  const S = w.reduce((a, b) => a + b, 0)
  const mx = pts.reduce((s, p, i) => s + w[i] * p[0], 0) / S
  const my = pts.reduce((s, p, i) => s + w[i] * p[1], 0) / S
  const sxy = pts.reduce((s, p, i) => s + w[i] * (p[0] - mx) * (p[1] - my), 0)
  const sxx = pts.reduce((s, p, i) => s + w[i] * (p[0] - mx) ** 2, 0)
  const m = sxy / sxx
  return { m, b: my - m * mx }
}
const fitLAD = (pts: Pt[]) => {
  let best = { m: 0, b: 0, s: Infinity }
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      if (Math.abs(pts[j][0] - pts[i][0]) < 1e-9) continue
      const m = (pts[j][1] - pts[i][1]) / (pts[j][0] - pts[i][0])
      const b = pts[i][1] - m * pts[i][0]
      const s = pts.reduce((t, p) => t + Math.abs(p[1] - b - m * p[0]), 0)
      if (s < best.s - 1e-12) best = { m, b, s }
    }
  return best
}
const fitHuber = (pts: Pt[]) => {
  let f = fitLS(pts)
  for (let k = 0; k < 100; k++) {
    const wts = pts.map((p) => Math.min(1, DELTA / Math.max(1e-12, Math.abs(p[1] - f.b - f.m * p[0]))))
    f = fitLS(pts, wts)
  }
  return f
}
const CLEAN_LS = fitLS(BASE)
const CLEAN_LAD = fitLAD(BASE)
const title: CSSProperties = { fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }
const huber = (r: number) => (Math.abs(r) <= DELTA ? 0.5 * r * r : DELTA * (Math.abs(r) - 0.5 * DELTA))

export default function RobustLossCompare() {
  const [q, setQ] = useState<Pt>(START)
  const [showHuber, setShowHuber] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const pts = useMemo(() => [...BASE, q], [q])
  const ls = useMemo(() => fitLS(pts), [pts])
  const lad = useMemo(() => fitLAD(pts), [pts])
  const hub = useMemo(() => fitHuber(pts), [pts])
  // how far the pink point drags each line, measured at the point's own x
  const movedLS = Math.abs(ls.b + ls.m * q[0] - (CLEAN_LS.b + CLEAN_LS.m * q[0]))
  const movedLAD = Math.abs(lad.b + lad.m * q[0] - (CLEAN_LAD.b + CLEAN_LAD.m * q[0]))

  return (
    <Figure
      title="One outlier: MSE swings, MAE shrugs"
      caption={
        <>
          Eight points follow a clear trend; drag the <b>pink</b> point up or down to make it an outlier (it starts as one). The blue line minimises the{' '}
          <b>MSE</b>, the orange line the <b>MAE</b>. Squaring makes the outlier's big error enormous, so the MSE line tilts towards it to shrink that one
          square. The MAE line pays only in proportion to the distance, so it stays with the majority. The bars measure how far the point drags each line away
          from where the other eight points would put it, and the loss-shape chart shows why: r² rises much faster than |r|.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: narrow ? '1fr' : '1.4fr 1fr',
          gap: 14,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: 4 }}>
        <div style={title}>Eight points and one outlier</div>
        <Plot
          x={[-0.5, 9.5]}
          y={[-1.5, 8.5]}
          width={400}
          height={320}
          minHeight={270}
          margin={{ left: 32, top: 18 }}
          ariaLabel="Data with a draggable outlier and lines fitted by MSE and by MAE"
        >
          <Grid xTicks={10} yTicks={10} />
          <Axes xLabel="x" yLabel="y" xTicks={5} yTicks={5} />
          <Path
            points={[
              [q[0], q[1]],
              [q[0], ls.b + ls.m * q[0]],
            ]}
            color="var(--viz-1)"
            width={1.5}
            dash="3 3"
          />
          <FnPath f={(x) => ls.b + ls.m * x} color="var(--viz-1)" width={3} />
          <FnPath f={(x) => lad.b + lad.m * x} color="var(--viz-2)" width={3} />
          {showHuber && <FnPath f={(x) => hub.b + hub.m * x} color="var(--viz-3)" width={2.5} dash="7 4" />}
          <Dots
            points={BASE.map(([x, y]) => ({
              x,
              y,
              r: 5.5,
              color: 'var(--viz-ink)',
            }))}
          />
          <Label x={9.4} y={ls.b + ls.m * 9.4} dy={ls.m < lad.m ? 18 : -10} anchor="end" color="var(--viz-1)" weight={700}>
            MSE line
          </Label>
          <Label x={9.4} y={lad.b + lad.m * 9.4} dy={ls.m < lad.m ? -10 : 18} anchor="end" color="var(--viz-2)" weight={700}>
            MAE line
          </Label>
          <DragDot
            x={q[0]}
            y={q[1]}
            lockX
            r={7}
            color="var(--viz-4)"
            tag="drag me"
            tagSide="left"
            ariaLabel="The outlier's y value (it moves up and down at x = 8)"
            onChange={(x, y) => setQ([x, Math.round(y * 10) / 10])}
          />
        </Plot>
        </div>
        <div style={{ display: 'grid', gap: 8, width: '100%' }}>
          <div style={title}>Loss shape: the cost of one residual r</div>
          <Plot
            x={[-4, 4]}
            y={[0, 8]}
            width={300}
            height={220}
            minHeight={190}
            margin={{ left: 28, top: 20 }}
            ariaLabel="Loss as a function of one residual: squared, absolute and Huber"
          >
            <Grid xTicks={8} yTicks={4} />
            <Axes origin xLabel="residual r" xTicks={4} yTicks={4} />
            <FnPath f={(r) => r * r} color="var(--viz-1)" width={3} />
            <FnPath f={(r) => Math.abs(r)} color="var(--viz-2)" width={3} />
            {showHuber && <FnPath f={huber} color="var(--viz-3)" width={2.5} dash="7 4" />}
            <Label x={-2.83} y={7.4} dx={-8} anchor="end" color="var(--viz-1)" weight={700}>
              r²
            </Label>
            <Label x={-3.9} y={3.7} dy={-8} color="var(--viz-2)" weight={700}>
              |r|
            </Label>
            {showHuber && (
              <Label x={3.9} y={huber(3.9)} dy={18} anchor="end" color="var(--viz-3)" weight={700}>
                Huber
              </Label>
            )}
          </Plot>
          <div
            style={{
              fontSize: 'var(--step--1)',
              fontWeight: 700,
              color: 'var(--ink-2)',
            }}
          >
            How far the pink point drags each line (measured at its x)
          </div>
          <Bars
            data={[
              { label: 'MSE line', value: movedLS, color: 'var(--viz-1)' },
              { label: 'MAE line', value: movedLAD, color: 'var(--viz-2)' },
            ]}
            max={3}
            format={(v) => v.toFixed(2)}
            ariaLabel="How far each fitted line moves because of the dragged point"
          />
        </div>
      </div>
      <Controls>
        <Toggle label="Show the Huber line and loss (δ = 1)" checked={showHuber} onChange={setShowHuber} />
        <Button onClick={() => setQ([8, 5.0])}>Put the point back on the trend</Button>
        <Button onClick={() => setQ(START)}>Reset</Button>
      </Controls>
      <Readout
        items={[
          ['slope without the outlier (MSE / MAE)', `${CLEAN_LS.m.toFixed(2)} / ${CLEAN_LAD.m.toFixed(2)}`],
          ['MSE line slope', ls.m.toFixed(2)],
          ['MAE line slope', lad.m.toFixed(2)],
          ...(showHuber ? ([['Huber line slope', hub.m.toFixed(2)]] as [string, string][]) : []),
        ]}
      />
    </Figure>
  )
}
