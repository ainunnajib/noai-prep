import { useState } from 'react'
import { Figure, Controls, Segmented, Button, Bars, Plot, Arrow, Label, usePlot, useNarrow } from '../../../../../kit'
import { CLUSTERS, WORDS, byWord, nearest } from './embData'
import { TryNotice } from '../Caption'
import s from './emb.module.css'

/*
  A 2-D view of the lesson's toy 16-number word vectors. Neighbours and analogies are computed
  with cosine similarity on the FULL vectors; the map is a linear projection, so the analogy
  parallelogram b - a + c is drawn exactly.
*/

const COLORS = ['var(--viz-1)', 'var(--viz-4)', 'var(--viz-2)', 'var(--viz-3)']
const PRESETS: [string, string, string][] = [
  ['man', 'king', 'woman'],
  ['japan', 'tokyo', 'france'],
  ['coffee', 'kopi', 'tea'],
  ['man', 'boy', 'woman'],
]
// plot domain; an analogy star outside it is drawn at the edge
const XD: [number, number] = [-5.2, 5.0]
const YD: [number, number] = [-4.9, 4.8]
const EDGE = 0.35
const inside = (v: number, [lo, hi]: [number, number]) => Math.min(hi - EDGE, Math.max(lo + EDGE, v))
const ARROW = 'var(--viz-ink)'
// label placement tweaks so names do not collide on small screens
const BELOW = new Set(['prata', 'satay', 'laksa', 'train', 'car', 'france', 'tea', 'teh', 'japan', 'korea'])

