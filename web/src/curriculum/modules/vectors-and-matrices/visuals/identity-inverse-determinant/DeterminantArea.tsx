import { useState } from 'react'
import { Figure, Controls, Toggle, Button, Plot, Grid, Axes, Arrow, Path, M, usePlot, useNarrow } from '../../../../../kit'
import { SnapPoint } from '../vectors/shared'
import s from './iid.module.css'

/*
  The determinant as an area scale factor. The columns of A are where (1,0) and (0,1) land,
  so A turns the unit square into the parallelogram they span. det A = ad − bc is that
  parallelogram's signed area: negative when the picture is mirrored, zero when it is flat.
*/

type V = [number, number]
const snap = (v: number) => Math.round(v * 2) / 2
const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))
const texNum = (v: number) => (v < 0 ? `(${num(v)})` : num(v))
const fmtDet = (v: number) => {
  const r = Math.round(v * 100) / 100
  return String(r === 0 ? 0 : r).replace(/^-/, '−')
}

const PRESETS: { name: string; c1: V; c2: V }[] = [
  { name: 'Identity', c1: [1, 0], c2: [0, 1] },
  { name: 'Stretch', c1: [2, 0], c2: [0, 1.5] },
  { name: 'Shear', c1: [1, 0], c2: [1, 1] },
  { name: 'Rotate 90°', c1: [0, 1], c2: [-1, 0] },
  { name: 'Mirror', c1: [0, 1], c2: [1, 0] },
  { name: 'Squash', c1: [2, 1], c2: [1, 0.5] },
]

const halo = { paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 4, strokeLinejoin: 'round' } as const

/** "area …" in the middle of the parallelogram, only when the shape is big enough to hold it. */
function AreaLabel({ c1, c2, text }: { c1: V; c2: V; text: string }) {
  const { xs, ys } = usePlot()
  const px = (v: V): V => [xs(v[0]) - xs(0), ys(v[1]) - ys(0)]
  const [p1, p2] = [px(c1), px(c2)]
  const areaPx = Math.abs(p1[0] * p2[1] - p1[1] * p2[0])
  const longest = Math.max(Math.hypot(...p1), Math.hypot(...p2), 1)
  // the shape's thickness across its longest side must fit a line of text, and its area a whole label
  if (areaPx / longest < 24 || areaPx < 1800) return null
  return (
    <text className="plot-label" x={xs((c1[0] + c2[0]) / 2)} y={ys((c1[1] + c2[1]) / 2)} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontWeight: 800, ...halo }}>
      {text}
    </text>
  )
}

/** "col 1" / "col 2" just beyond the tip of each column, along its direction, so it stays outside the shape. */
function TipName({ to, text, color }: { to: V; text: string; color: string }) {
  const { xs, ys } = usePlot()
  const dx = xs(to[0]) - xs(0)
  const dy = ys(to[1]) - ys(0)
  const l = Math.hypot(dx, dy)
  if (l < 1) return null
  const ux = dx / l
  const uy = dy / l
  const w = text.length * 7.5
  const [r0, r1] = xs.range()
  const [b0, b1] = ys.range()
  // centre of the label, beyond the tip; then kept inside the plot so it never runs off an edge
  const want = xs(to[0]) + ux * (14 + (w / 2) * Math.abs(ux))
  const cx = Math.max(Math.min(r0, r1) + w / 2, Math.min(Math.max(r0, r1) - w / 2, want))
  // pulled in from the left or right edge: then sit clearly above or below the handle instead
  const dyOff = Math.abs(cx - want) > 1 ? (uy > 0 ? 1 : -1) * 22 : uy * (14 + 4 * Math.abs(uy))
  const cy = Math.max(Math.min(b0, b1) + 8, Math.min(Math.max(b0, b1) - 8, ys(to[1]) + dyOff))
  return (
    <text className="plot-label" x={cx} y={cy} dy="0.35em" textAnchor="middle" style={{ fill: color, fontWeight: 800, ...halo }}>
      {text}
    </text>
  )
}

/** Points along the short arc from direction u to direction v, radius r (data units). */
function arc(u: V, v: V, r: number): V[] {
  const t1 = Math.atan2(u[1], u[0])
  let d = Math.atan2(v[1], v[0]) - t1
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  const n = 24
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = t1 + (d * k) / n
    return [r * Math.cos(t), r * Math.sin(t)] as V
  })
}

