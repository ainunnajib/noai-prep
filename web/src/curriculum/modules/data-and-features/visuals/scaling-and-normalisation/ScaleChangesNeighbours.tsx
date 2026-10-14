import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Grid, Axes, Path, Dots, DraggablePoint, useContainerWidth, type DotDatum } from '../../../../../kit'

/*
  k-NN (k = 3) on two features measured in very different units: age (years) and monthly
  income (dollars). Label: needs reading glasses (mostly people over about 45).
  Left: the data in its natural units, the query, its 3 nearest neighbours and the
  "neighbourhood" (all points as close as the 3rd neighbour). Right: the same points drawn
  TO SCALE in the units the distance actually uses, so you can see what k-NN "sees".
*/

const AGE = [33, 67, 29, 29, 37, 32, 54, 26, 65, 63, 20, 47, 25, 33, 41, 43, 43, 66, 33, 29, 54, 67, 66, 64, 23, 67]
const INC = [7800, 9800, 5700, 4000, 9100, 8000, 9000, 3800, 3200, 8900, 2200, 10500, 3200, 7400, 5800, 4900, 3500, 9000, 10200, 8600, 7400, 8400, 6800, 7000, 10200, 4500]
const GLASSES = [0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1]

type Mode = 'raw' | 'minmax' | 'z'

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
const std = (a: number[]) => Math.sqrt(mean(a.map((v) => (v - mean(a)) ** 2)))
const STATS = {
  age: { mean: mean(AGE), std: std(AGE), min: Math.min(...AGE), max: Math.max(...AGE) },
  inc: { mean: mean(INC), std: std(INC), min: Math.min(...INC), max: Math.max(...INC) },
}

/** centre and scale of each feature for a given mode: z = (x − centre) / scale */
function params(mode: Mode) {
  if (mode === 'raw') return { ca: 0, sa: 1, ci: 0, si: 1 }
  if (mode === 'minmax') return { ca: STATS.age.min, sa: STATS.age.max - STATS.age.min, ci: STATS.inc.min, si: STATS.inc.max - STATS.inc.min }
  return { ca: STATS.age.mean, sa: STATS.age.std, ci: STATS.inc.mean, si: STATS.inc.std }
}

const COL_YES = 'var(--viz-2)'
const COL_NO = 'var(--viz-1)'
const COL_Q = 'var(--viz-5)'

const fmtInc = (v: number) => `$${(v / 1000).toLocaleString('en-GB', { maximumFractionDigits: 1 })}k`

function ToScale({ mode, q, nn, radius }: { mode: Mode; q: [number, number]; nn: number[]; radius: number }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(320)
  const W = Math.max(240, Math.min(380, measured))
  const H = 270
  const pad = { l: 30, r: 12, t: 26, b: 40 }
  const P = params(mode)
  const tf = (a: number, i: number): [number, number] => [(a - P.ca) / P.sa, (i - P.ci) / P.si]
  const pts = AGE.map((a, k) => tf(a, INC[k]))
  const qq = tf(q[0], q[1])
  const us = [...pts.map((p) => p[0]), qq[0]]
  const vs = [...pts.map((p) => p[1]), qq[1]]
  const u0 = Math.min(...us)
  const u1 = Math.max(...us)
  const v0 = Math.min(...vs)
  const v1 = Math.max(...vs)
  const du = Math.max(1e-9, u1 - u0)
  const dv = Math.max(1e-9, v1 - v0)
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const s = Math.min(iw / du, ih / dv)
  const ox = pad.l + (iw - du * s) / 2
  const oy = pad.t + (ih - dv * s) / 2
  const X = (u: number) => ox + (u - u0) * s
  const Y = (v: number) => oy + (v1 - v) * s
  const boxW = Math.max(1, du * s)
  const note = mode === 'raw' ? '1 year counts the same as $1' : mode === 'minmax' ? 'both features squeezed into 0 to 1' : 'both features in standard deviations'
  return (
    <div ref={ref} style={{ width: '100%', maxWidth: 380 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`The same points drawn to scale in the units the distance uses: ${note}`}>
        <text x={W / 2} y={14} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 700 }}>
          What the distance sees (to scale)
        </text>
        <rect x={X(u0)} y={Y(v1)} width={boxW} height={dv * s} style={{ fill: 'color-mix(in srgb, var(--viz-1) 6%, transparent)', stroke: 'var(--viz-axis)', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <circle cx={X(qq[0])} cy={Y(qq[1])} r={Math.max(2, radius * s)} style={{ fill: 'color-mix(in srgb, var(--viz-5) 14%, transparent)', stroke: COL_Q, strokeWidth: 1.5 }} />
        {nn.map((k) => (
          <line key={`l${k}`} x1={X(qq[0])} y1={Y(qq[1])} x2={X(pts[k][0])} y2={Y(pts[k][1])} style={{ stroke: COL_Q, strokeWidth: 1.5 }} />
        ))}
        {pts.map(([u, v], k) => (
          <circle key={k} cx={X(u)} cy={Y(v)} r={4} style={{ fill: GLASSES[k] ? COL_YES : COL_NO, stroke: nn.includes(k) ? COL_Q : 'var(--surface)', strokeWidth: nn.includes(k) ? 2.5 : 1 }} />
        ))}
        <circle cx={X(qq[0])} cy={Y(qq[1])} r={6} style={{ fill: COL_Q, stroke: 'var(--surface)', strokeWidth: 2 }} />
        <text x={W / 2} y={H - 20} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
          {mode === 'raw' ? `age → all ${STATS.age.max - STATS.age.min} years fit in ${boxW < 2 ? 'about 1 pixel' : `${Math.round(boxW)} px`}` : 'age →'}
        </text>
        <text x={12} y={pad.t + ih / 2} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }} transform={`rotate(-90 12 ${pad.t + ih / 2})`}>
          {mode === 'raw' ? `income → ${(STATS.inc.max - STATS.inc.min).toLocaleString('en-GB')} dollars tall` : 'income →'}
        </text>
        <text x={W / 2} y={H - 4} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
          {note}
        </text>
      </svg>
    </div>
  )
}

