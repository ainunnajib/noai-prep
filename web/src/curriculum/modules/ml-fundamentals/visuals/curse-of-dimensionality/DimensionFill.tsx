import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Path, Dots, Rect, HLine, VLine, Label, M, useNarrow, usePlot } from '../../../../../kit'
import DotCloud from './DotCloud'
import { uniformMatrix, fmtBig, fmtPct, pow10 } from './maths'

/*
  Space grows faster than data. 1,000 random points live in the unit cube [0, 1]^d.
  Left: every point drawn at its first two features. The shaded box around the query point
  covers a share s of EVERY feature's range, so it holds a share s^d of the cube's volume.
  A point is a true neighbour only if it is inside the box in all d features.
  Right: the expected number of neighbours, 1000 · s^d, against d (log scale).
*/

const N = 1000
const DMAX = 20
const SEED = 2027

const small: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }

function fmtExpected(v: number): string {
  if (v >= 10) return v.toFixed(0)
  if (v >= 1) return v.toFixed(1)
  if (v >= 0.01) return v.toFixed(2)
  const e = Math.floor(Math.log10(v))
  return `${Math.round(v / 10 ** e)} × ${pow10(e)}`
}

const logTick = (v: number) => {
  const x = 10 ** v
  return x >= 1 ? String(Math.round(x)) : String(Number(x.toPrecision(1)))
}

/** y-axis ticks for a log10 axis: 0.001, 0.01, …, 1000 */
function LogYTicks({ from, to }: { from: number; to: number }) {
  const { xs, ys } = usePlot()
  const x0 = xs.range()[0]
  const ticks = Array.from({ length: to - from + 1 }, (_, i) => from + i)
  return (
    <g className="plot-axes">
      {ticks.map((t) => (
        <g key={t} transform={`translate(${x0},${ys(t)})`}>
          <line x2={-5} />
          <text x={-8} dy="0.32em" textAnchor="end">
            {logTick(t)}
          </text>
        </g>
      ))}
    </g>
  )
}

function Swatch({ kind }: { kind: 'in' | 'look' | 'out' }) {
  const style: CSSProperties =
    kind === 'in'
      ? { fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 1 }
      : kind === 'look'
        ? { fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1.6 }
        : { fill: 'var(--viz-muted)' }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="7" cy="7" r={kind === 'out' ? 2.5 : 4.5} style={style} />
    </svg>
  )
}

