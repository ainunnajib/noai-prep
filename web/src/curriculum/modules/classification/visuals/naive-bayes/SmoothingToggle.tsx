import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Toggle, Bars } from '../../../../../kit'
import { VOCAB, CLASSES, CLS_C, CLS_INK, PRIOR, COUNTS, TOTAL, type Word, likelihood, scores, frac, small } from './nbData'

/*
  The same word-count tables with and without Laplace (add-one) smoothing:
    P(word | class) = (count + 1) / (words in class + |V|),  |V| = 6.
  Messages are chosen so that a word never seen in one class appears, which zeroes that class's score
  unless the counts are smoothed.
*/

const PRESETS: { id: string; words: Word[] }[] = [
  { id: 'a', words: ['free', 'prize', 'homework'] },
  { id: 'b', words: ['free', 'lunch', 'homework'] },
  { id: 'c', words: ['free', 'prize', 'now'] },
]

export default function SmoothingToggle() {
  const [preset, setPreset] = useState('a')
  const [smooth, setSmooth] = useState(false)
  const alpha = smooth ? 1 : 0
  const words = PRESETS.find((p) => p.id === preset)!.words
  const ordered = VOCAB.filter((w) => words.includes(w))
  const { raw, post } = scores(ordered, alpha)

  const cell: CSSProperties = { padding: '5px 8px', fontSize: '0.86rem', borderBottom: '1px solid var(--rule)' }
  const head: CSSProperties = { ...cell, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--ink-2)' }

  return (
    <Figure
      title="One zero vetoes everything, unless you smooth"
      caption={
        <>
          Pick a message and look at its rows (highlighted). Without smoothing, a word that never appeared in a class gets probability 0 there, and one
          zero wipes out that class's whole score, however strong the other words are. Switch on Laplace smoothing: every count goes up by 1 and every
          denominator by 6 (one extra for each of the 6 vocabulary words), so no probability is ever 0 and the other words get their say again.
        </>
      }
    >
      <Controls>
        <div style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 'var(--step--1)', fontWeight: 600, color: 'var(--ink-2)' }}>message</span>
          <div role="radiogroup" aria-label="message" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRESETS.map((p) => {
              const on = p.id === preset
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPreset(p.id)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 999,
                    border: `1.5px solid ${on ? 'var(--accent)' : 'var(--rule)'}`,
                    background: on ? 'var(--accent-soft)' : 'var(--surface)',
                    color: on ? 'var(--accent)' : 'var(--ink-2)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.86rem',
                    fontWeight: on ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {p.words.join(' ')}
                </button>
              )
            })}
          </div>
        </div>
        <Toggle label="Laplace smoothing (add 1 to every count)" checked={smooth} onChange={setSmooth} />
      </Controls>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table className="tabular" style={{ borderCollapse: 'collapse', margin: '0 auto', minWidth: 0 }} aria-label="Word counts and P(word | class)">
          <thead>
            <tr>
              <th style={{ ...head, textAlign: 'left' }}>word</th>
              <th style={{ ...head, color: CLS_INK.spam }}>spam</th>
              <th style={{ ...head, color: CLS_INK.normal }}>normal</th>
            </tr>
          </thead>
          <tbody>
            {VOCAB.map((w) => {
              const on = words.includes(w)
              return (
                <tr key={w} style={{ background: on ? 'var(--highlight-soft)' : undefined }}>
                  <td style={{ ...cell, fontFamily: 'var(--font-mono)', fontWeight: on ? 700 : 400, color: 'var(--ink)' }}>{w}</td>
                  {CLASSES.map((c) => {
                    const l = likelihood(c, w, alpha)
                    const zero = l.p === 0
                    return (
                      <td key={c} style={{ ...cell, textAlign: 'center', color: zero ? 'var(--viz-neg)' : on ? 'var(--ink)' : 'var(--ink-2)', fontWeight: zero && on ? 700 : 400 }}>
                        {smooth ? `${COUNTS[c][w]}+1` : COUNTS[c][w]} → {frac(l.num, l.den)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr>
              <td style={{ ...cell, color: 'var(--ink-2)' }}>total</td>
              {CLASSES.map((c) => (
                <td key={c} style={{ ...cell, textAlign: 'center', color: 'var(--ink-2)' }}>
                  {smooth ? `${TOTAL[c]} + 6 = ${TOTAL[c] + 6}` : TOTAL[c]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gap: 6, width: '100%', maxWidth: 520, margin: '0 auto' }} aria-live="polite">
        {CLASSES.map((c) => (
          <div key={c} className="tabular" style={{ fontSize: '0.9rem', color: 'var(--ink-2)', textAlign: 'center' }}>
            <b style={{ color: CLS_INK[c] }}>{c}</b>: {PRIOR[c]}
            {ordered.map((w) => {
              const l = likelihood(c, w, alpha)
              return (
                <span key={w} style={{ color: l.p === 0 ? 'var(--viz-neg)' : undefined, fontWeight: l.p === 0 ? 700 : 400 }}>
                  {' '}
                  × {frac(l.num, l.den)}
                </span>
              )
            })}{' '}
            = <b style={{ color: raw[c] === 0 ? 'var(--viz-neg)' : 'var(--ink)' }}>{small(raw[c])}</b>
          </div>
        ))}
        {post ? (
          <Bars
            data={CLASSES.map((c) => ({ label: c, value: post[c], color: CLS_C[c], strong: post[c] >= 0.5 }))}
            max={1}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            ariaLabel="P(class | message) after normalising"
          />
        ) : (
          <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--viz-neg)' }}>0 versus 0: no class can be chosen.</div>
        )}
      </div>
    </Figure>
  )
}
