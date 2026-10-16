import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Slider, Toggle, Plot, Grid, Axes, Path, Label, DraggablePoint, usePlot, useNarrow } from '../../../../../kit'
import { TRAIN, X_RANGE, Y_RANGE, PLOT_W, PLOT_H, PASS_C, FAIL_C, knn, knnPass, regionRuns, dist2, colourOf } from './students'
import { Regions, StudentMarks, Legend } from './parts'
import rc from './regions.module.css'

/*
  k-nearest neighbours on last year's class. Click (or drag the big marker) to place a new student; lines
  join them to their k nearest classmates and the dashed circle reaches the k-th nearest. The background shows
  what k-NN would predict for a new student at every spot, so you can watch the regions change as k changes.
  On touch screens only a tap places the student, so a swipe over the map scrolls the page instead of moving it.
*/

/** Places the new student: mouse or pen on press and drag; touch only on a tap (little movement). */
function PlaceLayer({ onPlace, children }: { onPlace: (x: number, y: number) => void; children: ReactNode }) {
  const { toData, margin, width, height } = usePlot()
  const touchStart = useRef<[number, number] | null>(null)
  const place = (cx: number, cy: number) => {
    const [x, y] = toData(cx, cy)
    onPlace(x, y)
  }
  return (
    <g
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') touchStart.current = [e.clientX, e.clientY]
        else place(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'touch' && e.buttons === 1) place(e.clientX, e.clientY)
      }}
      onPointerUp={(e) => {
        const s0 = touchStart.current
        touchStart.current = null
        if (e.pointerType === 'touch' && s0 && Math.hypot(e.clientX - s0[0], e.clientY - s0[1]) < 10) place(e.clientX, e.clientY)
      }}
      onPointerCancel={() => (touchStart.current = null)}
    >
      <rect x={margin.left} y={margin.top} width={width - margin.left - margin.right} height={height - margin.top - margin.bottom} style={{ fill: 'transparent' }} />
      {children}
    </g>
  )
}

/** circle of radius r (in data units) around (cx, cy); drawn as an ellipse so it is exact even if the axes differ slightly */
function DataCircle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const { xs, ys, clipId } = usePlot()
  return (
    <ellipse
      clipPath={`url(#${clipId})`}
      cx={xs(cx)}
      cy={ys(cy)}
      rx={Math.abs(xs(cx + r) - xs(cx))}
      ry={Math.abs(ys(cy + r) - ys(cy))}
      style={{ fill: 'color-mix(in srgb, var(--viz-ink) 5%, transparent)', stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '5 4', opacity: 0.8 }}
    />
  )
}

function Rings({ pts }: { pts: { x: number; y: number }[] }) {
  const { xs, ys } = usePlot()
  return (
    <g aria-hidden="true">
      {pts.map((p, i) => (
        <circle key={i} cx={xs(p.x)} cy={ys(p.y)} r={10.5} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
      ))}
    </g>
  )
}

const chip = (c: string): CSSProperties => ({
  display: 'inline-block',
  padding: '0.05rem 0.45rem',
  borderRadius: 999,
  background: `color-mix(in srgb, ${c} 22%, var(--surface))`,
  border: `1.5px solid ${c}`,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  color: 'var(--ink)',
})

const clampQ = (x: number, y: number): [number, number] => [
  Math.round(Math.max(X_RANGE[0] + 0.1, Math.min(X_RANGE[1] - 0.1, x)) * 10) / 10,
  Math.round(Math.max(Y_RANGE[0] + 0.1, Math.min(Y_RANGE[1] - 0.1, y)) * 10) / 10,
]

export default function KNNPlayground() {
  const [k, setK] = useState(1)
  const [q, setQ] = useState<[number, number]>([2.7, 5.4])
  const [showRegions, setShowRegions] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)

  const runs = useMemo(() => regionRuns((x, y) => knnPass(TRAIN, x, y, k), 100, 70), [k])
  const res = knn(TRAIN, q[0], q[1], k)
  const kth = TRAIN[res.neighbours[k - 1]]
  const radius = Math.sqrt(dist2(q[0], q[1], kth.x, kth.y))
  const verdict = res.pass ? 'PASS' : 'FAIL'

  return (
    <Figure
      title="Ask the neighbours"
      caption={
        <>
          Click or tap anywhere (or drag the big marker) to place a new student. Lines join them to their <i>k</i> nearest classmates, and the majority vote
          decides the prediction. The background shows the prediction for a new student at every spot. Start at <i>k</i> = 1 near the orange student who
          barely revised, then slide <i>k</i> up to 3, 7 and 15: watch the little orange island vanish and the regions become smoother.
        </>
      }
    >
      <Legend />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <Plot
        x={X_RANGE}
        y={Y_RANGE}
        width={PLOT_W}
        height={PLOT_H}
        maxWidth={640}
        ariaLabel={`k-nearest-neighbour map with k = ${k}. A new student at ${q[0]} hours of revision and ${q[1]} hours of sleep has ${res.passVotes} passing and ${res.failVotes} failing neighbours, so the prediction is ${verdict.toLowerCase()}.`}
      >
        <PlaceLayer onPlace={(x, y) => setQ(clampQ(x, y))}>
        {showRegions && <Regions runs={runs} />}
        <Grid xTicks={10} yTicks={7} />
        <Axes xLabel="hours of revision" yLabel="hours of sleep" xTicks={10} yTicks={7} />
        <DataCircle cx={q[0]} cy={q[1]} r={radius} />
        {res.neighbours.map((i) => (
          <Path key={i} points={[q, [TRAIN[i].x, TRAIN[i].y]]} color={colourOf(TRAIN[i].pass)} width={2} />
        ))}
        <StudentMarks data={TRAIN} />
        <Rings pts={res.neighbours.map((i) => TRAIN[i])} />
        {!narrow && (
          <Label x={q[0]} y={q[1]} dx={q[0] > 6 ? -15 : 15} dy={-10} anchor={q[0] > 6 ? 'end' : 'start'} color={res.pass ? PASS_C : FAIL_C} weight={700}>
            {`new student: ${verdict.toLowerCase()}`}
          </Label>
        )}
        <g className={rc.hideDragText}>
          <DraggablePoint
            x={q[0]}
            y={q[1]}
            r={10}
            color={res.pass ? PASS_C : FAIL_C}
            label={`new student, predicted ${verdict.toLowerCase()}`}
            onChange={(x, y) => setQ(clampQ(x, y))}
          />
        </g>
        </PlaceLayer>
      </Plot>
      </div>
      <div style={{ width: '100%', display: 'grid', gap: '0.35rem', justifyItems: 'center', textAlign: 'center' }} aria-live="polite">
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>distances to the {k} nearest:</span>
          {res.neighbours.map((i) => (
            <span key={i} style={chip(colourOf(TRAIN[i].pass))}>
              {Math.sqrt(dist2(q[0], q[1], TRAIN[i].x, TRAIN[i].y)).toFixed(1)}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>
          <span style={{ color: PASS_C }}>{res.passVotes} passed</span> vs <span style={{ color: FAIL_C }}>{res.failVotes} failed</span> → predict{' '}
          <span style={{ color: res.pass ? PASS_C : FAIL_C }}>{verdict}</span>
        </div>
      </div>
      <Controls>
        <Slider label={<>number of neighbours <i>k</i></>} value={k} min={1} max={15} step={2} onChange={setK} />
        <Toggle label="Colour the map by prediction" checked={showRegions} onChange={setShowRegions} />
      </Controls>
    </Figure>
  )
}
