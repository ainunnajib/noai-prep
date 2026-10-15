import { useState } from 'react'
import { Figure } from '../../../../../kit'
import { fmt } from './shared'
import s from './vectors.module.css'

/*
  The same three words as one-hot vectors (sparse, one slot per vocabulary word) and as small
  made-up embeddings (dense). Every row and column is labelled; tap a word to compare its two rows.
*/

const VOCAB = ['cat', 'dog', 'rice', 'noodle', 'bus']
const WORDS = ['cat', 'dog', 'rice']
const EMB = [
  [0.8, 0.6, -0.3],
  [0.7, 0.7, -0.2],
  [-0.4, 0.1, 0.9],
]

/** Blue for negative, orange for positive, stronger for bigger values. */
const heat = (v: number) =>
  v === 0 ? undefined : `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round(Math.min(1, Math.abs(v)) * 62)}%, var(--surface))`

function Grid({
  title,
  cols,
  rows,
  sel,
  setSel,
  colHead,
}: {
  title: string
  cols: string[]
  rows: number[][]
  sel: number
  setSel: (i: number) => void
  colHead: string
}) {
  return (
    <div className={s.wv}>
      <div className={s.wvTitle}>{title}</div>
      <table className={s.wvTable} aria-label={title}>
        <thead>
          <tr>
            <th scope="col" className={s.wvCorner}>
              {colHead}
            </th>
            {cols.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={WORDS[i]} className={i === sel ? s.wvSel : undefined}>
              <th scope="row">
                <button type="button" className={s.wvWord} aria-pressed={i === sel} onClick={() => setSel(i)}>
                  {WORDS[i]}
                </button>
              </th>
              {r.map((v, j) => (
                <td key={j} style={{ background: heat(v) }}>
                  {fmt(v, 1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function WordVectors() {
  const [sel, setSel] = useState(1)
  const oneHot = WORDS.map((w) => VOCAB.map((v) => (v === w ? 1 : 0)))
  const word = WORDS[sel]
  return (
    <Figure
      title="Two ways to turn a word into a vector"
      caption={
        <>
          Each <b>row</b> is one word's vector. Left: one-hot, with one column per vocabulary word and a single 1 in the word's own column. Right: a
          made-up 3-number embedding (columns are just the 1st, 2nd and 3rd numbers). Tap <b>cat</b>, then <b>dog</b>: their one-hot rows share nothing,
          but their embedding rows are almost the same list.
        </>
      }
    >
      <div className={s.wvPair}>
        <Grid title="One-hot (sparse)" cols={VOCAB} rows={oneHot} sel={sel} setSel={setSel} colHead="word" />
        <Grid title="Embedding (dense, made-up values)" cols={['1st', '2nd', '3rd']} rows={EMB} sel={sel} setSel={setSel} colHead="word" />
      </div>
      <p className={s.reading} style={{ maxWidth: 'none' }} aria-live="polite">
        <b>{word}</b> one-hot: [{oneHot[sel].join(', ')}] ({VOCAB.length} numbers, almost all 0). <b>{word}</b> embedding: [{EMB[sel].map((v) => fmt(v, 1)).join(', ')}]
        (3 numbers, none of them 0).
      </p>
    </Figure>
  )
}
