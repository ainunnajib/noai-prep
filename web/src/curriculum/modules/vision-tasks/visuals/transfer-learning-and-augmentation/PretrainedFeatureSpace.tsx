import { useMemo, useState } from 'react'
import { Figure, Segmented, Plot, usePlot, useNarrow } from '../../../../../kit'
import { Thumb, CLASS_NAMES, CLASS_STYLE } from './drawings'
import { FEATURE_DATA } from './featureData'
import css from './tl.module.css'

/*
  Raw pixels versus pretrained features. 60 small images (cats, houses, cars with random
  position, size and colours) are shown as points on a 2-D map (PCA) of either
  - their raw pixel values (3,072 numbers each), or
  - the 64 features from a small CNN that was trained on a DIFFERENT task (telling 8 basic
    shapes apart) and then frozen: a miniature of an ImageNet-pretrained encoder.
  All coordinates, neighbour lists and accuracies were computed in Python (PyTorch +
  scikit-learn) from the same drawings, and are stored in featureData.ts.
  Aha: a pretrained encoder turns images into vectors where classes are already nearly separable.
*/

type Space = 'raw' | 'feat'
const { items, stats } = FEATURE_DATA

function Marker({ x, y, cls, r, dim, ring }: { x: number; y: number; cls: number; r: number; dim: boolean; ring: boolean }) {
  const { color, shape } = CLASS_STYLE[cls]
  const st = { fill: color, stroke: ring ? 'var(--viz-ink)' : 'var(--surface)', strokeWidth: ring ? 2 : 1.3 }
  let mark
  if (shape === 'square') mark = <rect x={-r * 0.9} y={-r * 0.9} width={r * 1.8} height={r * 1.8} style={st} />
  else if (shape === 'triangle') mark = <path d={`M0,${-r * 1.15}L${r * 1.05},${r * 0.8}L${-r * 1.05},${r * 0.8}Z`} style={st} />
  else mark = <circle r={r} style={st} />
  return (
    <g style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 650ms cubic-bezier(.4,.1,.2,1), opacity 300ms', opacity: dim ? 0.6 : 1 }}>{mark}</g>
  )
}

function Layer({ space, sel }: { space: Space; sel: number }) {
  const { xs, ys } = usePlot()
  const pos = (i: number) => {
    const p = space === 'raw' ? items[i].raw : items[i].feat
    return [xs(p[0]), ys(p[1])] as const
  }
  const nn = space === 'raw' ? items[sel].nnRaw : items[sel].nnFeat
  const [sx, sy] = pos(sel)
  return (
    <g>
      {nn.map((j) => {
        const [x, y] = pos(j)
        const same = items[j].cls === items[sel].cls
        return (
          <line
            key={`l${j}`}
            x1={sx}
            y1={sy}
            x2={x}
            y2={y}
            style={{ stroke: same ? 'var(--viz-pos)' : 'var(--viz-neg)', strokeWidth: 2, strokeDasharray: same ? undefined : '5 4', transition: 'all 650ms cubic-bezier(.4,.1,.2,1)' }}
          />
        )
      })}
      {[...items.keys()].sort((a, b) => Number(a === sel || nn.includes(a)) - Number(b === sel || nn.includes(b)) || Number(a === sel) - Number(b === sel)).map((i) => {
        const it = items[i]
        const [x, y] = pos(i)
        const near = i === sel || nn.includes(i)
        return <Marker key={i} x={x} y={y} cls={it.cls} r={i === sel ? 9 : near ? 7 : 6} dim={!near} ring={near} />
      })}
    </g>
  )
}

const pct = (v: number) => `${Math.round(v * 100)}%`

