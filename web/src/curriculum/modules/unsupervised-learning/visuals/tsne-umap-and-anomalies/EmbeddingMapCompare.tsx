import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Path, M, useNarrow, usePlot } from '../../../../../kit'
import { digits, roll, type EmbedSet } from './embedData'
import { DIGIT_COLOURS, rampColour, unflatten, nearest, neighbourKeep, closest, DotCloud, Rings, Frame, type XY } from './shared'

/*
  The same 500 points mapped to 2-D three ways: PCA (linear), t-SNE and UMAP (non-linear, precomputed in
  Python at several settings). Pick a point: rings mark its 10 nearest neighbours in the ORIGINAL space
  (64-D for digits, 3-D for the roll). A good map keeps those rings close to the chosen point.
*/

type DS = 'digits' | 'roll'
type Method = 'tsne' | 'umap'
const PERP = [5, 15, 30, 50]
const NNB = [5, 15, 50]
const DATA: Record<DS, EmbedSet> = { digits, roll }
const START: Record<DS, number> = { digits: digits.value.indexOf(8), roll: 7 }

const head: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: 2 }

function colourOf(ds: DS, v: number) {
  return ds === 'digits' ? DIGIT_COLOURS[v] : rampColour(v)
}

/** digit numerals just above the median position of each class */
function ClassLabels({ pts, labels }: { pts: XY[]; labels: number[] }) {
  const { xs, ys } = usePlot()
  const med = (a: number[]) => {
    const s = [...a].sort((p, q) => p - q)
    return s[Math.floor(s.length / 2)]
  }
  return (
    <g aria-hidden="true">
      {Array.from({ length: 10 }, (_, d) => {
        const mine = pts.filter((_, i) => labels[i] === d)
        const x = xs(med(mine.map((p) => p[0])))
        // sit just above the island so small, tight islands (UMAP) stay visible under their label
        const y = ys(med(mine.map((p) => p[1]))) - 13
        return (
          <text
            key={d}
            x={x}
            y={y}
            dy="0.35em"
            textAnchor="middle"
            style={{ fontSize: 17, fontWeight: 800, fill: DIGIT_COLOURS[d], stroke: 'var(--surface)', strokeWidth: 4, paintOrder: 'stroke' }}
          >
            {d}
          </text>
        )
      })}
    </g>
  )
}

function MapPanel({ title, ds, pts, sel, onPick, ariaLabel }: { title: ReactNode; ds: DS; pts: XY[]; sel: number; onPick: (i: number) => void; ariaLabel: string }) {
  const set = DATA[ds]
  const groups = useMemo(() => {
    const g = new Map<string, XY[]>()
    pts.forEach((p, i) => {
      const c = colourOf(ds, set.value[i])
      if (!g.has(c)) g.set(c, [])
      g.get(c)!.push(p)
    })
    return [...g.entries()]
  }, [pts, ds, set])
  const nn = set.nn[sel]
  const mapNear = useMemo(() => new Set(nearest(pts, sel, 10)), [pts, sel])
  const kept = nn.filter((j) => mapNear.has(j)).length
  const pick = (p: XY) => onPick(closest(pts, p))
  return (
    <div style={{ minWidth: 0 }}>
      <div style={head}>{title}</div>
      <Plot x={[-1.08, 1.08]} y={[-1.08, 1.08]} width={340} height={340} maxWidth={400} margin={{ left: 6, right: 6, top: 6, bottom: 6 }} ariaLabel={ariaLabel} onPointerMove={pick} onPointerDown={pick}>
        <Frame />
        {groups.map(([c, g]) => (
          <DotCloud key={c} pts={g} r={2.8} style={{ fill: c, opacity: 0.85 }} />
        ))}
        {nn.map((j) => (
          <Path key={j} points={[pts[sel], pts[j]]} color="var(--viz-ink)" width={1.2} opacity={0.55} />
        ))}
        <Rings pts={nn.map((j) => pts[j])} r={5.5} colour="var(--viz-ink)" width={1.8} />
        {ds === 'digits' && <ClassLabels pts={pts} labels={set.value} />}
        <Rings pts={[pts[sel]]} r={8} colour="var(--accent)" width={3} />
      </Plot>
      <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
        chosen point: <b className="tabular">{kept} of 10</b> true neighbours are also its map neighbours
      </div>
    </div>
  )
}

