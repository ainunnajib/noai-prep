import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Bars, M, useNarrow, usePlot, mulberry32 } from '../../../../../kit'
import { closest, type XY } from './shared'

/*
  Step 1 of t-SNE for one chosen point i: turn distances into neighbour probabilities
      p(j|i) = exp(-d_ij^2 / 2 sigma_i^2) / sum_k exp(-d_ik^2 / 2 sigma_i^2)
  with sigma_i found by binary search so that 2^H = perplexity, where H = -sum_j p(j|i) log2 p(j|i).
*/

function gauss(rnd: () => number): number {
  const u = Math.max(1e-12, rnd())
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
}

function makePoints(): { pts: XY[]; group: number[] } {
  const rnd = mulberry32(31)
  const spec: [number, number, number, number][] = [
    [16, 2.4, 4.6, 0.55],
    [14, 5.3, 2.1, 0.8],
    [12, 8.1, 4.6, 1.3],
  ]
  const pts: XY[] = []
  const group: number[] = []
  spec.forEach(([n, cx, cy, s], g) => {
    for (let i = 0; i < n; i++) {
      pts.push([cx + s * gauss(rnd), cy + s * gauss(rnd)])
      group.push(g)
    }
  })
  return { pts, group }
}

const { pts: PTS, group: GROUP } = makePoints()
/** a representative point in each group: the one nearest the group's centre */
const REP = [0, 1, 2].map((g) => {
  const idx = PTS.map((_, i) => i).filter((i) => GROUP[i] === g)
  const cx = idx.reduce((s, i) => s + PTS[i][0], 0) / idx.length
  const cy = idx.reduce((s, i) => s + PTS[i][1], 0) / idx.length
  return idx.reduce((best, i) => (Math.hypot(PTS[i][0] - cx, PTS[i][1] - cy) < Math.hypot(PTS[best][0] - cx, PTS[best][1] - cy) ? i : best), idx[0])
})

/** neighbour probabilities of point i and the sigma that gives the target perplexity */
function neighbourProbs(i: number, perp: number): { p: number[]; sigma: number; H: number } {
  const d2 = PTS.map(([x, y]) => (x - PTS[i][0]) ** 2 + (y - PTS[i][1]) ** 2)
  const target = Math.log(perp)
  let lo = 0
  let hi = Infinity
  let beta = 1
  let p: number[] = []
  let H = 0
  for (let it = 0; it < 100; it++) {
    const w = d2.map((d, j) => (j === i ? 0 : Math.exp(-beta * d)))
    const sum = w.reduce((a, b) => a + b, 0) || 1e-300
    p = w.map((v) => v / sum)
    H = -p.reduce((a, v) => (v > 0 ? a + v * Math.log(v) : a), 0)
    if (Math.abs(H - target) < 1e-7) break
    if (H > target) {
      lo = beta
      beta = hi === Infinity ? beta * 2 : (beta + hi) / 2
    } else {
      hi = beta
      beta = (beta + lo) / 2
    }
  }
  return { p, sigma: Math.sqrt(1 / (2 * beta)), H: H / Math.log(2) }
}

/** the sigma and 2-sigma circles: faint fills drawn under the dots, dashed outlines drawn on top */
function SigmaRings({ c, sigma, outline }: { c: XY; sigma: number; outline?: boolean }) {
  const { xs, ys, clipId } = usePlot()
  const r1 = Math.abs(xs(c[0] + sigma) - xs(c[0]))
  const cx = xs(c[0])
  const cy = ys(c[1])
  if (!outline)
    return (
      <g aria-hidden="true" clipPath={`url(#${clipId})`}>
        <circle cx={cx} cy={cy} r={2 * r1} style={{ fill: 'color-mix(in srgb, var(--accent) 5%, transparent)' }} />
        <circle cx={cx} cy={cy} r={r1} style={{ fill: 'color-mix(in srgb, var(--accent) 10%, transparent)' }} />
      </g>
    )
  return (
    <g aria-hidden="true" clipPath={`url(#${clipId})`}>
      <circle cx={cx} cy={cy} r={2 * r1} style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 1.2, strokeDasharray: '2 4' }} />
      <circle cx={cx} cy={cy} r={r1} style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2, strokeDasharray: '7 4' }} />
    </g>
  )
}

const GROUP_LABELS: [string, XY, 'start' | 'middle'][] = [
  ['tight group', [2.2, 6.3], 'middle'],
  ['medium group', [6.75, 0.95], 'start'],
  ['spread-out group', [9.2, 6.85], 'middle'],
]

