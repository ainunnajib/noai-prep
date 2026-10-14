import { useState } from 'react'
import { Figure, Controls, Segmented, Button, Bars, Plot, Arrow, usePlot, useNarrow } from '../../../../../kit'
import { CLUSTERS, WORDS, byWord, nearest } from './embData'
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
        <>
          24 words from a toy embedding, drawn in 2-D. In <b>neighbours</b> mode, tap a word to see the three words whose vectors have the highest
          cosine similarity: they come from the same topic. In <b>analogy</b> mode, the orange arrow is <i>b − a</i> (for example man → king,
          “add royalty”). Adding the same arrow to <i>c</i> lands on the star, and the nearest word to the star is the answer. Try the presets, then
          pick your own three words (tapping a word sets <i>c</i>). Real embeddings have hundreds of dimensions, and 2-D pictures like this one are
          squashed views of them.
        </>
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
        <Plot x={[-5.2, 5.0]} y={[-4.9, 4.8]} width={620} height={440} maxWidth={680} minHeight={narrow ? 380 : undefined} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} ariaLabel="Map of word embeddings: people top left, places top right, food and drink bottom left, transport bottom right">
          {mode === 'near' && <Lines from={focus} to={nn.map((n) => n.word)} />}
          {mode === 'analogy' && (
            <>
              <Arrow from={va.xy} to={vb.xy} color="var(--viz-2)" width={3} />
              <Arrow from={vc.xy} to={txy} color="var(--viz-2)" width={3} dash="6 4" />
            </>
          )}
          <Points selected={selected} faded={mode === 'analogy'} onPick={pick} small={narrow} />
          {mode === 'analogy' && <Star x={txy[0]} y={txy[1]} />}
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
            {b} − {a} + {c} = star → nearest word (not counting {a}, {b}, {c}):
          </span>
          <Bars data={ans.map((n, k) => ({ label: n.word, value: n.cos, strong: k === 0, color: k === 0 ? 'var(--viz-2)' : 'var(--viz-1)' }))} max={1} ariaLabel="Words nearest to the analogy result" />
        </div>
      )}
    </Figure>
  )
}
