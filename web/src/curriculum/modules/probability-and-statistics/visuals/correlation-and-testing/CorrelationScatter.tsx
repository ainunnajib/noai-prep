import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, Path, Rect, Dots, HLine, VLine, Label, useNarrow, mulberry32, M } from '../../../../../kit'
import { gauss, fmt } from './stats'

/*
  Covariance and correlation. 40 students: revision time (x) against quiz score (y).
  The data are built so that their sample correlation is EXACTLY the slider value: two
  standardised, uncorrelated columns u and w are mixed as v = r·u + √(1 − r²)·w.
  - "products" draws the rectangle from the mean point (x̄, ȳ) to each point: green when
    (x − x̄)(y − ȳ) > 0, red when < 0. The covariance is the average signed area.
  - switching hours ↔ minutes multiplies every x by 60: the cloud looks identical, the
    covariance is 60× bigger, the correlation does not change.
  - the U-shape pattern has r = 0 exactly although y is almost fixed by x.
*/

type Pattern = 'line' | 'curve'
type Unit = 'h' | 'min'
const N = 40

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
function standardise(v: number[]) {
  const m = mean(v)
  const c = v.map((x) => x - m)
  const s = Math.sqrt(c.reduce((t, x) => t + x * x, 0) / v.length)
  return c.map((x) => x / s)
}
/** remove the part of w that lines up with u (u standardised), then standardise */
function orthogonalTo(w: number[], u: number[]) {
  const wc = standardise(w)
  const proj = wc.reduce((t, x, i) => t + x * u[i], 0) / u.length
  return standardise(wc.map((x, i) => x - proj * u[i]))
}

function makeBase(seed: number) {
  const r = mulberry32(seed)
  const u = standardise(Array.from({ length: N }, () => gauss(r)))
  const w = orthogonalTo(
    Array.from({ length: N }, () => gauss(r)),
    u,
  )
  // a symmetric set of x values for the U-shape, so that cov(x, x²) is exactly 0
  const half = Array.from({ length: N / 2 }, () => gauss(r))
  const us = standardise([...half, ...half.map((x) => -x)])
  const noise = orthogonalTo(
    Array.from({ length: N }, () => gauss(r)),
    us,
  )
  const vs = standardise(us.map((x, i) => x * x - 1 + 0.22 * noise[i]))
  return { u, w, us, vs }
}

