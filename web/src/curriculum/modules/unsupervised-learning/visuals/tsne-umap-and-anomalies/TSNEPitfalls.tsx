import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, useNarrow } from '../../../../../kit'
import { density, distance, noise, type TrickSet } from './pitfallData'
import { unflatten, bounds, DotCloud, Frame, type XY } from './shared'

/*
  Three trick datasets and their t-SNE maps (precomputed with scikit-learn at perplexity 2, 5, 30, 50).
  Each map was rotated, uniformly scaled and shifted to sit on top of the real data, so sizes and gaps in the
  two panels can be compared directly. Guess the real layout from the map, then reveal it.
*/

type DS = 'density' | 'distance' | 'noise'
const SETS: Record<DS, TrickSet> = { density, distance, noise }
const PERP = [2, 5, 30, 50]
const COLOURS: Record<DS, string[]> = {
  density: ['var(--viz-1)', 'var(--viz-2)'],
  distance: ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-2)'],
  noise: ['var(--viz-5)'],
}
const QUESTION: Record<DS, string> = {
  density: 'Guess first: in the real data, which group is more spread out, blue or orange?',
  distance: 'Guess first: in the real data, are the three groups evenly spaced?',
  noise: 'Guess first: how many groups are there in the real data?',
}

const head: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: 2 }

function centroid(p: XY[]): XY {
  return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length]
}
function spread(p: XY[]): number {
  const [cx, cy] = centroid(p)
  return Math.sqrt(p.reduce((s, [x, y]) => s + (x - cx) ** 2 + (y - cy) ** 2, 0) / p.length)
}
const dist = (a: XY, b: XY) => Math.hypot(a[0] - b[0], a[1] - b[1])

/** the number each trick is about: spread ratio (density) or far gap / near gap (distance) */
function measure(ds: DS, pts: XY[], group: number[]): number | null {
  const by = (g: number) => pts.filter((_, i) => group[i] === g)
  if (ds === 'density') return spread(by(1)) / spread(by(0))
  if (ds === 'distance') {
    const c = [0, 1, 2].map((g) => centroid(by(g)))
    return dist(c[1], c[2]) / dist(c[0], c[1])
  }
  return null
}

function Panel({ pts, group, ds, x, y, label }: { pts: XY[]; group: number[]; ds: DS; x: [number, number]; y: [number, number]; label: string }) {
  const cols = COLOURS[ds]
  return (
    <Plot x={x} y={y} width={340} height={340} maxWidth={400} margin={{ left: 6, right: 6, top: 6, bottom: 6 }} ariaLabel={label}>
      <Frame />
      {cols.map((c, g) => (
        <DotCloud key={g} pts={pts.filter((_, i) => group[i] === g)} r={3.4} style={{ fill: c, stroke: 'var(--surface)', strokeWidth: 1.5, paintOrder: 'stroke' }} />
      ))}
    </Plot>
  )
}

export default function TSNEPitfalls() {
  const [ds, setDs] = useState<DS>('density')
  const [pi, setPi] = useState(2)
  const [shown, setShown] = useState<Record<DS, boolean>>({ density: false, distance: false, noise: false })
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)

  const set = SETS[ds]
  const box = useMemo(() => {
    const b = bounds(Object.values(set.maps))
    // square frame so both axes share one scale
    const w = Math.max(b.x[1] - b.x[0], b.y[1] - b.y[0]) / 2
    const cx = (b.x[0] + b.x[1]) / 2
    const cy = (b.y[0] + b.y[1]) / 2
    return { x: [cx - w, cx + w] as [number, number], y: [cy - w, cy + w] as [number, number] }
  }, [set])
  const real = useMemo(() => unflatten(set.maps.true), [set])
  const map = useMemo(() => unflatten(set.maps[`tsne${PERP[pi]}`]), [set, pi])
  const mReal = measure(ds, real, set.group)
  const mMap = measure(ds, map, set.group)
  const revealed = shown[ds]

  const items: [string, string][] =
    ds === 'density'
      ? [
          ['orange spread ÷ blue spread: map', `${mMap!.toFixed(1)}×`],
          ['real', revealed ? `${mReal!.toFixed(1)}×` : '?'],
        ]
      : ds === 'distance'
        ? [
            ['far gap ÷ near gap: map', `${mMap!.toFixed(1)}×`],
            ['real', revealed ? `${mReal!.toFixed(1)}×` : '?'],
          ]
        : [['real groups', revealed ? '1 (pure noise)' : '?']]

  return (
    <Figure
      wide
      title="Three ways a t-SNE map can fool you"
      caption={
        <>
          The left panel is a t-SNE map. Answer the question under it, then reveal the real data. <b>Different spreads:</b> one group is about 10 times
          more spread out than the other, yet t-SNE draws them at nearly the same size. <b>Different gaps:</b> one group is much farther away, yet t-SNE spaces
          them almost evenly (perplexity 50 does a little better). <b>Pure noise:</b> at perplexity 2 or 5 a single random blob breaks into
          clumps that look like clusters. Cluster sizes and gaps in a t-SNE map are not evidence; who is next to whom is.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: narrow ? '0.9rem' : '1.25rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={head}>t-SNE map, perplexity {PERP[pi]}</div>
          <Panel pts={map} group={set.group} ds={ds} x={box.x} y={box.y} label={`t-SNE map at perplexity ${PERP[pi]}`} />
          <div style={{ fontSize: '0.875rem', color: 'var(--ink-2)', textAlign: 'center', marginTop: 4 }}>{QUESTION[ds]}</div>
        </div>
        <div style={{ minWidth: 0, position: 'relative' }}>
          <div style={head}>{ds === 'noise' ? 'The real data' : 'The real data (same scale)'}</div>
          {revealed ? (
            <Panel pts={real} group={set.group} ds={ds} x={box.x} y={box.y} label="The real 2-D layout of the data" />
          ) : (
            <div
              style={{
                aspectRatio: '1 / 1',
                maxWidth: 400,
                margin: '0 auto',
                border: '1.5px dashed var(--rule)',
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--surface-2)',
              }}
            >
              <Button primary onClick={() => setShown({ ...shown, [ds]: true })}>
                Reveal the real data
              </Button>
            </div>
          )}
        </div>
      </div>
      <Controls>
        <Segmented
          label="dataset"
          value={ds}
          onChange={setDs}
          options={[
            { value: 'density', label: 'different spreads' },
            { value: 'distance', label: 'different gaps' },
            { value: 'noise', label: 'pure noise' },
          ]}
        />
        <Segmented label="perplexity" value={pi} onChange={setPi} options={PERP.map((p, i) => ({ value: i, label: String(p) }))} />
        <Readout items={items} />
      </Controls>
    </Figure>
  )
}