export default function DeterminantArea() {
  const [c1, setC1] = useState<V>([2, 1])
  const [c2, setC2] = useState<V>([1, 2])
  const [warp, setWarp] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const LIM = narrow ? 3.4 : 4.5
  const reach = narrow ? 3 : 4
  const clampV = (v: number) => Math.max(-reach, Math.min(reach, v))

  const [a, c] = c1
  const [b, d] = c2
  const det = a * d - b * c
  const singular = Math.abs(det) < 1e-9
  const flipped = det < -1e-9
  const tone = singular ? 'var(--viz-neg)' : flipped ? 'var(--viz-4)' : 'var(--viz-3)'
  const corner: V = [a + b, c + d]

  // images of the integer grid lines: k·c2 + t·c1 and k·c1 + t·c2
  const lines: [V, V][] = []
  if (warp) {
    for (let k = -8; k <= 8; k++) {
      lines.push([[k * b - 12 * a, k * d - 12 * c], [k * b + 12 * a, k * d + 12 * c]])
      lines.push([[k * a - 12 * b, k * c - 12 * d], [k * a + 12 * b, k * c + 12 * d]])
    }
  }
  const arcPts = singular ? [] : arc(c1, c2, 0.6)

  return (
    <Figure
      title="The determinant is an area scale factor"
      caption={
        <>
          Drag the tips of the two columns. The dashed square is the unit square (area 1); the shaded shape is where A sends it, and its area is |det A|. Make the
          columns point the same way (try the <b>Squash</b> preset, or line them up yourself): the shape goes flat, det becomes 0 and A is <b>singular</b>. Cross one
          column over the other and the colour changes: a negative determinant means the plane has been mirrored (the little turning arrow reverses).
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <Plot x={[-LIM, LIM]} y={[-LIM, LIM]} width={420} height={420} ariaLabel={`Unit square mapped to a parallelogram with signed area ${fmtDet(det)}`}>
        <Grid xTicks={2 * Math.floor(LIM)} yTicks={2 * Math.floor(LIM)} />
        {lines.map((l, i) => (
          <Path key={i} points={l} color="var(--viz-5)" width={1} opacity={0.35} />
        ))}
        <Axes origin xTicks={8} yTicks={8} />
        <Path points={[[0, 0], c1, corner, c2]} closed fill={`color-mix(in srgb, ${tone} 28%, transparent)`} color={tone} width={singular ? 3 : 2} />
        <Path points={[[0, 0], [1, 0], [1, 1], [0, 1]]} closed color="var(--viz-ink)" width={1.5} dash="5 4" />
        {arcPts.length > 1 && (
          <>
            <Path points={arcPts.slice(0, -2)} color={tone} width={2} />
            <Arrow from={arcPts[arcPts.length - 3]} to={arcPts[arcPts.length - 1]} color={tone} width={2} head={7} />
          </>
        )}
        <Arrow from={[0, 0]} to={c1} color="var(--viz-1)" width={3.5} />
        <Arrow from={[0, 0]} to={c2} color="var(--viz-2)" width={3.5} />
        {!singular && <AreaLabel c1={c1} c2={c2} text={`area ${fmtDet(Math.abs(det))}`} />}
        <TipName to={c1} text="col 1" color="var(--viz-1)" />
        <TipName to={c2} text="col 2" color="var(--viz-2)" />
        <SnapPoint x={a} y={c} color="var(--viz-1)" onChange={(x, y) => setC1([clampV(snap(x)), clampV(snap(y))])} />
        <SnapPoint x={b} y={d} color="var(--viz-2)" onChange={(x, y) => setC2([clampV(snap(x)), clampV(snap(y))])} />
      </Plot>
      </div>

      <div className={s.info} aria-live="polite">
        <div className={s.big}>
          <M>{`\\det\\begin{bmatrix} ${num(a)} & ${num(b)} \\\\ ${num(c)} & ${num(d)} \\end{bmatrix} = ${texNum(a)}\\times ${texNum(d)} - ${texNum(b)}\\times ${texNum(c)} = ${fmtDet(det).replace('−', '-')}`}</M>
        </div>
        <div className={s.badges}>
          <span className={`${s.badge} ${singular ? s.badgeBad : s.badgeOn}`}>{singular ? 'singular: squashed flat, no inverse' : 'invertible'}</span>
          {!singular && <span className={`${s.badge} ${s.badgeOn}`}>areas × {fmtDet(Math.abs(det))}</span>}
          {!singular && <span className={`${s.badge} ${flipped ? s.badgeBad : s.badgeOn}`}>{flipped ? 'orientation flipped (mirror image)' : 'orientation kept'}</span>}
        </div>
      </div>

      <Controls>
        {PRESETS.map((p) => (
          <Button
            key={p.name}
            onClick={() => {
              setC1(p.c1)
              setC2(p.c2)
            }}
          >
            {p.name}
          </Button>
        ))}
        <Toggle label="Show the transformed grid" checked={warp} onChange={setWarp} />
      </Controls>
    </Figure>
  )
}