export default function ScaleChangesNeighbours() {
  const [mode, setMode] = useState<Mode>('raw')
  const [q, setQ] = useState<[number, number]>([58, 5200])

  const P = params(mode)
  const d2 = AGE.map((a, k) => {
    const da = (a - q[0]) / P.sa
    const di = (INC[k] - q[1]) / P.si
    return { k, da2: da * da, di2: di * di, d: Math.sqrt(da * da + di * di) }
  })
  const nnInfo = [...d2].sort((a, b) => a.d - b.d).slice(0, 3)
  const nn = nnInfo.map((x) => x.k)
  const radius = nnInfo[2].d
  const votes = nn.reduce((s, k) => s + GLASSES[k], 0)
  const incShare = nnInfo.reduce((s, x) => s + x.di2, 0) / Math.max(1e-12, nnInfo.reduce((s, x) => s + x.da2 + x.di2, 0))

  // neighbourhood boundary in natural units: an ellipse with radii radius·scale
  const ellipse: [number, number][] = Array.from({ length: 97 }, (_, t) => {
    const th = (t / 96) * 2 * Math.PI
    return [q[0] + radius * P.sa * Math.cos(th), q[1] + radius * P.si * Math.sin(th)]
  })

  const dots: DotDatum[] = AGE.map((a, k) => ({ x: a, y: INC[k], color: GLASSES[k] ? COL_YES : COL_NO, shape: GLASSES[k] ? 'triangle' : 'circle', r: 5.5 }))
  const rings: DotDatum[] = nn.map((k) => ({ x: AGE[k], y: INC[k], r: 11, color: COL_Q, hollow: true }))

  return (
    <Figure
      wide
      title="Scaling changes who your neighbours are"
      caption={
        <>
          Each point is a person; orange triangles need reading glasses, blue circles do not. k-NN predicts for the purple point (drag it) by a vote of
          its 3 nearest neighbours. With <b>no scaling</b>, the neighbourhood is a thin horizontal band: only income matters, because income differences
          are hundreds of times bigger numbers than age differences. Switch to <b>min-max</b> or <b>standardise</b> and watch the neighbours, and the
          prediction, change. The right panel draws the points to scale in the units the distance really uses.
        </>
      }
    >
      <Controls>
        <Segmented<Mode>
          label="Scaling"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'raw', label: 'no scaling' },
            { value: 'minmax', label: 'min-max' },
            { value: 'z', label: 'standardise' },
          ]}
        />
      </Controls>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', alignItems: 'center', justifyItems: 'center' }}>
        <Plot x={[15, 75]} y={[1000, 12000]} width={380} height={290} maxWidth={460} margin={{ left: 46, top: 26, bottom: 34 }} ariaLabel="Age against monthly income, with the query point and its 3 nearest neighbours">
          <Grid xTicks={6} yTicks={5} />
          <Path points={ellipse} closed fill="color-mix(in srgb, var(--viz-5) 12%, transparent)" color={COL_Q} width={1.5} />
          <Axes xLabel="age (years)" yLabel="monthly income" xTicks={6} yTicks={5} tickFormat={(v) => (v >= 1000 ? fmtInc(v) : String(v))} />
          {nn.map((k) => (
            <Path key={k} points={[q, [AGE[k], INC[k]]]} color={COL_Q} width={1.8} />
          ))}
          <Dots points={dots} />
          <Dots points={rings} />
          <DraggablePoint
            x={q[0]}
            y={q[1]}
            color={COL_Q}
            label="you"
            constrain={(x, y) => [Math.round(Math.max(18, Math.min(72, x))), Math.round(Math.max(1500, Math.min(11500, y)) / 100) * 100]}
            onChange={(x, y) => setQ([x, y])}
          />
        </Plot>
        <ToScale mode={mode} q={q} nn={nn} radius={radius} />
      </div>
      <Readout
        items={[
          ['you', `age ${q[0]}, ${fmtInc(q[1])}`],
          ['3 nearest', nn.map((k) => `${AGE[k]} y, ${fmtInc(INC[k])}`).join(' · ')],
          ['vote', `${votes} of 3 need glasses → predict ${votes >= 2 ? 'glasses' : 'no glasses'}`],
          ['income’s share of the squared distance', `${(incShare * 100).toFixed(1)}%`],
        ]}
      />
    </Figure>
  )
}