export default function CorrelationScatter() {
  const [target, setTarget] = useState(0.6)
  const [pattern, setPattern] = useState<Pattern>('line')
  const [unit, setUnit] = useState<Unit>('h')
  const [showRects, setShowRects] = useState(true)
  const [showLine, setShowLine] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)

  const base = useMemo(() => makeBase(20260219), [])
  const k = unit === 'min' ? 60 : 1
  const pts = useMemo(() => {
    if (pattern === 'curve') return base.us.map((u, i) => ({ x: (5 + 1.5 * u) * k, y: 50 + 10 * base.vs[i] }))
    const c = Math.sqrt(Math.max(0, 1 - target * target))
    return base.u.map((u, i) => ({ x: (5 + 1.5 * u) * k, y: 60 + 12 * (target * u + c * base.w[i]) }))
  }, [base, pattern, target, k])

  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const mx = mean(xs)
  const my = mean(ys)
  const cov = mean(pts.map((p) => (p.x - mx) * (p.y - my)))
  const sx = Math.sqrt(mean(xs.map((x) => (x - mx) ** 2)))
  const sy = Math.sqrt(mean(ys.map((y) => (y - my) ** 2)))
  const r = cov / (sx * sy)
  const slope = cov / (sx * sx)
  const X1 = 10 * k
  const unitWord = unit === 'h' ? 'hours' : 'minutes'
  const covUnit = unit === 'h' ? 'hour·marks' : 'minute·marks'

  return (
    <Figure
      title="Covariance and correlation of a scatter plot"
      caption={
        <>
          Each dot is a student: revision time against quiz score. Slide the correlation from −1 to 1 and watch the cloud tilt and tighten. With{' '}
          <b>products</b> on, each rectangle joins the mean point to a dot: green when <M>{'(x-\\bar x)(y-\\bar y) > 0'}</M>, red when it is negative.
          The covariance is the average signed area. Now switch hours to minutes: the picture is identical, the covariance jumps 60×, and{' '}
          <M>r</M> stays put. Finally try the U-shape: a perfect pattern, yet <M>{'r = 0'}</M>.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={[0, X1]}
          y={[20, 100]}
          width={520}
          height={360}
          maxWidth={620}
          minHeight={300}
          margin={{ left: 42, bottom: 38 }}
          ariaLabel={`Scatter plot of 40 students with correlation ${r.toFixed(2)}`}
        >
          <Grid xTicks={narrow ? 5 : 10} yTicks={8} />
          <Axes xLabel={`revision time (${unitWord})`} yLabel="quiz score" xTicks={narrow ? 5 : 10} yTicks={8} tickFormat={(v) => String(v)} />
          {showRects &&
            pts.map((p, i) => {
              const pos = (p.x - mx) * (p.y - my) > 0
              const c = pos ? 'var(--viz-pos)' : 'var(--viz-neg)'
              return (
                <Rect
                  key={i}
                  x0={mx}
                  x1={p.x}
                  y0={my}
                  y1={p.y}
                  fill={`color-mix(in srgb, ${c} 11%, transparent)`}
                  stroke={`color-mix(in srgb, ${c} 45%, transparent)`}
                />
              )
            })}
          <VLine x={mx} color="var(--viz-muted)" dash="5 4" width={1.5} />
          <HLine y={my} color="var(--viz-muted)" dash="5 4" width={1.5} />
          {showLine && (
            <Path
              points={[
                [0, my - slope * mx],
                [X1, my + slope * (X1 - mx)],
              ]}
              color="var(--viz-2)"
              width={2.5}
            />
          )}
          <Dots points={pts.map((p) => ({ x: p.x, y: p.y, r: 4.5 }))} color="var(--viz-1)" />
          <Label x={mx} y={100} dx={5} dy={13} color="var(--ink-2)" size={12}>
            {narrow ? 'x̄' : 'mean x̄'}
          </Label>
          <Label x={X1} y={my} dx={-4} dy={-6} anchor="end" color="var(--ink-2)" size={12}>
            {narrow ? 'ȳ' : 'mean ȳ'}
          </Label>
          {showRects && !narrow && (
            <>
              <Label x={X1 * 0.97} y={93} anchor="end" color="var(--viz-pos)" weight={700} size={12}>
                {'product > 0'}
              </Label>
              <Label x={X1 * 0.03} y={93} color="var(--viz-neg)" weight={700} size={12}>
                {'product < 0'}
              </Label>
              <Label x={X1 * 0.03} y={23} color="var(--viz-pos)" weight={700} size={12}>
                {'product > 0'}
              </Label>
              <Label x={X1 * 0.97} y={23} anchor="end" color="var(--viz-neg)" weight={700} size={12}>
                {'product < 0'}
              </Label>
            </>
          )}
        </Plot>
      </div>
      <Controls>
        {pattern === 'line' ? (
          <Slider label="target correlation" value={target} min={-1} max={1} step={0.05} onChange={setTarget} format={(v) => v.toFixed(2)} />
        ) : (
          <div style={{ flex: '1 1 200px', fontSize: '0.85rem', color: 'var(--ink-2)' }}>
            U-shape: score depends strongly on revision time, but not along a straight line.
          </div>
        )}
        <Segmented
          label="pattern"
          value={pattern}
          onChange={setPattern}
          options={[
            { value: 'line', label: 'straight line' },
            { value: 'curve', label: 'U-shape' },
          ]}
        />
        <Segmented
          label="x measured in"
          value={unit}
          onChange={setUnit}
          options={[
            { value: 'h', label: 'hours' },
            { value: 'min', label: 'minutes' },
          ]}
        />
      </Controls>
      <Controls>
        <Toggle label={<>products (rectangles)</>} checked={showRects} onChange={setShowRects} />
        <Toggle label="best-fit line" checked={showLine} onChange={setShowLine} />
      </Controls>
      <Readout
        items={[
          ['cov(x, y)', `${fmt(cov, 1)} ${covUnit}`],
          ['σx', `${fmt(sx, 2)} ${unit}`],
          ['σy', `${fmt(sy, 2)} marks`],
          ['r = cov / (σx σy)', `${fmt(cov, 1)} / (${fmt(sx, 2)} × ${fmt(sy, 2)}) = ${fmt(r, 2)}`],
        ]}
      />
    </Figure>
  )
}