export default function PretrainedFeatureSpace() {
  const [space, setSpace] = useState<Space>('raw')
  const [sel, setSel] = useState(FEATURE_DATA.start)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const nn = space === 'raw' ? items[sel].nnRaw : items[sel].nnFeat
  const nSame = nn.filter((j) => items[j].cls === items[sel].cls).length

  const pick = useMemo(
    () => (p: [number, number]) => {
      let best = -1
      let bd = Infinity
      items.forEach((it, i) => {
        const q = space === 'raw' ? it.raw : it.feat
        const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2
        if (d < bd) {
          bd = d
          best = i
        }
      })
      if (best >= 0 && bd < 0.04) setSel(best)
    },
    [space],
  )

  const s = stats
  return (
    <Figure
      title="Raw pixels or pretrained features?"
      caption={
        <>
          Each dot is one of 60 small images, placed on a 2-D map so that images with similar numbers sit close together. Start with <b>raw pixels</b>: tap a dot
          and its 5 nearest neighbours light up (green line: same class; red dashed: different class). Then switch to the <b>pretrained encoder</b>, a small CNN
          that was trained only to tell basic shapes apart and then frozen. Without ever seeing a cat, house or car label, it already groups them.
        </>
      }
    >
      <Segmented
        label="Describe each image by"
        value={space}
        onChange={setSpace}
        options={[
          { value: 'raw', label: 'raw pixels (3,072 numbers)' },
          { value: 'feat', label: 'pretrained encoder (64 features)' },
        ]}
      />
      <div ref={wrapRef} className={css.fsWrap} style={{ gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1.25fr) minmax(0, 1fr)' }}>
        <div style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
          <Plot
            x={[-1.12, 1.12]}
            y={[-1.12, 1.12]}
            width={400}
            height={360}
            maxWidth={480}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
            ariaLabel={`Map of 60 images using ${space === 'raw' ? 'raw pixels' : 'pretrained features'}. Selected image is a ${CLASS_NAMES[items[sel].cls]}; ${nSame} of its 5 nearest neighbours share its class.`}
            onPointerDown={pick}
          >
            <rect x={0} y={0} width="100%" height="100%" style={{ fill: 'transparent', cursor: 'pointer' }} />
            <Layer space={space} sel={sel} />
          </Plot>
          <div className={css.legend}>
            {CLASS_NAMES.map((n, c) => (
              <span key={n}>
                <svg width={14} height={14} viewBox="-8 -8 16 16" aria-hidden="true">
                  {CLASS_STYLE[c].shape === 'circle' && <circle r={5.5} style={{ fill: CLASS_STYLE[c].color }} />}
                  {CLASS_STYLE[c].shape === 'square' && <rect x={-5} y={-5} width={10} height={10} style={{ fill: CLASS_STYLE[c].color }} />}
                  {CLASS_STYLE[c].shape === 'triangle' && <path d="M0,-6L5.8,4.4L-5.8,4.4Z" style={{ fill: CLASS_STYLE[c].color }} />}
                </svg>
                {n}
              </span>
            ))}
          </div>
        </div>
        <div className={css.fsSide}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Thumb p={items[sel]} size={64} />
            <div className={css.small}>
              Selected: a <b>{CLASS_NAMES[items[sel].cls]}</b>.<br />
              <b style={{ color: nSame >= 4 ? 'var(--viz-pos)' : nSame <= 2 ? 'var(--viz-neg)' : 'var(--ink)' }}>{nSame} of its 5</b> nearest neighbours are also{' '}
              {CLASS_NAMES[items[sel].cls]}s.
            </div>
          </div>
          <div className={css.nnRow} aria-label="Five nearest neighbours">
            {nn.map((j) => (
              <div key={j} className={css.nnItem}>
                <Thumb p={items[j]} size={44} />
                <span>
                  {CLASS_NAMES[items[j].cls]} <b style={{ color: items[j].cls === items[sel].cls ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{items[j].cls === items[sel].cls ? '✓' : '✗'}</b>
                </span>
              </div>
            ))}
          </div>
          <div className={css.small} style={{ marginTop: 4 }}>
            How well can a simple method tell the 3 classes apart?
          </div>
          <div className={css.statGrid}>
            <span />
            <span className={`${css.hd}${space === 'raw' ? ` ${css.on}` : ''}`}>pixels</span>
            <span className={`${css.hd}${space === 'feat' ? ` ${css.on}` : ''}`}>encoder</span>
            <span>nearest neighbour has the same class</span>
            <span className={css.num}>{pct(s.raw.nn1)}</span>
            <span className={css.num}>{pct(s.feat.nn1)}</span>
            <span>linear classifier trained on just 5 images per class</span>
            <span className={css.num}>{pct(s.raw.lin5)}</span>
            <span className={css.num}>{pct(s.feat.lin5)}</span>
          </div>
          <div className={css.small} style={{ color: 'var(--ink-3)' }}>
            Guessing would score 33%. Neighbours are found using all the numbers, not just the 2-D map.
          </div>
        </div>
      </div>
    </Figure>
  )
}