export default function DimensionFill() {
  const [d, setD] = useState(2)
  const [s, setS] = useState(0.5)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const X = useMemo(() => uniformMatrix(SEED, N, DMAX), [])

  const lo = 0.5 - s / 2
  const hi = 0.5 + s / 2
  const { inside, looks, outside } = useMemo(() => {
    const inside: [number, number][] = []
    const looks: [number, number][] = []
    const outside: [number, number][] = []
    for (let i = 0; i < N; i++) {
      const row = i * DMAX
      const x0 = X[row]
      const x1 = X[row + 1]
      const visible = x0 >= lo && x0 <= hi && (d < 2 || (x1 >= lo && x1 <= hi))
      let all = visible
      for (let j = 2; all && j < d; j++) {
        const v = X[row + j]
        if (v < lo || v > hi) all = false
      }
      const p: [number, number] = [x0, x1]
      if (all) inside.push(p)
      else if (visible) looks.push(p)
      else outside.push(p)
    }
    return { inside, looks, outside }
  }, [X, d, lo, hi])

  const frac = s ** d
  const expected = N * frac
  const curve: [number, number][] = Array.from({ length: DMAX }, (_, k) => [k + 1, Math.max(-3.4, Math.log10(N * s ** (k + 1)))])
  const found = inside.length

  return (
    <Figure
      wide
      title="How many neighbours does a new point have?"
      caption={
        <>
          Each dot is one of 1,000 random data points, drawn at its first two features. The shaded box around the query point ✕ covers a share{' '}
          <M>s</M> of <em>every</em> feature's range. Slide the number of features <M>d</M> up: the picture barely changes, but the solid
          orange dots (inside the box in all <M>d</M> features) vanish. Hollow dots look close, yet are far away in a feature you cannot
          see. Each feature is one more test a point must pass, so the box holds only <M>{'s^d'}</M> of the space.
        </>
      }
    >
      <div
        ref={ref}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: narrow ? '0.75rem' : '1.25rem', alignItems: 'start' }}
      >
        <div style={{ display: 'grid', gap: '0.35rem', minWidth: 0 }}>
          <div style={small}>{d === 1 ? 'Feature 1 only (dots spread up and down so you can see them)' : `Features 1 and 2 of ${d}`}</div>
          <Plot
            x={[0, 1]}
            y={[0, 1]}
            width={320}
            height={320}
            maxWidth={380}
            margin={{ left: 34, bottom: 42, top: 22, right: 10 }}
            ariaLabel={`1000 random points in ${d} dimensions; ${found} are inside a box covering ${Math.round(s * 100)}% of each feature`}
          >
            <Rect x0={lo} x1={hi} y0={d < 2 ? 0 : lo} y1={d < 2 ? 1 : hi} fill="color-mix(in srgb, var(--viz-2) 16%, transparent)" stroke="var(--viz-2)" />
            <Axes xLabel="feature 1" yLabel={d < 2 ? '' : 'feature 2'} xTicks={4} yTicks={4} hideYTicks={d < 2} />
            <DotCloud pts={outside} r={1.6} style={{ fill: 'var(--viz-muted)', opacity: 0.75 }} />
            <DotCloud pts={looks} r={3} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1.4 }} />
            <DotCloud pts={inside} r={3.6} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 0.8 }} />
            <Dots points={[{ x: 0.5, y: 0.5, shape: 'cross', r: 6, color: 'var(--viz-ink)' }]} />
          </Plot>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.9rem', justifyContent: 'center', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              <Swatch kind="in" /> {d === 1 ? 'neighbour (inside the box)' : `neighbour in all ${d} features`}: <b className="tabular">{found}</b>
            </span>
            {d > 2 && (
              <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                <Swatch kind="look" /> close here, far in a hidden feature: <b className="tabular">{looks.length}</b>
              </span>
            )}
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              <Swatch kind="out" /> not close
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '0.35rem', minWidth: 0 }}>
          <div style={small}>Expected neighbours out of 1,000</div>
          <Plot
            x={[0.5, DMAX + 0.5]}
            y={[-3.4, 3.2]}
            width={320}
            height={320}
            maxWidth={380}
            margin={{ left: 46, bottom: 42, top: 22, right: 10 }}
            ariaLabel={`Expected neighbours 1000 times ${s} to the power d, falling on a log scale; at d = ${d} it is ${fmtExpected(expected)}`}
          >
            <Grid xTicks={4} yTicks={6} />
            <Axes xLabel="number of features d" xTicks={4} hideYTicks />
            <LogYTicks from={-3} to={3} />
            <HLine y={0} color="var(--viz-neg)" label="1 neighbour" />
            <VLine x={d} color="var(--viz-muted)" />
            <Path points={curve} color="var(--viz-2)" width={2.5} />
            <Dots points={curve.map(([x, y]) => ({ x, y, r: x === d ? 6.5 : 2.6, color: 'var(--viz-2)' }))} />
            {found > 0 ? (
              <DotCloud pts={[[d, Math.log10(found)]]} r={9} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 2.2 }} />
            ) : (
              <Label x={d} y={-3.4} dy={-6} dx={d > 14 ? -6 : 6} anchor={d > 14 ? 'end' : 'start'} color="var(--viz-1)">
                0 found
              </Label>
            )}
            <Label x={DMAX + 0.5} y={3.2} dx={-4} dy={14} anchor="end" color="var(--viz-ink)">
              {`1000 × ${s.toFixed(2)}`}
              <tspan dy={-6} style={{ fontSize: 10 }}>
                d
              </tspan>
            </Label>
          </Plot>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.9rem', justifyContent: 'center', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              <Swatch kind="in" /> expected
            </span>
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
              <Swatch kind="look" /> actually found in this sample
            </span>
          </div>
        </div>
      </div>
      <Controls>
        <Slider label="number of features d" value={d} min={1} max={DMAX} step={1} onChange={setD} />
        <Slider label="box width s (share of each feature)" value={s} min={0.1} max={0.9} step={0.05} onChange={setS} format={(v) => v.toFixed(2)} />
      </Controls>
      <Readout
        items={[
          ['share of space in the box', <span key="f">
              {s.toFixed(2)}
              <sup>{d}</sup> = {fmtPct(frac)}
            </span>],
          ['neighbours expected', fmtExpected(expected)],
          ['data needed for 10 neighbours', fmtBig(10 / frac)],
        ]}
      />
    </Figure>
  )
}