export default function EmbeddingMapCompare() {
  const [ds, setDs] = useState<DS>('digits')
  const [method, setMethod] = useState<Method>('tsne')
  const [pi, setPi] = useState(2)
  const [ui, setUi] = useState(1)
  const [sel, setSel] = useState(START.digits)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)

  const set = DATA[ds]
  const key = method === 'tsne' ? `tsne${PERP[pi]}` : `umap${NNB[ui]}`
  const pca = useMemo(() => unflatten(set.maps.pca), [set])
  const other = useMemo(() => unflatten(set.maps[key]), [set, key])
  const keepPca = useMemo(() => neighbourKeep(pca, set.nn), [pca, set])
  const keepOther = useMemo(() => neighbourKeep(other, set.nn), [other, set])
  const name = method === 'tsne' ? `t-SNE, perplexity ${PERP[pi]}` : `UMAP, n_neighbors ${NNB[ui]}`
  const what = ds === 'digits' ? '64-D digit images' : '3-D Swiss roll'

  return (
    <Figure
      wide
      title="Two ways to flatten the same data"
      caption={
        <>
          Each dot is one data point; the same colours are used in both maps. Hover over (or tap) any dot: the rings mark its 10 nearest neighbours in the
          original {ds === 'digits' ? '64-dimensional pixel space' : '3-D space'}. In the PCA map they are often scattered; in the t-SNE or UMAP map they
          stay together, so the digits separate into clean islands. Switch to the Swiss roll, coloured by position along the roll: PCA piles the layers
          on top of each other, so far-apart colours mix, while the non-linear maps keep each neighbourhood together and the colour changes smoothly
          along each strip (though they may tear or fold the sheet). Now slide the setting and watch the picture change.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: narrow ? '0.9rem' : '1.25rem' }}>
        <MapPanel title={<>PCA (linear): keeps {Math.round(100 * keepPca)}% of neighbours</>} ds={ds} pts={pca} sel={sel} onPick={setSel} ariaLabel={`PCA map of ${what}`} />
        <MapPanel
          title={
            <>
              {name}: keeps {Math.round(100 * keepOther)}% of neighbours
            </>
          }
          ds={ds}
          pts={other}
          sel={sel}
          onPick={setSel}
          ariaLabel={`${name} map of ${what}`}
        />
      </div>
      {ds === 'digits' ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem 0.7rem', justifyContent: 'center', fontSize: '0.8125rem', color: 'var(--ink-2)', marginTop: 6 }}>
          {DIGIT_COLOURS.map((c, d) => (
            <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 5, background: c, display: 'inline-block' }} />
              {d}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.8125rem', color: 'var(--ink-2)', marginTop: 6 }}>
          <span>inner end of the roll</span>
          <span aria-hidden="true" style={{ width: 120, height: 10, borderRadius: 5, background: 'linear-gradient(90deg, var(--viz-1), var(--viz-2))' }} />
          <span>outer end</span>
        </div>
      )}
      <Controls>
        <Segmented
          label="data"
          value={ds}
          onChange={(d) => {
            setDs(d)
            setSel(START[d])
          }}
          options={[
            { value: 'digits', label: 'digits (64-D)' },
            { value: 'roll', label: 'Swiss roll (3-D)' },
          ]}
        />
        <Segmented
          label="right-hand map"
          value={method}
          onChange={setMethod}
          options={[
            { value: 'tsne', label: 't-SNE' },
            { value: 'umap', label: 'UMAP' },
          ]}
        />
        {method === 'tsne' ? (
          <Slider label="perplexity" value={pi} min={0} max={PERP.length - 1} step={1} onChange={setPi} format={(i) => PERP[i]} />
        ) : (
          <Slider label="n_neighbors" value={ui} min={0} max={NNB.length - 1} step={1} onChange={setUi} format={(i) => NNB[i]} />
        )}
        <Readout
          items={[
            ['neighbours kept: PCA', `${(100 * keepPca).toFixed(0)}%`],
            [method === 'tsne' ? 't-SNE' : 'UMAP', `${(100 * keepOther).toFixed(0)}%`],
          ]}
        />
      </Controls>
      <div style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', marginTop: 4 }}>
        <M>{'\\text{neighbours kept}'}</M> = average share of each point's 10 nearest neighbours in the original space that are also among its 10 nearest on the map.
      </div>
    </Figure>
  )
}