function Points({ selected, faded, onPick, small }: { selected: Set<string>; faded: boolean; onPick: (w: string) => void; small: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {WORDS.map((w) => {
        const x = xs(w.xy[0])
        const y = ys(w.xy[1])
        const on = selected.has(w.word)
        const below = BELOW.has(w.word)
        return (
          <g
            key={w.word}
            className={s.point}
            role="button"
            tabIndex={0}
            aria-label={`${w.word} (${CLUSTERS[w.cluster]})`}
            onClick={() => onPick(w.word)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onPick(w.word)
              }
            }}
            style={{ opacity: faded && !on ? 0.35 : 1 }}
          >
            <circle cx={x} cy={y} r={14} style={{ fill: 'transparent' }} />
            <circle cx={x} cy={y} r={on ? 7 : 5} style={{ fill: COLORS[w.cluster], stroke: on ? 'var(--ink)' : 'var(--surface)', strokeWidth: on ? 2 : 1.5 }} />
            <text
              className={s.pointLabel}
              x={x}
              y={below ? y + (small ? 15 : 17) : y - (small ? 8 : 10)}
              textAnchor="middle"
              style={{ fill: on ? 'var(--ink)' : COLORS[w.cluster], fontSize: small ? 11 : 12.5 }}
            >
              {w.word}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Lines({ from, to }: { from: string; to: string[] }) {
  const { xs, ys } = usePlot()
  const a = byWord(from).xy
  return (
    <g>
      {to.map((t) => {
        const b = byWord(t).xy
        return <line key={t} x1={xs(a[0])} y1={ys(a[1])} x2={xs(b[0])} y2={ys(b[1])} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
      })}
    </g>
  )
}

function Star({ x, y }: { x: number; y: number }) {
  const { xs, ys } = usePlot()
  const cx = xs(x)
  const cy = ys(y)
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 4.5 : 10
    const t = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} style={{ fill: 'var(--highlight)', stroke: 'var(--ink)', strokeWidth: 1.2 }} />
}

export default function EmbeddingSpace2D() {
  const [mode, setMode] = useState<'near' | 'analogy'>('near')
  const [focus, setFocus] = useState('king')
  const [abc, setAbc] = useState<[string, string, string]>(PRESETS[0])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const nn = nearest(byWord(focus).vec, [focus], 3)
  const [a, b, c] = abc
  const va = byWord(a)
  const vb = byWord(b)
  const vc = byWord(c)
  const target = vb.vec.map((x, i) => x - va.vec[i] + vc.vec[i])
  const txy: [number, number] = [vb.xy[0] - va.xy[0] + vc.xy[0], vb.xy[1] - va.xy[1] + vc.xy[1]]
  const sxy: [number, number] = [inside(txy[0], XD), inside(txy[1], YD)]
  const offMap = sxy[0] !== txy[0] || sxy[1] !== txy[1]
  const ans = nearest(target, [a, b, c], 3)

  const pick = (w: string) => {
    if (mode === 'near') setFocus(w)
    else setAbc(([x, y]) => [x, y, w])
  }
  const selected = mode === 'near' ? new Set([focus, ...nn.map((n) => n.word)]) : new Set([a, b, c, ans[0].word])
  const opts = WORDS.map((w) => w.word)
  const sel = (i: 0 | 1 | 2, label: string) => (
    <label className={s.label} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <span className={s.small}>{label}</span>
      <select
        className={s.select}
        value={abc[i]}
        onChange={(e) => setAbc((cur) => cur.map((x, k) => (k === i ? e.target.value : x)) as [string, string, string])}
      >
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <Figure
      wide
      title="Meaning becomes geometry"
      caption={
        <TryNotice
          tryIt={
            <>
              tap a word in <b>neighbours</b> mode, then switch to <b>analogy</b> and try the presets.
            </>
          }
          notice={
            <>
              a word&apos;s nearest neighbours share its topic, and adding the arrow <i>b − a</i> to <i>c</i> (dashed) lands near the answer (the star).
            </>
          }
          note={<>Real embeddings have hundreds of dimensions; this 2-D map is a squashed view of a toy embedding.</>}
        />
      }
    >
      <Controls>
        <Segmented
          label="mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'near', label: 'neighbours' },
            { value: 'analogy', label: 'analogy' },
          ]}
        />
        {mode === 'analogy' && (
          <div className={s.row} style={{ width: 'auto' }}>
            {PRESETS.map((p) => (
              <Button key={p.join()} onClick={() => setAbc(p)}>
                {`${p[0]} : ${p[1]} :: ${p[2]} : ?`}
              </Button>
            ))}
          </div>
        )}
      </Controls>
      <div ref={wrapRef} style={{ width: '100%' }}>
        <Plot x={XD} y={YD} width={620} height={440} maxWidth={680} minHeight={narrow ? 380 : undefined} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} ariaLabel="Map of word embeddings: people top left, places top right, food and drink bottom left, transport bottom right">
          {mode === 'near' && <Lines from={focus} to={nn.map((n) => n.word)} />}
          {mode === 'analogy' && (
            <>
              <Arrow from={va.xy} to={vb.xy} color={ARROW} width={3} />
              <Arrow from={vc.xy} to={sxy} color={ARROW} width={3} dash="6 4" />
            </>
          )}
          <Points selected={selected} faded={mode === 'analogy'} onPick={pick} small={narrow} />
          {mode === 'analogy' && <Star x={sxy[0]} y={sxy[1]} />}
          {mode === 'analogy' && offMap && (
            <Label x={sxy[0]} y={sxy[1]} dy={sxy[1] > 0 ? 24 : -16} anchor={sxy[0] > 0 ? 'end' : 'start'} color="var(--ink)" weight={700}>
              star is off the map
            </Label>
          )}
        </Plot>
        <div className={s.row} style={{ justifyContent: 'center', marginTop: 4 }} aria-hidden="true">
          {CLUSTERS.map((name, i) => (
            <span key={name} className={s.small} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ink-2)', fontWeight: 700 }}>
              <i style={{ width: 10, height: 10, borderRadius: 5, background: COLORS[i], display: 'inline-block' }} />
              {name}
            </span>
          ))}
        </div>
      </div>
      {mode === 'near' ? (
        <div className={s.panel}>
          <span className={s.label}>
            Nearest to <b style={{ color: 'var(--ink)' }}>{focus}</b> (cosine similarity on all 16 numbers)
          </span>
          <Bars data={nn.map((n, k) => ({ label: n.word, value: n.cos, strong: k === 0, color: COLORS[byWord(n.word).cluster] }))} max={1} ariaLabel={`Nearest neighbours of ${focus}`} />
        </div>
      ) : (
        <div className={s.panel}>
          <div className={s.row}>
            {sel(0, 'a')}
            {sel(1, 'b')}
            {sel(2, 'c')}
          </div>
          <span className={s.equation}>
            {b} − {a} + {c} = star → nearest word (not counting {a}, {b}, {c}){offMap ? ' (the star lies off this map, so it is drawn at the edge)' : ''}:
          </span>
          <Bars data={ans.map((n, k) => ({ label: n.word, value: n.cos, strong: k === 0, color: k === 0 ? 'var(--viz-2)' : 'var(--viz-1)' }))} max={1} ariaLabel="Words nearest to the analogy result" />
        </div>
      )}
    </Figure>
  )
}