function Weighted({ p, sel }: { p: number[]; sel: number }) {
  const { xs, ys } = usePlot()
  const max = Math.max(...p)
  // draw the most likely neighbours last so they sit on top
  const order = PTS.map((_, j) => j).sort((a, b) => p[a] - p[b])
  return (
    <g>
      {GROUP_LABELS.map(([t, [x, y], anchor]) => (
        <text key={t} x={xs(x)} y={ys(y)} textAnchor={anchor} style={{ fontSize: 12, fill: 'var(--viz-muted)', fontWeight: 600 }}>
          {t}
        </text>
      ))}
      {order.map((j) => {
        if (j === sel) return null
        const t = Math.sqrt(p[j] / max)
        return (
          <circle
            key={j}
            cx={xs(PTS[j][0])}
            cy={ys(PTS[j][1])}
            r={3 + 4.5 * t}
            style={{ fill: `color-mix(in srgb, var(--viz-2) ${Math.round(100 * t)}%, var(--surface))`, stroke: 'var(--viz-ink)', strokeWidth: 1, strokeOpacity: 0.35 + 0.4 * t }}
          />
        )
      })}
      <circle cx={xs(PTS[sel][0])} cy={ys(PTS[sel][1])} r={4.5} style={{ fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }} />
    </g>
  )
}

export default function PerplexityNeighbours() {
  const [sel, setSel] = useState(REP[1])
  const [perp, setPerp] = useState(8)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)
  const { p, sigma, H } = useMemo(() => neighbourProbs(sel, perp), [sel, perp])
  const order = useMemo(() => p.map((v, j) => [v, j] as [number, number]).sort((a, b) => b[0] - a[0]), [p])
  const top = order.slice(0, 6)
  const rest = order.slice(6).reduce((a, [v]) => a + v, 0)
  const groupName = ['tight', 'medium', 'spread-out'][GROUP[sel]]

  return (
    <Figure
      wide
      title="Perplexity: how many neighbours does each point listen to?"
      caption={
        <>
          Pretend these points live in a high-dimensional space. Around the chosen point (centre of the circles), t-SNE puts a bell curve of width{' '}
          <M>\sigma</M> (dashed circle; the dotted one is <M>2\sigma</M>) and gives every other point a neighbour probability: bigger, darker dots get
          more. Slide the perplexity and the circle grows until about that many points share the probability. Then switch between the <b>tight</b> and{' '}
          <b>spread-out</b> groups at the same perplexity: t-SNE uses a small circle where points are crowded and a much wider one where they are
          sparse, so every point gets roughly the same number of neighbours.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'center' }}>
        <Plot
          x={[0.2, 12.6]}
          y={[0.1, 7.2]}
          width={520}
          height={302}
          maxWidth={520}
          margin={{ left: 10, right: 10, top: 8, bottom: 8 }}
          ariaLabel={`Neighbour probabilities around a point in the ${groupName} group at perplexity ${perp}`}
          onPointerDown={(q) => setSel(closest(PTS, q))}
        >
          <SigmaRings c={PTS[sel]} sigma={sigma} />
          <Weighted p={p} sel={sel} />
          <SigmaRings c={PTS[sel]} sigma={sigma} outline />
        </Plot>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>
            Neighbour probabilities <M>{'p_{j|i}'}</M> (they add up to 1)
          </div>
          <Bars
            data={[
              ...top.map(([v], k) => ({ label: `#${k + 1} nearest`, value: v, color: 'var(--viz-2)' })),
              { label: `the other ${PTS.length - 7}`, value: rest, color: 'var(--viz-muted)' },
            ]}
            max={1}
            format={(v) => v.toFixed(2)}
            ariaLabel="Largest neighbour probabilities"
          />
        </div>
      </div>
      <Controls>
        <Segmented
          label="chosen point"
          value={GROUP[sel]}
          onChange={(g) => setSel(REP[g])}
          options={[
            { value: 0, label: 'tight group' },
            { value: 1, label: 'medium' },
            { value: 2, label: 'spread-out' },
          ]}
        />
        <Slider label="perplexity" value={perp} min={2} max={30} step={1} onChange={setPerp} />
        <Readout items={[['σ (circle radius)', sigma.toFixed(2)], [<>effective neighbours <M>{'2^H'}</M></>, (2 ** H).toFixed(1)]]} />
      </Controls>
    </Figure>
  )
}
