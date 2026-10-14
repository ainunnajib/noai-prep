import { Fragment, useState } from 'react'
import { Figure, Controls, Segmented, Readout, useNarrow } from '../../../../../kit'
import { byWord, cosine } from './embData'
import s from './emb.module.css'

/*
  Cosine-similarity matrix for 8 words, with one-hot vectors (over these 8 words) or with the
  lesson's toy 16-number embeddings. One-hot gives the identity matrix: every pair of different
  words has similarity 0. Click a cell to see the two vectors.
*/

const WORDS8 = ['king', 'queen', 'man', 'woman', 'laksa', 'prata', 'mrt', 'bus']

const oneHot = (w: string) => WORDS8.map((x) => (x === w ? 1 : 0))
const fmtVec = (v: number[], max = 8) => `[${v.slice(0, max).map((x) => (Number.isInteger(x) ? String(x) : x.toFixed(2))).join(', ')}${v.length > max ? ', …' : ''}]`

export default function OneHotVsDense() {
  const [mode, setMode] = useState<'onehot' | 'dense'>('onehot')
  const [sel, setSel] = useState<[number, number]>([0, 1])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(430)

  const vec = (w: string) => (mode === 'onehot' ? oneHot(w) : byWord(w).vec)
  const M = WORDS8.map((a) => WORDS8.map((b) => cosine(vec(a), vec(b))))
  const [i, j] = sel
  const a = WORDS8[i]
  const b = WORDS8[j]
  const cell = narrow ? 31 : 44
  const bg = (v: number) => `color-mix(in srgb, var(--viz-1) ${Math.round(Math.max(0, v) * 70)}%, var(--surface))`
  const dist = Math.hypot(...vec(a).map((x, k) => x - vec(b)[k]))

  return (
    <Figure
      title="Every one-hot word is equally different"
      caption={
        <>
          Each cell is the cosine similarity of two words. With <b>one-hot</b> vectors the table is the identity: a word matches itself (1) and
          nothing else (0), so “king” is exactly as unlike “queen” as it is unlike “bus”, and every pair is the same distance <code>√2</code> apart.
          Switch to <b>embeddings</b> and blocks appear: royalty, people, food and transport words are similar to each other. Click any cell to see the
          two vectors.
        </>
      }
    >
      <Controls>
        <Segmented
          label="vectors"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'onehot', label: 'one-hot' },
            { value: 'dense', label: 'embedding' },
          ]}
        />
      </Controls>
      <div ref={wrapRef} className={s.scroll}>
        <div className={s.grid} style={{ gridTemplateColumns: `auto repeat(8, ${cell}px)`, fontSize: narrow ? 10.5 : 11.5 }} role="table" aria-label="Cosine similarity matrix">
          <span />
          {WORDS8.map((w) => (
            <span key={w} className={s.head} style={{ fontSize: narrow ? '0.62rem' : undefined }}>
              {w}
            </span>
          ))}
          {WORDS8.map((r, ri) => (
            <Fragment key={r}>
              <span className={s.rowHead}>{r}</span>
              {WORDS8.map((c, ci) => {
                const v = M[ri][ci]
                const on = ri === i && ci === j
                return (
                  <button
                    key={c}
                    type="button"
                    className={`${s.cellBtn} ${on ? s.cellSel : ''}`}
                    style={{ background: bg(v), minHeight: narrow ? 28 : 32, color: v > 0.6 ? 'var(--ink)' : undefined }}
                    onClick={() => setSel([ri, ci])}
                    aria-label={`cosine of ${r} and ${c}: ${v.toFixed(2)}`}
                  >
                    {v === 0 ? '0' : v === 1 ? '1' : v.toFixed(narrow ? 1 : 2)}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <div className={s.panel}>
        <span className={s.equation}>
          {a} = {fmtVec(vec(a))}
        </span>
        <span className={s.equation}>
          {b} = {fmtVec(vec(b))}
        </span>
        <span className={s.equation} style={{ fontWeight: 700 }}>
          cos({a}, {b}) = {M[i][j].toFixed(3)} · distance = {dist.toFixed(3)}
        </span>
      </div>
      <Readout
        items={[
          ['numbers per word', mode === 'onehot' ? '8 (one per vocabulary word; 50,000+ in real life)' : '16 (50 to 1,000 in real models)'],
          ['non-zero', mode === 'onehot' ? 'exactly 1' : 'almost all'],
        ]}
      />
    </Figure>
  )
}
