import { Fragment, useMemo, useState } from 'react'
import { Figure, Controls, Toggle, Button, mulberry32, shuffled } from '../../../../../kit'
import { TryNotice } from '../Caption'
import s from './bow.module.css'

/*
  Bag of words: each sentence becomes a vector of counts over a shared vocabulary.
  Shuffling the words never changes the vector; adding bigrams (pairs of neighbouring
  words) brings back a little of the word order.
*/

const tokenise = (t: string) => (t.toLowerCase().match(/[a-z0-9']+/g) ?? []).slice(0, 14)
const bigrams = (w: string[]) => w.slice(0, -1).map((x, i) => `${x} ${w[i + 1]}`)

export default function BagOfWords() {
  const [a, setA] = useState('the dog chased the cat')
  const [b, setB] = useState('the cat chased the dog')
  const [useBigrams, setUseBigrams] = useState(false)
  const [seed, setSeed] = useState(1)

  const wa = tokenise(a)
  const wb = tokenise(b)
  const feats = (w: string[]) => (useBigrams ? [...w, ...bigrams(w)] : w)
  const fa = feats(wa)
  const fb = feats(wb)

  const vocab = useMemo(() => {
    const uni = [...new Set([...wa, ...wb])].sort()
    const bi = useBigrams ? [...new Set([...bigrams(wa), ...bigrams(wb)])].sort() : []
    return [...uni, ...bi]
  }, [wa.join(' '), wb.join(' '), useBigrams])

  const count = (f: string[], t: string) => f.filter((x) => x === t).length
  const va = vocab.map((t) => count(fa, t))
  const vb = vocab.map((t) => count(fb, t))
  const same = va.every((v, i) => v === vb[i])
  const max = Math.max(1, ...va, ...vb)
  const cellBg = (v: number) => (v ? `color-mix(in srgb, var(--viz-1) ${Math.round(18 + (v / max) * 40)}%, var(--surface))` : undefined)

  const shuffleA = () => {
    const words = tokenise(a)
    let next = words
    const rng = mulberry32(seed * 7919)
    for (let tries = 0; tries < 5 && next.join(' ') === words.join(' '); tries++) next = shuffled(words, rng)
    setA(next.join(' '))
    setSeed((x) => x + 1)
  }

  const vecText = (v: number[]) => `[${v.join(', ')}]`

  return (
    <Figure
      title="Put the words in a bag and shake it"
      caption={
        <TryNotice
          tryIt={
            <>
              press <b>Shuffle</b> a few times, then switch on <b>bigrams</b>.
            </>
          }
          notice={
            <>
              shuffling never changes the vector, because a bag of words forgets order. Bigrams (pairs of neighbouring words) tell A and B apart again,
              at the price of more columns.
            </>
          }
        />
      }
    >
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="bow-a">
          Sentence A
        </label>
        <input id="bow-a" className={s.input} value={a} spellCheck={false} onChange={(e) => setA(e.target.value)} />
        <label className={s.fieldLabel} htmlFor="bow-b">
          Sentence B
        </label>
        <input id="bow-b" className={s.input} value={b} spellCheck={false} onChange={(e) => setB(e.target.value)} />
      </div>
      <Controls>
        <Button onClick={shuffleA}>Shuffle A’s words</Button>
        <Toggle label="add bigrams" checked={useBigrams} onChange={setUseBigrams} />
      </Controls>
      <div className={s.scroll}>
        <div className={s.table} style={{ gridTemplateColumns: 'minmax(5rem, max-content) 3rem 3rem' }} role="table" aria-label="Count vectors of sentences A and B">
          <span className={s.th} style={{ justifyContent: 'flex-end' }}>
            vocabulary
          </span>
          <span className={s.th}>A</span>
          <span className={s.th}>B</span>
          {vocab.map((t, i) => (
            <Fragment key={t}>
              <span className={s.term} style={{ color: t.includes(' ') ? 'var(--viz-5)' : undefined }}>
                {t}
              </span>
              <span className={`${s.td} ${va[i] ? '' : s.tdMuted}`} style={{ background: cellBg(va[i]) }}>
                {va[i]}
              </span>
              <span className={`${s.td} ${vb[i] ? '' : s.tdMuted}`} style={{ background: cellBg(vb[i]), outline: va[i] !== vb[i] ? '2px solid var(--viz-2)' : undefined, outlineOffset: -2 }}>
                {vb[i]}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', display: 'grid', gap: 2, overflowWrap: 'anywhere' }}>
        <span>A = {vecText(va)}</span>
        <span>B = {vecText(vb)}</span>
      </div>
      <p className={`${s.status} ${same ? s.same : s.diff}`} role="status">
        {same
          ? `Identical vectors: a model that only sees these ${vocab.length} counts cannot tell A from B.`
          : `Different vectors: ${va.filter((v, i) => v !== vb[i]).length} of the ${vocab.length} entries differ (outlined).`}
      </p>
    </Figure>
  )
}
